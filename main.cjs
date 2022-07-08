const { fork } = require('node:child_process');
const http = require('http');
async function wrapper() {
    const utils = (await import("./modules/utils.mjs"));
    console.log("[WRAPPER] Starting Blorum Server (" + utils.version + ")...");
    const initializeBlorumServer = (await import("./modules/init.mjs")).initializeBlorumServer;
    const initializeRouter = (await import("./modules/router.mjs")).default;
    const prerequisite = initializeBlorumServer();
    prerequisite.promise.then(function (results) {
        prerequisite.log("log", "Main", "Blorum pre-initialization finished.");
        let router = initializeRouter(results, prerequisite.log, prerequisite.config.salt);
        if (prerequisite.config.port <= 1000 && prerequisite.config.port != 0) {
            prerequisite.log("warn", "Main", "Port might cause conflict.");
            prerequisite.log("warn", "Main", "If you are under *Unix system, this require privilege.");
        }
        let finalServer = http.createServer(
            router
        ).listen(prerequisite.config.port, function () {
            prerequisite.log("log", "Main", "Blorum Server started on port " + finalServer.address().port);
            console.log("Welcome to Blorum, made with ♡  by Winslow S.E.M.");
        }
        ).on('error', function (err) {
            prerequisite.log("error", "Main", "Blorum Server failed to start on port " + prerequisite.config.port);
            prerequisite.log("error", "Main", err);
        });
    });
}

wrapper();