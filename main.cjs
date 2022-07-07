const { fork } = require('node:child_process');
const version = "1.0.0 debug";
async function wrapper(){
    console.log("[WRAPPER] Starting Blorum Server (" + version + ")...");
    const initializeBlorumServer = (await import("./modules/init.mjs")).initializeBlorumServer;
    const initializeRouters = (await import("./modules/router.mjs")).initializeRouters;
    const prerequisite = initializeBlorumServer();
    prerequisite.promise.then(function(results){
        prerequisite.log("log","Main","Blorum initialization finished.");
    });
}

wrapper();
