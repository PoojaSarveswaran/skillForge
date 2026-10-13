-- OPTIONAL demo data for SkillForge AI.
--
-- Not required — schema.sql + seed.sql alone are enough to run the app with
-- an empty account. Import this file ONLY if you want the pre-built demo
-- account (demo@skillforge.ai / DemoPass123!) to already have its skills,
-- roadmap, and activity history populated, instead of starting empty.
--
-- Import AFTER schema.sql and seed.sql, into the same empty database:
--   mysql -u sf_app -p skillforge < database/demo_data.sql
--
-- MySQL dump 10.13  Distrib 9.5.0, for macos26.0 (arm64)
--
-- Host: localhost    Database: skillforge
-- ------------------------------------------------------
-- Server version	9.5.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` (`id`, `email`, `password_hash`, `display_name`, `education_stage`, `weekly_availability_hours`, `career_goals`, `target_role_id`, `created_at`, `updated_at`) VALUES (1,'demo@skillforge.ai','$2a$10$wZ5PB/2i9xeqJtaY7HgbqeAaI33xkX.Ek4/GzxwrWyfXGC4x73e8y','Prajeet V','B.E CSE (2024-2028)',10,'Become an ML engineer and build impactful AI products.',2,'2026-10-12 21:47:10','2026-10-12 21:47:27');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `user_skills`
--

LOCK TABLES `user_skills` WRITE;
/*!40000 ALTER TABLE `user_skills` DISABLE KEYS */;
INSERT INTO `user_skills` (`id`, `user_id`, `skill_name`, `category`, `proficiency`, `created_at`, `updated_at`) VALUES (1,1,'Python','AI/ML',2,'2026-10-12 21:47:27','2026-10-12 21:47:27'),(2,1,'Mathematics','AI/ML',3,'2026-10-12 21:47:27','2026-10-12 21:47:27'),(3,1,'Statistics','AI/ML',1,'2026-10-12 21:47:27','2026-10-12 21:47:27'),(4,1,'Data Analysis','AI/ML',2,'2026-10-12 21:47:27','2026-10-12 21:47:27'),(5,1,'Machine Learning','AI/ML',1,'2026-10-12 21:47:27','2026-10-12 21:47:27'),(6,1,'SQL','Databases',2,'2026-10-12 21:47:27','2026-10-12 21:47:27');
/*!40000 ALTER TABLE `user_skills` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `roadmaps`
--

LOCK TABLES `roadmaps` WRITE;
/*!40000 ALTER TABLE `roadmaps` DISABLE KEYS */;
INSERT INTO `roadmaps` (`id`, `user_id`, `role_id`, `title`, `status`, `created_at`, `updated_at`) VALUES (1,1,2,'AI/ML Engineer Roadmap','active','2026-10-12 21:47:40','2026-10-12 21:47:40');
/*!40000 ALTER TABLE `roadmaps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `roadmap_items`
--

LOCK TABLES `roadmap_items` WRITE;
/*!40000 ALTER TABLE `roadmap_items` DISABLE KEYS */;
INSERT INTO `roadmap_items` (`id`, `roadmap_id`, `title`, `item_type`, `skill_name`, `description`, `priority`, `estimated_hours`, `status`, `order_index`, `prerequisite_item_id`, `completed_at`, `created_at`, `updated_at`) VALUES (1,1,'Improve Python','milestone','Python','Close the gap from level 2 to level 4 in Python.','high',24,'completed',0,NULL,'2026-10-12 21:47:53','2026-10-12 21:47:40','2026-10-12 21:47:53'),(2,1,'Improve Statistics','milestone','Statistics','Close the gap from level 1 to level 3 in Statistics.','high',24,'completed',1,NULL,'2026-10-12 21:47:53','2026-10-12 21:47:40','2026-10-12 21:47:53'),(3,1,'Improve Machine Learning','milestone','Machine Learning','Close the gap from level 1 to level 4 in Machine Learning.','high',36,'completed',2,2,'2026-10-12 21:47:53','2026-10-12 21:47:40','2026-10-12 21:47:53'),(4,1,'Improve Data Analysis','milestone','Data Analysis','Close the gap from level 2 to level 3 in Data Analysis.','medium',12,'in_progress',3,1,NULL,'2026-10-12 21:47:40','2026-10-12 21:47:53'),(5,1,'Learn Deep Learning','milestone','Deep Learning','Close the gap from level 0 to level 3 in Deep Learning.','medium',36,'completed',4,3,'2026-10-12 21:59:38','2026-10-12 21:47:40','2026-10-12 21:59:37'),(6,1,'Learn Data Visualization','milestone','Data Visualization','Close the gap from level 0 to level 2 in Data Visualization.','medium',24,'completed',5,NULL,'2026-10-12 21:59:38','2026-10-12 21:47:40','2026-10-12 21:59:37'),(7,1,'Learn Model Deployment','milestone','Model Deployment','Close the gap from level 0 to level 2 in Model Deployment.','medium',24,'todo',6,5,NULL,'2026-10-12 21:47:40','2026-10-12 21:47:40');
/*!40000 ALTER TABLE `roadmap_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `activity_logs`
--

LOCK TABLES `activity_logs` WRITE;
/*!40000 ALTER TABLE `activity_logs` DISABLE KEYS */;
INSERT INTO `activity_logs` (`id`, `user_id`, `activity_type`, `description`, `metadata`, `created_at`) VALUES (1,1,'skill_added','Added skill \"Python\" at level 2.',NULL,'2026-10-12 21:47:27'),(2,1,'skill_added','Added skill \"Mathematics\" at level 3.',NULL,'2026-10-12 21:47:27'),(3,1,'skill_added','Added skill \"Statistics\" at level 1.',NULL,'2026-10-12 21:47:27'),(4,1,'skill_added','Added skill \"Data Analysis\" at level 2.',NULL,'2026-10-12 21:47:27'),(5,1,'skill_added','Added skill \"Machine Learning\" at level 1.',NULL,'2026-10-12 21:47:27'),(6,1,'skill_added','Added skill \"SQL\" at level 2.',NULL,'2026-10-12 21:47:27'),(7,1,'role_selected','Selected a new target career role.',NULL,'2026-10-12 21:47:27'),(8,1,'roadmap_generated','Generated a learning roadmap: \"AI/ML Engineer Roadmap\".',NULL,'2026-10-12 21:47:40'),(9,1,'milestone_completed','Completed \"Improve Python\".',NULL,'2026-10-12 21:47:53'),(10,1,'milestone_completed','Completed \"Improve Statistics\".',NULL,'2026-10-12 21:47:53'),(11,1,'milestone_completed','Completed \"Improve Machine Learning\".',NULL,'2026-10-12 21:47:53'),(18,1,'milestone_completed','Completed \"Learn Deep Learning\".',NULL,'2026-10-12 21:59:37'),(19,1,'milestone_completed','Completed \"Learn Data Visualization\".',NULL,'2026-10-12 21:59:37');
/*!40000 ALTER TABLE `activity_logs` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-13 15:49:23
