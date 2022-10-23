import { default as process } from 'process';

var mysql, redis;
process.on('message', (message) => {
    switch (message.action) {
        case "init":
            mysql = message.mysql;
            redis = message.redis;
            process.send("INIT");
            break;
    }
});
