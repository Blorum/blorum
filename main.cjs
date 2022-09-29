const { fork } = require('node:child_process');
const http = require('http');
const readline = require('node:readline');

async function wrapper() {
    if(process.argv.indexOf("--iapi-shell") !== -1){
        console.log("[WRAPPER] Entering IAPI shell testing environment...");
        const initializeBlorumServer = (await import("./modules/init.mjs")).initializeBlorumServer;
        const prerequisite = initializeBlorumServer();
        prerequisite.then(async function (results) {
            const IAPI = (await import("./modules/iapi.mjs")).IAPI;
            const iapi = new IAPI(results.mysql, results.redis, results.siteConfig, results.log, results.bootConfig.security.digest_salt, results.bootConfig.database.redis.prefix);
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
                prefix: '> ',
            });
            rl.on('line', (input) => {
                try{
                    eval(input);
                }catch(e){
                    console.log(e);
                }
            });
        });
    }else{
        const utils = (await import("./modules/utils.mjs"));
        console.log("[WRAPPER] Starting Blorum Server (" + utils.version + ")...");
        const initializeBlorumServer = (await import("./modules/init.mjs")).initializeBlorumServer;
        const initializeRouter = (await import("./modules/router.mjs")).default;
        const extensionList = (await import("./modules/extension.mjs")).extensionList;
        
        const prerequisite = initializeBlorumServer();
        prerequisite.then(function (results) {
            results.log("log", "Main", "Blorum pre-initialization finished.");
            let router = initializeRouter(results.mysql, results.redis, results.siteConfig, results.log, results.bootConfig.security.digest_salt, results.bootConfig.database.redis.prefix);
            if (results.bootConfig.port <= 1000 && results.bootConfig.port != 0) {
                results.log("warn", "Main", "Port might cause conflict.");
                results.log("warn", "Main", "If you are under *Unix system, this require privilege.");
            }
            let finalServer = http.createServer(
                router
            ).listen(results.bootConfig.port, function () {
                results.log("log", "Main", "Blorum Server started on port " + finalServer.address().port);
                console.log("Welcome to Blorum, made with ♡  by Winslow S.E.M.");
            }).on('error', function (err) {
                results.log("error", "Main", "Blorum Server failed to start on port " + results.bootConfig.port);
                results.log("error", "Main", err);
            });
        });
    }
}

wrapper();