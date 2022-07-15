import parse from "json5";
JSON.parse = parse.parse;

import {
    generateNewToken, blake3Hash, objHasAllProperties,
    strASCIIOnly, strStrictLegal, basicPasswordRequirement, isValidEmail, strNotOnlyNumber
} from "./utils.mjs";

class IAPI {
    constructor(mysql, redis, siteConfig, log, salt) {
        this.mysql = mysql;
        this.redis = redis;
        this.siteConfig = siteConfig;
        this.log = log;
        this.salt = salt;
        this.rolePermissions = JSON.parse(siteConfig.roles_permissions);
        this.log("log", "IAPI", "IAPI instance created.");
    }
    timestamp(){
        return new Date().getTime();
    }
    IP(req) {
        if(this.siteConfig.ip_detect_method == "connection"){
            return req.connection.remoteAddress;
        }else if(this.siteConfig.ip_detect_method == "header"){
            //Default header X-Forwarded-From.
            if(req.headers.hasOwnProperty(this.siteConfig.ip_detect_header)){
                return req.headers[this.siteConfig.ip_detect_header];
            }else{
                this.log("error", "IAPI", "Dictated IP detection method is header, but header is not found");
                if(req.headers.hasOwnProperty("X-Forwarded-From")){
                    return req.headers["X-Forwarded-From"];
                }else{
                    return req.connection.remoteAddress;
                }
            }
        }else{
            this.log("error", "IAPI", "Dictated IP detection method is not found.");
            return req.connection.remoteAddress;
        }
    }
    removeExpiredSessions(redisKey, userPermissions, results){
        let promisePool = [];
        for(const element of results){
            let parsedElement = JSON.parse(element);
            if(parsedElement.statistics.date + userPermissions.flags.cookie_expire_after < this.timestamp()){
                promisePool.push(new Promise((resolve, reject) => {
                    this.redis.lrem(redisKey, 0, element, (err, results) => {
                        if(err){
                            reject(err);
                            this.log("log", "IAPI", "Failed to remove expired session from redis");
                        }else{
                            resolve(results);
                        }
                    });
                }));
            }
        }
        return new Promise((resolve, reject) => {
            Promise.all(promisePool).then((results) => {
                let totalRemovedSessions = 0;
                for(const element of results){
                    totalRemovedSessions += element;
                }
                resolve(totalRemovedSessions);
            }).catch((err) => {
                reject(err);
            });
        });
    }
    userLogin(req, username, password) {
        let connIP = this.IP(req);
        let userAgent = req.headers['user-agent'];
        return new Promise((resolve, reject) => {
            password = blake3Hash(this.salt + password);
            this.mysql.query(
                "SELECT uid,password,permissions FROM users WHERE username = ?",
                [username],
                (err, results) => {
                    if (err) {
                        this.log("debug", "IAPI", "Failed to query database");
                        reject(err);
                    } else {
                        if (results.length === 0) {
                            this.log("debug", "IAPI", "User not found: " + username);
                            reject("User not found");
                        } else {
                            let user = results[0];
                            if (user.password === password) {
                                let newToken = generateNewToken(this.salt, username);
                                let userPermissions = user.permissions;
                                let userRole = userPermissions.role;
                                let redisKey = "user_session:" + user.uid;
                                let cookieExpireAfter = this.rolePermissions[userRole].cookie_expire_after;
                                let finalSession = JSON.stringify({
                                    "token": newToken,
                                    "permissions": user.permissions,
                                    "statistics": {
                                        "date": this.timestamp(),
                                        "userAgent": userAgent,
                                        "ip": connIP
                                    }
                                });
                                this.redis.lrange(redisKey, 0, -1, (err, results) => {
                                    this.removeExpiredSessions(redisKey, userPermissions, results).then((removedSessions) => {
                                        if(results.length - removedSessions >= userPermissions.flags.max_session){
                                            console.log(removedSessions);
                                            reject("You have reached the maximum number of sessions.");
                                        }else{
                                            this.redis.lpush(redisKey,finalSession, (err, results) => {
                                                if (err) {
                                                    this.log("debug", "IAPI", "Failed to push user session to redis");
                                                    reject(err);
                                                } else {
                                                    this.log("debug", "IAPI", "Successfully pushed user session to redis, user logged in: " + username + ",results: " + results);
                                                    resolve({
                                                        "uid": user.uid,
                                                        "permissions": {
                                                            "role": userRole,
                                                            "flags": userPermissions.flags.permissions.flags
                                                        },
                                                        "token": newToken
                                                    });
                                                }
                                            });
                                        }
                                    }).catch((err) => {
                                        reject(err);
                                    });
                                });
                            } else {
                                this.log("debug", "IAPI", "Wrong password");
                                reject("Wrong password");
                            }
                        }
                    }
                }
            );
        });
    }
    userRegister(req, username, password, email, nickname) {
        let connIP = this.IP(req);
        let userAgent = req.headers['user-agent'];
        return new Promise((resolve, reject) => {
            if (!basicPasswordRequirement(password)) {
                reject("Password does not meet basic requirements(> 8 characters, contains at least one number, one letter)");
            }else if (!strStrictLegal(username)) {
                reject("Username does not meet strict legal requirements(only letters, numbers, and underscores)");
            }else if (!isValidEmail(email)) {
                reject("Email is not valid");
            }else if(!strNotOnlyNumber(username)){
                reject("Username cannot be only numbers");
            }else{
                password = blake3Hash(this.salt + password);
                this.mysql.query(
                    "SELECT * FROM users WHERE username = ?",
                    [username],
                    (err, results) => {
                        if (err) {
                            this.log("debug", "IAPI", "Failed to query database");
                            reject(err);
                        } else {
                            if (results.length === 0) {
                                let defaultAbout;
                                let defaultAvatar = this.siteConfig.default_avatar;
                                let statisticsPrototype = {
                                    "invited_by": 0,
                                    "registered_at": this.timestamp(),
                                    "create":{
                                        "comment": 0,
                                        "react": 0,
                                        "article": 0,
                                        "note": 0,	
                                    },
                                    "received": {
                                        "comment": {
                                            "profile": 0,
                                            "article": 0,
                                            "post": 0,
                                            "comment": 0
                                        }
                                    },
                                    "read": {
                                        "time": 0,
                                        "article": 0,
                                        "post": 0
                                    },
                                    "invite": []
                                };
                                let defaultPreferences = {
                                    
                                };
                                let defaultPermissions = {
                                    "role": "user",
                                    "flags": JSON.parse(this.siteConfig.roles_permissions)[this.siteConfig.register_default_role]
                                }
                                try {
                                    this.mysql.query(
                                        "INSERT INTO users (username, nickname, email, password, avatar, about, statistics, permissions, preferences) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                                        [username, nickname, email, password, defaultAvatar, "", 
                                        JSON.stringify(statisticsPrototype), JSON.stringify(defaultPermissions), JSON.stringify(defaultPreferences)],
                                        (err, results) => {
                                            if (err) {
                                                this.log("debug", "IAPI", "Failed to insert user");
                                                reject(err);
                                            } else {
                                                this.log("debug", "IAPI", "User registered: " + username);
                                                resolve({
                                                    "uid": results.insertId
                                                });
                                            }
                                        }
                                    );
                                } catch (error) {
                                    reject(error);
                                }
                            } else {
                                this.log("debug", "IAPI", "User already exists: " + username);
                                reject("User already exists");
                            }
                        }
                    }
                );
            }
        });
    }
}

export { IAPI };