<?php
include 'db_connect.php';

$id = $_GET['id'] ?? '';

if ($id) {
    $stmt = $conn->prepare("DELETE FROM carts WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    echo "✅ تم حذف المنتج من السلة بنجاح";
} else {
    echo "❌ لم يتم تحديد المنتج للحذف";
}

$conn->close();
?>
