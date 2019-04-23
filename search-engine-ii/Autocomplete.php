<?php 

$input = isset($_REQUEST['input']) ? $_REQUEST['input'] : false;
$url = "http://localhost:8983/solr/irhw4/suggest?q=" . urlencode($input);
$json = file_get_contents($url);
echo $json;

?>