import {default as express} from "express";
import { version } from "./utils.mjs";
import {IAPI} from "./iapi.mjs";

function initializeRouter(db,log,salt){
    const iapi = new IAPI(db,log,salt);
    let blorumRouter = express();
    let commonHeader = {
        "X-Powered-By": "Blorum",
        "Access-Control-Allow-Origin": "*",
        "Content-Security-Policy": "default-src 'none'; connect-src 'self';font-src 'self'; img-src 'self' data: https:; style-src 'self' ; script-src 'self'"
    };

    blorumRouter.get('/', function (req, res) {
        res.set("Content-Type","application/json");
        res.set(commonHeader);
        res.send({"server": "Blorum", "version": version});
    });

    blorumRouter.post('/user/login', function (req, res) {
        console.log(req,res);
        res.set("Content-Type","application/json");
        res.set(commonHeader);
        res.status(200).send();
    });

    blorumRouter.delete('/user/delete', function (req, res) {
        
    });
    blorumRouter.get('*', function(req, res){
        res.set(commonHeader);
        res.send('Router does not exist.', 404);
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