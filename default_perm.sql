INSERT INTO `roles` (`name`, `with_rate_limit`, `permissions`, `rate_limits`) VALUES
('admin', 1, '{\"flags\": [\"override_ip_rate_limits\",\"administrative\"], \"max_session\": 10, \"cookie_expire_after\": 13150000000}', '{\"edit\": {\"post\": -1, \"react\": -1, \"article\": -1, \"comment\": -1}, \"login\": -1, \"create\": {\"post\": -1, \"react\": -1, \"article\": -1, \"comment\": -1}, \"remove\": {\"post\": -1, \"react\": -1, \"article\": -1, \"comment\": -1}}'),
('auditor', 1, '{\"flags\": [], \"max_session\": 10, \"cookie_expire_after\": 13150000000}', '{\"edit\": {\"post\": 15, \"react\": 240, \"article\": 1, \"comment\": 360}, \"login\": 20, \"create\": {\"post\": 10, \"react\": 60, \"article\": 0, \"comment\": 60}, \"remove\": {\"post\": 15, \"react\": 240, \"article\": 1, \"comment\": 360}}'),
('forum_admin', 1, '{\"flags\": [\"administrative\"], \"max_session\": 10, \"cookie_expire_after\": 13150000000}', '{\"edit\": {\"post\": 100, \"react\": 240, \"article\": 0, \"comment\": 240}, \"login\": 20, \"create\": {\"post\": 60, \"react\": 120, \"article\": 0, \"comment\": 120}, \"remove\": {\"post\": 100, \"react\": 240, \"article\": 0, \"comment\": 240}}'),
('moderator', 1, '{\"flags\": [\"administrative\"], \"max_session\": 10, \"cookie_expire_after\": 13150000000}', '{\"edit\": {\"post\": 60, \"react\": 120, \"article\": 60, \"comment\": 120}, \"login\": 20, \"create\": {\"post\": 60, \"react\": 120, \"article\": 60, \"comment\": 120}, \"remove\": {\"post\": 60, \"react\": 120, \"article\": 60, \"comment\": 120}}'),
('user', 1, '{\"flags\": [], \"max_session\": 8, \"cookie_expire_after\": 2630000000}', '{\"edit\": {\"post\": 10, \"react\": 30, \"article\": 0, \"comment\": 24}, \"login\": 20, \"create\": {\"post\": 6, \"react\": 30, \"article\": 0, \"comment\": 24}, \"remove\": {\"post\": 10, \"react\": 30, \"article\": 0, \"comment\": 24}}'),
('writer', 1, '{\"flags\": [], \"max_session\": 10, \"cookie_expire_after\": 2630000000}', '{\"edit\": {\"post\": 10, \"react\": 30, \"article\": 5, \"comment\": 30}, \"login\": 20, \"create\": {\"post\": 10, \"react\": 30, \"article\": 5, \"comment\": 30}, \"remove\": {\"post\": 10, \"react\": 30, \"article\": 5, \"comment\": 30}}');
