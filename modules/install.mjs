import "fs";
import "mysql";
import "redis";
import {isModuleAvailable} from "./utils.mjs";

function install(){
    console.log("******************************");
    console.log("*  Blorum Install Guidance   *");
    console.log("*                     v1.0.0 *");
    console.log("******************************");
}

export {install as installBlorum};