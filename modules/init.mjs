import { join } from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";
import { outputLogsColored, outputLogs } from "./utils.mjs";
import { default as mysql } from "mysql2";
import { promisifiedMysqlConnect, promisifiedRedisConnect } from "./utils.mjs";


function MysqlIntegrityCheck(mysqlConnection) {
    return new Promise((resolve, reject) => {
        resolve(); //TODO
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
        return new Promise((resolve, reject) => {
            let mysqlConnection = mysql.createConnection(bootConfig.database.mysql); 
            let redisPromise = promisifiedRedisConnect(bootConfig.database.redis);
            redisPromise.catch(function (err) {
                log("error", "INIT/db/redis", "Failed to connect to Redis Server.");
                throw err;
            }).then(function () {
                log("log", "INIT/db/redis", "Successfully connected to Redis Server.");
            });
            let mysqlPromise = promisifiedMysqlConnect(mysqlConnection);
            mysqlPromise.then(function () {
                log("log", "INIT/db/mysql", "Successfully connected to MySQL Server.");
            }).catch(function (err) {
                log("error", "INIT/db/mysql", "Failed to connect to MySQL Server.");
                reject(err);
            });

            Promise.all([redisPromise, mysqlPromise]).then((values) => {
                let mysqlConn = values[1];
                let redisConn = values[0];
                MysqlIntegrityCheck(mysqlConn).then(() => {
                    mysqlConn.query("SELECT * FROM config;", (err,results) => {
                        if (err) {
                            log("error", "INIT/db/mysql", "Failed to query config table.");
                            reject(err);
                        } else {
                            log("log", "INIT/db/mysql", "Site config loaded.");
                            let siteConfig = {};
                            for(const element of results){
                                siteConfig[element.flag] = element.value;
                            }
                            mysqlConn.query("SELECT * FROM roles;", (err,results) => {
                                if (err) {
                                    log("error", "INIT/db/mysql", "Failed to query roles table.");
                                    reject(err);
                                }else{
                                    let redisKey = bootConfig.database.redis.prefix + ":roles:";
                                    for(let element of results){
                                        try {
                                            let keyName = redisKey + element.name;
                                            delete element.name;
                                            redisConn.set(keyName, JSON.stringify(element)); 
                                        } catch (error) {
                                            log("error", "INIT/db/redis", "Failed to set role in redis.");
                                            reject(error);
                                        }
                                        resolve({
                                            "log": log,
                                            "mysql": mysqlConn,
                                            "redis": redisConn,
                                            "siteConfig": siteConfig,
                                            "bootConfig": bootConfig
                                        });
                                    }
                                }
                            });
                        }
                    });
                }).catch(function (err) {
                    log("error", "INIT/db/mysql", "MySQL Database integrity check failed. ");
                    reject(err);
                });
            }).catch(function (err) {
                reject(err);
            });
        });
    }
}

export { initializeBlorumServer };