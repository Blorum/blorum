function CacheMiddleware(log, redisConnection, mysqlConnection, siteConfig, iapi){

    this.middleware = (req, res, next) => {
        next();
    };
}

export default function(log, redisConnection, mysqlConnection, siteConfig, iapi){
    try{
        let middleware = new CacheMiddleware(log, redisConnection, mysqlConnection, siteConfig, iapi).middleware;
        log("log", "CacheStrategy", "Cache strategy middleware instance created.");
        return middleware;
    }catch(err){
        log("error", "CacheStrategy", "Cache strategy middleware failed to load.");
        log("error", "CacheStrategy", err);
    }
}