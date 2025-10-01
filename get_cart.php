<?php
include 'db.php';

$sql = "SELECT * FROM cart_items ORDER BY id DESC LIMIT 1"; // آخر سلة محفوظة
$result = $conn->query($sql);

if($result->num_rows > 0){
    $row = $result->fetch_assoc();
    echo $row['data'];
} else {
    echo "لا توجد سلة";
}
?>
