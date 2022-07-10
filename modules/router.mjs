import {default as express} from "express";
import { version } from "./utils.mjs";
import {IAPI} from "./iapi.mjs";
import {default as fs} from "fs";
import { fileURLToPath } from "url";
import { join } from "path";

function initializeRouter(db,log,salt){
    const iapi = new IAPI(db,log,salt);
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

    blorumRouter.post('/user/login', function (req, res) {
        console.log(req,res);
        res.set("Content-Type","application/json");
        res.set(commonHeader);
        res.status(200).send();
    });

    blorumRouter.post('/user/register', function (req, res) {
        console.log(req,res);
        res.set("Content-Type","application/json");
        res.set(commonHeader);
        res.status(200).send();
    });

    blorumRouter.post('/user/logout', function (req, res) {
        console.log(req,res);
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
    return blorumRouter;
}

export default function(db,log){
    try {
        let router = initializeRouter(db,log);
        log("log","Router","Router initialized.");
        return router;
    } catch (error) {
        log("error","Router","Failed to initialize router");
    }
};