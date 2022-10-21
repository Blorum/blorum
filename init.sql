/*Default Blorum site config SQL*/
use blorum;
truncate config;
/*True/False Flags*/

START TRANSACTION;

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
INSERT INTO `config`(`flag`, `value`) VALUES ("ip_detect_header","X-Forwarded-For");

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

INSERT INTO `config`(`flag`, `value`) VALUES ("register_default_role","user");

INSERT INTO `config`(`flag`, `value`) VALUES ("default_email_protocol","smtp");
INSERT INTO `config`(`flag`, `value`) VALUES ("sendmail_config","{}");
INSERT INTO `config`(`flag`, `value`) VALUES ("smtp_config","{}");
INSERT INTO `config`(`flag`, `value`) VALUES ("ses_config","{}");

INSERT INTO `config`(`flag`, `value`) VALUES ("diff_timeout","0.5");
INSERT INTO `config`(`flag`, `value`) VALUES ("diff_editcost","12");

INSERT INTO `config`(`flag`, `value`) VALUES ("removed_res_keep","true");
INSERT INTO `config`(`flag`, `value`) VALUES ("removed_res_keep_time","604800");

COMMIT;