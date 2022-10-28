import parse from "simdjson";
JSON.parse = parse.parse;


import { pureArray } from "./utils.mjs";

function RateControlMiddleware(log, redis, siteConfig, iapi, getReqInfo) {
    this.log = log;
    this.redis = redis;
    this.iapi = iapi;
    this.siteConfig = siteConfig;
    this.getReqInfo = getReqInfo;
    this.ipWhiteList = siteConfig.ip_rate_limit_bypass_whitelist;
    this.ipRateLimits = {
        "create": JSON.parse(siteConfig.ip_rate_limit_create),
        "remove": JSON.parse(siteConfig.ip_rate_limit_remove),
        "edit": JSON.parse(siteConfig.ip_rate_limit_edit),
        "login": JSON.parse(siteConfig.ip_rate_limit_login)
    };
    this.expireThreshold = 3600000;

    this.middleware = (req, res, next) => {
        let reqInfo = getReqInfo(req);
        let userBypassIPRateLimit = false;
        if(req.isUserSessionValid){
            let uid = req.validUserId;
            let rate_limits = req.validUserPermissions.rate_limits;
            if(req.validUserPermissions.permissions.flags.indexOf("override_ip_rate_limits") != -1){
                userBypassIPRateLimit = true;
            }
        }
        let reqMethod = req.method.toLowerCase();
        let reqPath = pureArray(req.path.toLowerCase().split("/"));

        let judger = (reqPath, reqMethod, bucket) => {
            return new Promise((resolve, reject) => {
                resolve({
                    "newBucket": bucket
                }); //TO BE REMOVED

                switch(reqPath[0]){
                    case "article":
                        break;
                    case "user":
                        break;
                }
                /*resolve with
                {
                    "newBucket": newBucket
                }
                reject if rate limit exceed
                */
            });
        };
        let IPRateLimitChecker = () => {
            return new Promise((resolve, reject) => {
                if(reqInfo.ip.substring(0, 7) === "::ffff:"){
                    reqInfo.ip = reqInfo.ip.substring(7, reqInfo.ip.length);
                }
                //temp disable ipWhiteList for debug purposes.
                // if(this.ipWhiteList.indexOf(reqInfo)){
                //     return true;
                // }else{
                    let redisKeyIT = iapi.rp + ":ip_token_bucket:" + reqInfo.ip;
                    iapi.getRedisKeyIfExists(redisKeyIT).then((result) => {
                        if(result !== null){
                            this.redis.pttl(redisKeyIT).then((TTLLeft) => {
                                let IPTokenBucket = JSON.parse(result);
                                judger(reqPath, reqMethod, IPTokenBucket).then((result) => {
                                    //update with result.newBucket
                                    this.redis.set(redisKeyIT, JSON.stringify(result.newBucket), "EX", TTLLeft, (err, res) => {
                                        if(err){
                                            reject({
                                                "status": 500,
                                                "message": "error when update IP token bucket."
                                            });
                                        }else{
                                            resolve();
                                        }
                                    });
                                }).catch((err) => {
                                    reject({
                                        "status": 429,
                                        "message": "Rate limit exceed."
                                    })
                                });
                            }).catch((err) => {
                                this.log("error", "RateControl", "Failed to get TTL of IP token bucket.");
                                this.log("error", "RateControl", err);
                                reject({
                                    "status": 500,
                                    "message": "Failed to get TTL of IP token bucket."
                                });
                            });
                        }else{
                            let newBucket = this.ipRateLimits;
                            this.redis.set(redisKeyIT, JSON.stringify(newBucket), "EX", this.expireThreshold,
                                (err, res) => {
                                    if(err){
                                        reject({
                                            "status": 500,
                                            "message": "Failed to create IP token bucket."
                                        });
                                    }else{
                                        resolve();
                                    }
                                });
                        }
                    }).catch((err) => {
                        log("error", "RateControl", "Failed to get IP token bucket.");
                        log("error", "RateControl", err);
                        reject({
                            "status": 500,
                            "message": "Failed to create IP token bucket."
                        });
                    });
                // }
            });
        };

        let userRateLimitChecker = () => {
            return new Promise((resolve, reject) => {
                let redisKeyUT = iapi.rp + ":user_token_bucket:" + req.validUserID;
                iapi.getRedisKeyIfExists(redisKeyUT).then((result) => {
                    if(result !== null){
                        this.redis.pttl(redisKeyUT).then((TTLLeft) => {
                            let userTokenBucket = JSON.parse(result);
                            judger(reqPath, reqMethod, userTokenBucket).then((result) => {
                                //update with result.newBucket
                                this.redis.set(redisKeyUT, JSON.stringify(result.newBucket), "EX", TTLLeft, (err, res) => {
                                    if(err){
                                        reject({
                                            "status": 500,
                                            "message": "error when update user token bucket."
                                        });
                                    }else{
                                        resolve();
                                    }
                                });
                            }).catch((err) => {
                                reject({
                                    "status": 429,
                                    "message": "Rate limit exceed."
                                })
                            });
                        }).catch((err) => {
                            this.log("error", "RateControl", "Failed to get TTL of user token bucket.");
                            this.log("error", "RateControl", err);
                            reject({
                                "status": 500,
                                "message": "Failed to get TTL of user token bucket."
                            });
                        });
                    }else{
                        let permissionExpireAfter = req.validUserPermissions.permissions.cookie_expire_after;
                        this.redis.set(redisKeyUT, JSON.stringify(req.validUserPermissions.rate_limits), "EX", permissionExpireAfter, (err) => {
                            if(err){
                                reject({
                                    "status": 500,
                                    "message": "Failed to create user token bucket: " + err
                                });
                            }else{
                                resolve();
                            }
                        });
                    }
                }).catch((err) => {
                    this.log("error", "RateControl", "Failed to get user token bucket.");
                    this.log("error", "RateControl", err);
                    reject(err);
                });
            });
        }

        if(req.isUserSessionValid){
            if(userBypassIPRateLimit){
                userRateLimitChecker().then(() => {
                    next();
                }).catch((err) => {
                    res.status(err.status).send(err.message);
                });
            }else{
                IPRateLimitChecker().then(() => {
                    userRateLimitChecker().then(() => {
                        next();
                    }).catch((err) => {
                        res.status(err.status).send(err.message);
                    });
                }).catch((err) => {
                    res.status(err.status).send(err.message);
                });
            }
        }else{
            IPRateLimitChecker().then(() => {
                next();
            }).catch((err) => {
                res.status(err.status).send(err.message);
            });
        }
    }
}

export default function (log, redisConnection, siteConfig, iapi, getReqInfo) {
    try {
        let middleware = new RateControlMiddleware(log, redisConnection, siteConfig, iapi, getReqInfo).middleware;
        log("log", "RateControl", "Rate control middleware instance created.");
        return middleware;
    } catch (err) {
        log("error", "RateControl", "Rate control middleware failed to load.");
        log("error", "RateControl", err);
    }
}