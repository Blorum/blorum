import { blake3 } from '@noble/hashes/blake3';

import { default as crypto } from "crypto";
import Redis from "ioredis";
import parse from "simdjson";
import { v4 as uuidv4 } from 'uuid';
JSON.parse = parse.parse;

const version = "1.0.0 Development";
const innerVersion = "0";

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
    if (currentTime.length == 10) {
        currentTime = currentTime + "00";
    } else if (currentTime.length == 11) {
        currentTime = currentTime + "0";
    }
    let logs = `[${level}][${currentTime}][${context}]: ${info}`;
    console.log(logs);
}

function outputLogsColored(level, context, info) {
    let date = new Date();
    let currentTime = date.toTimeString().substring(0, 8) + "." + date.getMilliseconds();
    if (currentTime.length == 10) {
        currentTime = currentTime + "00";
    } else if (currentTime.length == 11) {
        currentTime = currentTime + "0";
    }
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
    return Buffer.from(blake3.create({dkLen: 66}).update(text).digest()).toString('base64');
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

function isAllString(...args) {
    for (let i = 0; i < args.length; i++) {
        if (typeof args[i] !== "string") {
            return false;
        }
    }
    return true;
}

function objHasAllProperties(obj, ...props) {
    for (let i = 0; i < props.length; i++) {
        if (!obj.hasOwnProperty(props[i])) {
            return false;
        }
    }
    return true;
}

function strASCIIOnly(str) {
    return /^[\x00-\x7F]*$/.test(str);
}

function strStrictLegal(str) {
    return /^[a-zA-Z0-9_]+$/.test(str);
}

function strNotOnlyNumber(str) {
    return /[^0-9]/.test(str);
}

function basicPasswordRequirement(str) {
    //at least 8 characters, includes at least one number, one letter
    return /^(?:(?=.*[a-z])|(?=.*[A-Z]))(?=.*\d)[^]{8,}$/.test(str);
}

function isValidEmail(str) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

function mergeJSON(...args) {
    let obj = {};
    for (let i = 0; i < args.length; i++) {
        for (let key in args[i]) {
            obj[key] = args[i][key];
        }
    }
    return obj;
}

function filterSpace(str) {
    return str.replace(/\s/g, '');
}

function cookieParser(raw) {
    let cookie = {};
    let pairs = raw.split(';');
    var pairsLen = pairs.length;
    for (let i = 0; i < pairsLen; i++) {
        let pair = pairs[i].split('=');
        cookie[filterSpace(pair[0])] = pair[1];
    }
    return cookie;
}

function pureArray(arr) {
    //remove all empty items in an array
    return arr.filter(item => item !== "");
}

function mergeArray(...args) {
    return Array.from(new Set(args.reduce((a, b) => a.concat(b))));
}

function getFinalPermission(arr) {
    //v temp to be removed
    return getPermissionSum(arr);
    //^ temp to be removed

}

function getPermissionSum(arr) {
    //Grantive role permission sum

    //permSum is also the permission fallback, 
    //any permissions given to the user will override the permSum

    //PRIORITY TODO
    //update database permission sql to new format
    let permSum = {
        "with_rate_limit": 0,
        "permissions": {
            "flags": [],
            "max_session": 10,
            "cookie_expire_after": 13150000000,
            "user": {
                "permission": {
                    "read": {
                        "default": 0,
                        "allow": []
                    }
                },
                "role": {
                    "read": {
                        "default": 0,
                        "allow": []
                    }
                }
            },
            "role": {
                "read": {
                    "default": 0,
                    "allow": []
                },
                "grant": {
                    "level": 0,
                    "allow": []
                },
                "remove": {
                    "level": 0,
                    "allow": []
                },
            },
            "article": {
                "read": {
                    "default": 0,
                    "category": {
                        "allow": []
                    },
                    "tag": {
                        "allow": []
                    }
                },
                "create": {
                    "default": 0,
                    "category": {
                        "allow": []
                    },
                    "tag": {
                        "allow": []
                    }
                },
            },
            "forum": {
                "default": {
                    "read": {
                        "category": {
                            "allow": []
                        },
                        "tag": {
                            "allow": []
                        }
                    }
                }
            },
            "comment": {
                "post": {
                    "tag": {
                        "allow": []
                    },
                    "category": {
                        "allow": []
                    }
                },
                "user": {
                    "default": 0
                },
                "article": {
                    "tag": {
                        "allow": []
                    },
                    "category": {
                        "allow": []
                    }
                }
            },
            "tag": {
                "create": 0,
                "remove": 0,
                "add": {
                    "article": 0,
                    "post": 0
                }
            },
            "report": {
                "create": 0
            },
            "log": {
                "read": 0
            }
        },
        "rate_limits": {
            "login": 1,
            "invite": 0,
            "report": 0,
            "edit": {
                "post": {
                    "self": 0,
                    "tag": 0,
                    "category": 0,
                    "forum": 0
                },
                "article": {
                    "self": 0,
                    "tag": 0,
                    "category": 0
                },
                "comment": 0,
                "note": 0,
                "user": 0,
                "category": 0,
                "forum": 0,
            },
            "create": {
                "category": 0,
                "post": 0,
                "react": 0,
                "article": 0,
                "comment": 0,
                "note": 0,
                "forum": 0,
                "report": 0,
                "user": 0
            },
            "remove": {
                "category": 0,
                "post": 0,
                "react": 0,
                "article": 0,
                "comment": 0,
                "note": 0,
                "forum": 0,
                "report": 0,
                "user": 0
            },
            "site": {
                "change_config": 0
            }
        }
    };
    //TODO: update permission sum
    return permSum;
}

function getLPermissionSum(arr) {
    //Limitive permission sum.
    //TODO
}

function InfFixProxy(obj){
    return new Proxy(obj, {
        get: function(target, prop, receiver) {
            let val = Reflect.get(target, prop, receiver);
            if(val == -1){
                return Infinity;
            }
            return val;
        },
        set: function(target, prop, value, receiver) {
            return Reflect.set(target, prop, value, receiver);
        }
    })
}

function removeElementFromArray(arr, element){
    let index = arr.indexOf(element);
    if(index > -1){
        arr.splice(index, 1);
    }
}

function filterAction(obj){
    //Remove all dumplicate actions in an actionList
}

function syncScheduleDMsg(daemon, action, load){
    let messageID = uuidv4();
    let message = {
        "id": messageID,
        "action": action,
        "data": load
    };
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            reject(); //Failed scheduled message.
        },30000);
        let executor = (msg) => {
            if(msg.id == messageID){
                resolve(msg);
                daemon.removeListener("message", executor);
            }
        };
        daemon.on("message", executor);
        daemon.send(message);
    });
}

export {
    version, innerVersion, outputLogs, outputLogsColored, blake3Hash, generateNewToken,
    isModuleAvailable, promisifiedMysqlConnect, promisifiedRedisConnect,
    strASCIIOnly, strStrictLegal, basicPasswordRequirement, isValidEmail, isAllString,
    objHasAllProperties, strNotOnlyNumber, mergeJSON, mergeArray, cookieParser, pureArray, filterSpace, getPermissionSum, getLPermissionSum, getFinalPermission,
    removeElementFromArray, InfFixProxy, filterAction, syncScheduleDMsg
};