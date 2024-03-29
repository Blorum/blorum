import parse from "simdjson";
JSON.parse = parse.parse;


import { default as express } from "express";
import { version, innerVersion, isAllString, strNotOnlyNumber, objHasAllProperties} from "./utils.mjs";
import { default as fs } from "fs";
import { fileURLToPath } from "url";
import { join } from "path";
import { default as bodyParser } from "body-parser";
import { default as RCM } from "./rate_control.mjs";
import { default as SCM } from "./session_check.mjs";
import { default as STM } from "./statistic.mjs";
import { default as CSM } from "./cache.mjs";
import stringify from "quick-stable-stringify";

function rejectForLoginStatusDecorator(func){
    return function(req, res){
        if(req.isUserSessionValid){
            res.status(412).send("You are already logged in.");
        }else{
            func(req, res);
        }
    }
}


function initializeRouter(iapi, mysqlConnection, redisConnection, siteConfig, log){
    let getReqInfo = function(req){
        let ip = null;
        let ua = null;
        if(siteConfig.ip_detect_method == "connection"){
            ip = req.connection.remoteAddress;
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

    //to be removed in the future
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

    blorumRouter.post('/reload_site_config', function(req, res){
        
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
        //filter out ../ to prevent path traversal
        if(req.path.includes("../")){
            res.set(commonHeader);
            res.sendStatus(403);
            return;
        }
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

    blorumRouter.post('/user/login', 
        rejectForLoginStatusDecorator(
            function (req, res) {
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
                            res.cookie("blorum_uuid", result.uuid);
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
    }));

    blorumRouter.post('/user/register', 
        rejectForLoginStatusDecorator(
            function (req, res) {
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
    }));

    blorumRouter.get('/user/permissions', function (req, res) { 
        if(req.isUserSessionValid){
            res.set("Content-Type","application/json");
            res.set(commonHeader);
            let b = req.body;
            let permissionLevel = req.validUserPermissions.permissions.user.permission.read.default;
            if(!isNaN(b.uid)){
                switch(permissionLevel){
                    case 1:
                        iapi.getUserPermissions(b.uid).then((result) => {
                            if(result.permissions.flags.indexOf("administrative") == -1){
                                res.sendStatus(403);
                            }else{
                                res.status(200).send(stringify(result));
                            }
                        });
                        break;
                    case 2:
                        iapi.getUserPermissions(b.uid).then((result) => {
                            res.status(200).send(stringify(result));
                        });
                        break;
                    default:
                        iapi.logInsert(
                            req.validUserID,
                            "User don't have a valid permission level of \"user.permission.read\"",
                            3
                        );
                    case 0:
                        if(b.uid == req.validUserID){
                             //Todo: filter permissions returned
                            res.status(200).send(req.validUserPermissions);
                        }else{
                            res.sendStatus(403);
                        }
                }
            }else{
                res.sendStatus(400);
            }
        }else{
            res.sendStatus(401);
        }
    });

    blorumRouter.put('/user/permissions', function(req, res) {
        //Todo: set user permission API
        if(req.isUserSessionValid){
            //add permission check here!
                let b = req.body;
                let actionList = b.actions;
        }
    });

    blorumRouter.post('/user/logout', function (req, res) {
        if(req.isUserSessionValid){
            let b = req.body;
            res.set(commonHeader);
            iapi.userLogout(req.validUserID, b.uuid).then(function(result){
                if(b.uuid === req.validUserSessionUUID){
                    res.clearCookie('blorum_uid');
                    res.clearCookie('blorum_uuid');
                    res.clearCookie('blorum_token');
                    res.clearCookie('blorum_permissions');
                }
                res.sendStatus(200);
            }).catch(function(err){
                res.status(500).send(err);
            });
        }else{
            res.sendStatus(401);
        }
    });

    blorumRouter.get('/user/sessionList', function (req, res) {

        //Todo: filter the token, add permission check
        
        if(req.isUserSessionValid){
            let b = req.body;
            res.set("Content-Type","application/json");
            res.set(commonHeader);
            iapi.getUserSession(b.uid).then((results) => {
                if(results == null){
                    res.status(404).send();
                }else{
                    for(var i = 0; i < results.length; i++){
                        results[i] = JSON.parse(results[i]);
                    }
                    res.status(200).send(results);
                }
            }).catch((err) => {
                res.status(500).send(err);
            });
        }else{
            res.sendStatus(401);
        }
    });

    blorumRouter.post('/user/invite', function (req, res) {
        if(req.isUserSessionValid){
            let b = req.body;
            let inviteeEmail = b.email;
            let msgLeft = b.msg;
            //todo
        }else{
            res.sendStatus(401);
        }
    });
    
    blorumRouter.post('/user/remove', function (req, res) {
    });

    blorumRouter.post('/user/create', function (req, res) {
    });

    blorumRouter.get('/users/:uid', function (req, res) {
        let uid = req.params["uid"];
    });

    blorumRouter.get('/avatar/:uid', function (req, res) {
        let uid = req.params["uid"];
    });

    blorumRouter.get('/articles/:aid', function (req, res) {
        let aid = req.params["aid"];
    });

    blorumRouter.get('/comments/:type/:cid', function (req, res) {
        let commentType = req.params["type"];
        let cid = req.params["cid"];
    });

    blorumRouter.get('/forums/:fid', function (req, res) {
        let fid = req.params["fid"];
    });

    
    blorumRouter.put('/article', function (req, res) {
        let b = req.body;
        let articleContent = b.content;
        let category = b.category;
        let title = b.title;
        let excerpt = b.excerpt;
        let tags = b.tags;
        let statisticsProto = {};
    });

    blorumRouter.put('/post', function (req, res) {
        let statisticsProto = {};
    });

    blorumRouter.put('/comment', function (req, res) {
    });

    blorumRouter.put('/note', function (req, res) {
    });

    blorumRouter.put('/react', function (req, res) {
        let b = req.body;
        let targetType = b.type; // 0 = Article, 1 = Post, 2 = Comment, 3 = Note
    });

    blorumRouter.put('/forum', function (req, res) {
    });

    blorumRouter.put('/category', function (req, res) {
    });

    blorumRouter.put('/tag', function (req, res) {
    });

    
    blorumRouter.delete('/article', function (req, res) {
        let b = req.body;
        let id = b.id;
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

    blorumRouter.put('/site_config', function (req,res){
        if(isUserSessionValid){

        }
    });

    

    blorumRouter.post('/heartbeat', function (req, res) {
        
    });

    blorumRouter.get('*', function(req, res){
        res.set(commonHeader);
        res.status(418).send('Router does not exist.');
    });
    return blorumRouter;
}

export default function(iapi, mysqlConnection, redisConnection, siteConfig, log){
    try {
        let router = initializeRouter(iapi, mysqlConnection, redisConnection, siteConfig, log);
        log("log","Router","Router initialized.");
        return router;
    } catch (error) {
        log("error","Router","Failed to initialize router:" + error);
    }
};