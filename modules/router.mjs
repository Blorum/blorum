import parse from "json5";
JSON.parse = parse.parse;

import {default as express} from "express";
import { version, innerVersion, isAllString, strNotOnlyNumber, objHasAllProperties} from "./utils.mjs";
import { IAPI } from "./iapi.mjs";
import { default as fs } from "fs";
import { fileURLToPath } from "url";
import { join } from "path";
import { default as bodyParser } from "body-parser";
import { default as RCM } from "./rate_control.mjs";
import { default as SCM } from "./session_check.mjs";
import { default as STM } from "./statistic.mjs";
import { default as CSM } from "./cache.mjs";

function initializeRouter(mysqlConnection, redisConnection, siteConfig, log, salt, redisPrefix){
    let getReqInfo = function(req){
        let ip = null;
        let ua = null;
        if(siteConfig.ip_detect_method == "connection"){
            ip =  req.connection.remoteAddress;
        }else if(siteConfig.ip_detect_method == "header"){
            //Default header X-Forwarded-For.
            if(req.headers.hasOwnProperty(siteConfig.ip_detect_header)){
                ip = req.headers[siteConfig.ip_detect_header];
            }else{
                log("error", "IAPI", "Dictated IP detection method is header, but header is not found.");
                if(req.headers.hasOwnProperty("x-forwarded-for")){
                    ip = req.headers["x-forwarded-for"];
                }else{
                    ip = req.connection.remoteAddress;
                }
            }
        }else{
            log("error", "IAPI", "Dictated IP detection method is not found.");
            ip = req.connection.remoteAddress;
        }
        if(req.headers.hasOwnProperty("user-agent")){
            ua = req.headers["user-agent"];
        }else{
            ua = "Unknown/0";
        }
        return {
            "ip": ip,
            "ua": ua
        }
    };

    const iapi = new IAPI(mysqlConnection, redisConnection, siteConfig, log, salt, redisPrefix);
    
    let blorumRouter = express();
    let commonHeader = {
        "X-Powered-By": "Blorum",
        "Access-Control-Allow-Origin": "*"
    };

    let sessionCheckMiddleware = SCM(log, redisConnection, iapi);
    let rateControlMiddleware = RCM(log, redisConnection, siteConfig, iapi, getReqInfo);
    let statisticsMiddleware = STM(log, redisConnection, mysqlConnection, siteConfig, iapi, getReqInfo);
    let cacheMiddleware = CSM(log, redisConnection, mysqlConnection, siteConfig, iapi);

    try {
        blorumRouter.use(sessionCheckMiddleware);
        log("log", "Router/MW", "Session check middleware applied.");
    } catch (error) {
        log("error", "Router/MW", "Failed to apply session check middleware.");
        process.exit(1);
    }
    try {
        blorumRouter.use(rateControlMiddleware);
        log("log", "Router/MW", "Rate control middleware applied.");
    } catch (error) {
        log("error", "Router/MW", "Failed to apply rate control middleware.");
    }
    try {
        blorumRouter.use(statisticsMiddleware);
        log("log", "Router/MW", "Statistics middleware applied.");
    } catch (error) {
        log("error", "Router/MW", "Failed to apply statistics middleware.");
    }
    try {
        blorumRouter.use(cacheMiddleware);
        log("log", "Router/MW", "Cache strategy middleware applied.");
    } catch (error) {
        log("error", "Router/MW", "Failed to apply cache strategy middleware.");
    }

    blorumRouter.use(bodyParser.json({limit: '50mb'}));
    blorumRouter.use(function(err, req, res, next){
        if(err instanceof SyntaxError) {
            res.set(commonHeader);
            res.sendStatus(400);
        }else{
            next();
        }
    });

    blorumRouter.get('/debug', function(req, res){
        if(req.isUserSessionValid){
            console.log(req.isUserSessionValid);
            console.log(req.validUserID);
            console.log(req.validUserPermissions);
            console.log(getReqInfo(req));
        }
        res.set(commonHeader);
        res.sendStatus(200);
    });
    blorumRouter.get('/', function (req, res) {
        res.set("Content-Type","application/json");
        res.set(commonHeader);
        res.status(200).send({"server": "blorum", "version": version, "stamp": innerVersion});
    });

    //Static file serving
    blorumRouter.get("/favicon.ico", function(req, res){
        let __dirname = fileURLToPath(import.meta.url);
        let filePath = join(__dirname, '..', '..','statics/blorum256.ico');
        res.status(200).sendFile(filePath);
    });

    blorumRouter.get("/avatar.png", function(req, res){
        let __dirname = fileURLToPath(import.meta.url);
        let filePath = join(__dirname, '..', '..','statics/avatar.png');
        res.status(200).sendFile(filePath);
    });

    blorumRouter.get('/statics/*', function(req, res){
        let path = req.params[0];
        let __dirname = fileURLToPath(import.meta.url);
        let filePath = join(__dirname, '..', '..','statics', path);
        let testExistPromise = new Promise(function(resolve, reject){
            fs.access(filePath, fs.constants.R_OK, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
        let testIsFilePromise = new Promise(function(resolve, reject){
            fs.stat(filePath, (err, stats) => {
                if (err) {
                    reject(err);
                } else {
                    if (stats.isFile()) {
                        resolve();
                    } else {
                        reject(new Error("Not a file"));
                    }
                }
            });
        });
        Promise.allSettled([testExistPromise, testIsFilePromise]).then(function(results){
            if (results[0].status === "fulfilled" && results[1].status === "fulfilled") {
                res.status(200).sendFile(path, {root: './statics'});
            } else {
                res.status(404).send();
            }
        }
        ).catch(function(err){
            res.status(500).send();
        });
    });

    //JSON API
    blorumRouter.get('/site/info', function(req, res){
        res.set("Content-Type","application/json");
        res.set(commonHeader);
        let b = req.body;
    });

    blorumRouter.post('/user/login', function (req, res) {
        res.set("Content-Type","application/json");
        res.set(commonHeader);
        let b = req.body;
        let reqInfo = getReqInfo(req);
        if(objHasAllProperties(b, "username", "password")){
            if(isAllString(b.username, b.password)){
                iapi.userLogin(reqInfo.ip, reqInfo.ua, b.username, b.password).then(function(result){
                    res.set(commonHeader);
                    let parsedPermission = ""; //Todo
                    res.cookie("blorum_uid", result.uid, {httpOnly: true});
                    res.cookie("blorum_token", result.token, {httpOnly: true});
                    res.cookie("blorum_permissions", parsedPermission);
                    res.status(200).send(result);
                }).catch(function(err){
                    res.set(commonHeader);
                    res.status(500).send(err);
                });
            }else{
                res.sendStatus(400);
            }
        }else{
            res.sendStatus(400);
        }
    });

    blorumRouter.post('/user/register', function (req, res) {
        let b = req.body;
        let reqInfo = getReqInfo(req);
        if(objHasAllProperties(b, "username", "password", "email")){
            if(isAllString(b.username, b.password, b.email, b.nickname)){
                try {
                    res.set("Content-Type","application/json");
                    res.set(commonHeader);
                    iapi.userRegister(reqInfo.ip, reqInfo.ua, b.username, b.password, b.email, b.nickname).then(function (result) {
                        res.status(200).send(result);
                    }).catch(function (error) {
                        log("debug", "Router", "Failed to register user: " + error);
                        res.status(500).send(error);
                    });
                } catch (error) {
                    log("debug", "Router", "Failed to register user: " + error);
                    res.sendStatus(500);
                }
            }else{
                res.sendStatus(400);
            }
        }else{
            res.sendStatus(400);
        }
    });

    blorumRouter.get('/user/permissions', function (req, res) { 
        //TODO: permission check;
        if(req.isUserSessionValid){
            let b = req.body;
            res.set("Content-Type","application/json");
            res.set(commonHeader);
            iapi.getUserPermissions(b.uid).then((result) => {
                if(result == null){
                    res.status(404).send();
                }else{
                    res.status(200).send(result);
                }
            }).catch((err) => {
                res.status(500).send(err);
            });
        }else{
            res.sendStatus(401);
        }
    });

    blorumRouter.post('/user/logout', function (req, res) {
        if(req.isUserSessionValid){
            res.set(commonHeader);
            iapi.userLogout(req.validUserID, req.header.token).then(function(result){
                res.clearCookie('blorum_uid');
                res.clearCookie('blorum_token');
                res.clearCookie('blorum_permissions');
                res.sendStatus(200);
            }).catch(function(err){
                res.status(500).send(err);
            });
        }else{
            res.sendStatus(401);
        }
    });

    blorumRouter.post('/user/sessionList', function (req, res) {
    });

    blorumRouter.post('/user/invite', function (req, res) {
    });
    
    blorumRouter.post('/user/remove', function (req, res) {
    });

    blorumRouter.post('/user/create', function (req, res) {
    });

    blorumRouter.get('/users/*', function (req, res) {
    });

    blorumRouter.get('/avatar/*', function (req, res) {
    });

    blorumRouter.get('/articles/*', function (req, res) {
    });

    blorumRouter.get('/comments/*', function (req, res) {
    });

    blorumRouter.get('/forums/*', function (req, res) {
    });

    
    blorumRouter.put('/article', function (req, res) {
    });

    blorumRouter.put('/post', function (req, res) {
    });

    blorumRouter.put('/comment', function (req, res) {
    });

    blorumRouter.put('/note', function (req, res) {
    });

    blorumRouter.put('/react', function (req, res) {
    });

    blorumRouter.put('/forum', function (req, res) {
    });

    blorumRouter.put('/category', function (req, res) {
    });

    blorumRouter.put('/tag', function (req, res) {
    });

    
    blorumRouter.delete('/article', function (req, res) {
    });

    blorumRouter.delete('/post', function (req, res) {
    });

    blorumRouter.delete('/comment', function (req, res) {
    });

    blorumRouter.delete('/note', function (req, res) {
    });

    blorumRouter.delete('/react', function (req, res) {
    });

    blorumRouter.delete('/forum', function (req, res) {
    });

    blorumRouter.delete('/category', function (req, res) {
    });

    blorumRouter.delete('/tag', function (req, res) {
    });


    blorumRouter.post('/heartbeat', function (req, res) {
    });

    blorumRouter.get('*', function(req, res){
        res.set(commonHeader);
        res.status(418).send('Router does not exist.');
    });
    return blorumRouter;
}

export default function(mysqlConnection, redisConnection, siteConfig, log, salt, redisPrefix){
    try {
        let router = initializeRouter(mysqlConnection, redisConnection, siteConfig, log, salt, redisPrefix);
        log("log","Router","Router initialized.");
        return router;
    } catch (error) {
        log("error","Router","Failed to initialize router:" + error);
    }
};