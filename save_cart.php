<?php
include 'db.php'; // استدعاء الاتصال بالقاعدة

$cartData = $_POST['cart'] ?? '';

if($cartData != '') {
    // هنا نفترض عندك جدول اسمه cart_items
    $sql = "INSERT INTO cart_items (data) VALUES (?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $cartData);
    $stmt->execute();
    echo "تم حفظ السلة بنجاح!";
} else {
    echo "السلة فارغة";
}
?>
