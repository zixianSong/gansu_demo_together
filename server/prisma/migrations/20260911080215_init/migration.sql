-- CreateTable
CREATE TABLE `destination` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(64) NOT NULL,
    `cover_url` VARCHAR(512) NULL,
    `intro` TEXT NULL,
    `transport_guide` TEXT NULL,
    `status` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `sort_weight` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `route_template` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `destination_id` BIGINT UNSIGNED NULL,
    `name` VARCHAR(128) NOT NULL,
    `cover_url` VARCHAR(512) NULL,
    `subtitle` VARCHAR(255) NULL,
    `intro` TEXT NULL,
    `days_count` INTEGER NOT NULL,
    `status` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `sort_weight` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `poi` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `destination_id` BIGINT UNSIGNED NULL,
    `category` VARCHAR(32) NOT NULL,
    `poi_subtype` VARCHAR(32) NOT NULL,
    `name` VARCHAR(128) NOT NULL,
    `cover_url` VARCHAR(512) NULL,
    `images_json` JSON NULL,
    `tags_json` JSON NULL,
    `address` VARCHAR(255) NULL,
    `city` VARCHAR(50) NULL,
    `open_time` VARCHAR(128) NULL,
    `price` DECIMAL(10, 2) NULL,
    `price_note` VARCHAR(128) NULL,
    `intro` TEXT NULL,
    `suggest_duration` VARCHAR(64) NULL,
    `lat` DECIMAL(10, 7) NULL,
    `lng` DECIMAL(10, 7) NULL,
    `booking_appid` VARCHAR(64) NULL,
    `booking_path` VARCHAR(255) NULL,
    `booking_url` VARCHAR(512) NULL,
    `grade` VARCHAR(16) NULL,
    `cuisine_type` VARCHAR(64) NULL,
    `avg_cost` DECIMAL(10, 2) NULL,
    `rating` DECIMAL(2, 1) NULL,
    `status` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `article` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(200) NOT NULL,
    `cover_url` VARCHAR(512) NULL,
    `content_type` VARCHAR(32) NOT NULL,
    `content_html` MEDIUMTEXT NULL,
    `wechat_url` VARCHAR(512) NULL,
    `wechat_msg_id` VARCHAR(64) NULL,
    `tags_json` JSON NULL,
    `price_label` VARCHAR(32) NULL,
    `booking_path` VARCHAR(255) NULL,
    `author` VARCHAR(64) NULL,
    `published_at` DATETIME(3) NULL,
    `status` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `article_wechat_msg_id_key`(`wechat_msg_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `article_poi` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `article_id` BIGINT UNSIGNED NOT NULL,
    `poi_id` BIGINT UNSIGNED NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `article_poi_article_id_poi_id_key`(`article_id`, `poi_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `article_route` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `article_id` BIGINT UNSIGNED NOT NULL,
    `route_id` BIGINT UNSIGNED NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `article_route_article_id_route_id_key`(`article_id`, `route_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `banner` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(128) NULL,
    `image_url` VARCHAR(512) NOT NULL,
    `link_type` VARCHAR(32) NOT NULL,
    `link_id` BIGINT UNSIGNED NULL,
    `link_path` VARCHAR(255) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `start_at` DATETIME(3) NULL,
    `end_at` DATETIME(3) NULL,
    `status` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `home_hot_destination` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `destination_id` BIGINT UNSIGNED NOT NULL,
    `cover_override` VARCHAR(512) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `status` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `home_hot_destination_destination_id_key`(`destination_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `home_hot_route` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `route_id` BIGINT UNSIGNED NOT NULL,
    `cover_override` VARCHAR(512) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `status` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `home_hot_route_route_id_key`(`route_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `route_template` ADD CONSTRAINT `route_template_destination_id_fkey` FOREIGN KEY (`destination_id`) REFERENCES `destination`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `poi` ADD CONSTRAINT `poi_destination_id_fkey` FOREIGN KEY (`destination_id`) REFERENCES `destination`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `article_poi` ADD CONSTRAINT `article_poi_article_id_fkey` FOREIGN KEY (`article_id`) REFERENCES `article`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `article_poi` ADD CONSTRAINT `article_poi_poi_id_fkey` FOREIGN KEY (`poi_id`) REFERENCES `poi`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `article_route` ADD CONSTRAINT `article_route_article_id_fkey` FOREIGN KEY (`article_id`) REFERENCES `article`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `article_route` ADD CONSTRAINT `article_route_route_id_fkey` FOREIGN KEY (`route_id`) REFERENCES `route_template`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `home_hot_destination` ADD CONSTRAINT `home_hot_destination_destination_id_fkey` FOREIGN KEY (`destination_id`) REFERENCES `destination`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `home_hot_route` ADD CONSTRAINT `home_hot_route_route_id_fkey` FOREIGN KEY (`route_id`) REFERENCES `route_template`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
