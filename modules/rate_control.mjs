function RateControlMiddleware(log, redis, siteConfig, iapi, getReqInfo){
    this.log = log;
    this.redis = redis;
    this.iapi = iapi;
    this.siteConfig = siteConfig;
    this.getReqInfo = getReqInfo;
    this.ipWhiteList = siteConfig.ip_rate_limit_bypass_whitelist;
    this.ipRateLimits = {
        "create": siteConfig.ip_rate_limit_create,
        "remove": siteConfig.ip_rate_limit_remove,
        "edit": siteConfig.ip_rate_limit_edit,
        "login": siteConfig.ip_rate_limit_login
    };
    this.timestamp = function(){
        return new Date().getTime();
    };
    this.expireThreshold = 3600000;
    this.isTimestampExpired = function(val){
        return val + expireThreshold < timestamp();
    };
    this.middleware = async function(req, res, next){
        let reqInfo = getReqInfo(req);
        if(req.isUserSessionValid){
            let uid = req.validUserId;
            let rate_limits = req.validUserPermissions.rate_limits;
            next(); //To be deleted;
        }else{
            let redisKey = iapi.rp + ":ip_token_bucket:" + reqInfo.ip;
            try {
                let result = await iapi.getRedisKeyIfExists(reqInfo.ip);
                if(result !== null){

                }else{

                }
                next(); //To be deleted;
            } catch (error) {
                log("error", "SessionCheck", error);
                res.sendStatus(500);
            }
        }
    }
}

export default function(log, redisConnection, siteConfig, iapi, getReqInfo){
    try{
        let middleware = new RateControlMiddleware(log, redisConnection, siteConfig, iapi, getReqInfo).middleware;
        log("log", "RateControl", "Rate control middleware instance created.");
        return middleware;
    }catch(err){
        log("error", "RateControl", "Rate control middleware failed to load.");
        log("error", "RateControl", err);
    }
}