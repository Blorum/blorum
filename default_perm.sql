INSERT INTO `roles` (`name`, `type`, `with_rate_limit`, `permissions`, `rate_limits`) VALUES
('admin', 1, 1, '
{
    "flags":[
        "override_ip_rate_limits",
        "administrative"
    ],
    "max_session":10,
    "cookie_expire_after":1315000
}'
,'{
            "login": -1,
            "invite": -1,
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
            "judge": {
				"report": -1
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
    "cookie_expire_after":1315000
}'
, '{
            "login": 20,
            "invite": 8,
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
                "article": 0,
                "comment": 60,
                "note": 60,
                "forum": 0,
                "report": 240,
                "user": 0
            },
            "remove": {
                "category": 0,
                "post": 60,
                "react": 100,
                "article": 0,
                "comment": 60,
                "note": 20,
                "forum": 0,
                "report": 0,
                "user": 0
            },
			"judge": {
				"report": 380
            },
            "site": {
                "change_config": 0
            }
        }
'),

('forum_admin', 1,1, '
{
    "flags":[
        "administrative"
    ],
    "max_session":10,
    "cookie_expire_after":1315000
}'
, '{
            "login": 20,
            "invite": 20,
            "edit": {
                "post": {
                    "self": 120,
                    "tag": 120,
                    "category": 120,
                    "forum": 60
                },
                "article": {
                    "self": 0,
                    "tag": 0,
                    "category": 0
                },
                "comment": 40,
                "note": 40,
                "user": 0,
                "category": 40,
                "forum": 50,
            },
            "create": {
                "category": 60,
                "post": 80,
                "react": 60,
                "article": 0,
                "comment": 60,
                "note": 60,
                "forum": 0,
                "report": 240,
                "user": 0
            },
            "remove": {
                "category": 60,
                "post": 120,
                "react": 120,
                "article": 0,
                "comment": 120,
                "note": 0,
                "forum": 4,
                "report": 0,
                "user": 0
            },
			"judge": {
				"report": 380
            },
            "site": {
                "change_config": 0
            }
        }'),

('moderator', 1,1, '{
    "flags":[
        "administrative"
    ],
    "max_session":10,
    "cookie_expire_after":1315000
}'
, '{
            "login": 30,
            "invite": 20,
            "edit": {
                "post": {
                    "self": 120,
                    "tag": 120,
                    "category": 120,
                    "forum": 60
                },
                "article": {
                    "self": 40,
                    "tag": 40,
                    "category": 40
                },
                "comment": 40,
                "note": 40,
                "user": 60,
                "category": 60,
                "forum": 60,
            },
            "create": {
                "category": 60,
                "post": 80,
                "react": 120,
                "article": 30,
                "comment": 60,
                "note": 60,
                "forum": 10,
                "report": 240,
                "user": 20
            },
            "remove": {
                "category": 60,
                "post": 120,
                "react": 120,
                "article": 10,
                "comment": 120,
                "note": 60,
                "forum": 4,
                "report": 60,
                "user": 20
            },
			"judge": {
				"report": 380
            },
            "site": {
                "change_config": 60
            }
        }'),

('user', 1,1, '{
    "flags":[
        
    ],
    "max_session":8,
    "cookie_expire_after":2630000000
}'
, '{
            "login": 20,
            "invite": 8,
            "edit": {
                "post": {
                    "self": 40,
                    "tag": 40,
                    "category": 40,
                    "forum": 30
                },
                "article": {
                    "self": 0,
                    "tag": 0,
                    "category": 0
                },
                "comment": 40,
                "note": 40,
                "user": 0,
                "category": 0,
                "forum": 0,
            },
            "create": {
                "category": 0,
                "post": 40,
                "react": 60,
                "article": 0,
                "comment": 40,
                "note": 40,
                "forum": 0,
                "report": 80,
                "user": 0
            },
            "remove": {
                "category": 0,
                "post": 0,
                "react": 80,
                "article": 0,
                "comment": 80,
                "note": 80,
                "forum": 0,
                "report": 0,
                "user": 0
            },
            "judge": {
				"report": 0
            },
            "site": {
                "change_config": 0
            }
        }'),

('writer', 1,1, '{
    "flags":[
        
    ],
    "max_session":10,
    "cookie_expire_after":2630000000
}'
, '{
            "login": 20,
            "invite": 8,
            "edit": {
                "post": {
                    "self": 60,
                    "tag": 60,
                    "category": 60,
                    "forum": 40
                },
                "article": {
                    "self": 60,
                    "tag": 60,
                    "category": 60
                },
                "comment": 60,
                "note": 60,
                "user": 0,
                "category": 0,
                "forum": 0,
            },
            "create": {
                "category": 10,
                "post": 60,
                "react": 80,
                "article": 40,
                "comment": 60,
                "note": 60,
                "forum": 0,
                "report": 240,
                "user": 0
            },
            "remove": {
                "category": 0,
                "post": 0,
                "react": 100,
                "article": 30,
                "comment": 100,
                "note": 100,
                "forum": 0,
                "report": 0,
                "user": 0
            },
            "judge": {
				"report": 0
            },
            "site": {
                "change_config": 0
            }
        }'),

('guest', 0,1, '{
    "flags":[
        
    ],
    "site": {
        "allow_register": true,
        "allow_login": true,
        "get_title": true,
        "get_description": true,
        "get_excerpt": true,
        "get_keywords": true,
        "get_logo": true
    }
}'
, '');

