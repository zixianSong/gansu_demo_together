-- CreateTable
CREATE TABLE `biz_tour_route` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `route_name` VARCHAR(100) NOT NULL,
    `start_city` VARCHAR(50) NOT NULL,
    `end_city` VARCHAR(50) NOT NULL,
    `estimated_duration` VARCHAR(50) NULL,
    `reference_price` DECIMAL(10, 2) NULL,
    `route_desc` TEXT NULL,
    `cover_img` VARCHAR(255) NULL,
    `status` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_car_model` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `model_name` VARCHAR(50) NOT NULL,
    `vehicle_type` VARCHAR(20) NULL,
    `seat_count` INTEGER NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `status` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
