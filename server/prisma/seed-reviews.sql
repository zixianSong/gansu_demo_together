-- Place names on pending (status=4) orders; add one completed+reviewed order per user.

UPDATE orders
SET snapshot = JSON_SET(
  COALESCE(snapshot, JSON_OBJECT()),
  '$.placeName', product_name,
  '$.placeAddress', CASE
    WHEN product_name LIKE '%嘉峪关%' THEN '甘肃省嘉峪关市峪泉镇关城南路421号'
    WHEN product_name LIKE '%丹霞%' THEN '甘肃省张掖市临泽县倪家营乡'
    WHEN product_name LIKE '%莫高窟%' THEN '甘肃省敦煌市莫高窟'
    WHEN product_name LIKE '%月牙泉%' THEN '甘肃省敦煌市月牙泉镇'
    ELSE ''
  END
)
WHERE status = 4;

INSERT INTO orders (
  order_no, user_id, product_type, product_id, product_name, quantity, unit_price,
  total_amount, discount_amount, pay_amount, status, travel_date, refund_status, snapshot, pay_time
)
SELECT CONCAT('ORDU', u.user_id, 'E'), u.user_id, 1, 90, '张掖七彩丹霞旅游景区', 1, 168.00,
  168.00, 0.00, 168.00, 5, '2026-07-22', 0,
  JSON_OBJECT(
    'usage','刷二维码入园',
    'refundRule','未使用可随时退，部分使用不可退',
    'snapshotNote','作为本订单交易凭证，与订单具有同等效力',
    'userHidden', false,
    'placeName','张掖七彩丹霞旅游景区',
    'placeAddress','甘肃省张掖市临泽县倪家营乡'
  ),
  NOW()
FROM users u
WHERE u.deleted_at IS NULL
  AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.order_no = CONCAT('ORDU', u.user_id, 'E'));

INSERT INTO reviews (
  user_id, order_id, product_type, product_id, product_name, rating, rating_label, content, images, is_anonymous, status, review_time
)
SELECT o.user_id, o.order_id, o.product_type, o.product_id, o.product_name, 5, '非常满意',
  '七彩丹霞真的名不虚传，颜色层次很丰富，建议早晚光线更好。',
  JSON_ARRAY(), 1, 1, NOW()
FROM orders o
WHERE o.order_no LIKE 'ORDU%E'
  AND NOT EXISTS (SELECT 1 FROM reviews r WHERE r.order_id = o.order_id AND r.deleted_at IS NULL);

INSERT INTO orders (
  order_no, user_id, product_type, product_id, product_name, quantity, unit_price,
  total_amount, discount_amount, pay_amount, status, travel_date, refund_status, snapshot, pay_time
)
SELECT CONCAT('ORDU', u.user_id, 'F'), u.user_id, 1, 93, '麦积山石窟门票', 2, 75.00,
  150.00, 0.00, 150.00, 4, '2026-07-28', 0,
  JSON_OBJECT(
    'usage','凭身份证原件入园',
    'refundRule','未使用可随时退，部分使用不可退',
    'snapshotNote','作为本订单交易凭证，与订单具有同等效力',
    'userHidden', false,
    'placeName','麦积山石窟',
    'placeAddress','甘肃省天水市麦积区麦积镇'
  ),
  NOW()
FROM users u
WHERE u.deleted_at IS NULL
  AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.order_no = CONCAT('ORDU', u.user_id, 'F'));

INSERT INTO order_travelers (order_id, name, id_type, id_number, phone, sort_order)
SELECT o.order_id, '李*', 1, '620***********1234', '138****8888', 0
FROM orders o
WHERE o.order_no LIKE 'ORDU%F'
  AND NOT EXISTS (SELECT 1 FROM order_travelers t WHERE t.order_id = o.order_id);

INSERT INTO order_vouchers (order_id, qrcode_data, status, sort_order)
SELECT o.order_id, CONCAT('TV', o.order_id), 2, 0
FROM orders o
WHERE o.order_no LIKE 'ORDU%F'
  AND NOT EXISTS (SELECT 1 FROM order_vouchers v WHERE v.order_id = o.order_id);

INSERT INTO payment (payment_no, order_id, user_id, amount, status)
SELECT CONCAT('PAY', o.order_no), o.order_id, o.user_id, o.pay_amount, 2
FROM orders o
WHERE o.order_no LIKE 'ORDU%F'
  AND NOT EXISTS (SELECT 1 FROM payment p WHERE p.order_id = o.order_id);
