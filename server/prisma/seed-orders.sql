-- Demo tickets for every existing user. Skip if that user already has orders.
INSERT INTO orders (
  order_no, user_id, product_type, product_id, product_name, quantity, unit_price,
  total_amount, discount_amount, pay_amount, status, travel_date, refund_status, snapshot
)
SELECT CONCAT('ORDU', u.user_id, 'A'), u.user_id, 1, 88, '莫高窟旺季正常参观门票A票', 2, 238.00,
  476.00, 0.00, 476.00, 1, '2026-08-05', 0,
  JSON_OBJECT('usage','凭身份证原件入园','refundRule','未使用可随时退，部分使用不可退','snapshotNote','作为本订单交易凭证，与订单具有同等效力','userHidden', false)
FROM users u
WHERE u.deleted_at IS NULL
  AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.user_id);

INSERT INTO orders (
  order_no, user_id, product_type, product_id, product_name, quantity, unit_price,
  total_amount, discount_amount, pay_amount, status, travel_date, refund_status, snapshot, pay_time
)
SELECT CONCAT('ORDU', u.user_id, 'B'), u.user_id, 1, 90, '张掖七彩丹霞深度游门票+观光车', 1, 168.00,
  168.00, 0.00, 168.00, 2, '2026-08-08', 0,
  JSON_OBJECT('usage','刷二维码入园','refundRule','未使用可随时退，部分使用不可退','snapshotNote','作为本订单交易凭证，与订单具有同等效力','userHidden', false),
  NOW()
FROM users u
WHERE u.deleted_at IS NULL
  AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.order_no = CONCAT('ORDU', u.user_id, 'B'));

INSERT INTO orders (
  order_no, user_id, product_type, product_id, product_name, quantity, unit_price,
  total_amount, discount_amount, pay_amount, status, travel_date, refund_status, snapshot, pay_time
)
SELECT CONCAT('ORDU', u.user_id, 'C'), u.user_id, 1, 91, '嘉峪关关城门票', 2, 55.00,
  110.00, 0.00, 110.00, 4, '2026-07-20', 0,
  JSON_OBJECT('usage','刷身份证入园','refundRule','未使用可随时退，部分使用不可退','snapshotNote','作为本订单交易凭证，与订单具有同等效力','userHidden', false),
  NOW()
FROM users u
WHERE u.deleted_at IS NULL
  AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.order_no = CONCAT('ORDU', u.user_id, 'C'));

INSERT INTO orders (
  order_no, user_id, product_type, product_id, product_name, quantity, unit_price,
  total_amount, discount_amount, pay_amount, status, travel_date, refund_status, snapshot, pay_time
)
SELECT CONCAT('ORDU', u.user_id, 'D'), u.user_id, 1, 92, '鸣沙山月牙泉门票', 1, 110.00,
  110.00, 0.00, 110.00, 6, '2026-07-20', 1,
  JSON_OBJECT('usage','凭二维码入园','refundRule','未使用可随时退，部分使用不可退','snapshotNote','作为本订单交易凭证，与订单具有同等效力','userHidden', false),
  NOW()
FROM users u
WHERE u.deleted_at IS NULL
  AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.order_no = CONCAT('ORDU', u.user_id, 'D'));

INSERT INTO order_travelers (order_id, name, id_type, id_number, phone, sort_order)
SELECT o.order_id, '李*', 1, '620***********1234', '138****8888', 0
FROM orders o
WHERE NOT EXISTS (SELECT 1 FROM order_travelers t WHERE t.order_id = o.order_id);

INSERT INTO order_vouchers (order_id, qrcode_data, status, sort_order)
SELECT o.order_id, CONCAT('TV', o.order_id), IF(o.status IN (4, 5), 2, 1), 0
FROM orders o
WHERE o.status IN (2, 3, 4)
  AND NOT EXISTS (SELECT 1 FROM order_vouchers v WHERE v.order_id = o.order_id);

INSERT INTO payment (payment_no, order_id, user_id, amount, status)
SELECT CONCAT('PAY', o.order_no), o.order_id, o.user_id, o.pay_amount, IF(o.status = 1, 1, 2)
FROM orders o
WHERE NOT EXISTS (SELECT 1 FROM payment p WHERE p.order_id = o.order_id);
