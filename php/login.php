<?php

$mysqli = new mysqli(DB_PORT, DB_USER_PREFIX.$_POST["user"], $_POST["pass"], DB_NAME);
if($mysqli->connect_error){
    exit('Could not connect');
}
echo "true";

?>