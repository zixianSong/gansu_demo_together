INSERT INTO favorites (user_id, target_type, target_id, target_name, target_image, extra_info)
SELECT u.user_id, 1, p.id, p.name, p.cover_url,
  JSON_OBJECT('tab', 'spot', 'price', IFNULL(p.price, 0))
FROM users u
JOIN poi p ON p.deleted_at IS NULL AND p.category <> 'food'
WHERE u.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM favorites f
    WHERE f.user_id = u.user_id AND f.target_type = 1 AND f.target_id = p.id
  );

INSERT INTO favorites (user_id, target_type, target_id, target_name, target_image, extra_info)
SELECT u.user_id, 1, p.id, p.name, p.cover_url,
  JSON_OBJECT('tab', 'food', 'rating', IFNULL(p.rating, 4.8), 'avgCost', IFNULL(p.avg_cost, 18), 'address', IFNULL(p.address, ''))
FROM users u
JOIN poi p ON p.deleted_at IS NULL AND p.category = 'food'
WHERE u.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM favorites f
    WHERE f.user_id = u.user_id AND f.target_type = 1 AND f.target_id = p.id
  );

INSERT INTO favorites (user_id, target_type, target_id, target_name, target_image, extra_info)
SELECT u.user_id, 5, r.id, r.name, r.cover_url,
  JSON_OBJECT('tab', 'route', 'subtitle', IFNULL(r.subtitle, ''), 'price', 2680)
FROM users u
JOIN route_template r ON r.deleted_at IS NULL
WHERE u.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM favorites f
    WHERE f.user_id = u.user_id AND f.target_type = 5 AND f.target_id = r.id
  );

INSERT INTO favorites (user_id, target_type, target_id, target_name, target_image, extra_info)
SELECT u.user_id, 4, a.id, a.title, a.cover_url,
  JSON_OBJECT(
    'tab', 'guide',
    'author', IFNULL(a.author, ''),
    'publishTime', DATE_FORMAT(IFNULL(a.published_at, a.created_at), '%Y-%m-%d'),
    'readCount', '1.2w',
    'likeCount', 892
  )
FROM users u
JOIN article a ON a.deleted_at IS NULL
WHERE u.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM favorites f
    WHERE f.user_id = u.user_id AND f.target_type = 4 AND f.target_id = a.id
  );

INSERT INTO footprints (
  user_id, poi_id, poi_name, poi_image, poi_grade, poi_category, address, city_name, visit_date, visit_time, type
)
SELECT u.user_id, p.id, p.name, p.cover_url, p.grade, p.category, p.address, p.city, d.visit_date, d.visit_time, 1
FROM users u
JOIN poi p ON p.deleted_at IS NULL
JOIN (
  SELECT 1 AS seq, '2026-08-01' AS visit_date, '09:30:00' AS visit_time, 'scenic' AS cat
  UNION ALL SELECT 2, '2026-08-01', '14:20:00', 'food'
  UNION ALL SELECT 3, '2026-07-28', '10:15:00', 'museum'
) d ON (d.cat = p.category OR (d.cat = 'scenic' AND p.category = 'scenic'))
WHERE u.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM footprints f
    WHERE f.user_id = u.user_id AND f.poi_id = p.id AND f.visit_date = d.visit_date AND f.deleted_at IS NULL
  );
