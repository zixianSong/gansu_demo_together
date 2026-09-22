INSERT INTO travelers (user_id, name, id_type, id_number, phone, phone_area_code, is_default)
SELECT u.user_id, '李晓雅', 1, '110101199001011234', '13800008888', '+86', 1
FROM users u
WHERE u.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM travelers t
    WHERE t.user_id = u.user_id AND t.name = '李晓雅' AND t.deleted_at IS NULL
  );

INSERT INTO travelers (user_id, name, id_type, id_number, phone, phone_area_code, is_default)
SELECT u.user_id, '王建国', 1, '620102198802025678', '13900006666', '+86', 0
FROM users u
WHERE u.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM travelers t
    WHERE t.user_id = u.user_id AND t.name = '王建国' AND t.deleted_at IS NULL
  );
