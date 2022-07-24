function StatisticsMiddleware(log, redisConnection, siteConfig, iapi, getReqInfo){


}

export default function(log, redisConnection, siteConfig, iapi, getReqInfo){
    try{
        let middleware = new StatisticsMiddleware(log, redisConnection, siteConfig, iapi, getReqInfo).middleware;
        log("log", "Statistics", "Statistics middleware instance created.");
        return middleware;
    }catch(err){
        log("error", "Statistics", "Statistics middleware failed to load.");
        log("error", "Statistics", err);
    }
}