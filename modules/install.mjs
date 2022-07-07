import "fs";
import "mysql2";
import "redis";
import {default as inquirer} from "inquirer";
import {isModuleAvailable} from "./utils.mjs";

const moduleList = ["mysql2", "redis", "inquirer","express"];

function install(){
    console.log("******************************");
    console.log("*  Blorum Install Guidance   *");
    console.log("*                     v1.0.0 *");
    console.log("******************************");

    console.log("Checking module availability...");
}

export {install as installBlorum};