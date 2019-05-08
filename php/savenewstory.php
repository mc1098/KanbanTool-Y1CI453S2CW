<?php

$mysqli = new mysqli(DB_PORT, DB_USER, DB_PW, DB_NAME);
if($mysqli->connect_error){
    exit('Could not connect');
}


$sql = "insert into stories (story_name, story_desc, story_est, story_status) 
values 
(?, ?, ?, ?)";

$stmt = $mysqli->prepare($sql);
$stmt->bind_param("sssi", $_GET['name'], $_GET['desc'], $_GET['est'], $_GET['status']);
$stmt->execute();
echo $mysqli->insert_id;
$stmt->close();

?>
