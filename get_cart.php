<?php
include 'db.php';

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;
if ($id <= 0) {
    echo json_encode(['success'=>false, 'error'=>'معرّف غير صالح']);
    exit;
}

$stmt = $conn->prepare("SELECT data FROM cart_items WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$stmt->bind_result($cartData);
if ($stmt->fetch()) {
    echo json_encode(['success'=>true, 'cart'=>json_decode($cartData, true)]);
} else {
    echo json_encode(['success'=>false, 'error'=>'السلة غير موجودة']);
}
$stmt->close();
?>
