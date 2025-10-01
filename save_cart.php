<?php
include 'db.php';

// استخدم JSON فقط من body وليس POST مباشرة
$input = file_get_contents('php://input');
$data = json_decode($input, true);
$cartData = $data['cart'] ?? '';

// تحقق من صحة البيانات (مثال: كل منتج يجب أن يحتوي على سعر رقمي)
function isValidCart($cart) {
    if (!is_array($cart)) return false;
    foreach ($cart as $item) {
        if (!isset($item['newPrice']) || !is_numeric($item['newPrice'])) return false;
        if (!isset($item['qty']) || !is_numeric($item['qty'])) return false;
    }
    return true;
}

if($cartData && isValidCart($cartData)) {
    $stmt = $conn->prepare("INSERT INTO cart_items (data) VALUES (?)");
    $json = json_encode($cartData, JSON_UNESCAPED_UNICODE);
    $stmt->bind_param("s", $json);
    $stmt->execute();
    $id = $stmt->insert_id;
    $stmt->close();
    echo json_encode(['success'=>true, 'id'=>$id]);
} else {
    echo json_encode(['success'=>false, 'error'=>'سلة غير صالحة']);
}
?>
