-- MySQL dump 10.13  Distrib 8.0.29, for Linux (x86_64)
--
-- Host: localhost    Database: blorum
-- ------------------------------------------------------
-- Server version	8.0.29

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `articles`
--

DROP TABLE IF EXISTS `articles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `articles` (
  `aid` int unsigned NOT NULL AUTO_INCREMENT,
  `author` int unsigned NOT NULL,
  `title` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `excerpt` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `category` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `status` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `statistics` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `slug` char(255) DEFAULT NULL,
  PRIMARY KEY (`aid`),
  UNIQUE KEY `slug` (`slug`),
  KEY `category` (`category`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `articles`
--

LOCK TABLES `articles` WRITE;
/*!40000 ALTER TABLE `articles` DISABLE KEYS */;
INSERT INTO `articles` VALUES (0,0,'','','','','','{}','',NULL);
/*!40000 ALTER TABLE `articles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comments_a`
--

DROP TABLE IF EXISTS `comments_a`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments_a` (
  `cid` int unsigned NOT NULL AUTO_INCREMENT,
  `aid` int unsigned NOT NULL,
  `nid` int unsigned NOT NULL,
  `uid` int unsigned NOT NULL,
  `depth` tinyint NOT NULL,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `reply_to` int unsigned NOT NULL,
  `children` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `type` tinyint NOT NULL,
  `statistics` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  PRIMARY KEY (`cid`),
  KEY `aid` (`aid`),
  KEY `nid` (`nid`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments_a`
--

LOCK TABLES `comments_a` WRITE;
/*!40000 ALTER TABLE `comments_a` DISABLE KEYS */;
INSERT INTO `comments_a` VALUES (0,0,0,0,0,'',0,'{}',0,'{}');
/*!40000 ALTER TABLE `comments_a` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comments_p`
--

DROP TABLE IF EXISTS `comments_p`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments_p` (
  `cid` int unsigned NOT NULL AUTO_INCREMENT,
  `pid` int unsigned NOT NULL,
  `nid` int unsigned NOT NULL,
  `uid` int unsigned NOT NULL,
  `depth` tinyint unsigned NOT NULL,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `reply_to` int unsigned NOT NULL,
  `children` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `type` tinyint NOT NULL,
  `statistics` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  PRIMARY KEY (`cid`),
  KEY `aid` (`pid`),
  KEY `nid` (`nid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments_p`
--

LOCK TABLES `comments_p` WRITE;
/*!40000 ALTER TABLE `comments_p` DISABLE KEYS */;
INSERT INTO `comments_p` VALUES (0,0,0,0,0,'',0,'{}',0,'{}');
/*!40000 ALTER TABLE `comments_p` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comments_u`
--

DROP TABLE IF EXISTS `comments_u`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments_u` (
  `cid` int unsigned NOT NULL AUTO_INCREMENT,
  `to_uid` int unsigned NOT NULL,
  `uid` int unsigned NOT NULL,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `type` tinyint NOT NULL,
  `statistics` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  PRIMARY KEY (`cid`),
  KEY `aid` (`to_uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments_u`
--

LOCK TABLES `comments_u` WRITE;
/*!40000 ALTER TABLE `comments_u` DISABLE KEYS */;
INSERT INTO `comments_u` VALUES (0,0,0,'reserved',0,'{}');
/*!40000 ALTER TABLE `comments_u` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `config`
--

DROP TABLE IF EXISTS `config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `config` (
  `flag` varchar(64) NOT NULL,
  `value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  PRIMARY KEY (`flag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `config`
--

LOCK TABLES `config` WRITE;
/*!40000 ALTER TABLE `config` DISABLE KEYS */;
INSERT INTO `config` VALUES ('allowed_login','true'),('allowed_register','true'),('default_avatar','/avatar.png'),('default_email_protocol','smtp'),('ip_detect_header','X-Forwarded-From'),('ip_detect_method','connection'),('ip_rate_limit_article','60'),('ip_rate_limit_bypass_whitelist','[127.0.0.1]'),('ip_rate_limit_comment','128'),('ip_rate_limit_login','30'),('ip_rate_limit_post','60'),('ip_rate_limit_react','128'),('ip_rate_limit_register','1'),('ip_rate_limit_remove','\n{\n	\"article\": 12,\n	\"posts\": 12,\n	\"react\": 128,\n	\"comment\": 60\n}'),('register_default_role','user'),('role_permissions','{\n	\"admin\": {\n		\"permissions\": {\n			\"flags\": []\n		},\n		\"rate_limits\":{\n			\"create\":{\n				\"article\": Infinity,\n				\"post\": Infinity,\n				\"react\": Infinity,\n				\"comment\": Infinity\n			},\n			\"remove\": {\n				\"article\": Infinity,\n				\"post\": Infinity,\n				\"react\": Infinity,\n				\"comment\": Infinity\n			},\n			\"login\": Infinity,\n			\"cookie_expire_after\": 13150000,\n			\"max_session\": 10\n		}\n	},\n	\"moderator\": {\n		\"permissions\": {\n			\"flags\": []\n		},\n		\"rate_limits\":{\n			\"create\":{\n				\"article\": 60,\n				\"post\": 60,\n				\"react\": 120,\n				\"comment\": 120\n			},\n			\"remove\": {\n				\"article\": 60,\n				\"post\": 60,\n				\"react\": 120,\n				\"comment\": 120\n			},\n			\"login\": 20,\n			\"cookie_expire_after\":  13150000,\n			\"max_session\": 10\n		}\n	},\n	\"forum_admin\": {\n		\"permissions\": {\n			\"flags\": []\n		},\n		\"rate_limits\":{\n			\"create\":{\n				\"article\": 0,\n				\"post\": 60,\n				\"react\": 120,\n				\"comment\": 120\n			},\n			\"remove\": {\n				\"article\": 0,\n				\"post\": 100,\n				\"react\": 240,\n				\"comment\": 240\n			},\n			\"login\": 20,\n			\"cookie_expire_after\": 13150000,\n			\"max_session\": 10\n		}\n	},\n	\"auditor\": {\n		\"permissions\": {\n			\"flags\": []\n		},\n		\"rate_limits\":{\n			\"create\":{\n				\"article\": 0,\n				\"post\": 10,\n				\"react\": 60,\n				\"comment\": 60\n			},\n			\"remove\": {\n				\"article\": 1,\n				\"post\": 15,\n				\"react\": 240,\n				\"comment\": 360\n			},\n			\"login\": 20,\n			\"cookie_expire_after\": 13150000,\n			\"max_session\": 10\n		}\n	},\n	\"writer\": {\n		\"permissions\": {\n			\"flags\": []\n		},\n		\"rate_limits\":{\n			\"create\":{\n				\"article\": 5,\n				\"post\": 10,\n				\"react\": 30,\n				\"comment\": 30\n			},\n			\"remove\": {\n				\"article\": 5,\n				\"post\": 10,\n				\"react\": 30,\n				\"comment\": 30\n			},\n			\"login\": 20,\n			\"cookie_expire_after\": 2630000,\n			\"max_session\": 10\n		}\n	},\n	\"user\": {\n		\"permissions\": {\n			\"flags\": []\n		},\n		\"rate_limits\":{\n			\"create\":{\n				\"article\": 0,\n				\"post\": 6,\n				\"react\": 30,\n				\"comment\": 24\n			},\n			\"remove\": {\n				\"article\": 0,\n				\"post\": 10,\n				\"react\": 30,\n				\"comment\": 24\n			},\n			\"login\": 20,\n			\"cookie_expire_after\": 2630000,\n			\"max_session\": 8\n		}\n	}\n}\n'),('sendmail_config','{}'),('ses_config','{}'),('site_excerpt','This is a Blorum site, where you could publish blogs and chat.'),('site_logo','/favicon.ico'),('site_title','Yet another Blorum site.'),('site_url','127.0.0.1'),('smtp_config','{}'),('user_roles','[\"omni\", \"admin\", \"moderator\", \"forum_admin\", \"auditor\", \"writer\", “user”]');
/*!40000 ALTER TABLE `config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `forum`
--

DROP TABLE IF EXISTS `forum`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `forum` (
  `fid` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `excerpt` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `default_permission` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `attach` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `pin` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `statistics` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  PRIMARY KEY (`fid`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `forum`
--

LOCK TABLES `forum` WRITE;
/*!40000 ALTER TABLE `forum` DISABLE KEYS */;
/*!40000 ALTER TABLE `forum` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notes`
--

DROP TABLE IF EXISTS `notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notes` (
  `nid` int unsigned NOT NULL AUTO_INCREMENT,
  `aid` int unsigned NOT NULL,
  `cid` int unsigned NOT NULL,
  `from_pos` bigint unsigned NOT NULL,
  `to_pos` bigint unsigned NOT NULL,
  `author` int unsigned NOT NULL,
  `content` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  PRIMARY KEY (`nid`),
  KEY `aid` (`aid`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notes`
--

LOCK TABLES `notes` WRITE;
/*!40000 ALTER TABLE `notes` DISABLE KEYS */;
INSERT INTO `notes` VALUES (0,0,0,0,0,0,'');
/*!40000 ALTER TABLE `notes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `posts`
--

DROP TABLE IF EXISTS `posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `posts` (
  `pid` int unsigned NOT NULL AUTO_INCREMENT,
  `aid` int unsigned NOT NULL,
  `fid` int unsigned NOT NULL,
  `author` int unsigned NOT NULL,
  `title` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `content` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `is_conversation` tinyint(1) NOT NULL DEFAULT '0',
  `viewer` longtext,
  `statistics` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `status` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  PRIMARY KEY (`pid`),
  KEY `aid` (`aid`),
  KEY `fid` (`fid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `posts`
--

LOCK TABLES `posts` WRITE;
/*!40000 ALTER TABLE `posts` DISABLE KEYS */;
/*!40000 ALTER TABLE `posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reports`
--

DROP TABLE IF EXISTS `reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reports` (
  `rid` int unsigned NOT NULL AUTO_INCREMENT,
  `author` int unsigned NOT NULL,
  `reason` text NOT NULL,
  `type` tinyint unsigned NOT NULL,
  `tid` int unsigned NOT NULL,
  PRIMARY KEY (`rid`),
  KEY `tid` (`tid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reports`
--

LOCK TABLES `reports` WRITE;
/*!40000 ALTER TABLE `reports` DISABLE KEYS */;
/*!40000 ALTER TABLE `reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `statistics`
--

DROP TABLE IF EXISTS `statistics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `statistics` (
  `name` varchar(64) NOT NULL,
  `value` longtext NOT NULL,
  PRIMARY KEY (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `statistics`
--

LOCK TABLES `statistics` WRITE;
/*!40000 ALTER TABLE `statistics` DISABLE KEYS */;
/*!40000 ALTER TABLE `statistics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `uid` int unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(256) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `nickname` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `password` varchar(88) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `email` varchar(256) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `avatar` varchar(256) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `about` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `statistics` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `preferences` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  PRIMARY KEY (`uid`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-07-14 18:52:12
