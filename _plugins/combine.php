<?php

  $files = array(
    // "../_site/assets/javascripts/common/jquery.min.js",
    "../_site/assets/javascripts/common/socialite.js",
    "../_site/assets/javascripts/common/init.js"
  );

  echo "Starting JavaScript" . "\n";
  $jsContent = "/* Combined Javascript */";
  foreach ($files as $file) {
    $jsContent .= "\n/* File :: " . str_replace("../_site/assets/javascripts/common/", "", $file) . " */\n" . file_get_contents($file) . "\n";
    echo "Appended file: " . $file . "\n";
  };

  file_put_contents("../assets/javascripts/common/common_all.js", $jsContent);
  echo "Writing output file: ../assets/javascripts/common/common_all.js" . "\n";

  $files = array(
    "../_site/assets/stylesheets/common/pure.css",
    "../_site/assets/stylesheets/common/grids-responsive.css",
    "../_site/assets/stylesheets/common/typography.css",
    "../_site/assets/stylesheets/common/syntax.css",
    "../_site/assets/stylesheets/common/blog.css",
    "../_site/assets/stylesheets/common/styles.css"
  );

  echo "Starting CSS" . "\n";
  $cssContent = "/* Combined CSS */";
  foreach ($files as $file) {
    $cssContent .= "\n/* File :: " . str_replace("../_site/assets/stylesheets/common/", "", $file) . " */\n" . file_get_contents($file) . "\n";
    echo "Appended file: " . $file . "\n";
  };

  file_put_contents("../assets/stylesheets/common/common_all.css", $cssContent);
  echo "Writing output file ../assets/stylesheets/common/common_all.css" . "\n";

?>