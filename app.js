class Game {
	
	constructor() {
		this.canvas = document.querySelector("#canvas");
		this.context = this.canvas.getContext("2d");
    this.setInitialStatus();
		this.setListeners();
  }
  
  setInitialStatus(){
    this.player = this.spawnPlayer();
    this.enemies = [];
    this.shots = [];
    this.over = false;
    this.score = 0;
    this.inputs = { up: false, down: false, left: false, right: false, shoot: false, focus: false , restart: false};
    this.enemyRate = 400;
    this.enemyRateCounter = 100;  
    this.minEnemyRate = 150;
    this.multiplier = 3;
    this.multiplierCounter = 3;
  }

	start () {
		window.setInterval(() =>{
			this.draw();
		},16);

		window.setInterval(() =>{
			this.updateState();
		},16);
	}

	draw () {
    if (!this.over){
		  this.clearCanvas();
      this.drawPlayer();
      this.drawShots();
      this.drawEnemies();
    } else {
      this.drawGameOver();
    }
	}

	drawPlayer() {
		const ctx = this.context;
		const oPlayer = this.player;

    ctx.beginPath();
    ctx.arc(oPlayer.x, oPlayer.y, oPlayer.radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = oPlayer.color;
    ctx.fill();
    
  }
  
  drawShots() {
    const ctx = this.context;
    const aShots = this.shots;

    aShots.forEach(shot =>{
      ctx.beginPath();
      ctx.arc(shot.x, shot.y, shot.radius, 0, 2 * Math.PI, false);
      ctx.fillStyle = shot.color;
      ctx.fill();
    });
  }

	clearCanvas () {
		const ctx = this.context;
		const vCanvas = this.canvas;
		ctx.clearRect(0, 0, vCanvas.width, vCanvas.height);
	}

	drawEnemies () {
		const aEnemies = this.enemies;
		const ctx = this.context;

		aEnemies.forEach(enemy => {
			ctx.fillStyle = enemy.color;
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, enemy.radius, 0, 2 * Math.PI, false);
      ctx.fillStyle = enemy.color;
      ctx.fill();
		});
  }
  
  drawGameOver(){
		const ctx = this.context;
    const vCanvas = this.canvas;
    ctx.font = "16px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("Game Over, press R", vCanvas.width/5, vCanvas.height/2); 
  }

	spawnPlayer () {
    const vCanvas = this.canvas 
    const vXstartPos = Math.ceil(vCanvas.width / 2);
    const vYstartPos = Math.ceil(vCanvas.height * 0.8);
		return {
      x : vXstartPos,
      y : vYstartPos,
      color : this.getRandomColor(),
      radius : 5,
      speed: 4,
      focusSpeed : 2
		};
  }
  
  spawnEnemy () {
    const vCanvas = this.canvas; 
    const vXPos = Math.ceil(Math.random() * vCanvas.width);
    const vYPos = Math.ceil(vCanvas.height * 0.2);
		return {
      x : vXPos,
      y : vYPos,
      color : this.getRandomColor(),
      radius : 7,
      killed : false,
      hp : 50,
      shotCooldown: 40,
      shotCounter: 40,
      shotSpeed: 5
		};
  }

	setListeners(){

		const setInputs = (event, state) =>{
	    if(event.keyCode === 39) {
	    	this.inputs.right = state;
	    }
	    else if(event.keyCode === 37) {
	     	this.inputs.left = state;
	    }
	    if(event.keyCode === 40) {
	     	this.inputs.down = state;
	    }
	    else if(event.keyCode === 38) {
	     	this.inputs.up = state;	     	
      }
	    else if(event.keyCode === 88) {
        this.inputs.shoot = state;	     	
      }     
      else if(event.keyCode === 16) {
        this.inputs.focus = state;	     	
      }
      else if(event.keyCode === 82) {
        this.inputs.restart = state;	     	
      }       
		};

		const keyDownHandler = (event) => {
			event.preventDefault()
			setInputs(event,true);
		};

		const keyUpHandler = (event) => {
			event.preventDefault()
			setInputs(event,false);
		};		

		document.addEventListener('keydown', keyDownHandler, false);
		document.addEventListener('keyup', keyUpHandler, false);		
	}

	updateState(){
    if (!this.over){
      this.updateScore();
      this.updateDiff();
      this.updatePlayer();
      this.updateEnemies();
      this.updateShots();
      this.checkCollision();
      this.addEnemies();
    } else {
      this.checkRestart();
    }
  }
  
  addEnemies(){
    let vCounter = this.enemyRateCounter;
    //console.log(vCounter);

    if (this.enemyRateCounter !== 0){
      this.enemyRateCounter--;
    } else {
      this.increaseDifficulty();
      this.addEnemy();
      this.enemyRateCounter = this.enemyRate;
    }
  }

  increaseDifficulty(){

    if (this.multiplierCounter !== 0){
      this.multiplierCounter--;
    } else {
      if (this.enemyRate >= this.minEnemyRate){
        this.enemyRate = this.enemyRate - 50;
        this.updateDiff();
      }
      this.multiplierCounter = this.multiplier;
    }

  }

	updatePlayer(){

		const oInputs = this.inputs;
    const oPlayer = this.player;
    const vCanvas = this.canvas;

    const vSpeed = oInputs.focus ? oPlayer.focusSpeed : oPlayer.speed;

		if (oInputs.up){
			if ( (oPlayer.y - oPlayer.radius ) > 0){
				oPlayer.y -= vSpeed;
			}
		}
		if (oInputs.down){
      if (oPlayer.y < ( vCanvas.height - oPlayer.radius) ){
				oPlayer.y += vSpeed;
			}
		}
		if (oInputs.left){
			if ( (oPlayer.x - oPlayer.radius ) > 0){
				oPlayer.x -= vSpeed;
			}
		}
		if (oInputs.right){
			if (oPlayer.x < (vCanvas.width - oPlayer.radius)){
				oPlayer.x += vSpeed;
			}
    }
    
    if (oInputs.shoot) {
      this.shoot();
    }
  }
  
  updateEnemies(){
    let aEnemies = this.enemies;

    aEnemies.forEach(enemy =>{
      if (enemy.shotCounter === 0){
        this.enemyShoot(enemy.x, enemy.y, enemy.shotSpeed, enemy.color);
        enemy.shotCounter = enemy.shotCooldown;
      } else {
        enemy.shotCounter--;
      }
    });
  }

  checkRestart(){
    const oInputs = this.inputs;
    
    if (oInputs.restart){
      this.setInitialStatus();
    }
  }

  enemyShoot(xIn, yIn, s, colorIn){
    this.shots.push({
      x : xIn,
      y : yIn + 10,
      speed : -5,
      radius : 2,
      hit : false,
      color : colorIn
    });
  }
  
  shoot(){
    const oPlayer = this.player;
    this.shots.push({
      x : oPlayer.x,
      y : oPlayer.y - 10,
      speed : 10,
      radius : 2,
      hit : false,
      color : oPlayer.color
    });
  }

  updateShots(){
    const vCanvas = this.canvas;
    let aShots = this.shots;

    aShots.forEach(shot => {
      shot.y -= shot.speed;
    });

    aShots = aShots.filter( shot => shot.y > -10 && shot.y < vCanvas.height + 10 );
  }

	addEnemy(){
    if (!this.over){
      this.enemies.push(this.spawnEnemy());
    }
	}

	checkCollision(){
		const aEnemies = this.enemies;
    const aShots = this.shots;
    const oPlayer = this.player;
		
		aEnemies.forEach(enemy =>{
      aShots.forEach(shot =>{
        const vDistance = Math.sqrt( (shot.x - enemy.x)**2 + (shot.y - enemy.y)**2 );
        if (vDistance < enemy.radius + shot.radius){
          enemy.hp--;
          shot.hit = true;
        }
      });
      if (enemy.hp <= 0){
        enemy.killed = true;
        this.addScore();
      }
    });
    
    aShots.forEach(shot =>{
      const vDistance = Math.sqrt( (shot.x - oPlayer.x)**2 + (shot.y - oPlayer.y)**2 );
      if (vDistance < oPlayer.radius + shot.radius){
        this.over = true;
      }
    });

    this.enemies = aEnemies.filter( enemy => !enemy.killed);
    this.shots = aShots.filter( shot => !shot.hit);
	}

	addScore() {
		this.score++;
		this.updateScore();
	}

	updateScore() {
		document.querySelector("#score").innerText = "Score: " + this.score;
  }

	updateDiff() {
    var vDiff = ((400 - this.enemyRate) / 50 ) + 1;
		document.querySelector("#diff").innerText = "Difficulty: " + vDiff;
  }  
  
  getRandomColor() {
	  const letters = '0123456789ABCDEF';
	  let color = '#';
	  for (var i = 0; i < 6; i++) {
	    color += letters[Math.floor(Math.random() * 16)];
	  }
	  return color;
	}

}

const loadGame = () => {
  const oGame = new Game();
  oGame.start();
};