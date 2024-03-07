<?php

$targetPath = "../uploads" . basename($_FILES['studentImage']['name']);
move_uploaded_file($_FILES['studentImage']['tmp_name'], $targetPath);

?>