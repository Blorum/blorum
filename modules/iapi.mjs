import parse from "simdjson";
JSON.parse = parse.parse;

import {
    generateNewToken, blake3Hash, objHasAllProperties,
    strASCIIOnly, strStrictLegal, basicPasswordRequirement, isValidEmail, strNotOnlyNumber,
    mergeJSON, getPermissionSum
} from "./utils.mjs";
import { v4 as uuidv4 } from 'uuid';

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
                        resolve(null);
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
                    let userRoles = await this.getUserRoles(uid);
                    let rolePermList = [];
                    let promisePool = [];
                    for(const role of userRoles){
                        promisePool.push(this.getRolePermissions(role));
                    }
                    Promise.allSettled(promisePool).then((results) => {
                        rolePermList = results;
                    });
                    let permissionSum = getPermissionSum(rolePermList);
                    let removedSessionsCount = await this.removeExpiredSessions(uid, permissionSum.permissions.cookie_expire_after, currentSessions);
                    let finalSessions = await this.getUserSession(uid);
                    if(finalSessions.length > 0){
                        resolve({
                            "sessions": finalSessions,
                            "permissions": permissionSum,
                            "roles": userRoles,
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
    getRolePermissions(role){
        return new Promise((resolve, reject) => {
            this.redis.get(this.rp + ":roles:" + role, (err, results) => {
                if(err){
                    reject(err);
                }else{
                    resolve(JSON.parse(results));
                }
            });
        });
    }
    getUserRoles(uid){
        return new Promise((resolve, reject) => {
            let redisKey = this.rp + ":user_roles:" + uid;
            this.getRedisKeyIfExists(redisKey).then((results) => {
                if(results == null){
                    this.mysql.query(
                        "SELECT roles FROM users WHERE uid = ?",
                        [uid],
                        (err, results) => {
                            if(err){
                                this.log("debug", "IAPI", "Failed to query database.");
                                reject(err);
                            }else{
                                if(results.length === 0){
                                    this.log("debug", "IAPI", "User not found in database: " + uid);
                                    resolve(null);
                                }else{
                                    resolve(results[0].roles.split(","));
                                }
                            }
                        }
                    );
                }else{
                    resolve(results.split(","));
                }
            }).catch((err) => {
                this.log("debug", "IAPI", "Failed to get user roles from redis: " + err);
                this.mysql.query(
                    "SELECT roles FROM users WHERE uid = ?",
                    [uid],
                    (err, results) => {
                        if(err){
                            this.log("debug", "IAPI", "Failed to query database.");
                            reject(err);
                        }else{
                            if(results.length === 0){
                                this.log("debug", "IAPI", "User not found in database.");
                                resolve(null);
                            }else{
                                resolve(results[0].roles.split(","));
                            }
                        }
                    }
                );
            });
        });
    }
    getUserPermissions(uid){
        return new Promise(async (resolve, reject) => {
            let userRoles = await this.getUserRoles(uid);
            if(userRoles == null){
                reject("User not found in database.");
            }else if(typeof userRoles === "object" && userRoles[0] == ""){
                reject("User has no roles.");
            }else{
                let promisePool = [];
                for(const element of userRoles){
                    promisePool.push(new Promise((resolve, reject) => {
                        this.getRolePermissions(element).then((results) => {
                            resolve(results);
                        }).catch((err) => {
                            reject(err);
                        });
                    }));
                }
                Promise.allSettled(promisePool).then((results) => {
                    let permissions = getPermissionSum(results);
                    resolve(permissions);
                }).catch((err) => {
                    reject(err);
                });
            }
        });
    }
    //Actual service functions
    userLogin(ip, ua, username, password) {
        //Assume that user don't have login status, don't use session_check middleware optimization.
        return new Promise(async (resolve, reject) => {
            password = blake3Hash(this.salt + password);
            this.mysql.query(
                "SELECT uid,password,roles FROM users WHERE username = ?",
                [username],
                async (err, results) => {
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
                                let userRole = user.roles.split(",");
                                let sessionRedisKey = this.rp + ":user_session:" + user.uid;

                                let permissionList = [];
                                let permissionRedisPromisePool = [];
                                for(const element of userRole){
                                    permissionRedisPromisePool.push(
                                        this.getRolePermissions(element).then((result) => {
                                            permissionList.push(result);
                                        })
                                    );  
                                }
                                Promise.all(permissionRedisPromisePool).then(() => {
                                    
                                    let permissionSum = getPermissionSum(permissionList);
                                    let cookie_expire_after = permissionSum.permissions.cookie_expire_after;
                                    let tokenBucketRedisKey = this.rp + ":user_token_bucket:" + user.uid;
                                    /*
                                    TODO:
                                    
                                    User token bucket not re-implemented yet!
                                    */
                                    if(permissionSum.with_rate_limit){
    
                                    }else{
                                        //user don't have a rate limit, use fallback rate limit(added by getPermissionSum) and prompt both user & admin an system error log.

                                        //TODO: update log db structure and add "level"
                                    }

                                    let rolesRedisKey = this.rp + ":user_roles:" + user.uid;
                                    this.redis.set(rolesRedisKey, userRole, (err, results) => {
                                        if (err) {
                                            this.log("debug", "IAPI", "Failed to set redis key: " + rolesRedisKey);
                                            reject(err);
                                        } else {
                                            this.redis.pexpire(rolesRedisKey, cookie_expire_after, (err, results) => {
                                                if (err) {
                                                    this.log("debug", "IAPI", "Failed to set redis key expire: " + rolesRedisKey);
                                                    reject(err);
                                                }
                                            });
                                        }
                                    });
                                    let uuid = uuidv4();
                                    let finalSession = JSON.stringify({
                                        "token": newToken,
                                        "uuid": uuid,
                                        "statistics": {
                                            "date": this.timestamp(),
                                            "userAgent": ua,
                                            "ip": ip
                                        }
                                    });
                                    this.redis.lrange(sessionRedisKey, 0, -1, (err, results) => {
                                        this.removeExpiredSessions(user.uid, permissionSum.permissions.cookie_expire_after, results).then((removedSessions) => {
                                            if(results.length - removedSessions >= permissionSum.permissions.max_session){
                                                this.log("debug", "IAPI", "Removed " + removedSessions + " expired sessions from redis");
                                                reject("You have reached the maximum number of sessions.");
                                            }else{
                                                this.redis.lpush(sessionRedisKey,finalSession, (err, results) => {
                                                    if (err) {
                                                        this.log("debug", "IAPI", "Failed to push user session to redis");
                                                        reject(err);
                                                    } else {
                                                        this.log("debug", "IAPI", "Successfully pushed user session to redis, user logged in: " + username + ",results: " + results);
                                                        resolve({
                                                            "uid": user.uid,
                                                            "uuid": uuid,
                                                            "role": userRole,
                                                            "permissions": permissionSum,
                                                            "token": newToken
                                                        });
                                                    }
                                                });
                                            }
                                        }).catch((err) => {
                                            reject(err);
                                        });
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
        //Assume that user don't have login status, don't use session_check middleware optimization.
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
                    "SELECT username FROM users WHERE username = ?",
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
                                let defaultRoles = this.siteConfig.register_default_role;
                                try {
                                    this.mysql.query(
                                        "INSERT INTO users (username, nickname, email, password, avatar, about, statistics, roles, preferences) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                                        [username, nickname, email, password, defaultAvatar, "", 
                                        JSON.stringify(statisticsPrototype), defaultRoles, JSON.stringify(defaultPreferences)],
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
    userLogout(uid, uuid){
        return new Promise((resolve, reject) => {  
            let promisePool = [];
            let redisKey = this.rp + ":user_session:" + uid;
            this.redis.lrange(redisKey, 0, -1, (err, results) => {
                for(const element of results){
                    let parsedElement = JSON.parse(element);
                    if(parsedElement.uuid === uuid){
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
                        reject("Session not found");
                    }
                }).catch((err) => {
                    reject(err);
                });
            }).catch((err) => {
                reject(err);
            });
        });
    }
}

export { IAPI };