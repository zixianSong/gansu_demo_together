-- 行程管理：与 gansu_travel3.sql 中 plans / plan_days / itinerary_items / plan_snapshots / ai_conversations 对齐。
-- 不创建 users 表、不加 fk_plans_user，避免侵入「我的」模块；若已导入完整 SQL，请跳过本迁移，只执行 prisma generate。

CREATE TABLE `plans` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '方案名称',
  `attraction_summary` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '途径景点摘要',
  `plan_status` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'draft' COMMENT '方案态：current|draft|archived',
  `start_date` datetime NULL DEFAULT NULL COMMENT '行程开始日期',
  `end_date` datetime NULL DEFAULT NULL COMMENT '行程结束日期',
  `cities` json NULL COMMENT '途径城市列表',
  `analytics` json NULL COMMENT '行程分析',
  `badges` json NULL COMMENT '徽章列表',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_plan_status`(`user_id` ASC, `plan_status` ASC) USING BTREE,
  INDEX `idx_end_date`(`end_date` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'AI行程方案';

CREATE TABLE `plan_days` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `plan_id` bigint UNSIGNED NOT NULL COMMENT '关联方案id',
  `day_number` int NULL DEFAULT NULL COMMENT '第几天',
  `date` date NULL DEFAULT NULL COMMENT '具体日期',
  `weather` json NULL COMMENT '当日天气',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_plan_id`(`plan_id` ASC) USING BTREE,
  CONSTRAINT `fk_plan_days_plans` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '行程天数';

CREATE TABLE `itinerary_items` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `plan_day_id` bigint UNSIGNED NOT NULL COMMENT '关联每天计划id',
  `sort_order` int NOT NULL DEFAULT 0 COMMENT '排序序号',
  `type` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'attraction|hotel|transport',
  `time_slot` tinyint UNSIGNED NULL DEFAULT NULL COMMENT '模糊时段：0上午 1中午 2下午 3晚上',
  `exact_start_time` datetime NULL DEFAULT NULL COMMENT '精确开始时间',
  `exact_end_time` datetime NULL DEFAULT NULL COMMENT '精确结束时间',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '名称',
  `photo_url` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `latitude` decimal(10, 7) NULL DEFAULT NULL,
  `longitude` decimal(10, 7) NULL DEFAULT NULL,
  `poi_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '可选关联 poi',
  `details` json NULL COMMENT '扩展详情（含 completed / completedAt）',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_plan_day_sort`(`plan_day_id` ASC, `sort_order` ASC) USING BTREE,
  INDEX `idx_item_poi`(`poi_id` ASC) USING BTREE,
  CONSTRAINT `fk_itinerary_plan_days` FOREIGN KEY (`plan_day_id`) REFERENCES `plan_days` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_itinerary_poi` FOREIGN KEY (`poi_id`) REFERENCES `poi` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '行程项目明细';

CREATE TABLE `plan_snapshots` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `plan_id` bigint UNSIGNED NOT NULL,
  `snapshot_data` json NULL COMMENT '完整行程快照',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_plan_snapshots_plan_id`(`plan_id` ASC) USING BTREE,
  CONSTRAINT `fk_plan_snapshots_plans` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '行程历史快照';

CREATE TABLE `ai_conversations` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `plan_id` bigint UNSIGNED NULL DEFAULT NULL,
  `user_input` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `form_data` json NULL,
  `ai_response` json NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_ai_conversations_plan_id`(`plan_id` ASC) USING BTREE,
  CONSTRAINT `fk_ai_conversations_plans` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'AI对话';
