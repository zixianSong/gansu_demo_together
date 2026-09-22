CREATE TABLE IF NOT EXISTS `feedback` (
  `feedback_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint UNSIGNED NOT NULL,
  `type` tinyint UNSIGNED NULL DEFAULT 1,
  `content` text NOT NULL,
  `images` json NULL,
  `contact` varchar(50) NULL DEFAULT NULL,
  `status` tinyint UNSIGNED NOT NULL DEFAULT 0,
  `reply_content` text NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`feedback_id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_feedback_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
