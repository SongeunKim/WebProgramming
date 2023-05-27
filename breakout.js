let mouseX;
let scoreBar;
let board;
let boardCtx;
let boardLeft;
const boardWidth = 900;
const boardHeight = 600;
let game;
const PI = Math.PI;

//ready
$(document).ready(function() {
	//initialize
	mouseX = 0;
	scoreBar = $("#score-bar");
	board = $("#board").get(0);
	boardCtx = board.getContext("2d");
	boardLeft = board.getBoundingClientRect().left;
	board.width = boardWidth;
	board.height = boardHeight;
	game = new Game();

	//events
	$(document).mousemove(function(e) {
		mouseX = e.pageX - boardLeft;
	})
	$(document).click(function(){
		switch(game.status){
		case 0:
			break;
		case 1:
			game.status = 2;
		case 2:
			//...
			break;
		}

	})
	$(window).resize(function(e) {
		boardLeft = board.getBoundingClientRect().left;
	})
	//...

	//event handlers
	$("#main-start-button").click(function() {
		$("#level").css("display", "block");
		popUp($("#level"));
	});
	$("#level-easy").click(function(){
		$("#level").css("display", "none");
		$("#main-div").hide();
		$("#canvas-wrapper").css("display", "block");
		$("#board").css("background-image", "url(src/background1.jpg)")
		game.difficulty = 0;
		game.start();
	});
	$("#level-normal").click(function(){
		$("#level").css("display", "none");
		$("#main-div").hide();
		$("#canvas-wrapper").css("display", "block");
		$("#board").css("background-image", "url(src/background2.jpg)")
		game.difficulty = 1;
		game.start();
	});
	$("#level-hard").click(function(){
		$("#level").css("display", "none");
		$("#main-div").hide();
		$("#canvas-wrapper").css("display", "block");
		$("#board").css("background-image", "url(src/background3.jpg)")
		game.difficulty = 2;
		game.start();
	});
	$("#main-settings-button").click(function(){
		$("#settings").css("display", "block");
		popUp($("#settings"));
	});
	
	//...
});

class Game {
	//생성자
	constructor() {
		this.bar = new Bar("src/bar.png", 100, 20, 10);
		this.brick = new Brick("src/block.png", "src/block2.png", "src/question_block.png", 3, 18, 45, 45, 0, 45, 45);
		this.ball = new Ball("src/ball.png", "src/ball_invinc.png", 5);
		this.items = new Items();
		this.score = 0;
		this.life = 0;
		this.status = 0; //0: not ready, 1: ready, 2: running
		this.difficulty = 0; //0: easy, 1: normal, 2: hard
		this.timer = 0;
		this.timerPerFrame = 0;
		this.interval; //update interval
		//...
	}

	//게임 시작 시 한번 호출되는 함수
	start() {
		game.init();
		setTimeout(() => this.status = 1, 100);
		this.interval = setInterval(game.update, 10);
		//...
	}

	//게임 시작 후 매 프레임마다 호출되는 함수
	update() {
		game.calculate();
		game.draw();
		game.updateScoreBar();
		//...
	}

	//게임 종료 시 한번 호출되는 함수
	stop() {
		clearInterval(this.interval);
		//...
	}

	//게임 환경 초기화 함수
	init() {
		boardLeft = board.getBoundingClientRect().left;
		this.score = 0;
		this.life = 3;
		this.bar.init(100);
		switch (this.difficulty) {
		case 0:
			this.timer = 999;
			this.timerPerFrame = 0;
			this.ball.init(4);
			this.brick.init(1);
			break;
		case 1:
			this.timer = 180;
			this.timerPerFrame = 0.01;
			this.ball.init(5);
			this.brick.init(1);
			break;
		case 2:
			this.timer = 180;
			this.timerPerFrame = 0.01;
			this.ball.init(6);
			this.brick.init(2);
			break;
		default:
			break;
		}
		//...
	}

	//게임 내 수치 계산 함수
	calculate() {
		if(this.timer <= 0) {
			this.timer = 0;
			this.life = 0;
		}
		if(this.life == 0) {
			game.stop();
			this.status = 0;
		}
		this.bar.calculate();
		if(this.status == 2) {
			this.timer -= this.timerPerFrame;
			this.ball.calculate(this.bar, this.brick, this.items);
			this.items.calculate(this.bar);
		}
		//...
	}

	//그리기 함수
	draw() {
		boardCtx.clearRect(0, 0, boardWidth, boardHeight);
		this.bar.draw();
		this.brick.draw();
		this.ball.draw();
		this.items.draw();
	}

	updateScoreBar() {
		let str = "life: " + this.life + ", score: " + this.score + ", timer: " + parseInt(this.timer);
		scoreBar.html(str);
	}
}

class Bar {
	//생성자
	constructor(image, width, height, speed) {
		this.image = new Image();
		this.image.src = image;
		this.width = width;
		this.height = height;
		this.x = 0;
		this.y = boardHeight - this.height*2;
		this.speed = speed;
	}

	init(width) {
		this.width = width;
	}

	//위치 계산 함수
	calculate() {
		if (this.x < mouseX && this.x < boardWidth - this.width/2)
			this.x += Math.min(this.speed, mouseX - this.x);
		else if (this.x > mouseX && this.x > this.width/2)
			this.x -= Math.min(this.speed, this.x - mouseX);
		this.y = boardHeight - this.height*2;
	}

	//그리기 함수
	draw() {
		boardCtx.drawImage(this.image, this.x - this.width/2, this.y, this.width, this.height);
	}
}

class Ball {
	constructor(image, image2, speed){
		this.image = new Image();
		this.image.src = image;
		this.image2 = new Image();
		this.image2.src = image2;
		this.ballRadius = 10;
		this.ballX = boardWidth/2;
		this.ballY = boardHeight/2;
		this.angle = PI*3/2;
		this.speed = speed;
		this.invinc = 0;
	}

	init(s) {
		this.speed = s;
	}

	calculate(bar, brick, items) {
		//바닥에 닿았을 때
		if ((this.ballY > (boardHeight - this.ballRadius)) && (this.angle > PI)) {
			if(this.invinc == 0) {
				game.status = 1;
				game.life -= 1;
				this.ballX = boardWidth/2;
				this.ballY = boardHeight/2;
				this.angle = PI*3/2;
				return;
			}
			else{
				this.angle = 2*PI - this.angle;
			}
		}
		//외벽 충돌(바닥 제외)
		if ((this.ballX < (0 + this.ballRadius)) && (Math.cos(this.angle) < 0)) {
			if (this.angle <= PI)
				this.angle = PI - this.angle;
			else
				this.angle = 3*PI - this.angle;
		}
		else if ((this.ballX > (boardWidth-this.ballRadius)) && (Math.cos(this.angle) > 0)) {
			if (this.angle <= PI)
				this.angle = PI - this.angle;
			else
				this.angle = 3*PI - this.angle;
		}
		if ((this.ballY < (0 + this.ballRadius)) && (this.angle < PI)) {
			this.angle = 2*PI - this.angle;
		}
		//막대 충돌
		if((this.ballY + this.ballRadius > bar.y) && (this.ballY - this.ballRadius < bar.y + bar.height)) {
			if((this.ballX + this.ballRadius > bar.x - bar.width/2) && (this.ballX - this.ballRadius < bar.x + bar.width/2)) {
				if(this.angle >= PI) {
					this.angle = PI/2 - ((this.ballX - bar.x)/(bar.width/2))*PI/3;
				}
			}
		}
		//벽돌 충돌
		for (let i = 0; i < brick.brickColumnCount; i++) {
			for (let q = 0; q < brick.brickRowCount; q++) {
				let b = brick.bricks[i][q];
				if(b.durability <= 0) continue;
				if((this.ballY + this.ballRadius >= b.y) && (this.ballY - this.ballRadius <= b.y + brick.brickHeight)) {
					if((this.ballX >= b.x) && (this.ballX <= b.x + brick.brickWidth)) {
						
						b.durability -= 1;
						this.angle = 2*PI - this.angle;
					}
				}
				if((this.ballX + this.ballRadius >= b.x) && (this.ballX - this.ballRadius <= b.x + brick.brickWidth)) {
					if((this.ballY >= b.y) && (this.ballY <= b.y + brick.brickHeight))	{
						b.durability -= 1;
						if (this.angle <= PI)
							this.angle = PI - this.angle;
						else
							this.angle = 3*PI - this.angle;
					}
				}
				if(b.durability <= 0) {
					if(b.item > 0) {
						items.itemList[b.item - 1].durability = 1;
						setTimeout(() => items.itemList[b.item - 1].durability = 0, 8000);
					}
					game.score += 1;
				}
			}
		}
		this.ballX += this.speed * Math.cos(this.angle);
		this.ballY -= this.speed * Math.sin(this.angle);
	}

	draw() {
		if(this.invinc == 0)
			boardCtx.drawImage(this.image, this.ballX - this.ballRadius, this.ballY - this.ballRadius, 2*this.ballRadius, 2*this.ballRadius);
		else
			boardCtx.drawImage(this.image2, this.ballX - this.ballRadius, this.ballY - this.ballRadius, 2*this.ballRadius, 2*this.ballRadius);

	}
}

class Brick {
	constructor(image1, image2, image3, rowNum, colNum, width, height, padding, left, top){
		this.image1 = new Image();
		this.image1.src = image1;
		this.image2 = new Image();
		this.image2.src = image2;
		this.image3 = new Image();
		this.image3.src = image3;
		this.brickRowCount = rowNum;
		this.brickColumnCount = colNum;
		this.brickPadding = padding;
		this.brickOffsetLeft = left;
		this.brickOffsetTop = top;
		this.brickWidth = width;
		this.brickHeight = height;
		this.bricks = [];
	}

	init(d) {
		for(var i=0; i<this.brickColumnCount; i++){
			this.bricks[i] = [];
			for(var j=0; j<this.brickRowCount; j++){
				this.bricks[i][j] = {x: 0, y: 0, durability: d, item: 0};
				var brickX = (i*(this.brickWidth+this.brickPadding))+this.brickOffsetLeft;
				var brickY = (j*(this.brickHeight+this.brickPadding))+this.brickOffsetTop;
				this.bricks[i][j].x = brickX;
				this.bricks[i][j].y = brickY;
			}
		}
		game.items.init(this);
	}
	
	draw(){
		for(var i=0; i<this.brickColumnCount; i++){
			for(var j=0; j<this.brickRowCount; j++){
				if(this.bricks[i][j].durability <= 0) continue;
				if(this.bricks[i][j].item > 0)
					boardCtx.drawImage(this.image3, this.bricks[i][j].x, this.bricks[i][j].y, this.brickWidth, this.brickHeight);
				else if(this.bricks[i][j].durability == 2)
					boardCtx.drawImage(this.image2, this.bricks[i][j].x, this.bricks[i][j].y, this.brickWidth, this.brickHeight);
				else if(this.bricks[i][j].durability == 1)
					boardCtx.drawImage(this.image1, this.bricks[i][j].x, this.bricks[i][j].y, this.brickWidth, this.brickHeight);
			}
		}
	}
}

class Items {
	constructor() {
		this.itemList = [];
		this.randList = [];
		this.itemList[0] = new MushuroomR("src/mushroom_red.png", 50, 50);
		this.itemList[1] = new MushuroomG("src/mushroom_green.png", 50, 50);
		this.itemList[2] = new FireFlower("src/fire_flower.png", 50, 50);
		this.itemList[3] = new Star("src/star.png", 50, 50);
	}

	init(brick) {
		for(let i = 0; i < 4; i++) {
			let randX = Math.floor(Math.random() * brick.brickColumnCount);
			let randY = Math.floor(Math.random() * brick.brickRowCount);
			this.randList[i] = { x: randX, y: randY};
			for(let j = 0; j < i; j++) {
				if(this.randList[j].x == this.randList[i].x && this.randList[j].y == this.randList[i].y) {
					i--;
					break;
				}
			}
		}
		for(let i = 0; i < 4; i++) {
			this.itemList[i].brickX = this.randList[i].x;
			this.itemList[i].brickY = this.randList[i].y;
			brick.bricks[this.randList[i].x][this.randList[i].y].item = i + 1;
			brick.bricks[this.randList[i].x][this.randList[i].y].durability = 1;
			this.itemList[i].x = brick.bricks[this.randList[i].x][this.randList[i].y].x;
			this.itemList[i].y = brick.bricks[this.randList[i].x][this.randList[i].y].y;
		}
		console.log(brick.bricks[this.randList[0].x][this.randList[0].y].x + ", " + brick.bricks[this.randList[0].x][this.randList[0].y].y);
		console.log(this.itemList[0].x + ", " + this.itemList[0].y);
	}

	calculate(bar) {
		this.itemList.forEach(e => {if(e.durability == 1) e.calculate(bar)});
	}

	draw() {
		this.itemList.forEach(e => {if(e.durability == 1) e.draw()});
	}
}

class Item {
	constructor(image, width, height, speed, jumpPower) {
		this.image = new Image();
		this.image.src = image;
		this.lifetime = 5000;
		this.gravity = 0.05;
		this.width = width;
		this.height = height;
		this.x = 0;
		this.y = 0;
		this.dx = speed;
		this.dy = jumpPower/4;
		this.brickX = 0;
		this.brickY = 0;
		this.jumpPower = jumpPower;
		this.durability = 0;
	}

	calculate(bar) {
		if(this.durability == 1){
			if(((this.x + this.width) >= (bar.x - bar.width/2)) && (this.x <= (bar.x + bar.width/2)) && (this.y + this.height >= bar.y)) {
				this.effect();
				this.durability = 0;
			}

			if ((this.x + this.width > boardWidth)&&(this.dx > 0))
				this.dx = -this.dx;
			else if ((this.x < 0)&&(this.dx < 0))
				this.dx = -this.dx;
			if (((this.y + this.height > boardHeight)&&(this.dy > 0)))
				this.dy = this.jumpPower;
			this.dy += this.gravity;
			this.x += this.dx;
			this.y += this.dy;
		}
	}

	effect() {

	}

	draw() {
		if(this.durability == 1) boardCtx.drawImage(this.image, this.x, this.y, this.width, this.height);
	}
}

class MushuroomR extends Item {
	constructor(image, width, height) {
		super(image, width, height, 1.5, -2);
	}

	effect() {
		game.bar.width = game.bar.width * 2;
	}
}

class MushuroomG extends Item {
	constructor(image, width, height) {
		super(image, width, height, 1.5, -2);
	}

	effect() {
		game.life++;
	}
}

class FireFlower extends Item {
	constructor(image, width, height) {
		super(image, width, height, 0, 0);
		this.gravity = 0.025;
	}

	effect() {

	}
}

class Star extends Item {
	constructor(image, width, height) {
		super(image, width, height, 2, -5);
	}
	effect() {
		game.ball.speed = game.ball.speed * 2;
		game.ball.invinc = 1;
		setTimeout(()=> {
			game.ball.speed = game.ball.speed * 0.5;
			game.ball.invinc = 0;
		}, 5000);
	}
}

function popUp(obj){
	var w = ($(window).width()-obj.width())/2;
	var h = ($(window).height()-obj.width())/2;
	obj.css({top:h, left:w});
}