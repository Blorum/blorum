function SessionCheckMiddleware(log, redisConnection){
    this.middleware = function(req, res, next){
        next();
    }
}

export default function(log, redisConnection){
    try{
        let middleware = new SessionCheckMiddleware(log, redisConnection).middleware;
        log("log", "SessionCheck", "Session check middleware instance created.");
        return middleware;
    }catch(err){
        log("error", "SessionCheck", "Session check middleware failed to load.");
        log("error", "SessionCheck", err);
    }
}