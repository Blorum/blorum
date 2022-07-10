/*Default Blorum site config SQL*/

/*True/False Flags*/
INSERT INTO `config`(`flag`, `value`) VALUES ("allowed_register","true");
INSERT INTO `config`(`flag`, `value`) VALUES ("allowed_login","true");

/*Variable Flags*/
INSERT INTO `config`(`flag`, `value`) VALUES ("site_url","");
INSERT INTO `config`(`flag`, `value`) VALUES ("site_title","");
INSERT INTO `config`(`flag`, `value`) VALUES ("site_excerpt","");
INSERT INTO `config`(`flag`, `value`) VALUES ("site_logo","");
INSERT INTO `config`(`flag`, `value`) VALUES ("ip_detect_method","");
INSERT INTO `config`(`flag`, `value`) VALUES ("ip_detect_header","");
INSERT INTO `config`(`flag`, `value`) VALUES ("user_cookie_expire_after","");
INSERT INTO `config`(`flag`, `value`) VALUES ("admin_cookie_expire_after","");
INSERT INTO `config`(`flag`, `value`) VALUES ("mod_cookie_expire_after","");

INSERT INTO `config`(`flag`, `value`) VALUES ("max_user_sessions","");
INSERT INTO `config`(`flag`, `value`) VALUES ("max_admin_sessions","");
INSERT INTO `config`(`flag`, `value`) VALUES ("max_mod_sessions","");

INSERT INTO `config`(`flag`, `value`) VALUES ("ip_rate_limit_posts","");
INSERT INTO `config`(`flag`, `value`) VALUES ("ip_rate_limit_register","");
INSERT INTO `config`(`flag`, `value`) VALUES ("ip_rate_limit_react","");
INSERT INTO `config`(`flag`, `value`) VALUES ("ip_rate_limit_comment","");
INSERT INTO `config`(`flag`, `value`) VALUES ("ip_rate_limit_remove","");
INSERT INTO `config`(`flag`, `value`) VALUES ("ip_rate_limit_articles","");
INSERT INTO `config`(`flag`, `value`) VALUES ("ip_rate_limit_login","");
INSERT INTO `config`(`flag`, `value`) VALUES ("ip_rate_limit_bypass_whitelist","");

INSERT INTO `config`(`flag`, `value`) VALUES ("user_rate_limit_posts","");
INSERT INTO `config`(`flag`, `value`) VALUES ("user_rate_limit_react","");
INSERT INTO `config`(`flag`, `value`) VALUES ("user_rate_limit_comment","");
INSERT INTO `config`(`flag`, `value`) VALUES ("user_rate_limit_remove","");
INSERT INTO `config`(`flag`, `value`) VALUES ("user_rate_limit_articles","");
INSERT INTO `config`(`flag`, `value`) VALUES ("user_rate_limit_remove","");
INSERT INTO `config`(`flag`, `value`) VALUES ("user_rate_limit_articles","");
INSERT INTO `config`(`flag`, `value`) VALUES ("user_rate_limit_login","");