function StatisticsMiddleware(log, redisConnection, mysqlConnection, siteConfig, iapi, getReqInfo){
    this.log = log;
    this.mysql = mysqlConnection;
    //todo: scheduled connection!!!
    this.middleware = (req, res, next) => {
        switch(req.path){

        }
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