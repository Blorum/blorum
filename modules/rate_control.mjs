function rateControlMiddleware(log, redis, iapi){
    this.middleware = function(req, res, next){
        // if(req.isUserSessionValid){
        //     let uid = req.validUserId;
        // }else{

        // }
        next();
    }
}

export default function(log, redisConnection, iapi, getReqInfo){
    try{
        let middleware = new rateControlMiddleware(log, redisConnection, iapi, getReqInfo).middleware;
        log("log", "RateControl", "Rate control middleware instance created.");
        return middleware;
    }catch(err){
        log("error", "RateControl", "Rate control middleware failed to load.");
        log("error", "RateControl", err);
    }
}