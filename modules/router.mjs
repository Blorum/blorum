import {default as JSON} from "json5";
import {default as express} from "express";
import { version, isAllString, strNotOnlyNumber, objHasAllProperties} from "./utils.mjs";
import { IAPI } from "./iapi.mjs";
import { default as fs } from "fs";
import { fileURLToPath } from "url";
import { join } from "path";
import { default as bodyParser } from "body-parser";

function initializeRouter(mysqlConnection, redisConnection, siteConfig, log, salt){
    const iapi = new IAPI(mysqlConnection, redisConnection, siteConfig, log, salt);
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
        if(objHasAllProperties(b, "username", "password")){
            if(isAllString(b.username, b.password)){
                iapi.userLogin(req, b.username, b.password).then(function(result){
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
        if(objHasAllProperties(b, "username", "password", "email")){
            if(isAllString(b.username, b.password, b.email, b.nickname)){
                try {
                    res.set("Content-Type","application/json");
                    res.set(commonHeader);
                    iapi.userRegister(req, b.username, b.password, b.email, b.nickname).then(function (result) {
                        res.status(200).send(result);
                    }
                    ).catch(function (error) {
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

    blorumRouter.post('/user/logout', function (req, res) {
    });

    blorumRouter.get('/user/*', function (req, res) {
        
    });

    blorumRouter.post('/remove/account', function (req, res) {
    });

    blorumRouter.post('/remove/article', function (req, res) {
    });

    blorumRouter.post('/remove/account', function (req, res) {
    });

    blorumRouter.post('/remove/post', function (req, res) {
    });

    blorumRouter.post('/remove/comment', function (req, res) {
    });

    blorumRouter.post('/remove/react', function (req, res) {
    });



    blorumRouter.post('/heartbeat', function (req, res) {
    });

    blorumRouter.get('*', function(req, res){
        res.set(commonHeader);
        res.status(418).send('Router does not exist.');
    });
    return blorumRouter;
}

export default function(mysqlConnection, redisConnection, siteConfig, log, salt){
    try {
        let router = initializeRouter(mysqlConnection, redisConnection, siteConfig, log, salt);
        log("log","Router","Router initialized.");
        return router;
    } catch (error) {
        log("error","Router","Failed to initialize router:" + error);
    }
};