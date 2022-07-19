import parse from "json5";
JSON.parse = parse.parse;

import {
    generateNewToken, blake3Hash, objHasAllProperties,
    strASCIIOnly, strStrictLegal, basicPasswordRequirement, isValidEmail, strNotOnlyNumber,
    mergeJSON
} from "./utils.mjs";

class IAPI {
    constructor(mysql, redis, siteConfig, log, salt, redisPrefix) {
        this.mysql = mysql;
        this.redis = redis;
        this.siteConfig = siteConfig;
        this.log = log;
        this.salt = salt;
        this.rp = redisPrefix;
        //For util functions in IAPI, redis prefix will not be automatically added.
        //Redis prefix needed to be added manually in caller function.
        this.rolePermissions = JSON.parse(siteConfig.roles_permissions);
        this.log("log", "IAPI", "IAPI instance created.");
    }
    timestamp(){
        return new Date().getTime();
    }

    getRedisKeyIfExists(redisKey){
        return new Promise((resolve, reject) => {
            //check if redisKey exists, if yes, get the value of it and return it, if not, return null.
            this.redis.exists(redisKey, (err, results) => {
                if(err){
                    reject(err);
                    this.log("log", "IAPI", "Failed to check if redis key exists: " + redisKey);
                }else{
                    if(results == 1){
                        this.redis.get(redisKey, (err, results) => {
                            if(err){
                                reject(err);
                                this.log("log", "IAPI", "Failed to get redis key: " + redisKey);
                            }else{
                                resolve(results);
                            }
                        });
                    }else{
                        reject("Redis key not found");
                    }
                }
            });
        });
    }
    removeExpiredSessions(uid, expireAfter, results){
        let redisKey = this.rp + ":user_session:" + uid;
        let promisePool = [];
        for(const element of results){
            let parsedElement = JSON.parse(element);
            if(parsedElement.statistics.date + expireAfter < this.timestamp()){
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
    getUserSession(uid){
        return new Promise((resolve, reject) => {
            this.redis.lrange(this.rp + ":user_session:" + uid, 0, -1, (err, results) => {
                if(err){
                    reject(err);
                }else{
                    resolve(results);
                }
            });
        });
    }
    getValidUserSession(uid){
        return new Promise(async (resolve, reject) => {
            try {
                let currentSessions = await this.getUserSession(uid);
                if(currentSessions.length > 0){
                    let userPermissions = await this.getUserPermissions(uid);
                    let removedSessionsCount = await this.removeExpiredSessions(uid, JSON.parse(this.siteConfig["roles_permissions"])[userPermissions.role]["cookie_expire_after"], currentSessions);
                    let finalSessions = await this.getUserSession(uid);
                    if(finalSessions.length > 0){
                        resolve({
                            "sessions": finalSessions,
                            "permissions": userPermissions,
                            "removed_sessions": removedSessionsCount
                        });
                    }else{
                        resolve({
                            "sessions": []
                        });
                    }
                }else{
                    resolve({
                        "sessions": []
                    });
                }

            } catch (error) {
                reject(error);
            }
        });
    }
    //Actual service functions
    userLogin(ip, ua, username, password) {
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
                                let redisKey = this.rp + ":user_session:" + user.uid;
                                let cookieExpireAfter = JSON.parse(this.siteConfig["roles_permissions"])[userRole]["cookie_expire_after"];
                                let permissionsRedisKey = this.rp + ":user_permissions:" + user.uid;
                                this.redis.set(permissionsRedisKey, JSON.stringify(userPermissions), (err, results) => {
                                    if (err) {
                                        this.log("debug", "IAPI", "Failed to set redis key: " + permissionsRedisKey);
                                        reject(err);
                                    } else {
                                        this.redis.pexpire(permissionsRedisKey, cookieExpireAfter, (err, results) => {
                                            if (err) {
                                                this.log("debug", "IAPI", "Failed to set redis key expire: " + permissionsRedisKey);
                                                reject(err);
                                            }
                                        });
                                    }
                                });

                                let finalSession = JSON.stringify({
                                    "token": newToken,
                                    "statistics": {
                                        "date": this.timestamp(),
                                        "userAgent": ua,
                                        "ip": ip
                                    }
                                });
                                this.redis.lrange(redisKey, 0, -1, (err, results) => {
                                    this.removeExpiredSessions(user.uid, userPermissions.cookie_expire_after, results).then((removedSessions) => {
                                        if(results.length - removedSessions >= userPermissions.max_session){
                                            this.log("debug", "IAPI", "Removed " + removedSessions + " expired sessions from redis");
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
                                                        "role": userRole,
                                                        "permissions": userPermissions.permissions,
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
    userRegister(ip, ua, username, password, email, nickname) {
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
                                let defaultRolePermissions = JSON.parse(this.siteConfig.roles_permissions)[this.siteConfig.register_default_role];
                                delete defaultRolePermissions["cookie_expire_after"];
                                let defaultPermissions = mergeJSON(
                                    {
                                        "role": this.siteConfig.register_default_role
                                    },
                                    defaultRolePermissions
                                );
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
    userLogout(uid, token){
        return new Promise((resolve, reject) => {  
            let promisePool = [];
            let redisKey = this.rp + ":user_session:" + uid;
            this.redis.lrange(redisKey, 0, -1, (err, results) => {
                for(const element of results){
                    let parsedElement = JSON.parse(element);
                    if(parsedElement.token === token){
                        promisePool.push(new Promise((resolve, reject) => {
                            this.redis.lrem(redisKey, 0, element, (err, results) => {
                                if(err){
                                    reject(err);
                                }else{
                                    resolve(results);
                                }
                            });
                        }));
                    }
                }
                return Promise.all(promisePool).then((results) => {
                    if(results.length > 0){
                        resolve();
                    }else{
                        reject("Token not found");
                    }
                }).catch((err) => {
                    reject(err);
                });
            }).catch((err) => {
                reject(err);
            });
        });
    }
    getUserPermissions(uid){
        return new Promise((resolve, reject) => {
            let redisKey = this.rp + ":user_permissions:" + uid;
            this.getRedisKeyIfExists(redisKey).then((results) => {
                resolve(JSON.parse(results));
            }).catch((err) => {
                this.log("debug", "IAPI", "Failed to get user permissions from redis.");
                this.mysql.query(
                    "SELECT permissions FROM users WHERE uid = ?",
                    [uid],
                    (err, results) => {
                        if(err){
                            this.log("debug", "IAPI", "Failed to query database.");
                            reject(err);
                        }else{
                            if(results.length === 0){
                                this.log("debug", "IAPI", "User not found in database.");
                                reject("User not found");
                            }else{
                                resolve(results[0].permissions);
                            }
                        }
                    }
                );
            });
        });
    }
    //userSessionList(req, uid, token)
}

export { IAPI };