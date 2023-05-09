let mouseX; //현재 마우스 x좌표(board 기준)
let board; //board element
let boardCtx; //board context
let boardLeft; //board 왼쪽 여백 길이
let boardWidth; //board 너비
let boardHeight; //board 높이
let game; //gamemanager

//ready
$(document).ready(function() {
	//initialize
	mouseX = 0;
	board = $("#board").get(0);
	boardCtx = board.getContext("2d");
	boardLeft = board.getBoundingClientRect().left;
	boardWidth = board.getBoundingClientRect().width;
	boardHeight = board.getBoundingClientRect().height;
	game = new Game();

	//events
	$(document).mousemove(function(e) {
		mouseX = e.pageX - boardLeft;
	})
	//...

	//event handlers
	$("#main-start-button").click(function() {
		$("#main-div").css("display", "none");
		$("#level").css("display", "block");
	});
	$("#level-easy").click(function(){
		$("#level").css("display", "none");
		$("#canvas-wrapper").css("display", "block");
		game.start();
	});
	$("#level-normal").click(function(){
		$("#level").css("display", "none");
		$("#canvas-wrapper").css("display", "block");
		game.start();
	});
	$("#level-hard").click(function(){
		$("#level").css("display", "none");
		$("#canvas-wrapper").css("display", "block");
		game.start();
	});
	$("#main-settings-button").click(function(){
		$("#main-div").css("display", "none");
		$("#settings").css("display", "block");
	});
	//...
});

class Game {
	//생성자
	constructor() {
		this.bar = new Bar("src/bar.png", 100, 20, 10); //막대 객체
		this.brick = new Brick();
		this.interval; //update interval
		//...
	}

	//게임 시작 시 한번 호출되는 함수
	start() {
		game.init();
		this.interval = setInterval(game.update, 10);
		//...
	}

	//게임 시작 후 매 프레임마다 호출되는 함수
	update() {
		game.calculate();
		game.draw();
		//...
	}

	//게임 종료 시 한번 호출되는 함수
	stop() {
		clearInterval(interval);
		//...
	}

	//게임 환경 초기화 함수
	init() {
		//...
	}

	//게임 내 수치 계산 함수
	calculate() {
		this.bar.calculate();
		//...
	}

	//그리기 함수
	draw() {
		boardCtx.clearRect(0, 0, boardWidth, boardHeight);
		this.bar.draw();
		this.brick.draw();
		//...
	}
}

class Bar {
	//생성자
	constructor(image, width, height, speed) {
		this.image = new Image(); //막대 이미지 인스턴스
		this.image.src = image;
		this.width = width; //너비
		this.height = height; //높이
		this.x = 0; //x좌표
		this.y = boardHeight - 10; //y좌표
		this.speed = speed; //속도
	}

	//위치 계산 함수
	calculate() {
		if (this.x < mouseX && this.x < boardWidth - this.width/2)
			this.x += Math.min(this.speed, mouseX - this.x);
		else if (this.x > mouseX && this.x > this.width/2)
			this.x -= Math.min(this.speed, this.x - mouseX);
	}

	//그리기 함수
	draw() {
		boardCtx.drawImage(this.image, this.x - this.width/2, this.y, this.width, this.height);
	}
}

class Ball {
	//...
}

class Brick {
	constructor(){
		this.brickRowCount = 3;
		this.brickColumnCount = 5;
		this.brickWidth = 75;
		this.brickHeight = 20;
		this.brickPadding = 10;
		this.brickOffsetTop = 30;
		this.brickOffsetLeft = 30;
		this.bricks = [];
		for(var i=0; i<this.brickColumnCount; i++){
			this.bricks[i] = [];
			for(var j=0; j<this.brickRowCount; j++){
				this.bricks[i][j] = {x: 0, y: 0};
			}
		}
	}
	
	draw(){
		for(var i=0; i<this.brickColumnCount; i++){
			for(var j=0; j<this.brickRowCount; j++){
				var brickX = (i*(this.brickWidth+this.brickPadding))+this.brickOffsetLeft;
				var brickY = (j*(this.brickHeight+this.brickPadding))+this.brickOffsetTop;
				this.bricks[i][j].x = brickX;
				this.bricks[i][j].y = brickY;
				boardCtx.beginPath();
				boardCtx.rect(brickX,brickY,this.brickWidth,this.brickHeight);
				boardCtx.fillStyle = "#0095DD";
				boardCtx.fill();
				boardCtx.closePath();
			}
		}
	}
}