import {default as express} from "express";
import { version } from "./utils.mjs";
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
        res.status(200).send({"server": "Blorum", "version": version});
    });

    blorumRouter.get("/favicon.ico", function(req, res){
        let __dirname = fileURLToPath(import.meta.url);
        let filePath = join(__dirname, '..', '..','statics/blorum256.ico');
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
    blorumRouter.get('*', function(req, res){
        res.set(commonHeader);
        res.status(418).send('Router does not exist.');
    });

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
        console.log(req,res);
        res.set("Content-Type","application/json");
        res.set(commonHeader);
        res.status(200).send();
    });

    blorumRouter.post('/user/register', function (req, res) {
        let b = req.body;
        if(b.hasOwnProperty("username") && b.hasOwnProperty("password")  && b.hasOwnProperty("email") && b.hasOwnProperty("nickname")){
            if(typeof b.username == "string" && typeof b.password == "string" && typeof b.email == "string" && typeof b.nickname == "string" ){
                try {
                    res.set("Content-Type","application/json");
                    res.set(commonHeader);
                    iapi.userRegister(b.username, b.nickname, b.password, b.email).then(function (result) {
                        res.status(200).send(result);
                    }
                    ).catch(function (error) {
                        log("debug", "Router", "Failed to register user: " + error);
                        res.sendStatus(500);
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
        console.log(req);
        res.set("Content-Type","application/json");
        res.set(commonHeader);
        res.status(200).send();
    });

    blorumRouter.post('/user/suicide', function (req, res) {
        console.log(req,res);
        res.set("Content-Type","application/json");
        res.set(commonHeader);
        res.status(200).send();
    });

    blorumRouter.post('/users/*', function (req, res) {
        console.log(req,res);
        res.set("Content-Type","application/json");
        res.set(commonHeader);
        res.status(200).send();
    });


    blorumRouter.delete('/user/delete', function (req, res) {
        
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