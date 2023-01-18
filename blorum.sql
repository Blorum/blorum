SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `blorum`
--

-- --------------------------------------------------------

--
-- Table structure for table `articles`
--

CREATE TABLE `articles` (
  `aid` int UNSIGNED NOT NULL,
  `uid` int UNSIGNED NOT NULL,
  `title` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `excerpt` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `category` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `status` json NOT NULL,
  `history` json NOT NULL,
  `statistics` json NOT NULL,
  `slug` char(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `articles`
--

INSERT INTO `articles` (`aid`, `uid`, `title`, `content`, `excerpt`, `tags`, `category`, `status`, `history`, `statistics`, `slug`) VALUES
(0, 0, '__blorum_root', '', '', '', '', '{}', '{}', '{}', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `cid` int UNSIGNED NOT NULL,
  `type` tinyint NOT NULL,
  `name` varchar(64) NOT NULL,
  `icon` varchar(128) NOT NULL,
  `available` json NOT NULL,
  `parent` text NOT NULL,
  `children` text NOT NULL,
  `statistics` json NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`cid`, `type`, `name`,`icon`, `available`, `parent`, `children`, `statistics`) VALUES
(0, 0, '__blorum_root','','{}', '', '', '{}');

-- --------------------------------------------------------

--
-- Table structure for table `tags`
--

CREATE TABLE `tags` (
  `name` varchar(64) NOT NULL,
  `icon` varchar(128) NOT NULL,
  `available` json NOT NULL,
  `statistics` json NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=uft8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `comments_a`
--

CREATE TABLE `comments_a` (
  `cid` int UNSIGNED NOT NULL,
  `aid` int UNSIGNED NOT NULL,
  `nid` int UNSIGNED NOT NULL,
  `uid` int UNSIGNED NOT NULL,
  `depth` tinyint NOT NULL,
  `content` json NOT NULL,
  `reply_to` int UNSIGNED NOT NULL,
  `children` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `type` varchar(16) NOT NULL,
  `statistics` json NOT NULL,
  `history` json NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `comments_a`
--

INSERT INTO `comments_a` (`cid`, `aid`, `nid`, `uid`, `depth`, `content`, `reply_to`, `children`, `type`, `statistics`, `history`) VALUES
(0, 0, 0, 0, 0, '{}', 0, '{}', '0', '{}', '{}');

-- --------------------------------------------------------

--
-- Table structure for table `comments_p`
--

CREATE TABLE `comments_p` (
  `cid` int UNSIGNED NOT NULL,
  `pid` int UNSIGNED NOT NULL,
  `nid` int UNSIGNED NOT NULL,
  `uid` int UNSIGNED NOT NULL,
  `depth` tinyint UNSIGNED NOT NULL,
  `content` json NOT NULL,
  `reply_to` int UNSIGNED NOT NULL,
  `children` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `type` tinyint NOT NULL,
  `statistics` json NOT NULL,
  `history` json NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `comments_p`
--

INSERT INTO `comments_p` (`cid`, `pid`, `nid`, `uid`, `depth`, `content`, `reply_to`, `children`, `type`, `statistics`, `history`) VALUES
(0, 0, 0, 0, 0, '{}', 0, '{}', 0, '{}', '{}');

-- --------------------------------------------------------

--
-- Table structure for table `comments_u`
--

CREATE TABLE `comments_u` (
  `cid` int UNSIGNED NOT NULL,
  `to_uid` int UNSIGNED NOT NULL,
  `uid` int UNSIGNED NOT NULL,
  `reply_to` int UNSIGNED NOT NULL,
  `content` json NOT NULL,
  `type` tinyint NOT NULL,
  `statistics` json NOT NULL,
  `history` json NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `comments_u`
--

INSERT INTO `comments_u` (`cid`, `to_uid`, `uid`, `reply_to`, `content`, `type`, `statistics`, `history`) VALUES
(0, 0, 0, 0, '{}', 0, '{}', '{}');

-- --------------------------------------------------------

--
-- Table structure for table `config`
--

CREATE TABLE `config` (
  `flag` varchar(64) NOT NULL,
  `value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `config`
--

INSERT INTO `config` (`flag`, `value`) VALUES
('allowed_comment_to_article', 'true'),
('allowed_comment_to_post', 'true'),
('allowed_comment_to_user', 'true'),
('allowed_login', 'true'),
('allowed_register', 'true'),
('default_avatar', '/statics/avatar.png'),
('default_email_protocol', 'smtp'),
('enable_email_register_challenge', 'false'),
('ip_detect_header', 'X-Forwarded-For'),
('ip_detect_method', 'connection'),
('ip_rate_limit_bypass_whitelist', '[127.0.0.1]'),
('ip_rate_limit_create', '{\r\n	\"article\": 12,\r\n	\"posts\": 12,\r\n	\"notes\": 30,\r\n	\"react\": 64,	\r\n	\"comment\": 60\r\n}'),
('ip_rate_limit_edit', '\r\n{\r\n\r\n	\"article\": 12,\r\n	\"posts\": 20,\r\n	\"notes\": 30,\r\n	\"react\": 128,	\r\n	\"comment\": 60\r\n	\r\n}'),
('ip_rate_limit_login', '30'),
('ip_rate_limit_remove', '\r\n{\r\n\r\n	\"article\": 12,\r\n	\"posts\": 20,\r\n	\"notes\": 30,\r\n	\"react\": 128,	\r\n	\"comment\": 60\r\n	\r\n}'),
('lazy_process', '0'),
('register_default_role', 'user'),
('removed_res_keep', 'true'),
('removed_res_keep_time', '604800'),
('sendmail_config', '{}'),
('ses_config', '{}'),
('site_excerpt', 'This is a Blorum site, where you could publish blogs and chat.'),
('site_logo', '/favicon.ico'),
('site_title', 'Yet another Blorum site.'),
('site_url', '127.0.0.1'),
('smtp_config', '{}');

-- --------------------------------------------------------

--
-- Table structure for table `favorite_set`
--

CREATE TABLE `favorite_set` (
  `fid` int UNSIGNED NOT NULL,
  `uid` int UNSIGNED NOT NULL,
  `name` varchar(64) NOT NULL,
  `description` text NOT NULL,
  `content` json NOT NULL,
  `is_private` tinyint(1) NOT NULL,
  `subscribers` longtext NOT NULL,
  `statistics` json NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `forum`
--

CREATE TABLE `forum` (
  `fid` int UNSIGNED NOT NULL,
  `name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `excerpt` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `default_permission` json NOT NULL,
  `attach` json NOT NULL,
  `root_categories` text NOT NULL,
  `pin` json NOT NULL,
  `statistics` json NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=uft8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `logs`
--

CREATE TABLE `logs` (
  `lid` int UNSIGNED NOT NULL,
  `uid` int UNSIGNED NOT NULL,
  `level` tinyint NOT NULL DEFAULT '1',
  `content` json NOT NULL,
  `timestamp` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `uid` int UNSIGNED NOT NULL,
  `viewed` tinyint(1) NOT NULL,
  `content` json NOT NULL,
  `timestamp` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `notes`
--

CREATE TABLE `notes` (
  `nid` int UNSIGNED NOT NULL,
  `aid` int UNSIGNED NOT NULL,
  `cid` int UNSIGNED NOT NULL,
  `from_pos` bigint UNSIGNED NOT NULL,
  `to_pos` bigint UNSIGNED NOT NULL,
  `uid` int UNSIGNED NOT NULL,
  `content` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `history` json NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=uft8mb4;

--
-- Dumping data for table `notes`
--

INSERT INTO `notes` (`nid`, `aid`, `cid`, `from_pos`, `to_pos`, `uid`, `content`, `history`) VALUES
(0, 0, 0, 0, 0, 0, '', '{}');

-- --------------------------------------------------------

--
-- Table structure for table `posts`
--

CREATE TABLE `posts` (
  `pid` int UNSIGNED NOT NULL,
  `aid` int UNSIGNED NOT NULL,
  `fid` int UNSIGNED NOT NULL,
  `uid` int UNSIGNED NOT NULL,
  `title` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `content` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `is_conversation` tinyint(1) NOT NULL DEFAULT '0',
  `viewer` json DEFAULT NULL,
  `statistics` json NOT NULL,
  `history` json NOT NULL,
  `status` json NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=uft8mb4;

--
-- Dumping data for table `posts`
--

INSERT INTO `posts` (`pid`, `aid`, `fid`, `uid`, `title`, `content`, `is_conversation`, `viewer`, `statistics`, `history`, `status`) VALUES
(1, 0, 0, 0, '_blorum_root', '', 0, '{}', '{}', '{}', '{}');

-- --------------------------------------------------------

--
-- Table structure for table `reports`
--

CREATE TABLE `reports` (
  `rid` int UNSIGNED NOT NULL,
  `uid` int UNSIGNED NOT NULL,
  `reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `type` varchar(16) NOT NULL,
  `tid` int UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `name` varchar(64) NOT NULL,
  `type` tinyint(1) NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `with_rate_limit` tinyint(1) NOT NULL,
  `permissions` json NOT NULL,
  `rate_limits` json NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `rv_articles`
--

CREATE TABLE `rv_articles` (
  `aid` int UNSIGNED NOT NULL,
  `uid` int UNSIGNED NOT NULL,
  `title` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `excerpt` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `category` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `history` json NOT NULL,
  `slug` char(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `rv_comments_a`
--

CREATE TABLE `rv_comments_a` (
  `cid` int UNSIGNED NOT NULL,
  `aid` int UNSIGNED NOT NULL,
  `nid` int UNSIGNED NOT NULL,
  `uid` int UNSIGNED NOT NULL,
  `depth` tinyint NOT NULL,
  `content` json NOT NULL,
  `reply_to` int UNSIGNED NOT NULL,
  `children` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `type` varchar(16) NOT NULL,
  `history` json NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `rv_comments_p`
--

CREATE TABLE `rv_comments_p` (
  `cid` int UNSIGNED NOT NULL,
  `pid` int UNSIGNED NOT NULL,
  `nid` int UNSIGNED NOT NULL,
  `uid` int UNSIGNED NOT NULL,
  `depth` tinyint UNSIGNED NOT NULL,
  `content` json NOT NULL,
  `reply_to` int UNSIGNED NOT NULL,
  `children` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `type` tinyint NOT NULL,
  `history` json NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=uft8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `rv_comments_u`
--

CREATE TABLE `rv_comments_u` (
  `cid` int UNSIGNED NOT NULL,
  `to_uid` int UNSIGNED NOT NULL,
  `uid` int UNSIGNED NOT NULL,
  `reply_to` int UNSIGNED NOT NULL,
  `content` json NOT NULL,
  `type` tinyint NOT NULL,
  `history` json NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=uft8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `rv_posts`
--

CREATE TABLE `rv_posts` (
  `pid` int UNSIGNED NOT NULL,
  `aid` int UNSIGNED NOT NULL,
  `fid` int UNSIGNED NOT NULL,
  `uid` int UNSIGNED NOT NULL,
  `title` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `content` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `is_conversation` tinyint(1) NOT NULL DEFAULT '0',
  `viewer` json DEFAULT NULL,
  `history` json NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=uft8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `statistics`
--

CREATE TABLE `statistics` (
  `name` varchar(64) NOT NULL,
  `value` json NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=uft8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `uid` int UNSIGNED NOT NULL,
  `username` varchar(256) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `nickname` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `password` varchar(88) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `email` varchar(256) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `avatar` varchar(256) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `about` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `statistics` json NOT NULL,
  `roles` longtext NOT NULL,
  `preferences` json NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`uid`, `username`, `nickname`, `password`, `email`, `avatar`, `about`, `statistics`, `roles`, `preferences`) VALUES
(0, 'system', 'system', '', '', '', 'Blorum System', '{}', '{}', '{}');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `articles`
--
ALTER TABLE `articles`
  ADD PRIMARY KEY (`aid`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `category` (`category`),
  ADD KEY `uid` (`uid`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`cid`),
  ADD KEY `name` (`name`),
  ADD KEY `type` (`type`);

--
-- Indexes for table `comments_a`
--
ALTER TABLE `comments_a`
  ADD PRIMARY KEY (`cid`),
  ADD KEY `aid` (`aid`),
  ADD KEY `nid` (`nid`);

--
-- Indexes for table `comments_p`
--
ALTER TABLE `comments_p`
  ADD PRIMARY KEY (`cid`),
  ADD KEY `aid` (`pid`),
  ADD KEY `nid` (`nid`);

--
-- Indexes for table `comments_u`
--
ALTER TABLE `comments_u`
  ADD PRIMARY KEY (`cid`),
  ADD KEY `aid` (`to_uid`);

--
-- Indexes for table `config`
--
ALTER TABLE `config`
  ADD PRIMARY KEY (`flag`);

--
-- Indexes for table `favorite_set`
--
ALTER TABLE `favorite_set`
  ADD PRIMARY KEY (`fid`),
  ADD KEY `uid` (`uid`);

--
-- Indexes for table `forum`
--
ALTER TABLE `forum`
  ADD PRIMARY KEY (`fid`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `logs`
--
ALTER TABLE `logs`
  ADD PRIMARY KEY (`lid`) USING BTREE,
  ADD KEY `uid` (`uid`),
  ADD KEY `level` (`level`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD KEY `uid` (`uid`);

--
-- Indexes for table `notes`
--
ALTER TABLE `notes`
  ADD PRIMARY KEY (`nid`),
  ADD KEY `aid` (`aid`);

--
-- Indexes for table `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`pid`),
  ADD KEY `aid` (`aid`),
  ADD KEY `fid` (`fid`);

--
-- Indexes for table `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`rid`),
  ADD KEY `tid` (`tid`);

--
-- Indexes for table `rv_articles`
--
ALTER TABLE `rv_articles`
  ADD PRIMARY KEY (`aid`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `category` (`category`),
  ADD KEY `uid` (`uid`);

--
-- Indexes for table `rv_comments_a`
--
ALTER TABLE `rv_comments_a`
  ADD PRIMARY KEY (`cid`),
  ADD KEY `aid` (`aid`),
  ADD KEY `nid` (`nid`);

--
-- Indexes for table `rv_comments_p`
--
ALTER TABLE `rv_comments_p`
  ADD PRIMARY KEY (`cid`),
  ADD KEY `aid` (`pid`),
  ADD KEY `nid` (`nid`);

--
-- Indexes for table `rv_comments_u`
--
ALTER TABLE `rv_comments_u`
  ADD PRIMARY KEY (`cid`),
  ADD KEY `aid` (`to_uid`);

--
-- Indexes for table `rv_posts`
--
ALTER TABLE `rv_posts`
  ADD PRIMARY KEY (`pid`),
  ADD KEY `aid` (`aid`),
  ADD KEY `fid` (`fid`);

--
-- Indexes for table `statistics`
--
ALTER TABLE `statistics`
  ADD PRIMARY KEY (`name`);

--
-- Indexes for table `tags`
--
ALTER TABLE `tags`
  ADD PRIMARY KEY (`name`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`uid`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `articles`
--
ALTER TABLE `articles`
  MODIFY `aid` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `cid` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `comments_a`
--
ALTER TABLE `comments_a`
  MODIFY `cid` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `comments_p`
--
ALTER TABLE `comments_p`
  MODIFY `cid` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `comments_u`
--
ALTER TABLE `comments_u`
  MODIFY `cid` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `favorite_set`
--
ALTER TABLE `favorite_set`
  MODIFY `fid` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `forum`
--
ALTER TABLE `forum`
  MODIFY `fid` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `logs`
--
ALTER TABLE `logs`
  MODIFY `lid` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notes`
--
ALTER TABLE `notes`
  MODIFY `nid` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `posts`
--
ALTER TABLE `posts`
  MODIFY `pid` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reports`
--
ALTER TABLE `reports`
  MODIFY `rid` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rv_articles`
--
ALTER TABLE `rv_articles`
  MODIFY `aid` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rv_comments_a`
--
ALTER TABLE `rv_comments_a`
  MODIFY `cid` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rv_comments_p`
--
ALTER TABLE `rv_comments_p`
  MODIFY `cid` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rv_comments_u`
--
ALTER TABLE `rv_comments_u`
  MODIFY `cid` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rv_posts`
--
ALTER TABLE `rv_posts`
  MODIFY `pid` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `uid` int UNSIGNED NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
