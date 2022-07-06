const c = {
    "reset" : "\x1b[0m",
    "bright" : "\x1b[1m",
    "dim" : "\x1b[2m",
    "underscore" : "\x1b[4m",
    "blink" : "\x1b[5m",
    "reverse" : "\x1b[7m",
    "hidden" : "\x1b[8m",
    "fgBlack" : "\x1b[30m",
    "fgRed" : "\x1b[31m",
    "fgGreen" : "\x1b[32m",
    "fgYellow" : "\x1b[33m",
    "fgBlue" : "\x1b[34m",
    "fgMagenta" : "\x1b[35m",
    "fgCyan" : "\x1b[36m",
    "fgWhite" : "\x1b[37m",
    "bgBlack" : "\x1b[40m",
    "bgRed" : "\x1b[41m",
    "bgGreen" : "\x1b[42m",
    "bgYellow" : "\x1b[43m",
    "bgBlue" : "\x1b[44m",
    "bgMagenta" : "\x1b[45m",
    "bgCyan" : "\x1b[46m",
    "bgWhite" : "\x1b[47m"
}

function outputLogs(level,context,info){
    let currentTime = new Date().toTimeString().substring(0,8);
    let logs = `[${level}][${currentTime}][${context}]: ${info}`;
    console.log(logs);
}

function outputLogsColored(level,context,info){
    let currentTime = new Date().toTimeString().substring(0,8);
    let logs = "";
    switch(level){
        case "log":
            var lc = c.bgCyan;
            break;
        case "warn":
            var lc = c.bgYellow;
            break;
        case "error":
            var lc = c.bgRed;
            break
    }
    console.log(c.fgWhite+lc+"["+level+"]"+c.reset+c.fgGreen+"["+currentTime+"]"+c.fgBlue+"["+context+"]: "+c.reset+info);
}

export {outputLogs};