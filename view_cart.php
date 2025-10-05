<?php
include 'db_connect.php';

$user_id = $_GET['user_id'] ?? '';

if (!$user_id) {
    die("❌ لم يتم تحديد المستخدم");
}

$sql = "
SELECT c.id AS cart_id, p.name, p.price, p.image, c.quantity 
FROM carts c
JOIN products p ON c.product_id = p.id
WHERE c.user_id = ?
";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $user_id);
$stmt->execute();
$result = $stmt->get_result();

echo "<h2>🛒 سلة المستخدم: $user_id</h2>";
echo "<table border='1' cellpadding='8'>";
echo "<tr><th>المنتج</th><th>السعر</th><th>الكمية</th><th>الإجمالي</th><th>إجراء</th></tr>";

$total = 0;

while ($row = $result->fetch_assoc()) {
    $subtotal = $row['price'] * $row['quantity'];
    $total += $subtotal;
    echo "<tr>
        <td>{$row['name']}</td>
        <td>{$row['price']}</td>
        <td>{$row['quantity']}</td>
        <td>{$subtotal}</td>
        <td><a href='remove_from_cart.php?id={$row['cart_id']}'>حذف</a></td>
    </tr>";
}

echo "<tr><td colspan='3'><b>الإجمالي:</b></td><td colspan='2'><b>$total</b></td></tr>";
echo "</table>";

$conn->close();
?>
