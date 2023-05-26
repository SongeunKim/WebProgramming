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
		game.difficulty = 0;
		game.start();
	});
	$("#level-normal").click(function(){
		$("#level").css("display", "none");
		$("#main-div").hide();
		$("#canvas-wrapper").css("display", "block");
		game.difficulty = 1;
		game.start();
	});
	$("#level-hard").click(function(){
		$("#level").css("display", "none");
		$("#main-div").hide();
		$("#canvas-wrapper").css("display", "block");
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
		this.brick = new Brick("src/block.png", "src/block2.png", 3, 18, 45, 45, 0, 45, 45);
		this.ball = new Ball("src/ball.png", 5);
		this.star = new Star("src/star.png", 50, 50, 100, 100, 2, -5);
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
			this.ball.calculate(this.bar, this.brick);
			this.star.calculate();
		}
		//...
	}

	//그리기 함수
	draw() {
		boardCtx.clearRect(0, 0, boardWidth, boardHeight);
		this.bar.draw();
		this.brick.draw();
		this.ball.draw();
		this.star.draw();
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
	constructor(image, speed){
		this.image = new Image();
		this.image.src = image;
		this.ballRadius = 10;
		this.ballX = boardWidth/2;
		this.ballY = boardHeight/2;
		this.angle = PI*3/2;
		this.speed = speed;
	}

	init(s) {
		this.speed = s;
	}

	calculate(bar, brick) {
		//바닥에 닿았을 때
		if (this.ballY > (boardHeight + this.ballRadius)) {
			game.status = 1;
			game.life -= 1;
			this.ballX = boardWidth/2;
			this.ballY = boardHeight/2;
			this.angle = PI*3/2;
			return;
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
						brick.bricks[i][q].durability -= 1;
						this.angle = 2*PI - this.angle;
					}
				}
				if((this.ballX + this.ballRadius >= b.x) && (this.ballX - this.ballRadius <= b.x + brick.brickWidth)) {
					if((this.ballY >= b.y) && (this.ballY <= b.y + brick.brickHeight))	{
						brick.bricks[i][q].durability -= 1;
						if (this.angle <= PI)
							this.angle = PI - this.angle;
						else
							this.angle = 3*PI - this.angle;
					}
				}
				if(b.durability <= 0) game.score += 1;
			}
		}
		this.ballX += this.speed * Math.cos(this.angle);
		this.ballY -= this.speed * Math.sin(this.angle);
	}

	draw() {
		boardCtx.drawImage(this.image, this.ballX - this.ballRadius, this.ballY - this.ballRadius, 2*this.ballRadius, 2*this.ballRadius);
	}
}

class Brick {
	constructor(image1, image2, rowNum, colNum, width, height, padding, left, top){
		this.image1 = new Image();
		this.image1.src = image1;
		this.image2 = new Image();
		this.image2.src = image2;
		this.brickRowCount = rowNum;
		this.brickColumnCount = colNum;
		this.brickPadding = padding;
		this.brickOffsetLeft = left;
		this.brickOffsetTop = top;
		this.brickWidth = width;
		this.brickHeight = height;
		this.bricks = [];
	}

	init(d, n) {
		for(var i=0; i<this.brickColumnCount; i++){
			this.bricks[i] = [];
			for(var j=0; j<this.brickRowCount; j++){
				this.bricks[i][j] = {x: 0, y: 0, durability: d, item: 0};
			}
		}
		for(var i=0; i<n; i++) {
			this.bricks[Math.floor(Math.random()*(this.brickColumnCount+1))]
			[Math.floor(Math.random()*(this.brickRowCount+1))].item 
			= Math.floor(Math.random()*2 + 1);
		}
	}
	
	draw(){
		for(var i=0; i<this.brickColumnCount; i++){
			for(var j=0; j<this.brickRowCount; j++){
				if(this.bricks[i][j].durability <= 0) continue;
				var brickX = (i*(this.brickWidth+this.brickPadding))+this.brickOffsetLeft;
				var brickY = (j*(this.brickHeight+this.brickPadding))+this.brickOffsetTop;
				this.bricks[i][j].x = brickX;
				this.bricks[i][j].y = brickY;
				if(this.bricks[i][j].durability == 2)
					boardCtx.drawImage(this.image2, this.bricks[i][j].x, this.bricks[i][j].y, this.brickWidth, this.brickHeight);
				if(this.bricks[i][j].durability == 1)
					boardCtx.drawImage(this.image1, this.bricks[i][j].x, this.bricks[i][j].y, this.brickWidth, this.brickHeight);
			}
		}
	}
}

class Item {
	constructor(image, width, height, x, y, speed, jumpPower) {
		this.image = new Image();
		this.image.src = image;
		this.lifetime = 5000;
		this.gravity = 0.05;
		this.width = width;
		this.height = height;
		this.x = x;
		this.y = y;
		this.dx = speed;
		this.dy = jumpPower/4;
		this.jumpPower = jumpPower;
	}

	calculate() {
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

	draw() {
		boardCtx.drawImage(this.image, this.x, this.y, this.width, this.height);
	}
}

class Mushuroom extends Item {

}

class Star extends Item {
	constructor(image, width, height, x, y, speed, jumpPower) {
		super(image, width, height, x, y, speed, jumpPower);
	}
}

function popUp(obj){
	var w = ($(window).width()-obj.width())/2;
	var h = ($(window).height()-obj.width())/2;
	obj.css({top:h, left:w});
}