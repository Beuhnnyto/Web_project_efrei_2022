<?php
  $nom = $_POST["nom"];
  $prenom = $_POST["prenom"];
  $genre = $_POST["genre"];
  $email = $_POST["email"];
  $numero = $_POST["numero"];

  //db connection
  $conn = new mysqli('localhost','root','','injectmedaddy');
  if($conn->connect_error){
    die('Connection Failed : '.$conn->connect_error);
    
  }else{
    $stmt = $conn->prepare("insert into registration(nom,prenom,genre,email,numero)
values(?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssi", $nom, $prenom, $genre, $email, $nuemro);
    $stmt->execute();
    echo "registration success";
    $stmt->close();
    $conn->close();
  }
  
?>