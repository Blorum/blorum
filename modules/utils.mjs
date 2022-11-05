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
    let sets = {
        "flag": new Set(),
        "user_permission_read_allow": new Set(),
        "user_role_read_allow": new Set(),
        "role_read_allow": new Set(),
        "role_grant_allow": new Set(),
        "role_remove_allow": new Set(),
        "article_read_category_allow": new Set(),
        "article_read_tag_allow": new Set(),
        "article_create_category_allow": new Set(),
        "article_create_tag_allow": new Set(),
        "forum_default_read_category_allow": new Set(),
        "forum_default_read_tag_allow": new Set(),
        "comment_post_tag_allow": new Set(),
        "comment_post_category_allow": new Set()

    };
    let isRateLimitContained = false;
    var arrLen = arr.length;
    //The following part is generated to ensure the best performance, do not "optimize" it
    for (var i = 0; i < arrLen; i++) {
        let perm = arr[i];
        if (perm.with_rate_limit === 1) {
            isRateLimitContained = true;
        }
        //Flag processing
        let flagLen = perm.permissions.flags.length;
        for (var j = 0; j < flagLen; j++) {
            sets.flag.add(perm.permissions.flags[j]);
        }
        let user_permission_read_allowLen = perm.permissions.user.permission.read.allow.length;
        for (var j = 0; j < user_permission_read_allowLen; j++) {
            sets.user_permission_read_allow.add(perm.permissions.user.permission.read.allow[j]);
        }
        let user_role_read_allowLen = perm.permissions.user.role.read.allow.length;
        for (var j = 0; j < user_role_read_allowLen; j++) {
            sets.user_role_read_allow.add(perm.permissions.user.role.read.allow[j]);
        }
        let role_read_allowLen = perm.permissions.role.read.allow.length;
        for (var j = 0; j < role_read_allowLen; j++) {
            sets.role_read_allow.add(perm.permissions.role.read.allow[j]);
        }
        let role_grant_allowLen = perm.permissions.role.grant.allow.length;
        for (var j = 0; j < role_grant_allowLen; j++) {
            sets.role_grant_allow.add(perm.permissions.role.grant.allow[j]);
        }
        let role_remove_allowLen = perm.permissions.role.remove.allow.length;
        for (var j = 0; j < role_remove_allowLen; j++) {
            sets.role_remove_allow.add(perm.permissions.role.remove.allow[j]);
        }
        let article_read_category_allowLen = perm.permissions.article.read.category.allow.length;
        for (var j = 0; j < article_read_category_allowLen; j++) {
            sets.article_read_category_allow.add(perm.permissions.article.read.category.allow[j]);
        }
        let article_read_tag_allowLen = perm.permissions.article.read.tag.allow.length;
        for (var j = 0; j < article_read_tag_allowLen; j++) {
            sets.article_read_tag_allow.add(perm.permissions.article.read.tag.allow[j]);
        }
        let article_create_category_allowLen = perm.permissions.article.create.category.allow.length;
        for (var j = 0; j < article_create_category_allowLen; j++) {
            sets.article_create_category_allow.add(perm.permissions.article.create.category.allow[j]);
        }
        let article_create_tag_allowLen = perm.permissions.article.create.tag.allow.length;
        for (var j = 0; j < article_create_tag_allowLen; j++) {
            sets.article_create_tag_allow.add(perm.permissions.article.create.tag.allow[j]);
        }
        let forum_default_read_category_allowLen = perm.permissions.forum.default.read.category.allow.length;
        for (var j = 0; j < forum_default_read_category_allowLen; j++) {
            sets.forum_default_read_category_allow.add(perm.permissions.forum.default.read.category.allow[j]);
        }
        let forum_default_read_tag_allowLen = perm.permissions.forum.default.read.tag.allow.length;
        for (var j = 0; j < forum_default_read_tag_allowLen; j++) {
            sets.forum_default_read_tag_allow.add(perm.permissions.forum.default.read.tag.allow[j]);
        }
        let comment_post_tag_allowLen = perm.permissions.comment.post.tag.allow.length;
        for (var j = 0; j < comment_post_tag_allowLen; j++) {
            sets.comment_post_tag_allow.add(perm.permissions.comment.post.tag.allow[j]);
        }
        let comment_post_category_allowLen = perm.permissions.comment.post.category.allow.length;
        for (var j = 0; j < comment_post_category_allowLen; j++) {
            sets.comment_post_category_allow.add(perm.permissions.comment.post.category.allow[j]);
        }
        permSum.permissions.flags = Array.from(sets.flag);
        permSum.permissions.user.permission.read.allow = Array.from(sets.user_permission_read_allow);
        permSum.permissions.user.role.read.allow = Array.from(sets.user_role_read_allow);
        permSum.permissions.role.read.allow = Array.from(sets.role_read_allow);
        permSum.permissions.role.grant.allow = Array.from(sets.role_grant_allow);
        permSum.permissions.role.remove.allow = Array.from(sets.role_remove_allow);
        permSum.permissions.article.read.category.allow = Array.from(sets.article_read_category_allow);
        permSum.permissions.article.read.tag.allow = Array.from(sets.article_read_tag_allow);
        permSum.permissions.article.create.category.allow = Array.from(sets.article_create_category_allow);
        permSum.permissions.article.create.tag.allow = Array.from(sets.article_create_tag_allow);
        permSum.permissions.forum.default.read.category.allow = Array.from(sets.forum_default_read_category_allow);
        permSum.permissions.forum.default.read.tag.allow = Array.from(sets.forum_default_read_tag_allow);
        permSum.permissions.comment.post.tag.allow = Array.from(sets.comment_post_tag_allow);
        permSum.permissions.comment.post.category.allow = Array.from(sets.comment_post_category_allow);
        

        //Value processing
        if(perm.permissions.max_session > permSum.permissions.max_session) permSum.permissions.max_session = perm.permissions.max_session;
        if(perm.permissions.cookie_expire_after > permSum.permissions.cookie_expire_after) permSum.permissions.cookie_expire_after = perm.permissions.cookie_expire_after;
        if(perm.permissions.user.permission.read.default > permSum.permissions.user.permission.read.default) permSum.permissions.user.permission.read.default = perm.permissions.user.permission.read.default;
        if(perm.permissions.user.role.read.default > permSum.permissions.user.role.read.default) permSum.permissions.user.role.read.default = perm.permissions.user.role.read.default;
        if(perm.permissions.role.read.default > permSum.permissions.role.read.default) permSum.permissions.role.read.default = perm.permissions.role.read.default;
        if(perm.permissions.role.grant.level > permSum.permissions.role.grant.level) permSum.permissions.role.grant.level = perm.permissions.role.grant.level;
        if(perm.permissions.role.remove.level > permSum.permissions.role.remove.level) permSum.permissions.role.remove.level = perm.permissions.role.remove.level;
        if(perm.permissions.article.read.default > permSum.permissions.article.read.default) permSum.permissions.article.read.default = perm.permissions.article.read.default;
        if(perm.permissions.article.create.default > permSum.permissions.article.create.default) permSum.permissions.article.create.default = perm.permissions.article.create.default;
        if(perm.permissions.comment.user.default > permSum.permissions.comment.user.default) permSum.permissions.comment.user.default = perm.permissions.comment.user.default;
        if(perm.permissions.comment.article.default > permSum.permissions.comment.article.default) permSum.permissions.comment.article.default = perm.permissions.comment.article.default;
        if(perm.permissions.tag.create > permSum.permissions.tag.create) permSum.permissions.tag.create = perm.permissions.tag.create;
        if(perm.permissions.tag.remove > permSum.permissions.tag.remove) permSum.permissions.tag.remove = perm.permissions.tag.remove;
        if(perm.permissions.tag.add.article > permSum.permissions.tag.add.article) permSum.permissions.tag.add.article = perm.permissions.tag.add.article;
        if(perm.permissions.tag.add.post > permSum.permissions.tag.add.post) permSum.permissions.tag.add.post = perm.permissions.tag.add.post;
        if(perm.permissions.report.create > permSum.permissions.report.create) permSum.permissions.report.create = perm.permissions.report.create;
        if(perm.permissions.log.read > permSum.permissions.log.read) permSum.permissions.log.read = perm.permissions.log.read;
    }
    if(isRateLimitContained) {
        permSum.with_rate_limit = 1;
        for (var i = 0; i < arrLen; i++) {
            let perm = arr[i];
            if(perm.rate_limits.login > permSum.rate_limits.login) permSum.rate_limits.login = perm.rate_limits.login;
            if(perm.rate_limits.invite > permSum.rate_limits.invite) permSum.rate_limits.invite = perm.rate_limits.invite;
            if(perm.rate_limits.report > permSum.rate_limits.report) permSum.rate_limits.report = perm.rate_limits.report;
            if(perm.rate_limits.edit.post.self > permSum.rate_limits.edit.post.self) permSum.rate_limits.edit.post.self = perm.rate_limits.edit.post.self;
            if(perm.rate_limits.edit.post.tag > permSum.rate_limits.edit.post.tag) permSum.rate_limits.edit.post.tag = perm.rate_limits.edit.post.tag;
            if(perm.rate_limits.edit.post.category > permSum.rate_limits.edit.post.category) permSum.rate_limits.edit.post.category = perm.rate_limits.edit.post.category;
            if(perm.rate_limits.edit.post.forum > permSum.rate_limits.edit.post.forum) permSum.rate_limits.edit.post.forum = perm.rate_limits.edit.post.forum;
            if(perm.rate_limits.edit.article.self > permSum.rate_limits.edit.article.self) permSum.rate_limits.edit.article.self = perm.rate_limits.edit.article.self;
            if(perm.rate_limits.edit.article.tag > permSum.rate_limits.edit.article.tag) permSum.rate_limits.edit.article.tag = perm.rate_limits.edit.article.tag;
            if(perm.rate_limits.edit.article.category > permSum.rate_limits.edit.article.category) permSum.rate_limits.edit.article.category = perm.rate_limits.edit.article.category;
            if(perm.rate_limits.edit.comment > permSum.rate_limits.edit.comment) permSum.rate_limits.edit.comment = perm.rate_limits.edit.comment;
            if(perm.rate_limits.edit.note > permSum.rate_limits.edit.note) permSum.rate_limits.edit.note = perm.rate_limits.edit.note;
            if(perm.rate_limits.edit.user > permSum.rate_limits.edit.user) permSum.rate_limits.edit.user = perm.rate_limits.edit.user;
            if(perm.rate_limits.edit.category > permSum.rate_limits.edit.category) permSum.rate_limits.edit.category = perm.rate_limits.edit.category;
            if(perm.rate_limits.edit.forum > permSum.rate_limits.edit.forum) permSum.rate_limits.edit.forum = perm.rate_limits.edit.forum;
            if(perm.rate_limits.create.category > permSum.rate_limits.create.category) permSum.rate_limits.create.category = perm.rate_limits.create.category;
            if(perm.rate_limits.create.post > permSum.rate_limits.create.post) permSum.rate_limits.create.post = perm.rate_limits.create.post;
            if(perm.rate_limits.create.react > permSum.rate_limits.create.react) permSum.rate_limits.create.react = perm.rate_limits.create.react;
            if(perm.rate_limits.create.article > permSum.rate_limits.create.article) permSum.rate_limits.create.article = perm.rate_limits.create.article
            if(perm.rate_limits.create.comment > permSum.rate_limits.create.comment) permSum.rate_limits.create.comment = perm.rate_limits.create.comment;
            if(perm.rate_limits.create.note > permSum.rate_limits.create.note) permSum.rate_limits.create.note = perm.rate_limits.create.note;
            if(perm.rate_limits.create.forum > permSum.rate_limits.create.forum) permSum.rate_limits.create.forum = perm.rate_limits.create.forum;
            if(perm.rate_limits.create.report > permSum.rate_limits.create.report) permSum.rate_limits.create.report = perm.rate_limits.create.report;
            if(perm.rate_limits.create.user > permSum.rate_limits.create.user) permSum.rate_limits.create.user = perm.rate_limits.create.user;
            if(perm.rate_limits.remove.category > permSum.rate_limits.remove.category) permSum.rate_limits.remove.category = perm.rate_limits.remove.category;
            if(perm.rate_limits.remove.post > permSum.rate_limits.remove.post) permSum.rate_limits.remove.post = perm.rate_limits.remove.post;
            if(perm.rate_limits.remove.react > permSum.rate_limits.remove.react) permSum.rate_limits.remove.react = perm.rate_limits.remove.react;
            if(perm.rate_limits.remove.article > permSum.rate_limits.remove.article) permSum.rate_limits.remove.article = perm.rate_limits.remove.article;
            if(perm.rate_limits.remove.comment > permSum.rate_limits.remove.comment) permSum.rate_limits.remove.comment = perm.rate_limits.remove.comment;
            if(perm.rate_limits.remove.note > permSum.rate_limits.remove.note) permSum.rate_limits.remove.note = perm.rate_limits.remove.note;
            if(perm.rate_limits.remove.forum > permSum.rate_limits.remove.forum) permSum.rate_limits.remove.forum = perm.rate_limits.remove.forum;
            if(perm.rate_limits.remove.report > permSum.rate_limits.remove.report) permSum.rate_limits.remove.report = perm.rate_limits.remove.report;
            if(perm.rate_limits.remove.user > permSum.rate_limits.remove.user) permSum.rate_limits.remove.user = perm.rate_limits.remove.user;
            if(perm.rate_limits.site.change_config > permSum.rate_limits.site.change_config) permSum.rate_limits.site.change_config = perm.rate_limits.site.change_config;
            
        }
    }
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