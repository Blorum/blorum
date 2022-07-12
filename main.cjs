const { fork } = require('node:child_process');
const http = require('http');

async function wrapper() {
    const utils = (await import("./modules/utils.mjs"));
    console.log("[WRAPPER] Starting Blorum Server (" + utils.version + ")...");
    const initializeBlorumServer = (await import("./modules/init.mjs")).initializeBlorumServer;
    const initializeRouter = (await import("./modules/router.mjs")).default;
    const extensionList = (await import("./modules/extension.mjs")).extensionList;
    
    const prerequisite = initializeBlorumServer();
    prerequisite.promise.then(function (results) {
        prerequisite.log("log", "Main", "Blorum pre-initialization finished.");
        let router = initializeRouter(results[0].mysql, results[1], results[0].site_config, prerequisite.log, prerequisite.bootConfig.salt);
        if (prerequisite.bootConfig.port <= 1000 && prerequisite.bootConfig.port != 0) {
            prerequisite.log("warn", "Main", "Port might cause conflict.");
            prerequisite.log("warn", "Main", "If you are under *Unix system, this require privilege.");
        }
        let finalServer = http.createServer(
            router
        ).listen(prerequisite.bootConfig.port, function () {
            prerequisite.log("log", "Main", "Blorum Server started on port " + finalServer.address().port);
            console.log("Welcome to Blorum, made with ♡  by Winslow S.E.M.");
        }
        ).on('error', function (err) {
            prerequisite.log("error", "Main", "Blorum Server failed to start on port " + prerequisite.bootConfig.port);
            prerequisite.log("error", "Main", err);
        });
    });
}

wrapper();