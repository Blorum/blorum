import { cookieParser, objHasAllProperties } from "./utils.mjs";

function SessionCheckMiddleware(log, redis, iapi){
    this.log = log;
    this.redis = redis;
    this.iapi = iapi;
    this.middleware = function(req, res, next){
        let cookie = req.header("cookie");
        if(cookie !== undefined){
            let cookieParsed = cookieParser(cookie);
            if(objHasAllProperties(cookieParsed, "blorum_uid", "blorum_token")){       
                let uid = cookieParsed.blorum_uid;
                let token = cookieParsed.blorum_token;
                iapi.checkIfUserHasSession(uid).then(function(result){
                    if(result >= 0){
                        for(const element of result){
                            let parsedElement = JSON.parse(element);
                            if(parsedElement.token === token){
                                req.isUserSessionValid = true;
                                req.validUserId = uid;
                            }
                        }
                    }else{
                        req.isUserSessionValid = false;
                    }
                }).catch(function(err){
                    req.isUserSessionValid = false;
                    this.log("error", "SessionCheck", "Failed to check if user has session.");
                    this.log("error", "SessionCheck", err);
                });
            }else{
                req.isUserSessionValid = false;
            }
        }
        next();
    }
}

export default function(log, redisConnection, iapi){
    try{
        let middleware = new SessionCheckMiddleware(log, redisConnection, iapi).middleware;
        log("log", "SessionCheck", "Session check middleware instance created.");
        return middleware;
    }catch(err){
        log("error", "SessionCheck", "Session check middleware failed to load.");
        log("error", "SessionCheck", err);
    }
}