# Document - extension

Building Blorum Extensions is extremely easy with anyone who know how to code JavaScript. Since you can proxy/replace original blorum functions.

Example of Blorum Extension manifest.json

{
    "name": "SusRemover",
    "identifier": "crewmate.vote",
    "author": “Crewmate",
    "description": "This extensions remove IMPOSTERS in your ship.",
    "url": "https://sus.imposter",
    "conflict": ["imposter.pipe"],
    "require": [
        "crewmate.task@[1.3.2/1.3.3]"
        ],
    "before_init": [
        "some_js_got_executed_before_blorum_init.js"
    ],
    "after_init": [
        "some_js_got_executed_before_blorum_init.js"
    ],
    "after_ready": [],
}

As you see, you can indicate conflict and require.

For instances: 
"crewmate.task@[1.3.2/1.3.3]" indicates that this extensions require the crewmate.task extension and it must have the version 1.3.2 or 1.3.3
"imposter.pipe" indicates that this extensions always conflict with extension "imposter.pipe"

In every of your javascript files, you must include at least one function _init_ as the entry.

For after_init and after_ready files, Blorum will pass _(db,log)_ to your _init_, you can add two line params to get them.

Example:

> function init(db, log){
>   log("log", "Extensions/lasagna", "Lasagna is loaded! DB Connections:" + db);
> }