<?php

$mysqli = new mysqli(DB_PORT, DB_USER, DB_PW, DB_NAME);
if($mysqli->connect_error){
    exit('Could not connect');
}

$sql = "update stories set story_status = ?, story_comment = ? where story_id = ?";

$stmt = $mysqli->prepare($sql);
$stmt->bind_param("isi", $_GET['status'], $_GET['comment'], $_GET['id']);
$stmt->execute();
echo $stmt->affected_rows;
$stmt->close();

?>
