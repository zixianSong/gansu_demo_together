/*
 Navicat Premium Dump SQL

 Source Server         : rrq
 Source Server Type    : MySQL
 Source Server Version : 260700 (26.7.0)
 Source Host           : localhost:3306
 Source Schema         : gansu_travel3

 Target Server Type    : MySQL
 Target Server Version : 260700 (26.7.0)
 File Encoding         : 65001

 Date: 08/09/2026 20:38:22
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for ai_conversations
-- ----------------------------
DROP TABLE IF EXISTS `ai_conversations`;
CREATE TABLE `ai_conversations`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `plan_id` bigint UNSIGNED NULL DEFAULT NULL,
  `user_input` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `form_data` json NULL,
  `ai_response` json NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_plan_id`(`plan_id` ASC) USING BTREE,
  CONSTRAINT `fk_ai_conversations_plans` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'AI对话' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for article
-- ----------------------------
DROP TABLE IF EXISTS `article`;
CREATE TABLE `article`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `cover_url` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `content_type` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'guide|travelogue|destination_intro|food|route_story|booking_promo',
  `content_html` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '正文',
  `wechat_url` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `wechat_msg_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '微信公众号消息ID',
  `tags_json` json NULL,
  `price_label` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `booking_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `author` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `published_at` datetime NULL DEFAULT NULL,
  `status` tinyint UNSIGNED NOT NULL DEFAULT 1 COMMENT '1上架 0下架',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_article_wechat_msg`(`wechat_msg_id` ASC) USING BTREE,
  INDEX `idx_article_type_status`(`content_type` ASC, `status` ASC) USING BTREE,
  INDEX `idx_article_published`(`status` ASC, `published_at` ASC) USING BTREE,
  INDEX `idx_article_title`(`title` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '种草文章/攻略' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for article_poi
-- ----------------------------
DROP TABLE IF EXISTS `article_poi`;
CREATE TABLE `article_poi`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `article_id` bigint UNSIGNED NOT NULL,
  `poi_id` bigint UNSIGNED NOT NULL,
  `sort_order` int NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_article_poi`(`article_id` ASC, `poi_id` ASC) USING BTREE,
  INDEX `idx_article_poi_poi`(`poi_id` ASC) USING BTREE,
  CONSTRAINT `fk_article_poi_article` FOREIGN KEY (`article_id`) REFERENCES `article` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_article_poi_poi` FOREIGN KEY (`poi_id`) REFERENCES `poi` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '文章提及地点' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for article_route
-- ----------------------------
DROP TABLE IF EXISTS `article_route`;
CREATE TABLE `article_route`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `article_id` bigint UNSIGNED NOT NULL,
  `route_id` bigint UNSIGNED NOT NULL COMMENT 'route_template.id',
  `sort_order` int NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_article_route`(`article_id` ASC, `route_id` ASC) USING BTREE,
  INDEX `idx_article_route_route`(`route_id` ASC) USING BTREE,
  CONSTRAINT `fk_article_route_article` FOREIGN KEY (`article_id`) REFERENCES `article` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_article_route_route` FOREIGN KEY (`route_id`) REFERENCES `route_template` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '文章提及线路' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for banner
-- ----------------------------
DROP TABLE IF EXISTS `banner`;
CREATE TABLE `banner`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `image_url` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `link_type` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'none|article|destination|route|poi|mini_page|webview',
  `link_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '对应实体 id',
  `link_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '小程序路径或 H5',
  `sort_order` int NOT NULL DEFAULT 0,
  `start_at` datetime NULL DEFAULT NULL,
  `end_at` datetime NULL DEFAULT NULL,
  `status` tinyint UNSIGNED NOT NULL DEFAULT 1 COMMENT '1展示 0隐藏',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_banner_status_sort`(`status` ASC, `sort_order` ASC) USING BTREE,
  INDEX `idx_banner_window`(`start_at` ASC, `end_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '首页轮播' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for biz_carpool_schedule
-- ----------------------------
DROP TABLE IF EXISTS `biz_carpool_schedule`;
CREATE TABLE `biz_carpool_schedule`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `schedule_no` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `driver_id` bigint UNSIGNED NOT NULL,
  `vehicle_id` bigint UNSIGNED NOT NULL,
  `route_id` bigint UNSIGNED NOT NULL,
  `depart_time` datetime NOT NULL,
  `total_seats` int NOT NULL,
  `sold_seats` int NULL DEFAULT 0,
  `price_per_seat` decimal(10, 2) NOT NULL,
  `gather_address` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `service_tags` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `schedule_status` tinyint NULL DEFAULT 1 COMMENT '1待成团 2已成团 3行程中 4已结束 5已下架',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_schedule_no`(`schedule_no` ASC) USING BTREE,
  INDEX `idx_driver_id`(`driver_id` ASC) USING BTREE,
  INDEX `idx_route_id`(`route_id` ASC) USING BTREE,
  INDEX `idx_depart_time`(`depart_time` ASC) USING BTREE,
  INDEX `fk_schedule_vehicle`(`vehicle_id` ASC) USING BTREE,
  CONSTRAINT `fk_schedule_driver` FOREIGN KEY (`driver_id`) REFERENCES `biz_driver` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_schedule_route` FOREIGN KEY (`route_id`) REFERENCES `biz_tour_route` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_schedule_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `biz_vehicle` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '拼车班次表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for biz_driver
-- ----------------------------
DROP TABLE IF EXISTS `biz_driver`;
CREATE TABLE `biz_driver`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '司机ID（司机端账号主体）',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '手机号（司机端登录）',
  `real_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `id_card` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `driver_license` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `star_score` decimal(2, 1) NULL DEFAULT 5.0,
  `total_orders` int NULL DEFAULT 0,
  `balance` decimal(10, 2) NULL DEFAULT 0.00,
  `auth_status` tinyint NULL DEFAULT 0 COMMENT '0未认证 1已认证',
  `listen_status` tinyint NULL DEFAULT 1 COMMENT '1听单中 0已暂停',
  `service_city` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `password` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '可选；司机端优先手机验证码，后台可备用',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_phone`(`phone` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '司机表（独立小程序账号，不强制绑 users）' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for biz_driver_quote
-- ----------------------------
DROP TABLE IF EXISTS `biz_driver_quote`;
CREATE TABLE `biz_driver_quote`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `charter_ext_id` bigint UNSIGNED NOT NULL COMMENT 'order_charter_ext.id',
  `driver_id` bigint UNSIGNED NOT NULL,
  `quote_price` decimal(10, 2) NOT NULL,
  `quote_status` tinyint NULL DEFAULT 1 COMMENT '1待确认 2已选中 3已失效',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_charter_ext`(`charter_ext_id` ASC) USING BTREE,
  INDEX `idx_driver_id`(`driver_id` ASC) USING BTREE,
  CONSTRAINT `fk_quote_charter_ext` FOREIGN KEY (`charter_ext_id`) REFERENCES `order_charter_ext` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_quote_driver` FOREIGN KEY (`driver_id`) REFERENCES `biz_driver` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '司机报价记录' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for biz_driver_subscribe
-- ----------------------------
DROP TABLE IF EXISTS `biz_driver_subscribe`;
CREATE TABLE `biz_driver_subscribe`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `driver_id` bigint UNSIGNED NOT NULL,
  `subscribe_type` tinyint NOT NULL COMMENT '1城市 2线路',
  `city_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `route_id` bigint UNSIGNED NULL DEFAULT NULL,
  `effective_time` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `is_enable` tinyint NULL DEFAULT 1,
  `match_count` int NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_driver_id`(`driver_id` ASC) USING BTREE,
  INDEX `fk_subscribe_route`(`route_id` ASC) USING BTREE,
  CONSTRAINT `fk_subscribe_driver` FOREIGN KEY (`driver_id`) REFERENCES `biz_driver` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_subscribe_route` FOREIGN KEY (`route_id`) REFERENCES `biz_tour_route` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '司机订阅规则' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for biz_driver_wallet_log
-- ----------------------------
DROP TABLE IF EXISTS `biz_driver_wallet_log`;
CREATE TABLE `biz_driver_wallet_log`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `driver_id` bigint UNSIGNED NOT NULL,
  `log_type` tinyint NOT NULL COMMENT '1订单收入 2提现 3退款 4平台补贴',
  `amount` decimal(10, 2) NOT NULL,
  `order_no` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '关联统一订单号 orders.order_no',
  `balance_after` decimal(10, 2) NOT NULL,
  `remark` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_driver_id`(`driver_id` ASC) USING BTREE,
  INDEX `idx_create_time`(`created_at` ASC) USING BTREE,
  CONSTRAINT `fk_walletlog_driver` FOREIGN KEY (`driver_id`) REFERENCES `biz_driver` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '司机钱包流水' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for biz_hour_package
-- ----------------------------
DROP TABLE IF EXISTS `biz_hour_package`;
CREATE TABLE `biz_hour_package`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `package_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `duration_hour` int NOT NULL,
  `limit_km` int NULL DEFAULT NULL,
  `reference_price` decimal(10, 2) NULL DEFAULT NULL,
  `package_desc` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `status` tinyint UNSIGNED NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '小时包车套餐' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for biz_order_service_rel
-- ----------------------------
DROP TABLE IF EXISTS `biz_order_service_rel`;
CREATE TABLE `biz_order_service_rel`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `charter_ext_id` bigint UNSIGNED NOT NULL COMMENT 'order_charter_ext.id',
  `service_id` bigint UNSIGNED NOT NULL,
  `service_num` int NULL DEFAULT 1,
  `service_price` decimal(10, 2) NOT NULL COMMENT '单价快照',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_charter_ext`(`charter_ext_id` ASC) USING BTREE,
  INDEX `idx_service_id`(`service_id` ASC) USING BTREE,
  CONSTRAINT `fk_osr_charter_ext` FOREIGN KEY (`charter_ext_id`) REFERENCES `order_charter_ext` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_osr_service` FOREIGN KEY (`service_id`) REFERENCES `sys_additional_service` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '包车单-附加服务' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for biz_passenger
-- ----------------------------
DROP TABLE IF EXISTS `biz_passenger`;
CREATE TABLE `biz_passenger`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '乘客资料ID',
  `user_id` bigint UNSIGNED NOT NULL COMMENT '必须绑定 users（禁止游客下单）',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '手机号',
  `nickname` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `real_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '真实姓名（脱敏展示）',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_user_id`(`user_id` ASC) USING BTREE,
  UNIQUE INDEX `uk_phone`(`phone` ASC) USING BTREE,
  CONSTRAINT `fk_passenger_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '包车/拼车乘客资料（1用户1乘客）' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for biz_tour_route
-- ----------------------------
DROP TABLE IF EXISTS `biz_tour_route`;
CREATE TABLE `biz_tour_route`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `route_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_city` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `end_city` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `estimated_duration` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `reference_price` decimal(10, 2) NULL DEFAULT NULL,
  `route_desc` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `cover_img` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `status` tinyint UNSIGNED NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '包车旅游线路' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for biz_vehicle
-- ----------------------------
DROP TABLE IF EXISTS `biz_vehicle`;
CREATE TABLE `biz_vehicle`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `driver_id` bigint UNSIGNED NOT NULL,
  `car_model_id` bigint UNSIGNED NOT NULL,
  `plate_number` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `vehicle_img` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `is_main` tinyint NULL DEFAULT 1,
  `check_status` tinyint NULL DEFAULT 0 COMMENT '0待审核 1已通过',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_driver_id`(`driver_id` ASC) USING BTREE,
  INDEX `idx_car_model_id`(`car_model_id` ASC) USING BTREE,
  CONSTRAINT `fk_vehicle_carmodel` FOREIGN KEY (`car_model_id`) REFERENCES `sys_car_model` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_vehicle_driver` FOREIGN KEY (`driver_id`) REFERENCES `biz_driver` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '车辆表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for check_in_record
-- ----------------------------
DROP TABLE IF EXISTS `check_in_record`;
CREATE TABLE `check_in_record`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `voucher_id` bigint UNSIGNED NOT NULL,
  `operator_id` bigint UNSIGNED NULL DEFAULT NULL,
  `check_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `check_method` tinyint NOT NULL DEFAULT 1 COMMENT '1扫码 2手动输入',
  `device_info` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_voucher`(`voucher_id` ASC) USING BTREE,
  INDEX `idx_check_time`(`check_time` ASC) USING BTREE,
  CONSTRAINT `fk_cr_voucher` FOREIGN KEY (`voucher_id`) REFERENCES `ticket_voucher` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '核销记录' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for closure_date
-- ----------------------------
DROP TABLE IF EXISTS `closure_date`;
CREATE TABLE `closure_date`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `spot_id` bigint UNSIGNED NOT NULL COMMENT 'scenic_spot.id',
  `closure_date` date NOT NULL,
  `reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_by` bigint UNSIGNED NULL DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_spot_date`(`spot_id` ASC, `closure_date` ASC) USING BTREE,
  CONSTRAINT `fk_cd_spot` FOREIGN KEY (`spot_id`) REFERENCES `scenic_spot` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '闭园日期' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for daily_inventory
-- ----------------------------
DROP TABLE IF EXISTS `daily_inventory`;
CREATE TABLE `daily_inventory`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` bigint UNSIGNED NOT NULL,
  `sale_date` date NOT NULL,
  `total_limit` int NULL DEFAULT NULL,
  `sold_count` int NOT NULL DEFAULT 0,
  `is_closed` tinyint NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_product_date`(`product_id` ASC, `sale_date` ASC) USING BTREE,
  INDEX `idx_date`(`sale_date` ASC) USING BTREE,
  CONSTRAINT `fk_di_product` FOREIGN KEY (`product_id`) REFERENCES `ticket_product` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '日库存日历' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for destination
-- ----------------------------
DROP TABLE IF EXISTS `destination`;
CREATE TABLE `destination`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '如兰州',
  `cover_url` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `intro` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '简介',
  `transport_guide` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '出行交通指南 Markdown/HTML',
  `status` tinyint UNSIGNED NOT NULL DEFAULT 1 COMMENT '1上架 0下架',
  `sort_weight` int NOT NULL DEFAULT 0 COMMENT '排序权重，越小越靠前',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_destination_status_sort`(`status` ASC, `sort_weight` ASC) USING BTREE,
  INDEX `idx_destination_name`(`name` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '热门目的地' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for favorites
-- ----------------------------
DROP TABLE IF EXISTS `favorites`;
CREATE TABLE `favorites`  (
  `favorite_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '收藏ID',
  `user_id` bigint UNSIGNED NOT NULL COMMENT '用户ID',
  `target_type` tinyint UNSIGNED NOT NULL COMMENT '1点位poi 2精品线路routes 3攻略guides 4文章article 5线路模板route_template',
  `target_id` bigint UNSIGNED NOT NULL COMMENT '目标ID（逻辑外键）',
  `target_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '目标名称（冗余）',
  `target_image` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '目标图片（冗余）',
  `extra_info` json NULL COMMENT '扩展信息',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime NULL DEFAULT NULL COMMENT '取消收藏软删（也可物理删）',
  PRIMARY KEY (`favorite_id`) USING BTREE,
  UNIQUE INDEX `uk_user_target`(`user_id` ASC, `target_type` ASC, `target_id` ASC) USING BTREE,
  INDEX `idx_target`(`target_type` ASC, `target_id` ASC) USING BTREE,
  CONSTRAINT `fk_favorites_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '收藏表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for feedback
-- ----------------------------
DROP TABLE IF EXISTS `feedback`;
CREATE TABLE `feedback`  (
  `feedback_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '反馈ID',
  `user_id` bigint UNSIGNED NOT NULL COMMENT '用户ID',
  `type` tinyint UNSIGNED NULL DEFAULT 1 COMMENT '类型：1反馈 2投诉 3咨询',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '内容',
  `images` json NULL COMMENT '图片数组',
  `contact` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '联系方式',
  `status` tinyint UNSIGNED NOT NULL DEFAULT 0 COMMENT '处理状态：0待处理 1处理中 2已解决',
  `reply_content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '回复内容',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`feedback_id`) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE,
  CONSTRAINT `fk_feedback_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '反馈投诉表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for foods
-- ----------------------------
DROP TABLE IF EXISTS `foods`;
CREATE TABLE `foods`  (
  `food_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '美食ID（过渡）',
  `poi_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '迁移后对应 poi.id',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '名称',
  `rating` decimal(2, 1) NULL DEFAULT 5.0 COMMENT '评分',
  `avg_cost` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '人均消费',
  `location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '位置',
  `image` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '图片',
  `status` tinyint UNSIGNED NOT NULL DEFAULT 1 COMMENT '1上架 0下架',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`food_id`) USING BTREE,
  INDEX `idx_foods_poi`(`poi_id` ASC) USING BTREE,
  CONSTRAINT `fk_foods_poi` FOREIGN KEY (`poi_id`) REFERENCES `poi` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '【待废弃】美食表，数据应迁入 poi' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for footprints
-- ----------------------------
DROP TABLE IF EXISTS `footprints`;
CREATE TABLE `footprints`  (
  `footprint_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '足迹ID',
  `user_id` bigint UNSIGNED NOT NULL COMMENT '用户ID',
  `poi_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '点位ID，指向 poi.id（原 spot_id 已废弃）',
  `poi_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '点位/场所名称快照',
  `poi_image` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '缩略图快照',
  `poi_grade` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '景区等级快照',
  `poi_category` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '分类快照',
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '详细地址',
  `city_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '城市名称',
  `visit_date` date NOT NULL COMMENT '到访/浏览日期',
  `visit_time` time NULL DEFAULT NULL COMMENT '到访/浏览时间',
  `type` tinyint UNSIGNED NULL DEFAULT 1 COMMENT '类型：1浏览 2到访',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`footprint_id`) USING BTREE,
  INDEX `idx_user_id_date`(`user_id` ASC, `visit_date` ASC) USING BTREE,
  INDEX `idx_poi_id`(`poi_id` ASC) USING BTREE,
  INDEX `idx_city`(`city_name` ASC) USING BTREE,
  CONSTRAINT `fk_footprints_poi` FOREIGN KEY (`poi_id`) REFERENCES `poi` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_footprints_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '我的足迹表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for guides
-- ----------------------------
DROP TABLE IF EXISTS `guides`;
CREATE TABLE `guides`  (
  `guide_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '攻略ID',
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '标题',
  `author_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '作者昵称',
  `author_avatar` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '作者头像',
  `cover_image` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '封面图',
  `read_count` int UNSIGNED NULL DEFAULT 0 COMMENT '阅读量',
  `like_count` int UNSIGNED NULL DEFAULT 0 COMMENT '点赞数',
  `publish_time` datetime NULL DEFAULT NULL COMMENT '发布时间',
  `status` tinyint UNSIGNED NOT NULL DEFAULT 1 COMMENT '1显示 0下架',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`guide_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '攻略资讯表（可与 article 长期合并）' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for home_hot_destination
-- ----------------------------
DROP TABLE IF EXISTS `home_hot_destination`;
CREATE TABLE `home_hot_destination`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `destination_id` bigint UNSIGNED NOT NULL,
  `cover_override` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT 0,
  `status` tinyint UNSIGNED NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_home_hot_dest`(`destination_id` ASC) USING BTREE,
  INDEX `idx_home_hot_dest_sort`(`status` ASC, `sort_order` ASC) USING BTREE,
  CONSTRAINT `fk_home_hot_destination` FOREIGN KEY (`destination_id`) REFERENCES `destination` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '首页热门目的地配置' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for home_hot_route
-- ----------------------------
DROP TABLE IF EXISTS `home_hot_route`;
CREATE TABLE `home_hot_route`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `route_id` bigint UNSIGNED NOT NULL COMMENT 'route_template.id',
  `cover_override` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT 0,
  `status` tinyint UNSIGNED NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_home_hot_route`(`route_id` ASC) USING BTREE,
  INDEX `idx_home_hot_route_sort`(`status` ASC, `sort_order` ASC) USING BTREE,
  CONSTRAINT `fk_home_hot_route` FOREIGN KEY (`route_id`) REFERENCES `route_template` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '首页热门线路配置' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for itinerary_items
-- ----------------------------
DROP TABLE IF EXISTS `itinerary_items`;
CREATE TABLE `itinerary_items`  (
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
  `details` json NULL COMMENT '扩展详情',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_plan_day_sort`(`plan_day_id` ASC, `sort_order` ASC) USING BTREE,
  INDEX `idx_item_poi`(`poi_id` ASC) USING BTREE,
  CONSTRAINT `fk_itinerary_plan_days` FOREIGN KEY (`plan_day_id`) REFERENCES `plan_days` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_itinerary_poi` FOREIGN KEY (`poi_id`) REFERENCES `poi` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '行程项目明细' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for merchant_account
-- ----------------------------
DROP TABLE IF EXISTS `merchant_account`;
CREATE TABLE `merchant_account`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '登录手机号',
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '密码',
  `account_type` tinyint NOT NULL DEFAULT 1 COMMENT '1单景区 2多景区代理',
  `current_spot_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '当前选中景区 scenic_spot.id',
  `status` tinyint UNSIGNED NOT NULL DEFAULT 1 COMMENT '1正常 2冻结',
  `last_login_at` datetime NULL DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_phone`(`phone` ASC) USING BTREE,
  INDEX `idx_current_spot`(`current_spot_id` ASC) USING BTREE,
  CONSTRAINT `fk_ma_spot` FOREIGN KEY (`current_spot_id`) REFERENCES `scenic_spot` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '商家账号' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for merchant_profile
-- ----------------------------
DROP TABLE IF EXISTS `merchant_profile`;
CREATE TABLE `merchant_profile`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `merchant_id` bigint UNSIGNED NOT NULL,
  `contact_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `contact_phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `avatar_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `settle_time` datetime NULL DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_merchant`(`merchant_id` ASC) USING BTREE,
  CONSTRAINT `fk_mp_merchant` FOREIGN KEY (`merchant_id`) REFERENCES `merchant_account` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '商家资料' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for merchant_spot_relation
-- ----------------------------
DROP TABLE IF EXISTS `merchant_spot_relation`;
CREATE TABLE `merchant_spot_relation`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `merchant_id` bigint UNSIGNED NOT NULL,
  `spot_id` bigint UNSIGNED NOT NULL COMMENT 'scenic_spot.id',
  `role` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'admin',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_merchant_spot`(`merchant_id` ASC, `spot_id` ASC) USING BTREE,
  INDEX `idx_spot`(`spot_id` ASC) USING BTREE,
  CONSTRAINT `fk_msr_merchant` FOREIGN KEY (`merchant_id`) REFERENCES `merchant_account` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_msr_spot` FOREIGN KEY (`spot_id`) REFERENCES `scenic_spot` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '商家景区关联' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for notification
-- ----------------------------
DROP TABLE IF EXISTS `notification`;
CREATE TABLE `notification`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `merchant_id` bigint UNSIGNED NOT NULL COMMENT '接收商家',
  `msg_type` tinyint NOT NULL COMMENT '1新订单 2审核结果 3库存预警 4平台公告',
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` tinyint NOT NULL DEFAULT 0,
  `related_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_merchant_read`(`merchant_id` ASC, `is_read` ASC, `created_at` ASC) USING BTREE,
  CONSTRAINT `fk_nt_merchant` FOREIGN KEY (`merchant_id`) REFERENCES `merchant_account` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '商家消息通知' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for order_carpool_ext
-- ----------------------------
DROP TABLE IF EXISTS `order_carpool_ext`;
CREATE TABLE `order_carpool_ext`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` bigint UNSIGNED NOT NULL COMMENT 'orders.order_id，一对一',
  `schedule_id` bigint UNSIGNED NOT NULL,
  `passenger_id` bigint UNSIGNED NOT NULL,
  `seat_count` int NULL DEFAULT 1,
  `seat_preference` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `passenger_remark` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `domain_status` tinyint NULL DEFAULT 1 COMMENT '细态：1待支付 2已报名 3已取消 4已完成',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_carpool_order`(`order_id` ASC) USING BTREE,
  INDEX `idx_schedule_id`(`schedule_id` ASC) USING BTREE,
  INDEX `idx_passenger_id`(`passenger_id` ASC) USING BTREE,
  CONSTRAINT `fk_ocpe_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_ocpe_passenger` FOREIGN KEY (`passenger_id`) REFERENCES `biz_passenger` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_ocpe_schedule` FOREIGN KEY (`schedule_id`) REFERENCES `biz_carpool_schedule` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '拼车订单扩展（原 biz_carpool_order）' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for order_charter_ext
-- ----------------------------
DROP TABLE IF EXISTS `order_charter_ext`;
CREATE TABLE `order_charter_ext`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` bigint UNSIGNED NOT NULL COMMENT 'orders.order_id，一对一',
  `order_type` tinyint NOT NULL COMMENT '1线路整车 2小时包车',
  `passenger_id` bigint UNSIGNED NOT NULL,
  `driver_id` bigint UNSIGNED NULL DEFAULT NULL,
  `vehicle_id` bigint UNSIGNED NULL DEFAULT NULL,
  `route_id` bigint UNSIGNED NULL DEFAULT NULL,
  `package_id` bigint UNSIGNED NULL DEFAULT NULL,
  `depart_time` datetime NOT NULL,
  `pickup_address` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `pickup_lng` decimal(10, 6) NULL DEFAULT NULL,
  `pickup_lat` decimal(10, 6) NULL DEFAULT NULL,
  `people_count` int NULL DEFAULT 1,
  `luggage_count` int NULL DEFAULT 0,
  `passenger_price` decimal(10, 2) NOT NULL COMMENT '乘客出价',
  `final_price` decimal(10, 2) NULL DEFAULT NULL COMMENT '成交价（可与 orders.pay_amount 对齐）',
  `service_fee` decimal(10, 2) NULL DEFAULT NULL,
  `driver_income` decimal(10, 2) NULL DEFAULT NULL,
  `actual_duration` decimal(5, 1) NULL DEFAULT NULL,
  `actual_km` decimal(8, 1) NULL DEFAULT NULL,
  `order_remark` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `domain_status` tinyint NULL DEFAULT 1 COMMENT '细态：1待处理 2已接单待出行 3行程中 4已完成 5已取消',
  `cancel_type` tinyint NULL DEFAULT NULL COMMENT '1乘客 2司机 3系统',
  `cancel_reason` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `start_time` datetime NULL DEFAULT NULL COMMENT '行程开始',
  `end_time` datetime NULL DEFAULT NULL COMMENT '行程结束',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_charter_order`(`order_id` ASC) USING BTREE,
  INDEX `idx_passenger_id`(`passenger_id` ASC) USING BTREE,
  INDEX `idx_driver_id`(`driver_id` ASC) USING BTREE,
  INDEX `idx_route_id`(`route_id` ASC) USING BTREE,
  INDEX `idx_package_id`(`package_id` ASC) USING BTREE,
  INDEX `idx_domain_status`(`domain_status` ASC) USING BTREE,
  INDEX `idx_depart_time`(`depart_time` ASC) USING BTREE,
  INDEX `fk_charter_vehicle`(`vehicle_id` ASC) USING BTREE,
  CONSTRAINT `fk_oce_driver` FOREIGN KEY (`driver_id`) REFERENCES `biz_driver` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_oce_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_oce_package` FOREIGN KEY (`package_id`) REFERENCES `biz_hour_package` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_oce_passenger` FOREIGN KEY (`passenger_id`) REFERENCES `biz_passenger` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_oce_route` FOREIGN KEY (`route_id`) REFERENCES `biz_tour_route` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_oce_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `biz_vehicle` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '包车订单扩展（原 biz_charter_order）' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for order_item
-- ----------------------------
DROP TABLE IF EXISTS `order_item`;
CREATE TABLE `order_item`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` bigint UNSIGNED NOT NULL COMMENT 'orders.order_id',
  `product_id` bigint UNSIGNED NOT NULL COMMENT 'ticket_product.id',
  `ticket_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '票种名快照',
  `unit_price` decimal(10, 2) NOT NULL,
  `quantity` int NOT NULL DEFAULT 1,
  `play_date` date NOT NULL,
  `status` tinyint UNSIGNED NOT NULL DEFAULT 1 COMMENT '1待使用 2已使用 3已退款',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_order`(`order_id` ASC) USING BTREE,
  INDEX `idx_product`(`product_id` ASC) USING BTREE,
  CONSTRAINT `fk_oi_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_oi_product` FOREIGN KEY (`product_id`) REFERENCES `ticket_product` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '门票订单明细' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for order_status_logs
-- ----------------------------
DROP TABLE IF EXISTS `order_status_logs`;
CREATE TABLE `order_status_logs`  (
  `log_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` bigint UNSIGNED NOT NULL COMMENT 'orders.order_id',
  `from_status` tinyint UNSIGNED NULL DEFAULT 0 COMMENT '原主状态',
  `to_status` tinyint UNSIGNED NOT NULL COMMENT '新主状态',
  `operator` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'system' COMMENT 'system/user/admin/driver/merchant',
  `remark` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`) USING BTREE,
  INDEX `idx_order_id`(`order_id` ASC) USING BTREE,
  CONSTRAINT `fk_log_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '订单主状态日志' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for order_ticket_ext
-- ----------------------------
DROP TABLE IF EXISTS `order_ticket_ext`;
CREATE TABLE `order_ticket_ext`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` bigint UNSIGNED NOT NULL COMMENT 'orders.order_id，一对一',
  `spot_id` bigint UNSIGNED NOT NULL COMMENT 'scenic_spot.id',
  `merchant_id` bigint UNSIGNED NOT NULL COMMENT '接单/归属商家',
  `visitor_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '游客姓名快照',
  `visitor_phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `visitor_id_card` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '身份证脱敏快照',
  `booking_date` date NOT NULL COMMENT '游玩日期',
  `domain_status` tinyint UNSIGNED NOT NULL DEFAULT 1 COMMENT '票务细态：1待使用 2已使用 3已过期（主态仍看 orders.status）',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_ticket_order`(`order_id` ASC) USING BTREE,
  INDEX `idx_spot_status`(`spot_id` ASC, `domain_status` ASC) USING BTREE,
  INDEX `idx_visitor_phone`(`visitor_phone` ASC) USING BTREE,
  INDEX `fk_ote_merchant`(`merchant_id` ASC) USING BTREE,
  CONSTRAINT `fk_ote_merchant` FOREIGN KEY (`merchant_id`) REFERENCES `merchant_account` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_ote_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_ote_spot` FOREIGN KEY (`spot_id`) REFERENCES `scenic_spot` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '门票订单扩展（原 ticket_order）' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for order_travelers
-- ----------------------------
DROP TABLE IF EXISTS `order_travelers`;
CREATE TABLE `order_travelers`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` bigint UNSIGNED NOT NULL COMMENT 'orders.order_id',
  `traveler_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '常用出行人ID（可选）',
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '姓名快照',
  `id_type` tinyint UNSIGNED NULL DEFAULT 1,
  `id_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '证件号快照（加密）',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_order_id`(`order_id` ASC) USING BTREE,
  INDEX `idx_traveler_id`(`traveler_id` ASC) USING BTREE,
  CONSTRAINT `fk_ot_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_ot_traveler` FOREIGN KEY (`traveler_id`) REFERENCES `travelers` (`traveler_id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '订单出行人快照' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for order_vouchers
-- ----------------------------
DROP TABLE IF EXISTS `order_vouchers`;
CREATE TABLE `order_vouchers`  (
  `voucher_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '通用凭证（线路等）',
  `order_id` bigint UNSIGNED NOT NULL,
  `qrcode_data` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `qrcode_image` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `status` tinyint UNSIGNED NOT NULL DEFAULT 1 COMMENT '1未使用 2已核销 3已过期',
  `use_time` datetime NULL DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`voucher_id`) USING BTREE,
  INDEX `idx_order_id`(`order_id` ASC) USING BTREE,
  CONSTRAINT `fk_voucher_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '订单通用凭证明细' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for orders
-- ----------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders`  (
  `order_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '订单ID（全局主键）',
  `order_no` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '全局唯一订单号',
  `user_id` bigint UNSIGNED NOT NULL COMMENT '下单用户（禁止游客无账号下单）',
  `product_type` tinyint UNSIGNED NOT NULL COMMENT '1门票 2线路 3美食 4其他 5包车 6拼车',
  `product_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '商品ID：票种/线路等；包车拼车可空，细节见扩展表',
  `product_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '商品/服务名称快照',
  `product_image` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '封面快照',
  `quantity` int UNSIGNED NULL DEFAULT 1 COMMENT '购买份数/座位数等',
  `unit_price` decimal(12, 2) NULL DEFAULT 0.00 COMMENT '单价快照',
  `total_amount` decimal(12, 2) NOT NULL DEFAULT 0.00 COMMENT '应付总额',
  `discount_amount` decimal(12, 2) NOT NULL DEFAULT 0.00 COMMENT '优惠减免',
  `pay_amount` decimal(12, 2) NOT NULL DEFAULT 0.00 COMMENT '实付金额',
  `status` tinyint UNSIGNED NOT NULL DEFAULT 1 COMMENT '1待支付 2已支付待履约 3履约中 4待评价 5已完成 6退款/售后 7已取消',
  `pay_time` datetime NULL DEFAULT NULL COMMENT '支付成功时间',
  `travel_date` date NULL DEFAULT NULL COMMENT '出行/使用日期',
  `cancel_time` datetime NULL DEFAULT NULL COMMENT '取消时间',
  `refund_status` tinyint UNSIGNED NOT NULL DEFAULT 0 COMMENT '0无 1退款中 2已退款 3部分退款',
  `snapshot` json NULL COMMENT '下单快照（费用明细、规则等）',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_id`) USING BTREE,
  UNIQUE INDEX `uk_order_no`(`order_no` ASC) USING BTREE,
  INDEX `idx_user_id_status`(`user_id` ASC, `status` ASC) USING BTREE,
  INDEX `idx_product`(`product_type` ASC, `product_id` ASC) USING BTREE,
  INDEX `idx_create_time`(`created_at` ASC) USING BTREE,
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '订单主表（唯一列表/支付/评价入口）' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for payment
-- ----------------------------
DROP TABLE IF EXISTS `payment`;
CREATE TABLE `payment`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `payment_no` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '支付单号（商户侧）',
  `order_id` bigint UNSIGNED NOT NULL COMMENT '关联 orders.order_id',
  `user_id` bigint UNSIGNED NOT NULL,
  `amount` decimal(12, 2) NOT NULL COMMENT '支付金额',
  `pay_method` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'wxpay' COMMENT 'wxpay 等',
  `wx_transaction_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '微信支付交易号',
  `status` tinyint UNSIGNED NOT NULL DEFAULT 1 COMMENT '1待支付 2成功 3失败 4已关闭 5已退款',
  `paid_at` datetime NULL DEFAULT NULL,
  `raw_notify` json NULL COMMENT '回调原文（可选）',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_payment_no`(`payment_no` ASC) USING BTREE,
  INDEX `idx_payment_order`(`order_id` ASC) USING BTREE,
  INDEX `idx_payment_user`(`user_id` ASC) USING BTREE,
  INDEX `idx_wx_tx`(`wx_transaction_id` ASC) USING BTREE,
  CONSTRAINT `fk_payment_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_payment_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '支付单（一笔支付可对应一笔业务订单）' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for plan_days
-- ----------------------------
DROP TABLE IF EXISTS `plan_days`;
CREATE TABLE `plan_days`  (
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
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '行程天数' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for plan_snapshots
-- ----------------------------
DROP TABLE IF EXISTS `plan_snapshots`;
CREATE TABLE `plan_snapshots`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `plan_id` bigint UNSIGNED NOT NULL,
  `snapshot_data` json NULL COMMENT '完整行程快照',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_plan_id`(`plan_id` ASC) USING BTREE,
  CONSTRAINT `fk_plan_snapshots_plans` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '行程历史快照' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for plans
-- ----------------------------
DROP TABLE IF EXISTS `plans`;
CREATE TABLE `plans`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '方案名称',
  `attraction_summary` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '途径景点摘要',
  `plan_status` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'draft' COMMENT '方案态：current|draft|archived（不用通用 status 混用）',
  `start_date` datetime NULL DEFAULT NULL COMMENT '行程开始日期',
  `end_date` datetime NULL DEFAULT NULL COMMENT '行程结束日期',
  `cities` json NULL COMMENT '途径城市列表',
  `analytics` json NULL COMMENT '行程分析',
  `badges` json NULL COMMENT '徽章列表（原 bages）',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_plan_status`(`user_id` ASC, `plan_status` ASC) USING BTREE,
  INDEX `idx_end_date`(`end_date` ASC) USING BTREE,
  CONSTRAINT `fk_plans_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'AI行程方案' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for poi
-- ----------------------------
DROP TABLE IF EXISTS `poi`;
CREATE TABLE `poi`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '点位主键（内容/足迹/收藏推荐统一引用）',
  `destination_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '所属目的地',
  `category` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'scenic|museum|food',
  `poi_subtype` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'place|food',
  `name` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `cover_url` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `images_json` json NULL COMMENT '详情轮播图 URL 数组',
  `tags_json` json NULL COMMENT '标签，兼筛选',
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `city` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '所属城市（兼容原 spots.city）',
  `open_time` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `price` decimal(10, 2) NULL DEFAULT NULL COMMENT '门票参考价，免费为 NULL',
  `price_note` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `intro` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `suggest_duration` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `lat` decimal(10, 7) NULL DEFAULT NULL,
  `lng` decimal(10, 7) NULL DEFAULT NULL,
  `booking_appid` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `booking_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `booking_url` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `grade` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '5A/4A 等',
  `cuisine_type` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '美食类型筛选',
  `avg_cost` decimal(10, 2) NULL DEFAULT NULL COMMENT '人均消费（美食，兼容原 foods）',
  `rating` decimal(2, 1) NULL DEFAULT NULL COMMENT '评分（兼容原 foods）',
  `status` tinyint UNSIGNED NOT NULL DEFAULT 1 COMMENT '1上架 0下架',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_poi_category_status`(`category` ASC, `status` ASC) USING BTREE,
  INDEX `idx_poi_destination`(`destination_id` ASC) USING BTREE,
  INDEX `idx_poi_name`(`name` ASC) USING BTREE,
  INDEX `idx_poi_grade`(`grade` ASC) USING BTREE,
  INDEX `idx_poi_city`(`city` ASC) USING BTREE,
  CONSTRAINT `fk_poi_destination` FOREIGN KEY (`destination_id`) REFERENCES `destination` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '点位主数据：景区/文博/美食' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for product_tag_relation
-- ----------------------------
DROP TABLE IF EXISTS `product_tag_relation`;
CREATE TABLE `product_tag_relation`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` bigint UNSIGNED NOT NULL,
  `tag_id` int UNSIGNED NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_product_tag`(`product_id` ASC, `tag_id` ASC) USING BTREE,
  INDEX `fk_ptr_tag`(`tag_id` ASC) USING BTREE,
  CONSTRAINT `fk_ptr_product` FOREIGN KEY (`product_id`) REFERENCES `ticket_product` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_ptr_tag` FOREIGN KEY (`tag_id`) REFERENCES `ticket_type_tag` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '票种标签关联' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for qualification
-- ----------------------------
DROP TABLE IF EXISTS `qualification`;
CREATE TABLE `qualification`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `merchant_id` bigint UNSIGNED NOT NULL,
  `qual_type` tinyint NOT NULL COMMENT '1营业执照 2景区授权书',
  `file_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` tinyint UNSIGNED NOT NULL DEFAULT 0 COMMENT '0待提交 1审核中 2已通过 3已驳回',
  `reject_reason` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_merchant`(`merchant_id` ASC) USING BTREE,
  CONSTRAINT `fk_qua_merchant` FOREIGN KEY (`merchant_id`) REFERENCES `merchant_account` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '资质认证' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for refund_record
-- ----------------------------
DROP TABLE IF EXISTS `refund_record`;
CREATE TABLE `refund_record`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` bigint UNSIGNED NOT NULL COMMENT 'orders.order_id',
  `payment_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '关联支付单',
  `item_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '门票明细，可空表示整单',
  `refund_amount` decimal(12, 2) NOT NULL,
  `reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `status` tinyint UNSIGNED NOT NULL DEFAULT 1 COMMENT '1待审核 2已同意 3已拒绝',
  `apply_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `audit_time` datetime NULL DEFAULT NULL,
  `auditor_id` bigint UNSIGNED NULL DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_order`(`order_id` ASC) USING BTREE,
  INDEX `idx_payment`(`payment_id` ASC) USING BTREE,
  CONSTRAINT `fk_rr_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_rr_payment` FOREIGN KEY (`payment_id`) REFERENCES `payment` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '退款记录' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for reviews
-- ----------------------------
DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews`  (
  `review_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '评价ID',
  `user_id` bigint UNSIGNED NOT NULL,
  `order_id` bigint UNSIGNED NOT NULL COMMENT '必须关联统一 orders',
  `product_type` tinyint UNSIGNED NULL DEFAULT NULL COMMENT '冗余自订单',
  `product_id` bigint UNSIGNED NULL DEFAULT NULL,
  `product_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `rating` tinyint UNSIGNED NOT NULL DEFAULT 5 COMMENT '1-5星',
  `rating_label` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `images` json NULL,
  `is_anonymous` tinyint UNSIGNED NULL DEFAULT 0,
  `status` tinyint UNSIGNED NOT NULL DEFAULT 1 COMMENT '1显示 2隐藏',
  `review_time` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`review_id`) USING BTREE,
  UNIQUE INDEX `uk_order_id`(`order_id` ASC) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_product`(`product_type` ASC, `product_id` ASC) USING BTREE,
  CONSTRAINT `fk_reviews_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '评价表（挂统一订单）' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for route_template
-- ----------------------------
DROP TABLE IF EXISTS `route_template`;
CREATE TABLE `route_template`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `destination_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '目的地ID',
  `name` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `cover_url` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `subtitle` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '副标题',
  `intro` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '玩法简介',
  `days_count` int NOT NULL COMMENT '总天数',
  `status` tinyint UNSIGNED NOT NULL DEFAULT 1 COMMENT '1上架 0下架',
  `sort_weight` int NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_route_status_sort`(`status` ASC, `sort_weight` ASC) USING BTREE,
  INDEX `idx_route_name`(`name` ASC) USING BTREE,
  INDEX `idx_route_destination`(`destination_id` ASC) USING BTREE,
  CONSTRAINT `fk_route_tpl_destination` FOREIGN KEY (`destination_id`) REFERENCES `destination` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '热门线路/行程模板' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for routes
-- ----------------------------
DROP TABLE IF EXISTS `routes`;
CREATE TABLE `routes`  (
  `route_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '线路ID（可售精品线路）',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '线路名称',
  `days` int UNSIGNED NULL DEFAULT 1 COMMENT '行程天数',
  `departure` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '出发地',
  `price` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '价格',
  `image` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '封面图',
  `status` tinyint UNSIGNED NOT NULL DEFAULT 1 COMMENT '1上架 0下架',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`route_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '精品线路表（交易向）' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for scenic_spot
-- ----------------------------
DROP TABLE IF EXISTS `scenic_spot`;
CREATE TABLE `scenic_spot`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '可售卖景区主体ID',
  `poi_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '映射内容点位 poi.id',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '景区名称',
  `location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '地址',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '简介',
  `logo_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'Logo',
  `status` tinyint UNSIGNED NOT NULL DEFAULT 1 COMMENT '1营业 2停业',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_scenic_poi`(`poi_id` ASC) USING BTREE,
  CONSTRAINT `fk_scenic_poi` FOREIGN KEY (`poi_id`) REFERENCES `poi` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '票务景区主体（售卖/核销），展示信息优先走 poi' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for settlement_record
-- ----------------------------
DROP TABLE IF EXISTS `settlement_record`;
CREATE TABLE `settlement_record`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `merchant_id` bigint UNSIGNED NOT NULL,
  `spot_id` bigint UNSIGNED NOT NULL,
  `period_start` date NOT NULL,
  `period_end` date NOT NULL,
  `total_amount` decimal(12, 2) NOT NULL,
  `settlement_amount` decimal(12, 2) NOT NULL,
  `status` tinyint UNSIGNED NOT NULL DEFAULT 1 COMMENT '1待结算 2已结算',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_merchant`(`merchant_id` ASC, `spot_id` ASC) USING BTREE,
  INDEX `fk_sr_spot`(`spot_id` ASC) USING BTREE,
  CONSTRAINT `fk_sr_merchant` FOREIGN KEY (`merchant_id`) REFERENCES `merchant_account` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_sr_spot` FOREIGN KEY (`spot_id`) REFERENCES `scenic_spot` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '结算记录' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for sys_additional_service
-- ----------------------------
DROP TABLE IF EXISTS `sys_additional_service`;
CREATE TABLE `sys_additional_service`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `service_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `service_price` decimal(10, 2) NULL DEFAULT 0.00,
  `service_desc` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT 0,
  `status` tinyint UNSIGNED NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '附加服务配置' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for sys_car_model
-- ----------------------------
DROP TABLE IF EXISTS `sys_car_model`;
CREATE TABLE `sys_car_model`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `model_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `vehicle_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `seat_count` int NOT NULL,
  `sort_order` int NOT NULL DEFAULT 0,
  `status` tinyint UNSIGNED NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '车型配置表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for team_members
-- ----------------------------
DROP TABLE IF EXISTS `team_members`;
CREATE TABLE `team_members`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `team_id` bigint UNSIGNED NOT NULL COMMENT '所属旅行团',
  `user_id` bigint UNSIGNED NOT NULL COMMENT '团员用户ID',
  `role` tinyint UNSIGNED NOT NULL DEFAULT 2 COMMENT '角色：1团长 2普通团员（团长也在此表中有一行）',
  `status` tinyint UNSIGNED NOT NULL DEFAULT 1 COMMENT '1正常 0已退出/被移除',
  `joined_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime NULL DEFAULT NULL COMMENT '退出软删',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_team_user`(`team_id` ASC, `user_id` ASC) USING BTREE COMMENT '防止重复加入',
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_role`(`role` ASC) USING BTREE,
  CONSTRAINT `fk_member_team` FOREIGN KEY (`team_id`) REFERENCES `travel_teams` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_member_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '团队成员表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for ticket_price
-- ----------------------------
DROP TABLE IF EXISTS `ticket_price`;
CREATE TABLE `ticket_price`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` bigint UNSIGNED NOT NULL,
  `sale_price` decimal(10, 2) NOT NULL,
  `settlement_price` decimal(10, 2) NOT NULL,
  `daily_limit` int NULL DEFAULT NULL,
  `unlimited` tinyint NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_product`(`product_id` ASC) USING BTREE,
  CONSTRAINT `fk_tpr_product` FOREIGN KEY (`product_id`) REFERENCES `ticket_product` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '票种价格与限额' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for ticket_product
-- ----------------------------
DROP TABLE IF EXISTS `ticket_product`;
CREATE TABLE `ticket_product`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `spot_id` bigint UNSIGNED NOT NULL COMMENT 'scenic_spot.id',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `cover_image` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `real_name_required` tinyint NOT NULL DEFAULT 0,
  `min_age` int NULL DEFAULT NULL,
  `max_age` int NULL DEFAULT NULL,
  `id_card_types` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `terms` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `booking_advance_days` int NULL DEFAULT 0,
  `booking_advance_hours` int NULL DEFAULT 0,
  `refund_allowed` tinyint NOT NULL DEFAULT 1,
  `refund_deadline_type` tinyint NULL DEFAULT 1,
  `refund_deadline_value` int NULL DEFAULT 0,
  `refund_fee_rate` decimal(5, 2) NULL DEFAULT 0.00,
  `sale_start_date` date NULL DEFAULT NULL,
  `sale_end_date` date NULL DEFAULT NULL,
  `daily_sale_start_time` time NULL DEFAULT '08:00:00',
  `daily_sale_end_time` time NULL DEFAULT '18:00:00',
  `status` tinyint UNSIGNED NOT NULL DEFAULT 1 COMMENT '1销售中 2已下架 3审核中 4审核不通过',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_spot_status`(`spot_id` ASC, `status` ASC) USING BTREE,
  CONSTRAINT `fk_tp_spot` FOREIGN KEY (`spot_id`) REFERENCES `scenic_spot` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '票种主表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for ticket_type_tag
-- ----------------------------
DROP TABLE IF EXISTS `ticket_type_tag`;
CREATE TABLE `ticket_type_tag`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `color` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_code`(`code` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '票种标签字典' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for ticket_voucher
-- ----------------------------
DROP TABLE IF EXISTS `ticket_voucher`;
CREATE TABLE `ticket_voucher`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_item_id` bigint UNSIGNED NOT NULL,
  `qr_code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `verify_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` tinyint UNSIGNED NOT NULL DEFAULT 1 COMMENT '1待使用 2已使用 3已退款',
  `used_time` datetime NULL DEFAULT NULL,
  `used_by` bigint UNSIGNED NULL DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_verify_code`(`verify_code` ASC) USING BTREE,
  INDEX `idx_order_item`(`order_item_id` ASC) USING BTREE,
  CONSTRAINT `fk_tv_item` FOREIGN KEY (`order_item_id`) REFERENCES `order_item` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '票券凭证' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for time_slot
-- ----------------------------
DROP TABLE IF EXISTS `time_slot`;
CREATE TABLE `time_slot`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` bigint UNSIGNED NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `daily_limit` int NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_product`(`product_id` ASC) USING BTREE,
  CONSTRAINT `fk_ts_product` FOREIGN KEY (`product_id`) REFERENCES `ticket_product` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '分时预约时段' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for travel_teams
-- ----------------------------
DROP TABLE IF EXISTS `travel_teams`;
CREATE TABLE `travel_teams`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '旅行团ID',
  `plan_id` bigint UNSIGNED NOT NULL COMMENT '关联的行程方案ID（一个团固定关联一个行程）',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '团名称，如“张掖七彩丹霞探秘小分队”',
  `owner_user_id` bigint UNSIGNED NOT NULL COMMENT '团长用户ID（拥有编辑权限）',
  `join_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '加入码（团长生成，如 GANSU2024，分享给团员输入加入）',
  `join_code_expire_at` datetime NULL DEFAULT NULL COMMENT '加入码过期时间（NULL为永不过期；过期后团长可重置）',
  `status` tinyint UNSIGNED NOT NULL DEFAULT 1 COMMENT '1活跃 0已解散',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime NULL DEFAULT NULL COMMENT '软删（解散时记录时间）',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_plan_team`(`plan_id` ASC) USING BTREE COMMENT '一个行程只能被一个团使用',
  UNIQUE INDEX `uk_join_code`(`join_code` ASC) USING BTREE COMMENT '加入码全局唯一，防止串团',
  INDEX `idx_owner`(`owner_user_id` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE,
  CONSTRAINT `fk_team_owner` FOREIGN KEY (`owner_user_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_team_plan` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '旅行团主表（含静态加入码）' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for travelers
-- ----------------------------
DROP TABLE IF EXISTS `travelers`;
CREATE TABLE `travelers`  (
  `traveler_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '出行人ID',
  `user_id` bigint UNSIGNED NOT NULL COMMENT '所属用户ID',
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '姓名',
  `id_type` tinyint UNSIGNED NULL DEFAULT 1 COMMENT '证件类型：1身份证 2护照 3港澳通行证 4台湾通行证',
  `id_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '证件号码（建议应用层加密）',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '手机号',
  `phone_area_code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '+86' COMMENT '手机国际区号',
  `is_default` tinyint UNSIGNED NULL DEFAULT 0 COMMENT '是否默认：0否 1是',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime NULL DEFAULT NULL COMMENT '软删',
  PRIMARY KEY (`traveler_id`) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE,
  CONSTRAINT `fk_travelers_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '常用出行人表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `user_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `openid` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '微信openid（用户端小程序）',
  `unionid` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '微信unionid（跨端打通可选）',
  `avatar_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '头像URL',
  `nickname` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '昵称',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '手机号',
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '邮箱',
  `gender` tinyint UNSIGNED NULL DEFAULT 0 COMMENT '性别：0未知 1男 2女',
  `birthday` date NULL DEFAULT NULL COMMENT '生日',
  `signature` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '个性签名',
  `status` tinyint UNSIGNED NOT NULL DEFAULT 1 COMMENT '业务状态：0禁用 1正常（非删除）',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` datetime NULL DEFAULT NULL COMMENT '注销软删，NULL=未注销',
  PRIMARY KEY (`user_id`) USING BTREE,
  UNIQUE INDEX `uk_openid`(`openid` ASC) USING BTREE,
  UNIQUE INDEX `uk_phone`(`phone` ASC) USING BTREE,
  INDEX `idx_nickname`(`nickname` ASC) USING BTREE,
  INDEX `idx_users_deleted`(`deleted_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '用户端账号表' ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;
