import parse from "json5";
JSON.parse = parse.parse;

import { pathConvert } from "./utils.mjs";

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
    this.pathConvert = pathConvert;
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

        let IPRateLimitChecker = () => {
            return new Promise(async (resolve, reject) => {
                if(reqInfo.ip.substring(0, 7) === "::ffff:"){
                    reqInfo.ip = reqInfo.ip.substring(7, reqInfo.ip.length);
                }
                //temp disable ipWhiteList for debug purposes.
                // if(this.ipWhiteList.indexOf(reqInfo)){
                //     return true;
                // }else{
                    let redisKeyIT = iapi.rp + ":ip_token_bucket:" + reqInfo.ip;
                    try {
                        let result = await iapi.getRedisKeyIfExists(redisKeyIT);
                        if(result !== null){
                            let IPTokenBucket = JSON.parse(result);
                            resolve();//To be deleted;
                        }else{
                            let newBucket = this.ipRateLimits;
                            this.redis.set(redisKeyIT, JSON.stringify(newBucket), "PX", this.expireThreshold,
                                (err, res) => {
                                    if(err){
                                        reject({
                                            "status": 500,
                                            "message": "Failed to create IP token bucket."
                                        })
                                    }else{
                                        resolve();
                                    }
                                });
                        }
                    }catch (error){
                        this.log("error", "RateControl/IP", error);
                        reject({
                            "status": 500,
                            "message": error
                        });
                    }
                // }
            });
        };

        let userRateLimitChecker = () => {
            return new Promise(async (resolve, reject) => {
                let redisKeyUT = iapi.rp + ":user_token_bucket:" + req.validUserID;
                try {
                    let result = await iapi.getRedisKeyIfExists(redisKeyUT);
                    if(result !== null){
                        let userTokenBucket = JSON.parse(result);
                        resolve();//To be deleted;
                    }else{
                        let permissionExpireAfter = JSON.parse(siteConfig.roles_permissions)[req.validUserPermissions.role].cookie_expire_after;
                        this.redis.set(redisKeyUT, JSON.stringify(req.validUserPermissions.rate_limits), "PX", permissionExpireAfter, (err) => {
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
                } catch (error) {
                    this.log("error", "RateControl/user", error);
                    reject({
                        "status": 500,
                        "message": error
                    });
                }
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