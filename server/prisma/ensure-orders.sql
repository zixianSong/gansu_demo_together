-- Order-related tables matching gansu_travel3.sql. CREATE IF NOT EXISTS only.
-- FKs only to users/orders (tables that exist). No ticket_product / travelers FKs.

CREATE TABLE IF NOT EXISTS `orders` (
  `order_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_no` varchar(32) NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `product_type` tinyint UNSIGNED NOT NULL,
  `product_id` bigint UNSIGNED NULL DEFAULT NULL,
  `product_name` varchar(255) NOT NULL,
  `product_image` varchar(500) NULL DEFAULT NULL,
  `quantity` int UNSIGNED NULL DEFAULT 1,
  `unit_price` decimal(12, 2) NULL DEFAULT 0.00,
  `total_amount` decimal(12, 2) NOT NULL DEFAULT 0.00,
  `discount_amount` decimal(12, 2) NOT NULL DEFAULT 0.00,
  `pay_amount` decimal(12, 2) NOT NULL DEFAULT 0.00,
  `status` tinyint UNSIGNED NOT NULL DEFAULT 1,
  `pay_time` datetime NULL DEFAULT NULL,
  `travel_date` date NULL DEFAULT NULL,
  `cancel_time` datetime NULL DEFAULT NULL,
  `refund_status` tinyint UNSIGNED NOT NULL DEFAULT 0,
  `snapshot` json NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_id`),
  UNIQUE KEY `uk_order_no` (`order_no`),
  KEY `idx_user_id_status` (`user_id`, `status`),
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `order_travelers` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` bigint UNSIGNED NOT NULL,
  `traveler_id` bigint UNSIGNED NULL DEFAULT NULL,
  `name` varchar(50) NOT NULL,
  `id_type` tinyint UNSIGNED NULL DEFAULT 1,
  `id_number` varchar(100) NOT NULL,
  `phone` varchar(20) NULL DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`),
  CONSTRAINT `fk_ot_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `order_vouchers` (
  `voucher_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` bigint UNSIGNED NOT NULL,
  `qrcode_data` varchar(255) NULL DEFAULT NULL,
  `qrcode_image` varchar(500) NULL DEFAULT NULL,
  `status` tinyint UNSIGNED NOT NULL DEFAULT 1,
  `use_time` datetime NULL DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`voucher_id`),
  KEY `idx_order_id` (`order_id`),
  CONSTRAINT `fk_voucher_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `payment` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `payment_no` varchar(64) NOT NULL,
  `order_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `amount` decimal(12, 2) NOT NULL,
  `pay_method` varchar(32) NULL DEFAULT 'wxpay',
  `wx_transaction_id` varchar(64) NULL DEFAULT NULL,
  `status` tinyint UNSIGNED NOT NULL DEFAULT 1,
  `paid_at` datetime NULL DEFAULT NULL,
  `raw_notify` json NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_payment_no` (`payment_no`),
  KEY `idx_payment_order` (`order_id`),
  CONSTRAINT `fk_payment_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `refund_record` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` bigint UNSIGNED NOT NULL,
  `payment_id` bigint UNSIGNED NULL DEFAULT NULL,
  `item_id` bigint UNSIGNED NULL DEFAULT NULL,
  `refund_amount` decimal(12, 2) NOT NULL,
  `reason` varchar(255) NULL DEFAULT NULL,
  `status` tinyint UNSIGNED NOT NULL DEFAULT 1,
  `apply_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `audit_time` datetime NULL DEFAULT NULL,
  `auditor_id` bigint UNSIGNED NULL DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order` (`order_id`),
  CONSTRAINT `fk_rr_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `order_status_logs` (
  `log_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` bigint UNSIGNED NOT NULL,
  `from_status` tinyint UNSIGNED NULL DEFAULT 0,
  `to_status` tinyint UNSIGNED NOT NULL,
  `operator` varchar(50) NULL DEFAULT 'system',
  `remark` varchar(255) NULL DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`),
  KEY `idx_order_id` (`order_id`),
  CONSTRAINT `fk_log_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
