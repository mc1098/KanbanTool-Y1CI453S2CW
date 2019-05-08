<?php

$mysqli = new mysqli(DB_PORT, DB_USER, DB_PW, DB_NAME);
if($mysqli->connect_error){
    exit('Could not connect');
}

$sql = "select * from stories";

$stmt = $mysqli->prepare($sql);
$stmt->execute();
$stmt->store_result();
$stmt->bind_result($cid, $cname, $cdesc, $ccomment, $cest, $cstatus);

$c = 0;

echo "{ \"stories\":[";
while($stmt->fetch()){
    if($c > 0)
        echo ", ";
    echo "{ \"id\":" . $cid . ", \"name\":\"" . $cname . "\", \"desc\":\"" . $cdesc . "\", \"comment\":\"" . $ccomment . "\", \"est\":\"" . $cest . "\", \"status\":" . $cstatus . " } ";
    $c++;
}
echo "] } ";
$stmt->close();

?>
