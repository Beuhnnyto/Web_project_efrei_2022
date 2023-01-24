class Enemy {
  // méthode constructeur pour initialiser les propriétés de l'ennemi
  constructor(x, y, imageNumber) {
    this.x = x; // la position x de l'ennemi
    this.y = y; // la position y de l'ennemi
    this.width = 44; // la largeur de l'ennemi
    this.height = 32; // la hauteur de l'ennemi
    this.image = new Image(); // création d'un nouvel objet image
    this.image.src = `enemy${imageNumber}.png`; // source de l'image à partir du fichier
  }

  // méthode pour dessiner l'ennemi sur le canvas
  draw(ctx) {
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  }
  
  // méthode pour déplacer l'ennemi en lui ajoutant des valeurs de vélocités x et y
  move(xVelocity, yVelocity) {
    this.x += xVelocity; // ajout de la vitesse x à la position x
    this.y += yVelocity; // ajout de la vitesse y à la position y
  }

  // méthode pour détecter une collision entre l'ennemi et un autre sprite
  collideWith(sprite) {
    // vérification de la superposition des deux sprites sur les axes x et y
    if (
      this.x + this.width > sprite.x &&
      this.x < sprite.x + sprite.width &&
      this.y + this.height > sprite.y &&
      this.y < sprite.y + sprite.height
    ) {
      return true; // si il y a superposition, retourne true
    } else {
      return false; // si il n'y a pas de superposition, retourne false
    }
  }
}

class EnemyController {
  enemyMap = [
    [1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1],
    [1, 2, 1, 2, 1, 1, 1, 2, 1, 2, 1],
    [0, 1, 1, 2, 2, 1, 2, 2, 1, 1, 0],
    [0, 0, 1, 1, 2, 2, 2, 1, 1, 0, 0],
    [0, 0, 0, 1, 2, 2, 2, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0]
  ];
  enemyRows = [];

  currentDirection = MovingDirection.right;
  xVelocity = 0;
  yVelocity = 0.5;
  defaultXVelocity = 1;
  defaultYVelocity = 0.37;
  //moveDownTimerDefault = 30;
  //moveDownTimer = this.moveDownTimerDefault;
  fireBulletTimerDefault = 100; 
  fireBulletTimer = this.fireBulletTimerDefault;

   // constructeur qui initialise les propriétés canvas, enemyBulletController et playerBulletController
  constructor(canvas, enemyBulletController, playerBulletController) {
    this.canvas = canvas;
    this.enemyBulletController = enemyBulletController;
    this.playerBulletController = playerBulletController;

    this.createEnemies();
  }

  // méthode pour dessiner les ennemis sur le canvas
  draw(ctx) {
    this.decrementMoveDownTimer(); // décrémente le moveDownTimer
    this.updateVelocityAndDirection();  // met à jour la vélocité et la direction 
    this.collisionDetection();
    this.drawEnemies(ctx);
    //this.resetMoveDownTimer();
    this.fireBullet();
  }

  // vérifie les collisions entre les balles du joueur et les ennemis
  collisionDetection() {
    this.enemyRows.forEach((enemyRow) => {
      enemyRow.forEach((enemy, enemyIndex) => {
        if (this.playerBulletController.collideWith(enemy)) {
          enemyRow.splice(enemyIndex, 1);
        }
      });
    });

    this.enemyRows = this.enemyRows.filter((enemyRow) => enemyRow.length > 0);
  }

  // fait tirer une balle aléatoirement depuis un ennemi
  fireBullet() {
    this.fireBulletTimer--;
    if (this.fireBulletTimer <= 0) {
      this.fireBulletTimer = this.fireBulletTimerDefault;
      const allEnemies = this.enemyRows.flat();
      const enemyIndex = Math.floor(Math.random() * allEnemies.length);
      const enemy = allEnemies[enemyIndex];
      this.enemyBulletController.shoot(enemy.x, enemy.y, -3);
    }
  }

   // réinitialise le compteur de descente si nécessaire
  /*resetMoveDownTimer() {
    if (this.moveDownTimer <= 0) {
      this.moveDownTimer = this.moveDownTimerDefault;
    }
  }*/

  // décrémente le compteur de descente si la direction actuelle est vers le bas
  decrementMoveDownTimer() {
    if (
      this.currentDirection === MovingDirection.downLeft ||
      this.currentDirection === MovingDirection.downRight
    ) {
      this.moveDownTimer--;
    }
  }

  // met à jour la direction et la vélocité en fonction de la position des ennemis et des dimensions du canvas
  updateVelocityAndDirection() {
    for (const enemyRow of this.enemyRows) {
      if (this.currentDirection == MovingDirection.right) {
        this.xVelocity = this.defaultXVelocity;
        this.yVelocity = 0;
        const rightMostEnemy = enemyRow[enemyRow.length - 1];
        if (rightMostEnemy.x + rightMostEnemy.width >= this.canvas.width - 30) { //centrer les ennemis 
          this.currentDirection = MovingDirection.downLeft;
          break;
        }
      } else if (this.currentDirection === MovingDirection.downLeft) {
        if (this.moveDown(MovingDirection.left)) {
          break;
        }
      } else if (this.currentDirection === MovingDirection.left) {
        this.xVelocity = -this.defaultXVelocity;
        this.yVelocity = 0;
        const leftMostEnemy = enemyRow[0];
        if (leftMostEnemy.x <= 0) {
          this.currentDirection = MovingDirection.downRight;
          break;
           }
      } else if (this.currentDirection === MovingDirection.downRight) {
        if (this.moveDown(MovingDirection.right)) {
          break;
        }
      }
    }
  }

  // fait descendre les ennemis d'une ligne et change la direction
  moveDown(newDirection) {
    this.xVelocity = 0;
    this.yVelocity = this.defaultYVelocity;
 
  }

  // dessine tous les ennemis sur le canvas
  drawEnemies(ctx) {
    this.enemyRows.flat().forEach((enemy) => {
      enemy.move(this.xVelocity, this.yVelocity);
      enemy.draw(ctx);
    });
  }

  // crée les ennemis en fonction de la map d'ennemis
  createEnemies() {
    this.enemyMap.forEach((row, rowIndex) => {
      this.enemyRows[rowIndex] = [];
      row.forEach((enemyNubmer, enemyIndex) => {
        if (enemyNubmer > 0) {
          this.enemyRows[rowIndex].push(
            new Enemy(enemyIndex * 50, rowIndex * 35, enemyNubmer) //fix
          );
        }
      });
    });
  }

  // vérifie les collisions entre un sprite et les ennemis
  collideWith(sprite) {
    return this.enemyRows.some((enemyRow) =>
      enemyRow.some((enemy) => enemy.collideWith(sprite))
    );
  }
}
  

class Bullet {
  constructor(canvas, x, y, velocity, bulletColor) {
    this.canvas = canvas;
    this.x = x;
    this.y = y;
    this.velocity = velocity;
    this.bulletColor = bulletColor;

    this.width = 5;
    this.height = 20;
  }

  // dessine la balle sur le canvas
  draw(ctx) {
    this.y -= this.velocity; // déplace la balle en fonction de sa vitesse
    ctx.fillStyle = this.bulletColor; // définit la couleur de la balle
    ctx.fillRect(this.x, this.y, this.width, this.height); // dessine la balle
  }

  // vérifie si la balle entre en collision avec un sprite
  collideWith(sprite) {
    if (
      this.x + this.width > sprite.x &&
      this.x < sprite.x + sprite.width &&
      this.y + this.height > sprite.y &&
      this.y < sprite.y + sprite.height
    ) {
      return true; // retourne vrai si il y a collision
    } else {
      return false; // retourne faux si il n'y a pas de collision
    }
  }
}

class BulletController {
  bullets = []; // liste qui stocke toutes les balles
  timeTillNextBulletAllowed = 0;

  constructor(canvas, maxBulletsAtATime, bulletColor) {
    this.canvas = canvas;
    this.maxBulletsAtATime = maxBulletsAtATime;
    this.bulletColor = bulletColor;

  }

  // dessine les balles sur le canvas et met à jour leur position
  draw(ctx) {
    // filtre les balles pour ne garder que celles qui sont encore visibles sur le canvas
    this.bullets = this.bullets.filter(
      (bullet) => bullet.y + bullet.width > 0 && bullet.y <= this.canvas.height
    );
    // dessine chaque balle
    this.bullets.forEach((bullet) => bullet.draw(ctx));
    // décrémente le temps avant de pouvoir tirer à nouveau
    if (this.timeTillNextBulletAllowed > 0) {
      this.timeTillNextBulletAllowed--;
    }
  }

  // vérifie si une balle entre en collision avec un sprite
  collideWith(sprite) {
    const bulletThatHitSprite = this.bullets.find((bullet) =>
      bullet.collideWith(sprite)
    );

    if (bulletThatHitSprite) {
      // récupère l'index de la balle qui est entrer en collision
      const bulletIndex = this.bullets.indexOf(bulletThatHitSprite);
      this.bullets.splice(bulletIndex, 1); // supprime la balle qui a entrer en collision
      return true;
    }

    return false;
  }

  // methode pour tirer une balle
  shoot(x, y, velocity, timeTillNextBulletAllowed = 0) {
    // vérifie si le temps pour pouvoir tirer à nouveau est écoulé et si on a pas atteint la limite de balles
    if (
      this.timeTillNextBulletAllowed <= 0 &&
      this.bullets.length < this.maxBulletsAtATime //////////////////////
    ) {
      //Si c'est le cas, une nouvelle balle est créée et ajoutée à la liste des balles en cours de jeu
      const bullet = new Bullet(this.canvas, x, y, velocity, this.bulletColor);
      this.bullets.push(bullet);
      this.timeTillNextBulletAllowed = timeTillNextBulletAllowed; //le compteur de temps pour le prochain tir est mis à jour.
    }
  }
}

class Player {
  rightPressed = false;
  leftPressed = false;
  shootPressed = false;

  constructor(canvas, velocity, bulletController) {
    this.canvas = canvas;
    this.velocity = velocity;
    this.bulletController = bulletController;

    this.x = this.canvas.width / 2; // position x initiale du joueur, au milieu de l'écran
    this.y = this.canvas.height -75; // position y initiale du joueur, en bas de l'écran
    this.width = 50; // largeur du joueur
    this.height = 48; // hauteur du joueur
    this.image = new Image();
    this.image.src = "player.png";

    // écouteurs d'événements pour les entrées clavier
    document.addEventListener("keydown", this.keydown);
    document.addEventListener("keyup", this.keyup);
  }

  draw(ctx) {
    if (this.shootPressed) { //vérifie si le bouton shoot est pressé
      this.bulletController.shoot(this.x + this.width / 2, this.y, 4, 10);
    }
    this.move();
    this.collideWithWalls();
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  }

  collideWithWalls() {
    //Vérifie si la coordonnée x de l’objet est inférieure à 0,  empêche déplacement gauche qui sort
    if (this.x < 0) {
      this.x = 0;
    }
    if (this.x > this.canvas.width - this.width) { //Vérifie si la coordonnée x de l’objet est supérieure à la largeur de lu canvas moins la largeur de l’objet. empêche déplacement droite qui sort
      this.x = this.canvas.width - this.width;
    }
  }

  move() {
    if (this.rightPressed) {
      this.x += this.velocity;
    } else if (this.leftPressed) {
      this.x += -this.velocity;
    }
  }

  keydown = (event) => {
    if (event.code == "ArrowRight") { // si flèche droite appuyé booléan rightPressed = true pour déplacer player
      this.rightPressed = true;
    }
    if (event.code == "ArrowLeft") {// si flèche gauche appuyé booléan leftPressed = true pour déplacer player
      this.leftPressed = true;
    }
    if (event.code == "Space") {// si espace appuyé booléan shootPressed = true pour faire tirer player
      this.shootPressed = true;
    }
  };

  keyup = (event) => {
    if (event.code == "ArrowRight") {
      this.rightPressed = false;
    }
    if (event.code == "ArrowLeft") {
      this.leftPressed = false;
    }
    if (event.code == "Space") {
      this.shootPressed = false;
    }
  };
}



const MovingDirection = {
  left: 0,
  right: 1,
  downLeft: 2,
  downRight: 3,
};
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 600;
canvas.height = 600;

const background = new Image();
background.src = "space.png";

const playerBulletController = new BulletController(canvas, 10, "red", true);
const enemyBulletController = new BulletController(canvas, 4, "white", false);
const enemyController = new EnemyController(canvas, enemyBulletController,playerBulletController);
const player = new Player(canvas, 3, playerBulletController);

let isGameOver = false;
let didWin = false;

function game() {
  checkGameOver();
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
  displayGameOver();
  if (!isGameOver) {
    enemyController.draw(ctx);
    player.draw(ctx);
    playerBulletController.draw(ctx);
    enemyBulletController.draw(ctx);
  }
}

function displayGameOver() {
  if (isGameOver) {
    let text = didWin ? "You Win" : "Game Over";
    let textOffset = didWin ? 3.5 : 5;

    ctx.fillStyle = "white";
    ctx.font = "70px Arial";
    ctx.fillText(text, canvas.width / textOffset, canvas.height / 2);
  }
}

function checkGameOver() {
  if (isGameOver) {
    return;
  }

  if (enemyBulletController.collideWith(player)) { //si balle d'un ennemi touche joueur, perdu, fin du jeu
    isGameOver = true;
  }

  if (enemyController.collideWith(player)) { // si ennemis touche joueur , perdu, fin du jeu
    isGameOver = true;
  }

  if (enemyController.enemyRows.length === 0) { // si liste des enemis est vide, gagné, fin du jeu
    didWin = true;
    isGameOver = true;
  }
}

setInterval(game, 1000 / 60); //appelle de la fonction game 60 fois par seconde pour mettre à jour l'état du jeu