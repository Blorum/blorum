import { default as process } from 'process';

var log, mysql, redis;
process.on('message', (message) => {
    switch (message.action) {
        case "init":
            log = message.log;
            mysql = message.mysql;
            redis = message.redis;
            log("log", "ScheduleD", "ScheduleDaemon initialized.");
            break;
    }
});
