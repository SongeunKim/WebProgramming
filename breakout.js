let mouseX;
let mouseY;
let scoreBar;
let board;
let boardCtx;
let boardLeft;
let game;
let vd;
let bgm;
let snd;
let muted;
let tutorial;
let user_change;
const boardWidth = 900;
const boardHeight = 600;
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
	vd = $("video");
	bgm = new Audio();
	bgm.src = "src/audio/title_screen.mp3";
	bgm.autoplay = true;
	bgm.loop = true;
	muted = 1;
	tutorial = 1;
	user_change = 0;

	//functions
	function helpPopup(){
		if(tutorial == 1){
			tutorial = 0;
			$("#help").css("display", "block");
		}
	}

	function selectStage(level){
		$("#level").css("display", "none");
		$("#main-div").hide();
		helpPopup();
		$("#canvas-wrapper").css("display", "block");
		game.difficulty = level;
		game.start();
	}

	function change_help_popup(){
		var arr = ["꽃 – 타이머 시간 추가","초록버섯 – 목숨 추가","빨간버섯 – 바 길이","스타 – 피버타임"];
		var src = ["src/fire_flower.png","src/mushroom_green.png","src/mushroom_red.png","src/star.png"];
		$("#item-help").html(arr[tutorial]);
		$("#help_image").attr("src",src[tutorial]);
		tutorial++;
	}

	//events
	document.addEventListener('keydown',(e)=>{
		if(e.key=='Escape'){
			if($("#level").css("display") == "block"){
				$("#level").css("display","none");
			}
			if($("#settings").css("display") == "block"){
				if(game.status == 0) {
					$("#main-div").show();
					if(muted==1){
						bgm.play();
					}
				}else if(game.status==3){
					game.status = 1;
					game.audio.play();
					game.interval = setInterval(game.update, 10);
				}
				$("#settings").css("display", "none");
			}
			if(game.status == 2 || game.status == 1){
				if($("#help").css("display") == "none"){
					game.status = 3;
					game.audio.pause();
					$("#pause").css("display", "block");
				}
			}
		}
		if(e.keyCode==13){
			if(game.status == 1 || game.status == 2)
				game.score = 99;
		}
		if(e.keyCode==32){
			if(game.status == 2)
				game.timer = 60;
		}
	});
	$(document).mousemove(function(e) {
		mouseX = e.pageX - boardLeft;
		mouseY = e.pageY;
	})
	$(document).click(function(){
		if(tutorial !=4 && ($("#help").css("display")=="block")){
			change_help_popup()
		}else{
			switch(game.status){
				case 0:
					break;
				case 1:
					if($("#help").css("display") == "block")
						$("#help").css("display", "none");
					game.status = 2;
				case 2:
					break;
				case 3:
					break;
				default:
					break;
			}
		}
	})
	$(window).resize(function(e) {
		boardLeft = board.getBoundingClientRect().left;
	})

	//event handlers
	$("#bar_image").on("change",function(){
		var src = $(this).val();
		if(src!="head"){
			game.bar.image.src = src;
			$("#image_show").attr("src",src);
			$("#image_show").css("width","200px");
		}
	});
	$("#ball_image").on("change",function(){
		var src = $(this).val();
		if(src!="head"){
			game.ball.image.src = src;
			$("#image_show").attr("src",src);
			$("#image_show").css("width","100px");
		}
	});
	$("#background_music").on("change",function(){
		if($(this).val()!="제목"){
			user_change = 1;
			var source = $(this).val();
			var loop = true;
			game.setMusic(source, loop)
		}
	});
	$("#volume_control").on("change",function(){
		bgm.volume = this.value/10;
		game.audio.volume = this.value/10;
		snd.volume = this.value/10;
	});
	$("#resume").click(function(){
		$("#pause").css("display", "none");
		game.status = 1;
		game.audio.play();
		game.interval = setInterval(game.update, 10);
	});
	$("#back_to_title").click(function(){
		$("#pause").css("display", "none");
		$("#canvas-wrapper").hide();
		$("#main-div").show();
		game.status = 0;
		game.stop();
		if(muted==1){
			bgm.currentTime = "0";
			bgm.play();
		}
	});
	$("#setting_menu").click(function(){
		$("#pause").css("display", "none");
		$("#settings").appendTo($("#canvas-wrapper"));
		$("#settings").css("display", "block");
	});
	$("#main-start-button").click(function() {
		if(tutorial == 1){
			$("#main-div").hide();		
			$("#prologue-video").css("display", "block");
			bgm.pause();
			vd.get(0).currentTime = "0";
			vd.get(0).play();
			let interval = setInterval(function() {
				if(vd.prop("ended")) {
					$("#prologue-video").hide();
					$("#prologue-text").css("display", "block");
					setTimeout(function() {
						$("#text1").fadeOut(500);
						setTimeout(function() {
							$("#text2").fadeIn(500);
							setTimeout(function() {
								$("#prologue-text").fadeOut(1000);
								setTimeout(function() {
									$("#main-div").css("display","block");
									$("#level").css("display", "block");
								}, 1000);
							}, 3000);
						}, 1000);
					}, 3000);
					clearInterval(interval);
				}
			}, 200);
		}else{
			$("#level").css("display", "block");
		}
	});
	$("#level-easy").click(function(){
		selectStage(0);
	});
	$("#level-normal").click(function(){
		selectStage(1);
	});
	$("#level-hard").click(function(){
		selectStage(2);
	});
	$("#boss").click(function(){
		selectStage(3);
	});
	$("#main-settings-button").click(function(){
		$("#settings").appendTo($("#main-div"));
		$("#settings").css("display", "block");
	});
	$("#sound-button").click(function(){
		if(muted==0){
			$("#sound-button img").attr('src', 'src/sound.png')
			muted = 1;
			bgm.play();
		}else{
			$("#sound-button img").attr('src', 'src/no_sound.png')
			muted = 0;
			bgm.pause();
		}
		
	});
	$(".result-home").click(function(){
		$("#result").css("display", "none");
		$("#canvas-wrapper").css("display", "none");
		$("#main-div").show();
		if(muted==1){
			bgm.currentTime = "0";
			bgm.play();
		}
	});
	$(".result-button").click(function(){
		if($("#result-title").html()=="GAME CLEAR"){
			$("#result").css("display", "none");
			game.difficulty = game.difficulty + 1;
			game.start();
		}
		else{
			$("#result").css("display", "none");
			game.start();
		}
	});

	$("#prologue-skip").click(function() {

		$("#prologue-video").fadeOut(1000);
		setTimeout(function() {
			vd.get(0).pause();
			$("#main-div").show();
			$("#level").css("display", "block");
		}, 1500);
	});
	//...
});

class Game {
	//생성자
	constructor() {
		this.bar = new Bar("src/bar.png", 100, 20, 8);
		this.brick = new Brick("src/block.png", "src/block2.png", "src/question_block.png", 3, 18, 45, 45, 0, 45, 45);
		this.ball = new Ball("src/ball_red.png", "src/ball_invinc.png", 5);
		this.boss = new boss("src/goomba2.png",45, 45, boardWidth/2, 3);
		this.items = new Items();
		this.audio = new Audio();
		this.score = 0;
		this.life = 0;
		this.ending = 0;
		this.status = 0; //0: not ready, 1: ready, 2: running
		this.difficulty = 0; //0: easy, 1: normal, 2: hard
		this.timer = 0;
		this.timerPerFrame = 0;
		this.interval; //update interval
		this.runningOut = 0;
		this.runningOutTimeout;
	}

	//게임 시작 시 한번 호출되는 함수
	start() {
		game.init();
		bgm.pause();
		this.audio.play();
		setTimeout(() => this.status = 1, 100);
		this.interval = setInterval(game.update, 10);
	}

	//게임 시작 후 매 프레임마다 호출되는 함수
	update() {
		game.calculate();
		game.draw();
		game.updateScoreBar();
	}

	//게임 종료 시 한번 호출되는 함수
	stop() {
		clearInterval(this.interval);
		game.audio.pause();
		if(game.status == 1 || game.status == 2){
			if(this.life <= 0 || this.timer <= 0)
			{
				$("#result-title").html("GAME OVER");
				$(".result-button").html("RETRY");
				snd = new Audio("src/audio/game_over.mp3");
				snd.play();
			}
			$("#result").css("display", "block");
		}
		if(game.status != 3){
			clearTimeout(this.runningOutTimeout);
			clearTimeout(this.items.itemList[3].defaultTimeout);
		}
	}

	//게임 환경 초기화 함수
	init() {
		boardLeft = board.getBoundingClientRect().left;
		this.score = 0;
		this.ball.invinc = 0;
		this.life = 3;
		this.bar.init(100);
		this.runningOut = 0;
		this.audio.playbackRate = 1;
		switch (this.difficulty) {
		case 0:
			$("#board").css("background-image", "url(src/background1.jpg)");
			if(user_change==1){
				user_change=0;
			}else{
				game.setMusic('src/audio/easy_mode.mp3', true);
			}
			this.timer = 999;
			this.timerPerFrame = 0;
			this.ball.init(4);
			this.brick.init(1, 2, 18, 45);
			break;
		case 1:
			$("#board").css("background-image", "url(src/background2.jpg)");
			if(user_change==1){
				user_change=0;
			}else{
				game.setMusic('src/audio/normal_mode.mp3', true);
			}
			this.timer = 180;
			this.timerPerFrame = 0.01;
			this.ball.init(5);
			this.brick.init(1, 3, 18, 45);
			break;
		case 2:
			$("#board").css("background-image", "url(src/background3.jpg)");
			if(user_change==1){
				user_change=0;
			}else{
				game.setMusic('src/audio/hard_mode.mp3', true);
			}
			this.timer = 180;
			this.timerPerFrame = 0.01;
			this.ball.init(6);
			this.brick.init(2, 4, 18, 45);
			break;
		case 3:
			$("#board").css("background-image", "url(src/background3.jpg)");
			if(user_change==1){
				user_change=0;
			}else{
				game.setMusic('src/audio/hard_mode.mp3', true);
			}
			this.timer = 180;
			this.timerPerFrame = 0.01;
			this.ball.init(6);
			this.brick.init(1, 2, 18, 90);
			this.boss.init();
		default:
			break;
		}
	}

	//게임 내 수치 계산 함수
	calculate() {
		if(this.timer <= 0) {
			this.timer = 0;
			this.life = 0;
		}
		else if (this.timer <= 60 && this.runningOut == 0) {
			this.audio.pause();
			this.runningOut = 1;
			snd = new Audio("src/audio/running_out.mp3");
			snd.play();
			this.runningOutTimeout = setTimeout(()=>this.audio.play(), 3500)
			this.audio.playbackRate = 1.3;
		}
		if(this.life == 0) {
			game.stop();
			this.status = 0;
		}
		if(this.status == 3){
			game.stop();
		}
		if(this.boss.hp<=0){
			$("#result").css("display", "block");
				$("#result-title").html("GAME CLEAR");
				$(".result-button").html("");
				snd = new Audio("src/audio/game_clear.mp3");
				snd.play();
				game.stop();
		}
		if (this.score >= this.brick.brickColumnCount*this.brick.brickRowCount && this.difficulty != 3){
			if (game.difficulty == 2) {
				this.ending = 1;
				$("#boss").show();
				clearTimeout(this.runningOutTimeout);
				game.stop();
				$("#result").css("display", "none");
				$("#canvas-wrapper").fadeOut(1500);
				setTimeout(function() {
					$("#ending-img").fadeIn(1500);
					$("#ending-img1").fadeIn(1500);
					setTimeout(function() {
						$("#ending-img1").fadeOut(500);
						setTimeout(function() {
							$("#ending-img2").fadeIn(500);
							setTimeout(function() {
								$("#ending-img2").fadeOut(500);
								setTimeout(function() {
									$("#ending-img").css("display", "none")
									$("#main-div").show();
									if(muted==1){
										bgm.currentTime = "0";
										bgm.play();
									}
								}, 500);
							}, 4000);
						}, 1000);
					}, 4000);
				}, 1500);
			}
			else {
				$("#result").css("display", "block");
				$("#result-title").html("GAME CLEAR");
				$(".result-button").html("NEXT LEVEL");
				snd = new Audio("src/audio/game_clear.mp3");
				snd.play();
			}
			this.status = 0;
		}
		this.bar.calculate();
		if(this.status == 2) {
			this.timer -= this.timerPerFrame;
			this.ball.calculate(this.bar, this.brick, this.items, this.boss);
			this.items.calculate(this.bar);
			if(this.difficulty==3)
				if(this.boss.hp > 0)
					this.boss.calculate(this.ball);
		}
	}

	//그리기 함수
	draw() {
		boardCtx.clearRect(0, 0, boardWidth, boardHeight);
		this.bar.draw();
		this.brick.draw();
		this.ball.draw();
		this.items.draw();
		if(this.difficulty==3)
			this.boss.draw();
	}

	updateScoreBar() {
		let str = "life: " + this.life + ", score: " + this.score;
		if(this.difficulty != 0)
			str += ", time: " + parseInt(this.timer);
		if(this.difficulty==3)
			str +=", hp: " + parseInt(this.boss.hp);
		scoreBar.html(str);
	}

	setMusic(source, loop){
		this.audio.src = source;
		this.audio.loop = loop;
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
		if(game.difficulty==3){
			if (this.y < mouseY && this.y < boardHeight - this.height/2)
			this.y += Math.min(this.speed, mouseY - this.y);
			else if (this.y > mouseY && this.y > this.height/2)
			this.y -= Math.min(this.speed, this.y - mouseY);
		}else{
			this.y = boardHeight - this.height*2;
		}
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
		this.damage = 1;
	}

	init(s) {
		this.ballX = boardWidth/2;
		this.ballY = boardHeight/2;
		this.angle = PI*3/2;
		this.speed = s;
	}

	calculate(bar, brick, items, boss) {
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
					snd = new Audio("src/audio/fireball.mp3");
					snd.play();
				}
			}
		}
		//벽돌 충돌
		loop:
		for (let i = 0; i < brick.brickColumnCount; i++) {
			for (let q = 0; q < brick.brickRowCount; q++) {
				let b = brick.bricks[i][q];
				let isCol = 0;
				if(b.durability <= 0) continue;
				if((this.ballY + this.ballRadius >= b.y) && (this.ballY - this.ballRadius <= b.y + brick.brickHeight)) {
					if((this.ballX >= b.x) && (this.ballX <= b.x + brick.brickWidth)) {
						this.angle = 2*PI - this.angle;
						b.durability -= 1;
						isCol = 1;
					}
				}
				if((this.ballX + this.ballRadius >= b.x) && (this.ballX - this.ballRadius <= b.x + brick.brickWidth)) {
					if((this.ballY >= b.y) && (this.ballY <= b.y + brick.brickHeight))	{
						if (this.angle <= PI)
							this.angle = PI - this.angle;
						else
							this.angle = 3*PI - this.angle;
						if(isCol == 0)
							b.durability -= 1;
						isCol = 1;
					}
				}
				if(b.durability <= 0) {
					if(b.item > 0) {
						items.itemList[b.item - 1].durability = 1;
						setTimeout(() => items.itemList[b.item - 1].durability = 0, 8000);
					}
					game.score += 1;
					snd = new Audio("src/audio/breakblock.mp3");
					snd.play();
				}
				if(isCol == 1)
					break loop;
			}
		}
		if(game.difficulty == 3 && boss.hp > 0 && boss.invinc == 0){
			if((this.ballY + this.ballRadius >= boss.y) && (this.ballY - this.ballRadius <= boss.y + boss.height)) {
				if((this.ballX >= boss.x) && (this.ballX <= boss.x + boss.width)) {
					this.angle = 2*PI - this.angle;
					boss.hp -= this.damage;
					boss.invinc = 1;
					setTimeout(()=>{
						boss.invinc = 0;
					}, 2000);
				}
			}
			if((this.ballX + this.ballRadius >= boss.x) && (this.ballX - this.ballRadius <= boss.x + boss.width)) {
				if((this.ballY >= boss.y) && (this.ballY <= boss.y + boss.height))	{
					if (this.angle <= PI)
						this.angle = PI - this.angle;
					else
						this.angle = 3*PI - this.angle;
					boss.hp -= this.damage;
					boss.invinc = 1;
					setTimeout(()=>{
						boss.invinc = 0;
					}, 2000);
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

	init(d, rowNum, colNum, offset_top) {
		this.brickColumnCount = colNum;
		this.brickRowCount = rowNum;
		this.brickOffsetTop = offset_top;
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
		if(game.difficulty == 0)
		{
			brick.bricks[this.randList[2].x][this.randList[2].y].item = 0;
		}
		for(let i = 0; i < 4; i++) {
			this.itemList[i].init();
		}
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
		this.speed = speed;
		this.jumpPower = jumpPower;
		this.durability = 0;
	}

	init() {
		this.durability = 0;
		this.dx = this.speed;
		this.dy = this.jumpPower/4;
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
		this.defaultTimeout;
	}

	effect() {
		snd = new Audio("src/audio/powerup.mp3");
		snd.play();
		if(game.difficulty==3){
			game.boss.attack.invinc = 1;
			this.defaultTimeout = setTimeout(() => {
				game.boss.attack.invinc = 0;
			}, 3000);
		}else{
			game.bar.width = game.bar.width * 2;
		}
	}
}

class MushuroomG extends Item {
	constructor(image, width, height) {
		super(image, width, height, 1.5, -2);
	}

	effect() {
		snd = new Audio("src/audio/powerup.mp3");
		snd.play();

		game.life++;
	}
}

class FireFlower extends Item {
	constructor(image, width, height) {
		super(image, width, height, 0, 0);
		this.gravity = 0.025;
	}

	effect() {
		snd = new Audio("src/audio/powerup.mp3");
		snd.play();


		game.timer += 30;
	}
}

class Star extends Item {
	constructor(image, width, height) {
		super(image, width, height, 2, -5);
		this.defaultTimeout;
	}
	effect() {
		snd = new Audio("src/audio/powerup.mp3");
		snd.play();

		game.ball.speed = game.ball.speed * 2;
		game.ball.invinc = 1;
		this.defaultTimeout = setTimeout(()=> {
			game.ball.speed = game.ball.speed * 0.5;
			game.ball.invinc = 0;
		}, 5000);
	}
}

class boss{
	constructor(image, width, height, position_x, speed){
		this.image = new Image();
		this.image.src = image;
		this.width = width;
		this.height = height;
		this.x = position_x;
		this.y = 10;
		this.hp = 10;
		this.attack = new boss_attack("src/ball.png", "src/ball_invinc.png", 2);
		this.speed = speed;
		this.invinc = 0;
	}

	init(){
		this.y = 10;
		this.x = boardWidth/2;
		this.attack.init();
		this.hp = 10;
	}

	calculate(){
		var direction = Math.pow(-1, Math.floor(Math.random()*100));
		var move = direction*this.speed;
		if((this.x + move >= 0) && (this.x + this.width + move <= boardWidth)){
			this.x += move;
		}
		this.attack.calculate(game.bar);
	}
	
	draw(){
		if(this.hp > 0) {
			boardCtx.drawImage(this.image, this.x, this.y, this.width, this.height);
			this.attack.draw();
		}
	}
}

class boss_attack extends Ball {
	constructor(image1, image2, speed){
		super(image1, image2, speed);
	}
	init() {
		this.ballX = game.boss.x + game.boss.width/2;
		this.ballY = game.boss.height;
		this.angle = PI*Math.random();
	}

	calculate(bar) {
		if ((this.ballY > (boardHeight - this.ballRadius)) && (this.angle > PI)) {
			this.ballX = game.boss.x + game.boss.width/2;
			this.ballY = game.boss.height;
			this.angle = PI*Math.random();
		}

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

		if((this.ballY + this.ballRadius > bar.y) && (this.ballY - this.ballRadius < bar.y + bar.height)) {
			if((this.ballX + this.ballRadius > bar.x - bar.width/2) && (this.ballX - this.ballRadius < bar.x + bar.width/2)) {
				if(this.invinc == 0) game.life -= this.damage;
				this.ballX = game.boss.x + game.boss.width/2;
				this.ballY = game.boss.height;
				this.angle = PI*Math.random();
			}
		}
		this.ballX += this.speed * Math.cos(this.angle);
		this.ballY -= this.speed * Math.sin(this.angle);
	}
}