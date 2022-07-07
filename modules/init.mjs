import {join} from "path";
import { fileURLToPath } from "url";
import {readFileSync} from "fs";
import {outputLogsColored, outputLogs} from "./utils.mjs";
import "mysql";
import "redis";
import "inquirer";
import {installBlorum} from "./install.mjs";

function initializeBlorumServer(){
    const __dirname = fileURLToPath(import.meta.url);
    const configPath = join(__dirname, '..', '..', 'config.json');
    let config = JSON.parse(readFileSync(configPath, 'utf8', (err) => {
        if (err) throw err;
    }));
    var log = function(level,context,info){
        if(config.logs.colored){
            var output = outputLogsColored;
        }else{
            var output = outputLogs;
        }
        if(config.logs.level === "debug"){
            output(level,context,info);
        }
        if(config.logs.level === "error"){
            if(level === "error"){
                output(level,context,info);
            }
        }
        if(config.logs.level === "warn"){
            if(level === "warn" || level === "error"){
                output(level,context,info);
            }
        }
        if(config.logs.level === "log"){
            if(level === "log" || level === "warn" || level === "error"){
                output(level,context,info);
            }
        }
    }

    log("log","INIT", "Read config from " + configPath);
    if(!config.is_installed){
        log("error","INIT","value of config.is_installed is false!!!");

    }else{
        let db = {
            "mysql": null,
            "redis": null
        }
        db.mysql = mysql.createConnection(config.database.mysql);
          
        db.mysql.connect(function(err) {
            if (err) throw err;
            console.log("Connected!");
          });
    
        return config;
    }

}

export {initializeBlorumServer};