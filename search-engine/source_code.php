<?php

// make sure browsers see this page as utf-8 encoded HTML
header('Content-Type: text/html; charset=utf-8');

$limit = 10;
$query = isset($_REQUEST['q']) ? $_REQUEST['q'] : false;
$results = false;
$path = "/home/aayushkhanna/Desktop/IR/solr-7.5.0/nypost/";

if ($query)
{
  

  // The Apache Solr Client library should be on the include path
  // which is usually most easily accomplished by placing in the
  // same directory as this script ( . or current directory is a default
  // php include path entry in the php.ini)
  require_once('solr-php-client/Apache/Solr/Service.php');


  if (!isset($hashMap)) {
    $hashMap = array();
    if (($fopen = fopen("URLtoHTML_nypost.csv", "r")) !== FALSE) {
        while (($data = fgetcsv($fopen, 1000, ",")) !== FALSE) {
            $file = $path.$data[0];
            $url = $data[1];
            $hashMap[$file] = $url;
            // echo $file."->".$url."<br>";
        }
        fclose($fopen);
    }

  }


  // create a new solr service instance - host, port, and webapp
  // path (all defaults in this example)
  $solr = new Apache_Solr_Service('localhost', 8983, '/solr/irhw4');


  // if magic quotes is enabled then stripslashes will be needed
  if (get_magic_quotes_gpc() == 1)
  {
    $query = stripslashes($query);
  }

  // in production code you'll always want to use a try /catch for any
  // possible exceptions emitted  by searching (i.e. connection
  // problems or a query parsing error)
  try
  {
    if(isset($_REQUEST['sortby'])) {
      $additionalParameters = array(
        'sort' => $_REQUEST['sortby'],
      );
      $results = $solr->search($query, 0, $limit, $additionalParameters); 
    }
  }
  catch (Exception $e)
  {
    // in production you'd probably log or email this error to an admin
    // and then show a special message to the user but for this example
    // we're going to show the full exception
    die("<html><head><title>SEARCH EXCEPTION</title><body><pre>{$e->__toString()}</pre></body></html>");
  }
}

?>
<html>
  <head>
    <title>IR HW 4 - FALL 2018</title>
  </head>
  <body>
    <form  accept-charset="utf-8" method="get">
      <label for="q">Search:</label>
      <input id="q" name="q" type="text" value="<?php echo htmlspecialchars($query, ENT_QUOTES, 'utf-8'); ?>"/>
      <select name="sortby" id="sortby">
        <option value="score desc">Lucene</option>
        <option value="pageRankFile desc" <?php if(isset($_REQUEST['algorithm']) && $_REQUEST['algorithm']=="pageRankFile desc") { echo "selected"; } ?> >PageRank</option>
      </select>
      <input type="submit"/>
    </form>

  <?php
  // display results
  if ($results)
  {
    $total = (int) $results->response->numFound;
    $start = min(1, $total);
    $end = min($limit, $total);
  ?>

    <div>Results <?php echo $start; ?> - <?php echo $end;?> of <?php echo $total; ?>:</div>

    <ol>
    <?php
      // iterate result documents
      foreach ($results->response->docs as $doc)
      {
        // if the url is already present no need to fetch from hashMap
        if($doc->og_url) {
          $url = $doc->og_url;
        }
        else {
          $url = $hashMap[$doc->id];
        }
    ?>
      <li>
        <div>
          <h4>
            <b>Title:</b>
            <a href="<?php echo $url ?>" class="title"><?php echo $doc->title ?></a>
          </h4>
          <?php if ($url) { ?>
          <p>
            <b>Link:</b>
            <a href="<?php echo $url ?>" class="link"><?php echo $url ?></a>
          </p>
          <?php } ?>
          <?php if ($doc->og_description) { ?>
          <p class="description">
            <b>Description: </b>
            <?php echo $doc->og_description ?>          
          </p>
          <?php } ?>
        </div>
      </li>
    <?php
      }
    ?>
    </ol>
  <?php
  }
  ?>
  </body>
</html>