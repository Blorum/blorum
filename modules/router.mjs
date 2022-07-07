import {default as express} from "express";
import { version } from "./utils.mjs";
import {iapi} from "./iapi.mjs";

function initializeRouter(db,log){
    let blorumRouter = express();
    let commonHeader = {
        "X-Powered-By": "Blorum",
        "Access-Control-Allow-Origin": "*"
    };

    blorumRouter.get('/', function (req, res) {
        res.set("Content-Type","application/json");
        res.set(commonHeader);
        res.send({"server": "Blorum", "version": version});
    });

    blorumRouter.post('/user/login', function (req, res) {

    });

    blorumRouter.delete('/user/delete', function (req, res) {
        
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