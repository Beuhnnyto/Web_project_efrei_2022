class Ball {
  constructor() { //Le constructeur
    this.r = 7; //Attribut rayon
    this.vel = new createVector(1, 1).mult(3); //Attribut vitesse
    this.dir = new createVector(1, 1); //Attribut direction
    this.pos = new createVector(width / 2, height - 100); //Attribut position

  }

  update() { //Méthode pour l'actualisation de la position
    this.pos.x += this.vel.x * this.dir.x;
    this.pos.y += this.vel.y * this.dir.y;
  }

  display() { //Méthode pour afficher la balle ellipse(x,y,diamètre horizontal, diamètre vertical)

    // Display the rocket image at the ball's position
    image(rocketImg, this.pos.x - this.r, this.pos.y - this.r, this.r * 8, this.r * 8);
    //noStroke();
  }

  checkEdges() { //Méthode pour les collision avec les bords
    if (this.pos.x > width - this.r && this.dir.x > 0) {
      this.dir.x *= -1; //On change le signe de la direction
    }
    if (this.pos.x < this.r && this.dir.x < 0) {
      this.dir.x *= -1;
    }
    if (this.pos.y < this.r && this.dir.y < 0) {
      this.dir.y *= -1;
    }
  }

  touche_bas() {
    if (this.pos.y > height - this.r && this.dir.y > 0) {
      return true;
    } else {
      return false;
    }
  }
  meets(paddle) { // Méthode pour détecter la collision avec le paddle
    if (
      this.pos.y < paddle.pos.y &&
      this.pos.y > paddle.pos.y - this.r &&
      this.pos.x > paddle.pos.x - this.r &&
      this.pos.x < paddle.pos.x + paddle.w + this.r
    ) {
      return true;
    } else {
      return false;
    }
  }

  meets(brick) {
    if (
      this.pos.y < brick.pos.y + brick.h &&
      this.pos.y > brick.pos.y - this.r &&
      this.pos.x > brick.pos.x - this.r &&
      this.pos.x < brick.pos.x + brick.w + this.r
    ) {
      return true;
    } else {
      return false;
    }
  }
}


class Brick {
  // Attribut de classe un dictionnaire de couleurs
  static COLORS = { 1: "#562187", 2: "#562187", 3: "#ffC0cb", 4: "#9664ff" };

  constructor(x, y, hits) {
    // Le constructeur
    this.w = 75; // Attribut longueur
    this.h = 20; // Attreibut largeur
    this.pos = new createVector(x, y); // Attribut position
    this.hits = hits; // Attribut clé pour la couleur
    this.col = Brick.COLORS[hits]; // La couleur
  }

  // Méthode pour afficher la brique
  display() {
    fill(Brick.COLORS[this.hits]);
    stroke("#ffffff"); // Couleur du bord
    strokeWeight(2); // Épaisseur des bords
    rect(this.pos.x, this.pos.y, this.w, this.h);
  }
}

class Paddle {
  constructor() {
    // Constructeur
    this.w = 180; // Attribut longueur du paddle
    this.h = 15; // Attribut largeur du paddle
    // La position du paddle avec un objet Pvector
    this.pos = new createVector(width / 2 - this.w / 2, height - 40);
    this.isMovingLeft = false; // Booléen pour mouvement à gauche
    this.isMovingRight = false; // Idem à droite
    this.stepSize = 20; // Pas pour le déplacement
  }

  // Méthode premettant l'affichage
  display() {
    fill("#b60202"); // Couleur de remplissage
    noStroke(); // Pas de "bord"
    // Affichage du rectangle rect(x,y,longueur, largeur)
    rect(this.pos.x, this.pos.y, this.w, this.h);
  }
  // Méthode pour actualiser l'affichage des déplacements
  update() {
    if (this.isMovingLeft) {
      this.move(-this.stepSize);
    } else if (this.isMovingRight) {
      this.move(this.stepSize);
    }
  }

  // Méthode qui gère le déplacement
  move(step) {
    this.pos.x += step;
  }
  // Méthode qui gère les collisions avec les bords
  checkEdges() {
    if (this.pos.x <= 0) {
      this.pos.x = 0;
    } else if (this.pos.x + this.w >= width) {
      this.pos.x = width - this.w;
    }
  }
}

let bricks; //on une liste qui contiendra la liste de toutes les briques qui n'ont pas été détruites par le joueur
let texte_centre; //on déclare une variable qui contient le texte affiché au centre de la fenêtre
let texte_centre_2; //on déclare une variable qui contient le texte affiché au centre de la fenêtre, à la deuxième ligne
let texte_centre_3;
let niv; //on déclare une variable qui contient le niveau actuel du joueur
let score; //on déclare une variable qui contient le score actuel du joueur
let vies; //on déclare une variable qui contient le nombre de vies qu'a le joueur
let temps_max;  //on déclare une variable qui contient le temps maximal qu'a le joueur pour réussir le niveau (1 min en millisecondes)
let temps_debut; //on déclare une variable qui nous servira à stocker l'horaire de début du niveau
let temps_depuis_debut; //on déclare une variable qui nous servira à stocker les secondes passées depuis le début du niveau
let temps_affichage_texte; //on déclare une variable où on mettra le temps auquel un message texte temporaire sera affiché afin de pouvoir l'enlever après quelques secondes
let stop_chrono; //on déclare une variable booléenne qui indique si le chronomètre est arrêté
let stop_game; //on déclare une variable booléenne qui indique si le jeu est en pause (utile quand le joueur perd et veut recommencer)
let playing_game; //on déclare une variable booléenne qui indique si le jeu est en cours
let img; //on déclare la variable qui contiendra l'image de fond d'écran
//let rocket; // On déclare la variable qui contiendra la rocket en png
let rocketImg;

function preload() { // fonction qui précharge les images 
  img = loadImage("background.jpg");
  rocketImg = loadImage("rocket.png");
}

function addBrick(x, y, hits){
  /*crée des briques et les stocke dans la liste 'bricks'*/
  var brick = new Brick(x, y, hits);// Crée des briques
  bricks.push(brick);// Ajoute les briques dans la liste "bricks"
}

function setup() { /* revoir savoir expliquer*/
  bricks = [];   // On initialise une liste qui contiendra la liste de toutes les briques qui n'ont pas été détruites par le joueur
  texte_centre = "Salut! Pour commencer a jouer appuie sur la souris, et pour jouer utilise les touches 'q' et 'd'";   // On initialise une variable qui contient le texte affiché au centre de la fenêtre
  texte_centre_2 = "Tu as 40 secondes pour finir le niveau";   // On initialise une variable qui contient le texte affiché au centre de la fenêtre, à la deuxième ligne
  niv = 1;  // On initialise une variable qui contient le niveau actuel du joueur
  score = 0;   // On initialise une variable qui contient le score actuel du joueur
  vies = 2;  // On initialise une variable qui contient le nombre de vies qu'a le joueur
  temps_max = 60000;  // On initialise une variable qui contient le temps maximal qu'a le joueur pour réussir le niveau (1 min en millisecondes)
  temps_debut = millis();  // On initialise une variable qui nous servira à stocker l'horaire de début du niveau
  temps_depuis_debut = 0;  // On initialise une variable qui nous servira à stocker les secondes passées depuis le début du niveau
  temps_affichage_texte = temps_max + 1;  // On initialise une variable où on mettra le temps auquel un message texte temporaire sera affiché afin de pouvoir l'enlever après quelques secondes
  stop_chrono = true;  // On initialise une variable booléenne qui indique si le chronomètre est arrêté
  stop_game = false;  // On initialise une variable booléenne qui indique si le jeu est en pause (utile quand le joueur perd et veut recommencer)
  playing_game = false;   // On initialise une variable booléenne qui indique si le jeu est en cours

  createCanvas(750, 400);  // On crée la fenêtre contenant le jeu
  paddle = new Paddle();  // On crée l'objet paddle
  ball = new Ball();   // On crée l'objet ball

  // Appel de la fonction addBrick pour ajouter les briques
  if (niv == 1) {    // Briques pour le niveau 1
    for (let x = 5; x < width - 80; x += 75) {
      addBrick(x + 37.5, 50, 2);
      addBrick(x + 37.5, 70, 2);
      addBrick(x + 37.5, 90, 2);
    }
  }
  if (niv == 2) {    // Briques pour le niveau 2
    for (let x = 5; x < width - 80; x += 75) {
      addBrick(x + 37.5, 50, 3);
      addBrick(x + 37.5, 70, 3);
      addBrick(x + 37.5, 90, 3);
      addBrick(x + 37.5, 110, 2);
      addBrick(x + 37.5, 130, 2);
      addBrick(x + 37.5, 150, 2);
    }
  }
  if (niv == 3) {    // Briques pour le niveau 3
    for (let x = 5; x < width - 80; x += 75) {
      addBrick(x + 37.5, 50, 4);
      addBrick(x + 37.5, 70, 4);
      addBrick(x + 37.5, 90, 4);
      addBrick(x + 37.5, 110, 4);
      addBrick(x + 37.5, 130, 3);
      addBrick(x + 37.5, 150, 3);
      addBrick(x + 37.5, 170, 3);
      addBrick(x + 37.5, 190, 3);
    }
  }
 /* let liste_powerup = [];  // On initialise une liste qui contiendra la liste des positions aléatoires des briques qui vont contenir un "power up"
  for (let i = 0; i < niv; i++) {
    let numero = floor(random(0, bricks.length - 1));  // On choisit un nombre au hasard
    liste_powerup.push(numero);  // On ajoute ce nombre dans la liste "liste_powerup"
  }
  for (let i = 0; i < liste_powerup.length; i++) {
    let largeur = bricks[liste_powerup[i]].x;  // On prend la largeur de chaque brique
    let hauteur = bricks[liste_powerup[i]].y;  // On prend la hauteur de chaque brique
    bricks.splice(liste_powerup[i], 1);  // On supprime la brique
    addBrick(largeur, hauteur, 1);  // On ajoute les nouvelles briques possédant un "power up" aux positions récupérées précédemment
  }*/
}

function draw() {
  background(img);
  /*let temps_depuis_debut = 0;
  let temps_affichage_texte = temps_max + 1;*/

  // On affiche les textes sur le jeu, en blanc et centrés (textes qui varie tout le long du programme)
  textAlign(CENTER);
  fill(255, 255, 255);
  text(texte_centre, width / 2, height / 2 + 60);
  text(texte_centre_2, width / 2, height / 2 + 80);

  if (playing_game) {
    // Appel des méthodes pour le paddle
    paddle.display();
    paddle.checkEdges();
    paddle.update();

    // Appel des méthodes pour la balle
    ball.display();
    ball.update();
    ball.checkEdges();  

    if (ball.touche_bas()) {  // Si la balle touche le bas de l'écran
      defaite();
      ball.dir.y *= -1;  // On fait rebondir la balle (utile si la fonction défaite n'a pas porté au Game Over)
    }

    if (ball.meets(paddle)) {  // Si la balle touche le paddle
      if (ball.dir.y > 0) {
        ball.dir.y *= -1;  // On fait rebondir la balle
      }
    }

    for (let i = 0; i < bricks.length; i++) {
      bricks[i].display();  // On affiche les briques
    }

    for (let i = bricks.length - 1; i >= 0; i--) {
      if (ball.meets(bricks[i])) {  // Si la balle touche une brique
        augmentation_score(bricks[i]);  // On augmente le score ou on évoque un "power up"

        ball.dir.y *= -1;  // On fait rebondir la balle
        bricks[i].hits -= 1;  // On diminue de 1 la couleur de la brique (pour les briques qui se détruisent en plus d'un coup)
        if (bricks[i].hits <= 1) {  // Si la couleur de la brique était vert ou orange
          bricks.splice(i, 1);  // On supprime la brique
        }
      }
    }
  }

  temps_depuis_debut = temps_passe();  // On calcule le temps passé depuis le début du niveau
  if (temps_depuis_debut == -1) {  // Si le temps est écoulé
    defaite();
  }

  // On affiche le temps, en blanc, en bas à gauche
  let texte_temps = "Temps : " + temps_depuis_debut + " s / " + temps_max + " s";
  textAlign(RIGHT);
  fill(255, 255, 255);
  text(texte_temps, width - 630, height - 10);

  // On affiche le niveau, en blanc, en bas à gauche
  let texte_niveau = "Niveau : " + niv;
  textAlign(RIGHT);
  fill(255, 255, 255);
  text(texte_niveau, width - 560, height - 10);

  // On affiche le score, en blanc, en bas à droite
  let texte_score = "Score : " + score;
  textAlign(LEFT);
  fill(255, 255, 255);
  text(texte_score, width - 70, height - 10);

  // On affiche les vies restantes, en blanc, en bas à droite
  let texte_vies = "Vies : " + vies;
  textAlign(LEFT);
  fill(255, 255, 255);
  text(texte_vies, width - 130, height - 10);

  if (bricks.length == 0) {  // Si toutes les briques ont été détruites
    victoire();  // Le joueur a passé le niveau
  }

  if (temps_affichage_texte + 3 <= temps_depuis_debut) {  // Si le texte affiché temporairement (suite à un "power up") est apparu depuis 3 secondes
    texte_centre = "";
    texte_centre_2 = "";
    temps_affichage_texte = temps_max + 1;  // On "supprime" la valeur de "temps_affichage_texte" (on fait en sorte que la condition précédente ne soit pas à nouveau vraie)
  }
}

function victoire() {
  // Interrompt le jeu et communique au joueur qu'il a completé le niveau et si le niveau réussit est le 3, il annonce au joueur la fin du jeu et son score
  texte_centre = "Bravo ! Pour continuer appuie sur 'G', pour quitter appuie sur 'J'";
  texte_centre_2 = "";
  playing_game = false;  // On arrête le jeu
  stop_chrono = true;  // On interrompt le chronomètre
  if (niv == 3) {  // S'il s'agit du dernier niveau
    texte_centre = "Bravo ! Tu as totalisé " + score + " points, le maximum des points !";
    texte_centre_2 = "Pour quitter appuie sur 'J', pour recommencer appuie sur 'K'";
    stop_game = true;  // On met en pause le jeu (variable utile si le joueur veut rejouer)
  }
}

function defaite() {
  // Si le joueur a encore des vies et le temps n'est pas écoulé, retire une vie, sinon interrompt le jeu et communique au joueur qu'il a perdu
  if (vies > 0 && "temps_depuis_debut" != -1) {  // Si le joueur a encore des vies et le temps n'est pas écoulé
    vies -= 1;  // Retire une vie
  } 
  else {
    if ("temps_depuis_debut" == -1) {  // Si le joueur a perdu car il a finit le temps
      texte_centre = "Temps écoulé ! GAME OVER";
  } else {  // Si le joueur a perdu pour manque de vies
      texte_centre = "Plus de vies ! GAME OVER";
      texte_centre_2 = "Pour quitter appuie sur 'J', pour recommencer appuie sur 'K'";
      stop_chrono = true;  // On interrompts le chronomètre
      playing_game = false;  // On arrête le jeu
      stop_game = true;  // On met en pause le jeu (variable utile si le joueur suite à cette défaite veut rejouer)
    }
  }
}


function augmentation_score(brique) {
  // Augmente le score en fonction de la couleur de la brique détruite
  if (brique.col== "#64ff96") {  // Si la brique est verte
    score += 1;
  } else if (brique.col == "#ffC0cb") {  // Si la brique est rose
    score += 2;
  } else if (brique.col == "#9664ff") {  // Si la brique est violette
    score += 3;
  } else if (brique.col == "#ff8000") {  // Si la brique est orange
    power_up();  // Active un "power up"
  }
}

function power_up() {
  let temps_affichage_texte = temps_max + 1;
  // Génère un 'pouvoir spécial' aléatoire au joueur
  let nombre = floor(random(0, 3));  // On prend un nombre aléatoire entier entre 0 et 2
  texte_centre = "Power Up activé";
  temps_affichage_texte = temps_passe();  // On prend l'heure où le texte précédent a été affiché
  if (nombre == 0) {  // Premier pouvoir spécial
    paddle.w += 20;  // On augmente la taille du paddle
    texte_centre_2 = "Taille du Paddle augmentée !";
  }
  if (nombre == 1) {  // Deuxième pouvoir spécial
  temps_max += 20;  // On rajoute du temps maximal
  texte_centre_2 = "20 secondes de plus !";
  }
  if (nombre == 2) {  // Troisième pouvoir spécial
    vies += 1;  // On donne une vie de plus
    texte_centre_2 = "Une vie de plus !";
  }
}

function lancerChrono() {
  // Met la variable "stop_chrono" à false et prend l'heure du lancement du chronomètre
  stop_chrono = false;
  temps_debut = millis();
    //Date.now();
}

function temps_passe() {
  if ("stop_chrono") { // Si le chrono n'est pas activé
    return 0;
  } else {
    temps_passe = millis() - temps_debut; // On prend le temps passé depuis le début du niveau
    if (temps_passe > temps_max) { // Si le joueur a fini le temps qu'il a à disposition
      return -1;
    } 
    else {
      return temps_passe;
    }
  }
}

function mousePressed() {
  if (!playing_game && !stop_game) {
    playing_game = true;
    texte_centre = "";
    texte_centre_2 = "";
    lancerChrono();
  }
}

function keyPressed() {
  if (key === "q" || key === "Q") {
    paddle.isMovingLeft = true; // On déplace le paddle vers la gauche
  } 
  else if (key === "d" || key === "D") {
    paddle.isMovingRight = true; // On déplace le paddle vers la droite
  } 
  else if (key === "g" || key === "G") {
    if (bricks.length !== 0 || niv > 2) { 
      return; // Ne rien faire
    } 
    else {
      niv = niv + 1; // On passe au niveau supérieur
      paddle.w -= 30; // On diminue la taille du paddle (pour rendre le niveau plus difficile)
      texte_centre = "Bravo ! Pour commencer le prochain niveau appuie sur la souris";
      texte_centre_2 = "Tu as 40 secondes de plus pour finir ce niveau";
      temps_max += 40; // On augmente le temps maximal du niveau de 40 secondes
      setup();
    }
  } 
  else if (key === "j" || key === "J") {
    remove(); // Sortir du jeu
  } 
  else if (key === "k" || key === "K") {
    if (!playing_game) {
      stop_game = false; // On met en pause le jeu
      niv = 1; // On retourne au niveau 1
      temps_max = 40; // On remet le temps max du niveau 1
      score = 0; // On reinitialise le score
      bricks = []; // On supprime les briques
      vies = 2; // On remet les vies au max
      texte_centre = "Salut ! Pour commencer a jouer appuie sur la souris, et pour jouer utilise les touches 'q' et 'd'";
      texte_centre_2 = "Tu as 40 secondes pour finir le niveau";
      setup();
    }
  }
}

// Annulation des mouvements quand on relâche la touche
function keyReleased(){
  paddle.isMovingRight = false;
  paddle.isMovingLeft = false;
};
