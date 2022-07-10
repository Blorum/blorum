import "fs";
import "mysql2";
import "ioredis";
import {default as inquirer} from "inquirer";
import {isModuleAvailable} from "./modules/utils.mjs";

const moduleList = ["mysql2", "ioredis", "inquirer","express"];

function install(){
    console.log("******************************");
    console.log("*  Blorum Install Guidance   *");
    console.log("*                     v1.0.0 *");
    console.log("******************************");

    console.log("Checking module availability...");
}

install();

export {install as installBlorum};