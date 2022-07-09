# Document - config

## True / False flags
##### Example
> {"value" : true}
> {"value" : false}

#### allowed_register

## Varible flags
##### Example
> {"value" : "something"}
> {"value" : {
>   "a": 1,
>   "test": "a"
> }}

#### site_url

##### default
127.0.0.1


#### site_title
##### default
Yet another Blorum site.

#### site_excerpt
##### default
This is a Blorum site, where you could publish blogs and chat.

#### site_logo
##### default

* Time were based on seconds.
#### user_cookie_expire_after
##### default
2630000 

(One month)

#### admin_cookie_expire_after
##### default
1315000

(Half month)

#### mod_cookie_expire_after
##### default
1315000

(Half month)

#### max_user_sessions
##### default
4

#### max_admin_sessions
##### default
1

#### max_mods_sessions
##### default
2


*Rate limits are based on requests per hour.

#### ip_rate_limit_posts
##### default
12

#### ip_rate_limit_register
##### default
1

#### ip_rate_limit_react
##### default
32

#### ip_rate_limit_comment
##### default
60

#### ip_rate_limit_remove
##### default
128

#### ip_rate_limit_articles
##### default
12

#### ip_rate_limit_login
##### default
30

#### ip_rate_limit_bypass_whitelist
##### default
[]

#### user_rate_limit_posts

#### user_rate_limit_react

#### user_rate_limit_comment

#### user_rate_limit_remove

#### user_rate_limit_articles

#### user_rate_limit_login