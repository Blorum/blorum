import { join } from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";
import { outputLogsColored, outputLogs } from "./utils.mjs";
import { default as mysql } from "mysql2";
import { default as redis } from "ioredis";
import { promisifiedMysqlConnect, promisifiedRedisConnect } from "./utils.mjs";


function MysqlIntegrityCheck(mysqlConnection) {
    return new Promise((resolve, reject) => {
        resolve();
    });
}

function initializeBlorumServer() {
    const __dirname = fileURLToPath(import.meta.url);
    let bootConfigPath = join(__dirname, '..', '..', 'config.json');
    let bootConfig = JSON.parse(readFileSync(bootConfigPath, 'utf8', (err) => {
        if (err) throw err;
    }));
    var log = function (level, context, info) {
        if (bootConfig.logs.colored) {
            var output = outputLogsColored;
        } else {
            var output = outputLogs;
        }
        if (bootConfig.logs.level === "debug") {
            output(level, context, info);
        }
        if (bootConfig.logs.level === "error") {
            if (level === "error") {
                output(level, context, info);
            }
        }
        if (bootConfig.logs.level === "warn") {
            if (level === "warn" || level === "error") {
                output(level, context, info);
            }
        }
        if (bootConfig.logs.level === "log") {
            if (level === "log" || level === "warn" || level === "error") {
                output(level, context, info);
            }
        }
    };

    log("log", "INIT", "Read boot config from " + bootConfigPath);
    if (!bootConfig.is_installed) {
        log("error", "INIT", "value of config.is_installed is false!!!");
    } else {
        let mysqlConnection = mysql.createConnection(bootConfig.database.mysql);
        let redisPromise = promisifiedRedisConnect(bootConfig.database.redis);
        redisPromise.catch(function (err) {
            log("error", "INIT:db/redis", "Failed to connect to Redis Server");
            throw err;
        }).then(function () {
            log("log", "INIT:db/redis", "Successfully connected to Redis Server");
        });
        let mysqlPromise = new Promise((resolve, reject) => {
            promisifiedMysqlConnect(mysqlConnection).then(function (conn) {
                log("log", "INIT:db/mysql", "Successfully connected to MySQL Server");
                MysqlIntegrityCheck(conn).then(function () {
                    conn.query("SELECT * FROM config;", function (err, result) {
                        if (err) {
                            throw err;
                        }
                        let siteConfig = {};
                        for(const element of result){
                            siteConfig[element.flag] = element.value;
                        }
                        resolve({
                            "mysql": mysqlConnection,
                            "site_config": siteConfig
                        });
                    });
                }).catch(function (err) {
                    log("error", "INIT:db/mysql", "MySQL database integrity check failed.");
                    throw err;
                });
            }).catch(function (err) {
                log("error", "INIT:db/mysql", "Failed to connect to MySQL Server");
                throw err;
            });
        });
        return {
            "bootConfig": bootConfig,
            "promise": Promise.all([mysqlPromise, redisPromise]),
            "log": log
        };
    }
}

export { initializeBlorumServer };