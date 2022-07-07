async function wrapper(){
    console.log("[WRAPPER] Starting Blorum Server...");
    const initializeBlorumServer = (await import("./modules/init.mjs")).initializeBlorumServer;
    const initializeRouters = (await import("./modules/router.mjs")).initializeRouters;
    const prerequisite = initializeBlorumServer();
    
}

wrapper();
