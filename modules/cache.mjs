function CacheMiddleware(log, redisConnection, siteConfig, iapi, getReqInfo){


}

export default function(log, redisConnection, siteConfig, iapi, getReqInfo){
    try{
        let middleware = new CacheMiddleware(log, redisConnection, siteConfig, iapi, getReqInfo).middleware;
        log("log", "CacheStrategy", "Cache strategy middleware instance created.");
        return middleware;
    }catch(err){
        log("error", "CacheStrategy", "Cache strategy middleware failed to load.");
        log("error", "CacheStrategy", err);
    }
}