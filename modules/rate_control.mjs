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

    this.middleware = async (req, res, next) => {
        let reqInfo = getReqInfo(req);
        let userBypassIPRateLimit = false;
        if(req.isUserSessionValid){
            let uid = req.validUserId;
            let rate_limits = req.validUserPermissions.rate_limits;
            if(req.validUserPermissions.permissions.flags.indexOf("override_ip_rate_limits") != -1){
                userBypassIPRateLimit = true;
            }
        }

        if(!userBypassIPRateLimit){
            if(reqInfo.ip.substring(0, 7) === "::ffff:"){
                reqInfo.ip = reqInfo.ip.substring(7, reqInfo.ip.length);
            }
            //temp disable ipWhiteList for debug purposes.
            // if(this.ipWhiteList.indexOf(reqInfo)){
            //     next();
            // }else{
                let redisKey = iapi.rp + ":ip_token_bucket:" + reqInfo.ip;
                try {
                    let result = await iapi.getRedisKeyIfExists(redisKey);
                    if(result !== null){
                        let tokenBucket = JSON.parse(result);
                        next();//To be deleted;
                    }else{
                        let newBucket = this.ipRateLimits;
                        this.redis.set(redisKey, JSON.stringify(newBucket), "PX", this.expireThreshold,
                            (err, res) => {
                                if(err){
                                    res.status(500).send("Redis is down!");
                                }else{
                                    next();
                                }
                            });
                    }
                }catch (error){
                    this.log("error", "SessionCheck", error);
                    res.sendStatus(500);
                }
            // }
        } else {
            let redisKey = iapi.rp + ":user_token_bucket:" + reqInfo.uid;
            next(); //To be deleted;
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