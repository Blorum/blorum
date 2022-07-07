import { join } from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";
import { outputLogsColored, outputLogs } from "./utils.mjs";
import { default as mysql } from "mysql2";
import { default as redis} from "redis";
import "inquirer";
import { installBlorum } from "./install.mjs";
import { promisifiedMysqlConnect, promisifiedRedisConnect } from "./utils.mjs";

function initializeBlorumServer() {
    const __dirname = fileURLToPath(import.meta.url);
    const configPath = join(__dirname, '..', '..', 'config.json');
    let config = JSON.parse(readFileSync(configPath, 'utf8', (err) => {
        if (err) throw err;
    }));
    var log = function (level, context, info) {
        if (config.logs.colored) {
            var output = outputLogsColored;
        } else {
            var output = outputLogs;
        }
        if (config.logs.level === "debug") {
            output(level, context, info);
        }
        if (config.logs.level === "error") {
            if (level === "error") {
                output(level, context, info);
            }
        }
        if (config.logs.level === "warn") {
            if (level === "warn" || level === "error") {
                output(level, context, info);
            }
        }
        if (config.logs.level === "log") {
            if (level === "log" || level === "warn" || level === "error") {
                output(level, context, info);
            }
        }
    };

    log("log", "INIT", "Read config from " + configPath);
    if (!config.is_installed) {
        log("error", "INIT", "value of config.is_installed is false!!!");
    } else {
        let mysqlConnection = mysql.createConnection(config.database.mysql);
        let redisConnection = redis.createClient(config.database.redis);
        let redisPromise = promisifiedRedisConnect(redisConnection);
        redisPromise.catch(function (err) {
            log("error", "INIT:db/redis", "Failed to connect to Redis Server");
            throw err;
        }).then(function () {
            log("log", "INIT:db/redis", "Successfully connected to Redis Server");
        });
        let mysqlPromise = promisifiedMysqlConnect(mysqlConnection);
        mysqlPromise.catch(function (err) {
            log("error", "INIT:db/mysql", "Failed to connect to MySQL Server");
            throw err;
        }).then(function () {
            log("log", "INIT:db/mysql", "Successfully connected to MySQL Server");
        });
        return {
            "config": config,
            "promise": Promise.all([redisPromise, mysqlPromise]),
            "log": log
        };
    }

}

export { initializeBlorumServer };