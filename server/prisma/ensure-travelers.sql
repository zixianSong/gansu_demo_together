CREATE TABLE IF NOT EXISTS `travelers` (
  `traveler_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint UNSIGNED NOT NULL,
  `name` varchar(50) NOT NULL,
  `id_type` tinyint UNSIGNED NULL DEFAULT 1,
  `id_number` varchar(100) NOT NULL,
  `phone` varchar(20) NULL DEFAULT NULL,
  `phone_area_code` varchar(10) NULL DEFAULT '+86',
  `is_default` tinyint UNSIGNED NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`traveler_id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_travelers_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
