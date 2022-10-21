import parse from "simdjson";
JSON.parse = parse.parse;

import {
    generateNewToken, blake3Hash, objHasAllProperties,
    strASCIIOnly, strStrictLegal, basicPasswordRequirement, isValidEmail, strNotOnlyNumber,
    mergeJSON, getFinalPermission, removeElementFromArray
} from "./utils.mjs";

import { v4 as uuidv4 } from 'uuid';

import stringify from "quick-stable-stringify";

class IAPI {
    constructor(mysql, redis, siteConfig, log, salt, redisPrefix) {
        this.mysql = mysql;
        this.redis = redis;
        this.siteConfig = siteConfig;
        this.log = log;
        this.salt = salt;
        this.rp = redisPrefix;

        this.log("log", "IAPI", "IAPI instance created.");
    }
    timestamp(){
        return new Date().getTime();
    }
    changeSiteConfig(actions){
        //Update IAPI object and database in the same time.
        /* Actions = a list of {
            "name": the keyname of the config,
            "to": the desired value
        } */
        return new Promise((resolve, reject) => {
            let arrLen = actions.length;
            let mysqlWritePromisePool = [];
            for(var i=0;i<arrLen;i++){
                let actionName = actions[i].name;
                let actionTo = actions[i].to;
                siteConfig[actionName] = actionTo;
                mysqlWritePromisePool.push(new Promise((resolve, reject) => {
                    //todo: write database
                }));
            }
            mysqlWritePromisePool.allSettled((results) => {
                //todo: check fail&success, return
            })
        });
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
        //todo: limitive and grantive
        return new Promise((resolve, reject) => {
            this.getUserSession(uid).then((currentSessions) => {
                if(currentSessions.length > 0){
                    this.getUserRoles(uid).then((userRoles) => {
                        let promisePool = [];
                        for(const role of userRoles){
                            if(role === null){
                                continue;
                            }
                            promisePool.push(this.getRolePermissions(role));
                        }
                        Promise.all(promisePool).then((results) => {
                            let permissionSum = getFinalPermission(results);
                            this.removeExpiredSessions(uid, permissionSum.permissions.cookie_expire_after, currentSessions).then((removedSessions) => {
                                this.getUserSession(uid).then((finalSessions) => {
                                    if(finalSessions.length > 0){
                                        resolve({
                                            "sessions": finalSessions,
                                            "permissions": permissionSum,
                                            "roles": userRoles,
                                            "removed_sessions": removedSessions
                                        });
                                    }else{
                                        resolve({
                                            "sessions": []
                                        });
                                    }
                                }).catch((err) => {
                                    reject(err);
                                });
                            }).catch((err) => {
                                reject(err);
                            });
                        });
                    }).catch((err) => {
                        reject(err);
                    });
                }else{
                    resolve({
                        "sessions": []
                    });
                }
            }).catch((err) => {
                this.log("debug", "IAPI", "Failed to get valid user session: " + err);
                reject(err);
            });
        });
    }
    getRolePermissions(role){
        return new Promise((resolve, reject) => {
            this.getRedisKeyIfExists(this.rp + ":roles:" + role).then((results) => {
                if(results != null){
                    resolve(JSON.parse(results));
                }else{
                    resolve(null);
                }
            }).catch((err) => {
                reject(err);
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
                                    let roles = results[0].roles.split(",");
                                    let arrLen = roles.length;
                                    for(let i = 0; i < arrLen; i++){
                                        roles[i] = roles[i].replace(/{{/g, "");
                                        roles[i] = roles[i].replace(/}}/g, "");
                                    }
                                    resolve(roles);
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
    modifyUserRole(uid, actions){
        //Action param structure: 
        //A list of {role: "{{role}}", action: "add/remove"}
        return new Promise((resolve, reject) => {
            //todo: upd redis if exist
            this.getUserRoles(uid).then((results) => {
                if(results == null){
                    this.log("debug", "IAPI", "User not found in database.");
                    reject(null);
                }else{
                    let roleSet = new Set();
                    results.forEach(element => {
                        roleSet.add(element);
                    });
                    for(const action of actions){
                        if(action.action === "add"){
                            roleSet.add("{{" + action.role + "}}");
                        }else if(action.action === "remove"){
                            roleSet.delete("{{" + action.role + "}}");
                        }
                    }
                    let finalRoleList = Array.from(roleSet);
                    this.mysql.query(
                        "UPDATE users SET roles = ? WHERE uid = ?",
                        [finalRoleList.join(","), uid],
                        (err, results) => {
                            if(err){
                                this.log("debug", "IAPI", "Failed to query database.");
                                reject(err);
                            }else{
                                resolve(results);
                            }
                        }
                    );
                }
            });
        });
    }
    getUserPermissions(uid){
        return new Promise((resolve, reject) => {
            this.getUserRoles(uid).then((userRoles) => {
                if(userRoles == null){
                    reject("User not found in database.");
                }else if(typeof userRoles === "object" && userRoles[0] == ""){
                    reject("User has no roles.");
                }else{
                    let promisePool = [];
                    for(const element of userRoles){
                        if(element === null){
                            continue;
                        }
                        promisePool.push(new Promise((resolve, reject) => {
                            this.getRolePermissions(element).then((results) => {
                                resolve(results);
                            }).catch((err) => {
                                reject(err);
                            });
                        }));
                    }
                    Promise.allSettled(promisePool).then((results) => {
                        let permissions = getFinalPermission(results);
                        resolve(permissions);
                    }).catch((err) => {
                        reject(err);
                    });
                }
            }).catch((err) => {
                reject(err);
            });
        });
    }
    userLogin(ip, ua, username, password) {
        //Assume that user don't have login status, don't use session_check middleware optimization.
        return new Promise((resolve, reject) => {
            password = blake3Hash(this.salt + password);
            this.mysql.query(
                "SELECT uid,password,roles FROM users WHERE username = ?",
                [username], (err, results) => {
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
                                    let permissionSum = getFinalPermission(permissionList);
                                    let cookie_expire_after = permissionSum.permissions.cookie_expire_after;
                                    let tokenBucketRedisKey = this.rp + ":user_token_bucket:" + user.uid;
                                    /*
                                    TODO:
                                    
                                    User token bucket not re-implemented yet!
                                    */
                                    if(permissionSum.with_rate_limit){
    
                                    }else{
                                        //user don't have a rate limit, use fallback rate limit(added by getFinalPermission) and prompt both user & admin an system error log.

                                        //TODO: update log db structure and add "level"
                                    }

                                    let rolesRedisKey = this.rp + ":user_roles:" + user.uid;
                                    this.redis.set(rolesRedisKey, user.roles, (err, results) => {
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
                                    let finalSession = stringify({
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
                                this.mysql.query(
                                    "INSERT INTO users (username, nickname, email, password, avatar, about, statistics, roles, preferences) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                                    [username, nickname, email, password, defaultAvatar, "", 
                                    stringify(statisticsPrototype), defaultRoles, stringify(defaultPreferences)],
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
                                });
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
    logInsert(uid, content, level){
        return new Promise((resolve, reject) => {
            this.mysql.query(
                "INSERT INTO logs (uid, content, level, timestamp) VALUES (?, ?, ?, ?)",
                [uid, stringify({
                    "message": content //I know this JSON is redundant, but it's for future extensibility.
                }), level, this.timestamp()],
                (err, results) => {
                    if(err){
                        reject(err);
                    }else{
                        resolve();
                    }
                });
        });
    }
    logGet(uid, time_range, level){
        //if any constraint is null, it will be ignored.
        return new Promise((resolve, reject) => {
            let queryProto = "SELECT * FROM logs ";
            let constraint = {
                "uid": new Set(),
                "level": new Set()
            };
            if(uid == null || time_range == null || level == null){
                this.mysql.query(queryProto + ";", (err, results) => {
                    if(err){
                        reject(err);
                    }else{
                        resolve(results);
                    }
                });
            }else{
                if(uid != null){
                    let uidArrLen = uid.length;
                    for(var i = 0; i < uidArrLen; i++){
                        constraint.uid.add("uid = " + uid[i]);
                    }
                }
                if(level != null){
                    let levelArrLen = level.length;
                    for(var i = 0; i < levelArrLen; i++){
                        constraint.level.add("level = " + level[i]);
                    }
                }
                constraint.uid = Array.from(constraint.uid);
                constraint.level = Array.from(constraint.level);
                let finalList = [];
                let finalConstraint = "";
                if(constraint.uid.length > 0){
                    finalList.push("(" + constraint.uid.join(" OR ") + ")");
                }
                if(constraint.level.length > 0){
                    finalList.push("(" + constraint.level.join(" OR ") + ")");
                }
                if(time_range != null){
                    finalList.push("timestamp BETWEEN " + time_range[0] + " AND " + time_range[1]);
                }
                if(finalList.length > 0){
                    finalConstraint = " WHERE " + finalList.join(" AND ");
                }
                this.mysql.query(queryProto + constraint + ";", (err, results) => {
                    if(err){
                        reject(err);
                    }else{
                        resolve(results);
                    }
                });
            }
        });
    }
    createArticle(uid, title, content, tags, category, excerpt, slug, status){
        let statusProto = {};

    }
    alterArticle(){

    }
    deleteArticle(id){

    }

    createPost(uid, title, content, forum, attach_to, category){

    }

    editPost(postID, actions){
        //Action types: title, user, content, forum, attach, category
    }

    deletePost(postID){

    }

    createComment(targetType, targetID, content, uid, reply_to){

    }

    editComment(targetType, targetID, actions){

    }

    deleteComment(targetType, targetID){

    }

    createCategory(name, description){

    }

    editCategory(name, actions){
        //Action types: description, name
        return new Promise((resolve, reject) => {
            //todo. 1st: find category ID with name.
        });
    }

    deleteCategory(name){

    }

    depriveCategory(name){

    }

    createRole(roleType, name, permission){
        //todo
        switch(roleType){
            case "0":
                //Limitive
                break;
            case "1":
                //Grantive
                break;
            default:
                return Promise.reject("Invalid role type");
        }
    }

    deleteRole(name){
        return new Promise((resolve, reject) => {
            this.mysql.query("DELETE FROM roles WHERE name = ?;", [name], (err, results) => {
                if(err){
                    reject(err);
                }else{
                    resolve(results);
                }
            });
        });
    }

    depriveRole(name){
        //Remove this role from all users with this role.
        return new Promise((resolve, reject) => {
            this.mysql.query(
                "SELECT uid,roles FROM users WHERE roles.contains(?);",
                [name],
                (err, results) => {
                    if(err){
                        reject(err);
                    }else{
                        let promisePool = [];
                        for(let element of results){
                            promisePool.push(new Promise((resolve, reject) => {
                                element.roles = element.roles.split(",");
                                removeElementFromArray(element.roles, name);
                                this.mysql.query(
                                    "UPDATE users SET roles = ? WHERE uid = ?;",
                                    [element.roles.join(","), element.uid],
                                    (err, results) => {
                                        if(err){
                                            reject(err);
                                        }else{
                                            resolve(results);
                                        }
                                    });
                            }));
                        }
                        return Promise.all(promisePool).then((results) => {
                            resolve(results);
                        }).catch((err) => {
                            reject(err);
                        });
                    }
                }
            )
        });
    }
    depriveTag(name){

    }

    createReact(targetType, targetID, react){

    }
}

export { IAPI };