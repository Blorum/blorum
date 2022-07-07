const { fork } = require('node:child_process');
const http = require('http');
async function wrapper(){
    const utils = (await import("./modules/utils.mjs"));
    console.log("[WRAPPER] Starting Blorum Server (" + utils.version + ")...");
    const initializeBlorumServer = (await import("./modules/init.mjs")).initializeBlorumServer;
    const initializeRouter = (await import("./modules/router.mjs")).default;
    const prerequisite = initializeBlorumServer();
    prerequisite.promise.then(function(results){
        prerequisite.log("log","Main","Blorum pre-initialization finished.");
        let router = initializeRouter(results,prerequisite.log);
        http.createServer(
            router
        ).listen(prerequisite.config.port, function(){
            prerequisite.log("log","Main","Blorum Server started on port " + prerequisite.config.port);
        }
        ).on('error', function(err){
            prerequisite.log("error","Main","Blorum Server failed to start on port " + prerequisite.config.port);
            prerequisite.log("error","Main",err);
        });
    });
}

wrapper();
