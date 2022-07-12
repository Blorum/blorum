import {
    generateNewToken, blake2bHash,
    strASCIIOnly, strStrictLegal, basicPasswordRequirement, isValidEmail
} from "./utils.mjs";

Object.prototype.p = Object.prototype.hasOwnProperty;

class IAPI {
    constructor(mysql, redis, siteConfig, log, salt) {
        this.mysql = mysql;
        this.redis = redis;
        this.siteConfig = siteConfig;
        this.log = log;
        this.salt = salt;
    }
    timestamp(){
        return new Date().getTime();
    }
    IP(req) {
        if(this.siteConfig.ip_detect_method == "connection"){
            return req.connection.remoteAddress;
        }else if(this.siteConfig.ip_detect_method == "header"){
            //Default header X-Forwarded-From.
            if(req.headers.p(this.siteConfig.ip_detect_header)){
                return req.headers[this.siteConfig.ip_detect_header];
            }else{
                this.log("error", "IAPI", "Dictated IP detection method is header, but header is not found");
                if(req.headers.p("x-forwarded-for")){
                    return req.headers["x-forwarded-for"];
                }else{
                    return req.connection.remoteAddress;
                }
            }
        }else{
            this.log("error", "IAPI", "Dictated IP detection method is not found");
            return req.connection.remoteAddress;
        }
    }
    userLogin(req, username, password) {
        let connIP = this.IP(req);
        let userAgent = req.headers['user-agent'];
        return new Promise((resolve, reject) => {
            password = blake2bHash(this.salt + password);
            this.mysql.query(
                "SELECT uid,permissions FROM users WHERE username = ?",
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
                                let userRole = JSON.parse(user.permissions.split(",")).role;
                                let redisKey = "user_session:" + user.uid;
                                this.redis.lpush(redisKey, JSON.stringify({
                                    "token": newToken,
                                    "statistics": {
                                        "date": this.timestamp(),
                                        "userAgent": userAgent,
                                        "ip": connIP
                                    }
                                }), "EX", this.siteConfig.user_cookie_expire_after, (err, results) => {
                                    if (err) {
                                        this.log("debug", "IAPI", "Failed to push user session to redis");
                                        reject(err);
                                    } else {
                                        this.log("debug", "IAPI", "Successfully pushed user session to redis, user logged in: " + username + "results: " + results);
                                        resolve({
                                            "uid": user,
                                            "token": newToken
                                        });
                                    }
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
            }else{
                password = blake2bHash(this.salt + password);
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
                                let defaultAvatar;
                                let statisticsPrototype;
                                let defaultPreferences;
                                let defaultPermissions = {
                                    "role": "user",
                                    "flags": JSON.parse(siteConfig.user_default_flags)
                                }
                                this.mysql.query(
                                    "INSERT INTO users (username, nickname, email, password, avatar, about, statistics, permissions, preferences) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                                    [username, nickname, email, password, "", "", "{}", "{}", "{}"],
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