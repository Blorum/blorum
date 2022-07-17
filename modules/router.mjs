import parse from "json5";
JSON.parse = parse.parse;

import {default as express} from "express";
import { version, isAllString, strNotOnlyNumber, objHasAllProperties} from "./utils.mjs";
import { IAPI } from "./iapi.mjs";
import { default as fs } from "fs";
import { fileURLToPath } from "url";
import { join } from "path";
import { default as bodyParser } from "body-parser";

function initializeRouter(mysqlConnection, redisConnection, siteConfig, log, salt, redisPrefix){
    let getReqInfo = function(req){
        let ip = null;
        let ua = null;
        if(siteConfig.ip_detect_method == "connection"){
            ip =  req.connection.remoteAddress;
        }else if(siteConfig.ip_detect_method == "header"){
            //Default header X-Forwarded-From.
            if(req.headers.hasOwnProperty(siteConfig.ip_detect_header)){
                ip = req.headers[siteConfig.ip_detect_header];
            }else{
                log("error", "IAPI", "Dictated IP detection method is header, but header is not found.");
                if(req.headers.hasOwnProperty("X-Forwarded-From")){
                    ip = req.headers["X-Forwarded-From"];
                }else if(req.headers.hasOwnProperty("x-forwarded-from")){
                    ip = req.headers["x-forwarded-from"];
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
        }else if(req.headers.hasOwnProperty("User-Agent")){
            ua = req.headers["User-Agent"];
        }else{
            ua = "Unknown/0";
        }
        return {
            "ip": ip,
            "ua": ua
        }
    }

    const iapi = new IAPI(mysqlConnection, redisConnection, siteConfig, log, salt, redisPrefix);
    
    let blorumRouter = express();
    let commonHeader = {
        "X-Powered-By": "Blorum",
        "Access-Control-Allow-Origin": "*"
    };

    blorumRouter.get('/', function (req, res) {
        res.set("Content-Type","application/json");
        res.set(commonHeader);
        res.status(200).send({"server": "blorum", "version": version});
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
    blorumRouter.use(bodyParser.json({limit: '50mb'}));
    blorumRouter.use(function(err, req, res, next){
        if (err instanceof SyntaxError) {
            res.set(commonHeader);
            res.status(400).send('Bad Request');
        } else {
            next();
        }
    }
    );

    blorumRouter.post('/user/login', function (req, res) {
        res.set("Content-Type","application/json");
        res.set(commonHeader);
        let b = req.body;
        let reqInfo = getReqInfo(req);
        if(objHasAllProperties(b, "username", "password")){
            if(isAllString(b.username, b.password)){
                iapi.userLogin(reqInfo.ip, reqInfo.ua, b.username, b.password).then(function(result){
                    res.set(commonHeader);
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
                        res.status(403).send(error);
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
    });

    blorumRouter.post('/user/logout', function (req, res) {
        let b = req.body;
        res.set("Content-Type","application/json");
        res.set(commonHeader);
        if(objHasAllProperties(b, "uid", "token")){
            iapi.userLogout(req, b.uid, b.token).then(function(result){
                res.sendStatus(200);
            }).catch(function(err){
                res.status(500).send(err);
            }
            );
        }else{
            res.sendStatus(400);
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