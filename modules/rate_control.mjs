function rateControlMiddleware(log, redis, iapi){
    this.middleware = function(req, res, next){
        next();
    }
}

export default function(log, redisConnection){
    try{
        let middleware = new rateControlMiddleware(log, redisConnection).middleware;
        log("log", "RateControl", "Rate control middleware instance created.");
        return middleware;
    }catch(err){
        log("error", "RateControl", "Rate control middleware failed to load.");
        log("error", "RateControl", err);
    }
}