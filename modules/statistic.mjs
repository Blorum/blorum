function StatisticsMiddleware(log, redisConnection, mysqlConnection, siteConfig, iapi, getReqInfo){

    this.middleware = (req, res, next) => {
        next();
    };
}

export default function(log, redisConnection, mysqlConnection, siteConfig, iapi, getReqInfo){
    try{
        let middleware = new StatisticsMiddleware(log, redisConnection, mysqlConnection, siteConfig, iapi, getReqInfo).middleware;
        log("log", "Statistics", "Statistics middleware instance created.");
        return middleware;
    }catch(err){
        log("error", "Statistics", "Statistics middleware failed to load.");
        log("error", "Statistics", err);
    }
}