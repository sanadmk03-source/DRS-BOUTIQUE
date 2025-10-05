<?php
include 'db_connect.php';

// نتحقق من البيانات القادمة
$user_id = $_POST['user_id'] ?? '';
$product_id = $_POST['product_id'] ?? '';
$quantity = $_POST['quantity'] ?? 1;

if ($user_id && $product_id) {
    // نتحقق إذا المنتج موجود في السلة من قبل
    $check = $conn->prepare("SELECT id, quantity FROM carts WHERE user_id=? AND product_id=?");
    $check->bind_param("si", $user_id, $product_id);
    $check->execute();
    $result = $check->get_result();

    if ($result->num_rows > 0) {
        // لو موجود، نحدث الكمية
        $row = $result->fetch_assoc();
        $new_qty = $row['quantity'] + $quantity;
        $update = $conn->prepare("UPDATE carts SET quantity=? WHERE id=?");
        $update->bind_param("ii", $new_qty, $row['id']);
        $update->execute();
    } else {
        // لو مش موجود، نضيفه
        $insert = $conn->prepare("INSERT INTO carts (user_id, product_id, quantity) VALUES (?, ?, ?)");
        $insert->bind_param("sii", $user_id, $product_id, $quantity);
        $insert->execute();
    }

    echo "✅ تمت إضافة المنتج للسلة بنجاح";
} else {
    echo "❌ بيانات ناقصة!";
}

$conn->close();
?>
