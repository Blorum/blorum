import "crypto";

const version = "1.0.0 debug";

const c = {
    "reset" : "\x1b[0m",
    "bright" : "\x1b[1m",
    "dim" : "\x1b[2m",
    "underscore" : "\x1b[4m",
    "blink" : "\x1b[5m",
    "reverse" : "\x1b[7m",
    "hidden" : "\x1b[8m",
    "fgBlack" : "\x1b[30m",
    "fgRed" : "\x1b[31m",
    "fgGreen" : "\x1b[32m",
    "fgYellow" : "\x1b[33m",
    "fgBlue" : "\x1b[34m",
    "fgMagenta" : "\x1b[35m",
    "fgCyan" : "\x1b[36m",
    "fgWhite" : "\x1b[37m",
    "bgBlack" : "\x1b[40m",
    "bgRed" : "\x1b[41m",
    "bgGreen" : "\x1b[42m",
    "bgYellow" : "\x1b[43m",
    "bgBlue" : "\x1b[44m",
    "bgMagenta" : "\x1b[45m",
    "bgCyan" : "\x1b[46m",
    "bgWhite" : "\x1b[47m"
}

function outputLogs(level,context,info){
    let currentTime = new Date().toTimeString().substring(0,8);
    let logs = `[${level}][${currentTime}][${context}]: ${info}`;
    console.log(logs);
}

function outputLogsColored(level,context,info){
    let currentTime = new Date().toTimeString().substring(0,8);
    let logs = "";
    switch(level){
        case "debug":
            var lc = c.bgMagenta;
            break;
        case "log":
            var lc = c.bgCyan;
            break;
        case "warn":
            var lc = c.bgYellow;
            break;
        case "error":
            var lc = c.bgRed;
            break
    }
    console.log(c.fgWhite+lc+"["+level+"]"+c.reset+c.fgGreen+"["+currentTime+"]"+c.fgBlue+"["+context+"]: "+c.reset+info);
}

function generateNewToken(salt,username){
    let currentTime = new Date().toTimeString();
    let randomSalt = crypto.randomBytes(16).toString('hex');
    let token = crypto.createHash('blake2b512').update(salt+randomSalt+currentTime+username).digest('base64');
    return token;
}

function promisifiedMysqlConnect(mysqlConnection){
    return new Promise((resolve,reject)=>{
        mysqlConnection.connect(function(err){
            if(err){
                reject(err);
            }else{
                resolve(mysqlConnection);
            }
        });
    });
}

function promisifiedRedisConnect(redisConnection){
    return new Promise((resolve,reject)=>{
        redisConnection.connect();
        redisConnection.on("error",function(err){  
            reject(err);
        });
        redisConnection.on("ready",function(){
            redisConnection.ping().then(function(result){
                if(result == "PONG"){
                    resolve(redisConnection);
                }else{
                    reject("Redis connection failed: no PONG response");
                }
            }); 
        });
    });
}
function isModuleAvailable(name){
    try {
        require.resolve(name);
        return true;
    } catch (e) {
        return false;
    }
}
export {version, outputLogs, outputLogsColored, generateNewToken, isModuleAvailable, promisifiedMysqlConnect, promisifiedRedisConnect};