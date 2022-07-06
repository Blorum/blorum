async function wrapper(){
    const initializeRouters = (await import("./modules/router.mjs")).initializeRouters;
    initializeRouters();
}

wrapper();
