INSERT INTO `roles` (`name`, `type`, `with_rate_limit`, `permissions`, `rate_limits`) VALUES
('admin', 1, 1, '
{
    "flags":[
        "override_ip_rate_limits",
        "administrative"
    ],
    "max_session":10,
    "cookie_expire_after":13150000000
}'
,'        "rate_limits": {
            "login": -1,
            "invite": -1,
            "report": -1,
            "edit": {
                "post": {
                    "self": -1,
                    "tag": -1,
                    "category": -1,
                    "forum": -1
                },
                "article": {
                    "self": -1,
                    "tag": -1,
                    "category": -1
                },
                "comment": -1,
                "note": -1,
                "user": -1,
                "category": -1,
                "forum": -1,
            },
            "create": {
                "category": -1,
                "post": -1,
                "react": -1,
                "article": -1,
                "comment": -1,
                "note": -1,
                "forum": -1,
                "report": -1,
                "user": -1
            },
            "remove": {
                "tag": -1,
                "category": -1,
                "post": -1,
                "react": -1,
                "article": -1,
                "comment": -1,
                "note": -1,
                "forum": -1,
                "report": -1,
                "user": -1
            },
            "site": {
                "change_config": -1
            }
        }'),

('auditor', 1,1, '
{
    "flags":[
        
    ],
    "max_session":10,
    "cookie_expire_after":13150000000
}'
, '
"rate_limits": {
            "login": 20,
            "invite": 8,
            "report": 512,
            "edit": {
                "post": {
                    "self": 60,
                    "tag": 60,
                    "category": 60,
                    "forum": 30
                },
                "article": {
                    "self": 0,
                    "tag": 0,
                    "category": 0
                },
                "comment": 20,
                "note": 20,
                "user": 0,
                "category": 0,
                "forum": 0,
            },
            "create": {
                "category": 10,
                "post": 20,
                "react": 60,
                "article": -1,
                "comment": -1,
                "note": -1,
                "forum": -1,
                "report": -1,
                "user": -1
            },
            "remove": {
                "tag": -1,
                "category": -1,
                "post": -1,
                "react": -1,
                "article": -1,
                "comment": -1,
                "note": -1,
                "forum": -1,
                "report": -1,
                "user": -1
            },
            "site": {
                "change_config": -1
            }
        }
'),

('forum_admin', 1,1, '
{
    "flags":[
        "administrative"
    ],
    "max_session":10,
    "cookie_expire_after":13150000000
}'
, '{
    "edit":{
        "post":100,
        "react":240,
        "article":0,
        "comment":240
    },
    "login":20,
    "create":{
        "post":60,
        "react":120,
        "article":0,
        "comment":120
    },
    "remove":{
        "post":100,
        "react":240,
        "article":0,
        "comment":240
    }
}'),

('moderator', 1,1, '{
    "flags":[
        "administrative"
    ],
    "max_session":10,
    "cookie_expire_after":13150000000
}'
, '
{
    "edit":{
        "post":60,
        "react":120,
        "article":60,
        "comment":120
    },
    "login":20,
    "create":{
        "post":60,
        "react":120,
        "article":60,
        "comment":120
    },
    "remove":{
        "post":60,
        "react":120,
        "article":60,
        "comment":120
    }
}'),

('user', 1,1, '{
    "flags":[
        
    ],
    "max_session":8,
    "cookie_expire_after":2630000000
}'
, '{
    "edit":{
        "post":10,
        "react":30,
        "article":0,
        "comment":24
    },
    "login":20,
    "create":{
        "post":6,
        "react":30,
        "article":0,
        "comment":24
    },
    "remove":{
        "post":10,
        "react":30,
        "article":0,
        "comment":24
    }
}'),

('writer', 1,1, '{
    "flags":[
        
    ],
    "max_session":10,
    "cookie_expire_after":2630000000
}'
, '{
    "edit":{
        "post":10,
        "react":30,
        "article":5,
        "comment":30
    },
    "login":20,
    "create":{
        "post":10,
        "react":30,
        "article":5,
        "comment":30
    },
    "remove":{
        "post":10,
        "react":30,
        "article":5,
        "comment":30
    }
}');

