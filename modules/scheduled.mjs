import { default as process } from 'process';

var taskList = [];
var mysql, redis;
var cacheMap = {};
var mainLoop = {
    "_destroyed": true
};

function log(level, message){
    process.send({
        "id": null,
        "action": "log",
        "level": level,
        "info": message
    });
}

function beforeInit(message){
    switch (message.action) {
        case "init":
            mysql = message.mysql;
            redis = message.redis;
            process.send({
                "id": null,
                "action": "init"
            });
            eventExecutor = afterInit;
            break;
    }
}

function afterInit(message){
    switch(message.action){
        case "start_loop":
            try{
                mainLoop = setInterval(function(){

                },message.interval);
                process.send({
                    "id": message.id,
                    "status": "success"
                });
            }catch(e){
                process.send({
                    "id": message.id,
                    "status": "error",
                    "error": e
                });
            }
            break;
        case "stop_loop":
            try{
                clearInterval(mainLoop);
            }catch(e){
                process.send({
                    "id": message.id,
                    "status": "error",
                    "error": e
                });
            }
            break;
        case "loop_status":
            process.send({
                "id": message.id,
                "status": mainLoop._destroyed
            });
        case "create_task":
            break;
        case "fetch_task_list":
            break;
        default:
            log("error", "Unknown action, message: " + message)
    }
}

var eventExecutor = beforeInit;
process.on('message', (message) => {
    eventExecutor(message);
});
