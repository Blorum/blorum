SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET @@auto_increment_increment=1;

START TRANSACTION;

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `blorum`
--
CREATE DATABASE IF NOT EXISTS `blorum` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `blorum`;

-- --------------------------------------------------------

--
-- Table structure for table `articles`
--

CREATE TABLE `articles` (
  `aid` int(10) UNSIGNED NOT NULL,
  `uid` int(10) UNSIGNED NOT NULL,
  `title` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `excerpt` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `category` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `status` json NOT NULL,
  `statistics` json NOT NULL,
  `slug` char(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `articles`
--

INSERT INTO `articles` (`aid`, `uid`, `title`, `content`, `excerpt`, `tags`, `category`, `status`, `statistics`, `slug`) VALUES
(0, 0, '', '', '', '', '', '{}', '{}', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `comments_a`
--

CREATE TABLE `comments_a` (
  `cid` int(10) UNSIGNED NOT NULL,
  `aid` int(10) UNSIGNED NOT NULL,
  `nid` int(10) UNSIGNED NOT NULL,
  `uid` int(10) UNSIGNED NOT NULL,
  `depth` tinyint(4) NOT NULL,
  `content` json NOT NULL,
  `reply_to` int(10) UNSIGNED NOT NULL,
  `children` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `type` varchar(16) NOT NULL,
  `statistics` json NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `comments_a`
--

INSERT INTO `comments_a` (`cid`, `aid`, `nid`, `uid`, `depth`, `content`, `reply_to`, `children`, `type`, `statistics`) VALUES
(0, 0, 0, 0, 0, '{}', 0, '{}', '0', '{}');

-- --------------------------------------------------------

--
-- Table structure for table `comments_p`
--

CREATE TABLE `comments_p` (
  `cid` int(10) UNSIGNED NOT NULL,
  `pid` int(10) UNSIGNED NOT NULL,
  `nid` int(10) UNSIGNED NOT NULL,
  `uid` int(10) UNSIGNED NOT NULL,
  `depth` tinyint(4) UNSIGNED NOT NULL,
  `content` json NOT NULL,
  `reply_to` int(10) UNSIGNED NOT NULL,
  `children` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `type` tinyint(4) NOT NULL,
  `statistics` json NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `comments_p`
--

INSERT INTO `comments_p` (`cid`, `pid`, `nid`, `uid`, `depth`, `content`, `reply_to`, `children`, `type`, `statistics`) VALUES
(0, 0, 0, 0, 0, '{}', 0, '{}', 0, '{}');

-- --------------------------------------------------------

--
-- Table structure for table `comments_u`
--

CREATE TABLE `comments_u` (
  `cid` int(10) UNSIGNED NOT NULL,
  `to_uid` int(10) UNSIGNED NOT NULL,
  `uid` int(10) UNSIGNED NOT NULL,
  `reply_to` int(10) UNSIGNED NOT NULL,
  `content` json NOT NULL,
  `type` tinyint(4) NOT NULL,
  `statistics` json NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `comments_u`
--

INSERT INTO `comments_u` (`cid`, `to_uid`, `uid`, `reply_to`, `content`, `type`, `statistics`) VALUES
(0, 0, 0, 0, '{}', 0, '{}');

-- --------------------------------------------------------

--
-- Table structure for table `config`
--

CREATE TABLE `config` (
  `flag` varchar(64) NOT NULL,
  `value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `favorite_set`
--

CREATE TABLE `favorite_set` (
  `fid` int(10) UNSIGNED NOT NULL,
  `uid` int(10) UNSIGNED NOT NULL,
  `name` varchar(64) NOT NULL,
  `description` text NOT NULL,
  `content` json NOT NULL,
  `is_private` tinyint(1) NOT NULL,
  `subscribers` longtext NOT NULL,
  `statistics` json NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `forum`
--

CREATE TABLE `forum` (
  `fid` int(10) UNSIGNED NOT NULL,
  `name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `excerpt` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `default_permission` json NOT NULL,
  `attach` json NOT NULL,
  `pin` json NOT NULL,
  `statistics` json NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `log`
--

CREATE TABLE `log` (
  `lid` int(10) UNSIGNED NOT NULL,
  `uid` int(10) UNSIGNED NOT NULL,
  `level` tinyint(4) NOT NULL DEFAULT '1',
  `content` json NOT NULL,
  `timestamp` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `uid` int(10) UNSIGNED NOT NULL,
  `content` json NOT NULL,
  `timestamp` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `notes`
--

CREATE TABLE `notes` (
  `nid` int(10) UNSIGNED NOT NULL,
  `aid` int(10) UNSIGNED NOT NULL,
  `cid` int(10) UNSIGNED NOT NULL,
  `from_pos` bigint(20) UNSIGNED NOT NULL,
  `to_pos` bigint(20) UNSIGNED NOT NULL,
  `uid` int(10) UNSIGNED NOT NULL,
  `content` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `notes`
--

INSERT INTO `notes` (`nid`, `aid`, `cid`, `from_pos`, `to_pos`, `uid`, `content`) VALUES
(0, 0, 0, 0, 0, 0, '');

-- --------------------------------------------------------

--
-- Table structure for table `posts`
--

CREATE TABLE `posts` (
  `pid` int(10) UNSIGNED NOT NULL,
  `aid` int(10) UNSIGNED NOT NULL,
  `fid` int(10) UNSIGNED NOT NULL,
  `uid` int(10) UNSIGNED NOT NULL,
  `title` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `content` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `is_conversation` tinyint(1) NOT NULL DEFAULT '0',
  `viewer` json DEFAULT NULL,
  `statistics` json NOT NULL,
  `status` json NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `reports`
--

CREATE TABLE `reports` (
  `rid` int(10) UNSIGNED NOT NULL,
  `uid` int(10) UNSIGNED NOT NULL,
  `reason` text NOT NULL,
  `type` varchar(16) NOT NULL,
  `tid` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `name` varchar(64) NOT NULL,
  `type` tinyint(1) NOT NULL,
  `with_rate_limit` tinyint(1) NOT NULL,
  `permissions` json NOT NULL,
  `rate_limits` json NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `statistics`
--

CREATE TABLE `statistics` (
  `name` varchar(64) NOT NULL,
  `value` json NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `uid` int(10) UNSIGNED NOT NULL,
  `username` varchar(256) CHARACTER SET ascii NOT NULL,
  `nickname` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `password` varchar(88) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `email` varchar(256) CHARACTER SET ascii NOT NULL,
  `avatar` varchar(256) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `about` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `statistics` json NOT NULL,
  `roles` longtext NOT NULL,
  `preferences` json NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

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
  ADD PRIMARY KEY (`flag`) USING HASH;

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
-- Indexes for table `log`
--
ALTER TABLE `log`
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
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`name`);

--
-- Indexes for table `statistics`
--
ALTER TABLE `statistics`
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
  MODIFY `aid` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `comments_a`
--
ALTER TABLE `comments_a`
  MODIFY `cid` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `comments_p`
--
ALTER TABLE `comments_p`
  MODIFY `cid` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `comments_u`
--
ALTER TABLE `comments_u`
  MODIFY `cid` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `favorite_set`
--
ALTER TABLE `favorite_set`
  MODIFY `fid` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `forum`
--
ALTER TABLE `forum`
  MODIFY `fid` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `log`
--
ALTER TABLE `log`
  MODIFY `lid` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notes`
--
ALTER TABLE `notes`
  MODIFY `nid` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `posts`
--
ALTER TABLE `posts`
  MODIFY `pid` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reports`
--
ALTER TABLE `reports`
  MODIFY `rid` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `uid` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;