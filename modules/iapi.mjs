import { generateNewToken, blake2bHash } from "./utils.mjs";

class IAPI {
    constructor(mysql, redis, siteConfig, log, salt) {
        this.mysql = mysql;
        this.redis = redis;
        this.siteConfig = siteConfig;
        this.log = log;
        this.salt = salt;
    }
    userLogin(username, password) {
        return new Promise((resolve, reject) => {
            this.mysql.query(
                "SELECT * FROM users WHERE username = ?",
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
                                this.log("debug", "IAPI", "User logged in: " + username);
                                resolve({
                                    "uid":user
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
    userRegister(username, nickname, email, password) {
        password = blake2bHash(password, this.salt);
        return new Promise((resolve, reject) => {
            this.mysql.query(
                "SELECT * FROM users WHERE username = ?",
                [username],
                (err, results) => {
                    if (err) {
                        this.log("debug", "IAPI", "Failed to query database");
                        reject(err);
                    } else {
                        if (results.length === 0) {
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
                                            "uid":results.insertId
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
        });
    }
}

export {IAPI};