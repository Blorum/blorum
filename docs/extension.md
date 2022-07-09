# Document - extension

Building Blorum Extensions is extremely easy with anyone who know how to code JavaScript. Since you can proxy/replace original blorum functions.

Example of Blorum Extension manifest.json

{
    "name": "eg",
    "aauthor": “a",
    "url": "https://sus.imposter",
    "conflict": [],
    "require": [],
    "before_init": [
        "some_js_got_executed_before_blorum_init.js"
    ],
    "after_ready": [],
}