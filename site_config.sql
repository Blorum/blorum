/*Default Blorum site config SQL*/

/*True/False Flags*/
INSERT INTO `config`(`flag`, `value`) VALUES ("allowed_register","true");
INSERT INTO `config`(`flag`, `value`) VALUES ("allowed_login","true");

/*Variable Flags*/
INSERT INTO `config`(`flag`, `value`) VALUES ("site_url","127.0.0.1");
INSERT INTO `config`(`flag`, `value`) VALUES ("site_title","Yet another Blorum site.");
INSERT INTO `config`(`flag`, `value`) VALUES ("site_excerpt","This is a Blorum site, where you could publish blogs and chat.");
INSERT INTO `config`(`flag`, `value`) VALUES ("site_logo","/favicon.ico");
INSERT INTO `config`(`flag`, `value`) VALUES ("ip_detect_method","connection");
INSERT INTO `config`(`flag`, `value`) VALUES ("ip_detect_header","X-Forwarded-From");
INSERT INTO `config`(`flag`, `value`) VALUES ("user_cookie_expire_after","2630000");
INSERT INTO `config`(`flag`, `value`) VALUES ("admin_cookie_expire_after","1315000");
INSERT INTO `config`(`flag`, `value`) VALUES ("mod_cookie_expire_after","1315000");

INSERT INTO `config`(`flag`, `value`) VALUES ("max_user_sessions","8");
INSERT INTO `config`(`flag`, `value`) VALUES ("max_admin_sessions","4");
INSERT INTO `config`(`flag`, `value`) VALUES ("max_mod_sessions","6");

INSERT INTO `config`(`flag`, `value`) VALUES ("ip_rate_limit_posts","12");
INSERT INTO `config`(`flag`, `value`) VALUES ("ip_rate_limit_register","1");
INSERT INTO `config`(`flag`, `value`) VALUES ("ip_rate_limit_react","64");
INSERT INTO `config`(`flag`, `value`) VALUES ("ip_rate_limit_comment","60");
INSERT INTO `config`(`flag`, `value`) VALUES ("ip_rate_limit_remove",'
{
	"article": 12,
	"posts": 12,
	"react": 128,
	"comment": 60
}');
INSERT INTO `config`(`flag`, `value`) VALUES ("ip_rate_limit_articles","12");
INSERT INTO `config`(`flag`, `value`) VALUES ("ip_rate_limit_login","30");
INSERT INTO `config`(`flag`, `value`) VALUES ("ip_rate_limit_bypass_whitelist","[127.0.0.1]");

INSERT INTO `config`(`flag`, `value`) VALUES ("user_rate_limit_posts","12");
INSERT INTO `config`(`flag`, `value`) VALUES ("user_rate_limit_react","64");
INSERT INTO `config`(`flag`, `value`) VALUES ("user_rate_limit_comment","60");
INSERT INTO `config`(`flag`, `value`) VALUES ("user_rate_limit_remove",'{
	"article": 12,
	"posts": 12,
	"react": 128,
	"comment": 60
}');
INSERT INTO `config`(`flag`, `value`) VALUES ("user_rate_limit_articles","12");
INSERT INTO `config`(`flag`, `value`) VALUES ("user_rate_limit_login","30");