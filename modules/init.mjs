import { join } from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";
import { outputLogsColored, outputLogs } from "./utils.mjs";
import { default as mysql } from "mysql2";
import { promisifiedMysqlConnect, promisifiedRedisConnect } from "./utils.mjs";
import { default as child_process } from 'child_process';

import stringify from "quick-stable-stringify";

function initializeBlorumServer() {
    const __dirname = fileURLToPath(import.meta.url);
    let bootConfigPath = join(__dirname, '..', '..', 'config.json');
    let bootConfig = JSON.parse(readFileSync(bootConfigPath, 'utf8', (err) => {
        if (err) throw err;
    }));
    var log = function (level, context, info) {
        var output = outputLogs;
        if (bootConfig.logs.colored) {
            output = outputLogsColored;
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
                                        redisConn.set(keyName, stringify(element)); 
                                    } catch (error) {
                                        log("error", "INIT/db/redis", "Failed to set role in redis.");
                                        reject(error);
                                    }
                                }
                                const scheduleDaemon = child_process.fork('./modules/scheduled.mjs', {
                                    stdio: ['pipe', 'pipe', 'pipe', 'ipc']
                                });
                                scheduleDaemon.send(
                                    {
                                        "action": "init",
                                        "redis": bootConfig.database.redis,
                                        "mysql": bootConfig.database.mysql,
                                    }
                                );
                                scheduleDaemon.on('message', (message) => {
                                    switch (message.action) {
                                        case "init":
                                            log("log", "INIT/ScheduleD", "Successfully initialized scheduleD.");
                                            resolve({
                                                "log": log,
                                                "mysql": mysqlConn,
                                                "redis": redisConn,
                                                "siteConfig": siteConfig,
                                                "bootConfig": bootConfig,
                                                "scheduleDaemon": scheduleDaemon
                                            });
                                            break;
                                    }
                                });
                                scheduleDaemon.on('exit', (code, signal) => {
                                    log("log", "INIT", "Schedule Daemon exited with code " + code + " and signal " + signal);
                                    process.exit(1);
                                });
                            }
                        });
                    }
                });
            }).catch(function (err) {
                reject(err);
            });
        });
    }
}

export { initializeBlorumServer };