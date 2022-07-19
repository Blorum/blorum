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
                let token = decodeURIComponent(cookieParsed.blorum_token);
                req.header.token = token;
                iapi.getValidUserSession(uid).then(function(result){
                    if(result.sessions.length > 0){
                        for(const element of result.sessions){
                            let parsedElement = JSON.parse(element);
                            if(parsedElement.token === token){
                                req.isUserSessionValid = true;
                                req.validUserID = uid;
                            }
                        }
                    }else{
                        req.isUserSessionValid = false;
                    }
                    if(req.isUserSessionValid){
                        req.validUserPermissions = result.permissions;
                    }
                    next();
                }).catch(function(err){
                    req.isUserSessionValid = false;
                    log("error", "SessionCheck", "Failed to check if user has session.");
                    log("error", "SessionCheck", err);
                    next();
                    throw err;
                });
            }else{
                req.isUserSessionValid = false;
                next();
            }
        }else{
            next();
        }
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