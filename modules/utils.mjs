import { default as blake3 } from "blake3";
import { default as crypto } from "crypto";
import Redis from "ioredis";

const version = "1.0.0 in_dev (unf, debug) dv 10004";

const c = {
    "reset": "\x1b[0m",
    "bright": "\x1b[1m",
    "dim": "\x1b[2m",
    "underscore": "\x1b[4m",
    "blink": "\x1b[5m",
    "reverse": "\x1b[7m",
    "hidden": "\x1b[8m",
    "fgBlack": "\x1b[30m",
    "fgRed": "\x1b[31m",
    "fgGreen": "\x1b[32m",
    "fgYellow": "\x1b[33m",
    "fgBlue": "\x1b[34m",
    "fgMagenta": "\x1b[35m",
    "fgCyan": "\x1b[36m",
    "fgWhite": "\x1b[37m",
    "bgBlack": "\x1b[40m",
    "bgRed": "\x1b[41m",
    "bgGreen": "\x1b[42m",
    "bgYellow": "\x1b[43m",
    "bgBlue": "\x1b[44m",
    "bgMagenta": "\x1b[45m",
    "bgCyan": "\x1b[46m",
    "bgWhite": "\x1b[47m"
}

function outputLogs(level, context, info) {
    let currentTime = new Date().toTimeString().substring(0, 8);
    let logs = `[${level}][${currentTime}][${context}]: ${info}`;
    console.log(logs);
}

function outputLogsColored(level, context, info) {
    let date = new Date();
    let currentTime = date.toTimeString().substring(0, 8) + "." + date.getMilliseconds();
    let logs = "";
    switch (level) {
        case "debug":
            var lc = c.bgMagenta;
            break;
        case "log":
            var lc = c.bgCyan;
            break;
        case "warn":
            var lc = c.bgYellow;
            break;
        case "error":
            var lc = c.bgRed;
            break
    }
    console.log(c.fgWhite + lc + "[" + level + "]" + c.reset + c.fgGreen + "[" + currentTime + "]" + c.fgBlue + "[" + context + "]: " + c.reset + info);
}

function blake3Hash(text) {
    return blake3.hash(text, {"length": 66}).toString("base64");
}

function generateNewToken(salt, username) {
    return blake3Hash(salt + crypto.randomBytes(16).toString('hex') + new Date().toTimeString() + username);
}

function promisifiedMysqlConnect(mysqlConnection) {
    return new Promise((resolve, reject) => {
        mysqlConnection.connect(function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(mysqlConnection);
            }
        });
    });
}

function promisifiedRedisConnect(config) {
    return new Promise((resolve, reject) => {
        const redisConnection = new Redis(config);
        redisConnection.on("error", function (err) {
            reject(err);
        }).on("ready", function () {
            redisConnection.ping().then(function (result) {
                if (result == "PONG") {
                    resolve(redisConnection);
                } else {
                    reject("Redis connection failed: no PONG response");
                }
            });
        });
    });
}

function isModuleAvailable(name) {
    try {
        require.resolve(name);
        return true;
    } catch (e) {
        return false;
    }
}

function isAllString(...args){
    for(let i = 0; i < args.length; i++){
        if(typeof args[i] !== "string"){
            return false;
        }
    }
    return true;
}

function objHasAllProperties(obj, ...props){
    for(let i = 0; i < props.length; i++){
        if(!obj.hasOwnProperty(props[i])){
            return false;
        }
    }
    return true;
}

function strASCIIOnly(str){
    return /^[\x00-\x7F]*$/.test(str);
}

function strStrictLegal(str){
    return /^[a-zA-Z0-9_]+$/.test(str);
}

function strNotOnlyNumber(str){
    return /[^0-9]/.test(str);
}

function basicPasswordRequirement(str){
    //at least 8 characters, includes at least one number, one letter
    return /^(?:(?=.*[a-z])|(?=.*[A-Z]))(?=.*\d)[^]{8,}$/.test(str);
}

function isValidEmail(str){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

function mergeJSON(...args){
    let obj = {};
    for(let i = 0; i < args.length; i++){
        for(let key in args[i]){
            obj[key] = args[i][key];
        }
    }
    return obj;
}

function filterSpace(str){
    return str.replace(/\s/g, '');
}

function cookieParser(raw){
    let cookie = {};
    let pairs = raw.split(';');
    for(let i = 0; i < pairs.length; i++){
        let pair = pairs[i].split('=');
        cookie[filterSpace(pair[0])] = pair[1];
    }
    return cookie;
}


export { 
    version, outputLogs, outputLogsColored, blake3Hash, generateNewToken, 
    isModuleAvailable, promisifiedMysqlConnect, promisifiedRedisConnect,
    strASCIIOnly, strStrictLegal, basicPasswordRequirement, isValidEmail, isAllString,
    objHasAllProperties, strNotOnlyNumber, mergeJSON, cookieParser
};