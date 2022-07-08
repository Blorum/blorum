import { generateNewToken } from "./utils.mjs";

class IAPI {
    constructor(db, log, salt) {
        this.redis = db.redis;
        this.mysql = db.mysql;
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
                                resolve(user);
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
}

export {IAPI};