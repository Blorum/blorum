/*Default Blorum site config SQL*/
use blorum;
truncate config;
/*True/False Flags*/
INSERT INTO `config`(`flag`, `value`) VALUES ("allowed_register","true");
INSERT INTO `config`(`flag`, `value`) VALUES ("allowed_login","true");
INSERT INTO `config`(`flag`, `value`) VALUES ("allowed_comment_to_article","true");
INSERT INTO `config`(`flag`, `value`) VALUES ("allowed_comment_to_post","true");
INSERT INTO `config`(`flag`, `value`) VALUES ("allowed_comment_to_user","true");
INSERT INTO `config`(`flag`, `value`) VALUES ("enable_email_register_challenge","false");

/*Variable Flags*/
INSERT INTO `config`(`flag`, `value`) VALUES ("site_url","127.0.0.1");
INSERT INTO `config`(`flag`, `value`) VALUES ("site_title","Yet another Blorum site.");
INSERT INTO `config`(`flag`, `value`) VALUES ("site_excerpt","This is a Blorum site, where you could publish blogs and chat.");
INSERT INTO `config`(`flag`, `value`) VALUES ("site_logo","/favicon.ico");
INSERT INTO `config`(`flag`, `value`) VALUES ("default_avatar","/statics/avatar.png");
INSERT INTO `config`(`flag`, `value`) VALUES ("ip_detect_method","connection");
INSERT INTO `config`(`flag`, `value`) VALUES ("ip_detect_header","X-Forwarded-From");

INSERT INTO `config`(`flag`, `value`) VALUES ("ip_rate_limit_create",'{
	"article": 12,
	"posts": 12,
	"notes": 30,
	"react": 64,	
	"comment": 60
}');
INSERT INTO `config`(`flag`, `value`) VALUES ("ip_rate_limit_remove",'
{

	"article": 12,
	"posts": 20,
	"notes": 30,
	"react": 128,	
	"comment": 60
	
}');
INSERT INTO `config`(`flag`, `value`) VALUES ("ip_rate_limit_edit",'
{

	"article": 12,
	"posts": 20,
	"notes": 30,
	"react": 128,	
	"comment": 60
	
}');
INSERT INTO `config`(`flag`, `value`) VALUES ("ip_rate_limit_login","30");
INSERT INTO `config`(`flag`, `value`) VALUES ("ip_rate_limit_bypass_whitelist","[127.0.0.1]");

INSERT INTO `config`(`flag`, `value`) VALUES ("user_roles",'["omni", "admin", "moderator", "forum_admin", "auditor", "writer", “user”]');

INSERT INTO `config`(`flag`, `value`) VALUES ("roles_permissions",'{
	"admin": {
		"permissions": {
			"flags": []
		},
		"rate_limits":{
			"create":{
				"article": Infinity,
				"post": Infinity,
				"react": Infinity,
				"comment": Infinity
			},
			"remove": {
				"article": Infinity,
				"post": Infinity,
				"react": Infinity,
				"comment": Infinity
			},
			"login": Infinity
		},
		"cookie_expire_after": 13150000000,
		"max_session": 10
	},
	"moderator": {
		"permissions": {
			"flags": []
		},
		"rate_limits":{
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
			"login": 20
		},
		"cookie_expire_after":  13150000000,
		"max_session": 10
	},
	"forum_admin": {
		"permissions": {
			"flags": []
		},
		"rate_limits":{
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
			"login": 20
		},
		"cookie_expire_after": 13150000000,
		"max_session": 10
	},
	"auditor": {
		"permissions": {
			"flags": []
		},
		"rate_limits":{
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
			"login": 20
		},
		"cookie_expire_after": 13150000000,
		"max_session": 10
	},
	"writer": {
		"permissions": {
			"flags": []
		},
		"rate_limits":{
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
			"login": 20
		},
		"cookie_expire_after": 2630000000,
		"max_session": 10
	},
	"user": {
		"permissions": {
			"flags": []
		},
		"rate_limits":{
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
			"login": 20
		},
		"cookie_expire_after": 2630000000,
		"max_session": 8
	}
}
');

INSERT INTO `config`(`flag`, `value`) VALUES ("register_default_role","user");

INSERT INTO `config`(`flag`, `value`) VALUES ("default_email_protocol","smtp");
INSERT INTO `config`(`flag`, `value`) VALUES ("sendmail_config","{}");
INSERT INTO `config`(`flag`, `value`) VALUES ("smtp_config","{}");
INSERT INTO `config`(`flag`, `value`) VALUES ("ses_config","{}");
