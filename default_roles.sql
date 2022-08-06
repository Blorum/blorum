INSERT INTO `roles`(`name`, `with_rate_limit`, `permissions`, `rate_limits`) VALUES ("admin",1,
		'{
			"flags": ["override_ip_rate_limits"],
            "cookie_expire_after": 13150000000,
			"max_session": 10
        }
		','{
			"create":{
				"article": -1,
				"post": -1,
				"react": -1,
				"comment": -1
			},
			"remove": {
				"article": -1,
				"post": -1,
				"react": -1,
				"comment": -1
			},
			"edit": {
				"article": -1,
				"post": -1,
				"react": -1,
				"comment": -1
			},
			"login": -1
		}');
        
        
        
INSERT INTO `roles`(`name`, `with_rate_limit`, `permissions`, `rate_limits`) VALUES ("moderator",1,
		'{
			"flags": [],
			"cookie_expire_after":  13150000000,
			"max_session": 10
        }
		','{
			"create":{
				"article": 60,
				"post": 60,
				"react": 120,
				"comment": 120
			},
			"remove": {
				"article": 60,
				"post": 60,
				"react": 120,
				"comment": 120
			},
			"edit": {
				"article": 60,
				"post": 60,
				"react": 120,
				"comment": 120
			},
			"login": 20
		}');
        
INSERT INTO `roles`(`name`, `with_rate_limit`, `permissions`, `rate_limits`) VALUES ("forum_admin",1,
		'{
			"flags": [],
			"cookie_expire_after":  13150000000,
			"max_session": 10
        }
		','{
			"create":{
				"article": 0,
				"post": 60,
				"react": 120,
				"comment": 120
			},
			"remove": {
				"article": 0,
				"post": 100,
				"react": 240,
				"comment": 240
			},
			"edit": {
				"article": 0,
				"post": 100,
				"react": 240,
				"comment": 240
			},
			"login": 20
		}');
        
INSERT INTO `roles`(`name`, `with_rate_limit`, `permissions`, `rate_limits`) VALUES ("auditor",1,
		'{
			"flags": [],
			"cookie_expire_after": 13150000000,
			"max_session": 10
        }
		','{
			"create":{
				"article": 0,
				"post": 10,
				"react": 60,
				"comment": 60
			},
			"remove": {
				"article": 1,
				"post": 15,
				"react": 240,
				"comment": 360
			},
			"edit": {
				"article": 1,
				"post": 15,
				"react": 240,
				"comment": 360
			},
			"login": 20
		}');
        
INSERT INTO `roles`(`name`, `with_rate_limit`, `permissions`, `rate_limits`) VALUES ("writer",1,
		'{
			"flags": [],
			"cookie_expire_after": 2630000000,
			"max_session": 10
        }','{
			"create":{
				"article": 5,
				"post": 10,
				"react": 30,
				"comment": 30
			},
			"remove": {
				"article": 5,
				"post": 10,
				"react": 30,
				"comment": 30
			},
			"edit": {
				"article": 5,
				"post": 10,
				"react": 30,
				"comment": 30
			},
			"login": 20
		}');
        
INSERT INTO `roles`(`name`, `with_rate_limit`, `permissions`, `rate_limits`) VALUES ("user",1,
		'{
			"flags": [],
			"cookie_expire_after": 2630000000,
			"max_session": 8
        }','{
			"create":{
				"article": 0,
				"post": 6,
				"react": 30,
				"comment": 24
			},
			"remove": {
				"article": 0,
				"post": 10,
				"react": 30,
				"comment": 24
			},
			"edit": {
				"article": 0,
				"post": 10,
				"react": 30,
				"comment": 24
			},
			"login": 20
		}');