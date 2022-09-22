import { cookieParser, objHasAllProperties } from "./utils.mjs";

function SessionCheckMiddleware(log, redis, iapi){
    this.log = log;
    this.redis = redis;
    this.iapi = iapi;
    this.middleware = function(req, res, next){
        let cookie = req.header("cookie");
        req.isUserSessionValid = false;
        if(cookie !== undefined){
            let cookieParsed = cookieParser(cookie);
            if(objHasAllProperties(cookieParsed, "blorum_uid", "blorum_token", "blorum_uuid")){
                let uid = cookieParsed.blorum_uid;
                let uuid = cookieParsed.blorum_uuid;
                let token = decodeURIComponent(cookieParsed.blorum_token);
                req.header.token = token;
                iapi.getValidUserSession(uid).then(function(result){
                    if(result.sessions.length > 0){
                        for(const element of result.sessions){
                            let parsedElement = JSON.parse(element);
                            if(parsedElement.uuid === uuid && parsedElement.token === token){
                                req.isUserSessionValid = true;
                                req.validUserID = uid;
                                req.validUserSession = parsedElement;
                                req.validUserSessionUUID = uuid;
                            }
                        }
                    }
                    if(req.isUserSessionValid){
                        req.validUserRole = result.roles;
                        req.validUserPermissions = result.permissions;
                        next();
                    }else{
                        if(req.path != "/user/login" && req.path != "/user/logout"){
                            res.clearCookie('blorum_uid');
                            res.clearCookie('blorum_token');
                            res.clearCookie('blorum_permissions');
                            res.status(412).send("Invalid(expired) session.");
                        }else{
                            next();
                        }
                    }
                }).catch(function(err){
                    log("error", "SessionCheck", "Failed to check if user has session.");
                    log("error", "SessionCheck", err);
                    next();
                    throw err;
                });
            }else{
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