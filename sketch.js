let _debug = false;


// for canvas size
let _cw; // canvas width
let _ch; // canvas height

// for snake size
let _scl;  // a snake body size(px)
let _zoom;  // bigger makes a snake smaller


// for game fill
let _fr;  // frame rate. bigger is faster

// for snake movements
let _prevPos;
let _currPos;
let _prevKey;
let _currKey;

// game level
const _LV = [8, 12, 16, 20, 24];
const _SPEED = [5, 7, 9, 11, 13];
let _gameLv;
let _foodLeft;
let _gameScore;

// etc
let _snake;
let _food;



// TODO
// . Make a touch region to play in the mobile device
// . Ask retry when dead -> space bar
// . Show Lv, point, left food, next level -> ok
// . Set dead when collide with wall -> ok 

function setup() {
  initVar();
  createCanvas(_cw, _ch);
}


function draw() {
  background(220);
  frameRate(_fr);
  
  _food.draw();
  _snake.draw();  
  _snake.checkEat(_food);
  _snake.checkDead();

  drawStatus();
  gotoNextLv();
  //drawArrow();
}


function drawEnding() {
  let str = 'Congratulation! You are a master of SNAKE!!!';
  fill(20,200,150);
  textSize(32);
  let x = floor(_cw/2);
  let y = floor(_ch/2);
  textAlign(CENTER);
  text(str,x,y);
  
  noLoop();
}


function gotoNextLv() {
  if(_foodLeft == 0) {
    
    console.log('gotoNextLv', _gameLv++);
    if( _gameLv == _LV.length ) {
      drawEnding();
    }
    else {
      startGame(_gameLv, _gameScore);    
    }
  }
}


function startGame(lv = 0, score = 0) {
  _gameLv = lv;
  _gameScore = score;
  _foodLeft = _LV[_gameLv];
  _fr = _SPEED[_gameLv];
  
  _currKey = RIGHT_ARROW;
  _prevKey = _currKey;
  
  _snake = new Snake();
  _food = new Food();  
  
  loop();
}



function drawArrow() {
  fill(0,0,0,20);
  ellipse(_cw/2, _ch/2, _cw/2, _cw/2);
}


function mousePressed() {
//   if( mouseX )
//   if(playMode == 1 && currPlayer == human) {
//     let x = floor(mouseX / gw);
//     let y = floor(mouseY / gw);
//     if (x < 0 || x > 2 || y < 0 || y > 2) return;

//     if(board[y][x] == '') {
//       board[y][x] = player[currPlayer];
//       currPlayer = (currPlayer + 1) % player.length
//     }
//   }
}


function drawStatus() {
  let lv = _gameLv + 1;
  let speed = _SPEED[_gameLv];
  let score = _gameScore;
  let left = _foodLeft;
  
  let str = 'Lv : ' + lv + '   Speed : ' + speed + '   Food left : ' + left + '   Score : ' + score;
  fill(0);
  textSize(18);
  let x = floor(_cw/2);
  textAlign(CENTER);
  text(str,x,30);
} 
 

function initVar() {
  _cw = windowWidth;
  _ch = windowHeight;
  _cw = _cw - _cw%100;
  _ch = _ch - _ch%100;
  
  if(_cw > _ch) {
    _zoom = _ch / 50;
  } else if(_cw < _ch) {
    _zoom = _cw / 50;
  }

  if( _cw > _ch) {
    _scl = floor(_ch / _zoom);
  }
  else {
    _scl = floor(_cw / _zoom);
  }
  _scl = _scl - _scl%10;
  
  _cw -= _cw % _scl;
  _ch -= _ch % _scl;
  

  
  // for debugging
  if(_debug == true) {
    _cw = 400;
    _ch = 400;
    _scl = 20;
    _fr = 1;

    _snake = new Snake(0, 0, [1,0]);
    _food = new Food(20,20);
  }
  else {
    startGame();
  }
}


function keyPressed() {
  // keyCode 32 is SPACE
  if(keyCode == 32 || keyCode == ENTER){
    startGame();
    return;
  }
  
  // To make sure a makding a turn after a move
  _prevPos = _currPos;
  _currPos = _snake.getHeadPos();
    
  if( _prevPos != null && _prevPos[0] == _currPos[0] && _prevPos[1] == _currPos[1]) {
    return;
  }
    
    
  let prevK = _prevKey;
  let currK = _currKey;
  
  _prevKey = _currKey;
  _currKey = keyCode;
      
  // To make sure not to happen direct reverse turn
  if (_prevKey != RIGHT_ARROW && _currKey === LEFT_ARROW) {
     _snake.setDir([-1,0]);
  } else if (_prevKey != LEFT_ARROW && _currKey === RIGHT_ARROW) {
    _snake.setDir([1,0]);
  } else if (_prevKey != DOWN_ARROW && _currKey === UP_ARROW) {
    _snake.setDir([0,-1]);
  } else if (_prevKey != UP_ARROW && _currKey === DOWN_ARROW) {
    _snake.setDir([0,1]);
  }
  else {
    _prevKey = prevK;
    _currKey = currK;
  }
}


class Snake {
  constructor(x = -1, y = -1) {
    if( x== -1 || y == -1){
      x = floor(_cw/4);
      y = floor(_ch/4);
    }
    
    this._headColor = color(50,50,250);
    this._bodyColor = color(120,120,250);
    this._tailColor = color(180,180,250);
    
    this._cx = x - (x % _scl);
    this._cy = y - (y % _scl);
    this._cdir = [1,0];
    
    this._px = this._cx;
    this._py = this._cy;
    this._pdir = this._cdir;
    
    this._tailPos = [];
    this._tailCnt = 0;
  }
  

  draw() {
    this._px = this._cx;
    this._py = this._cy;
    this._cx += this._cdir[0] * _scl;
    this._cy += this._cdir[1] * _scl;
    this._cx = constrain(this._cx, 0, _cw - _scl);
    this._cy = constrain(this._cy, 0, _ch - _scl);
    
    // console.log('draw - head', this._cx, this._cy);
  
    // Push previous position
    // And cut the end to line with the length of the tail
    this._tailPos.unshift([this._px, this._py]);
    for(let i=0;i<this._tailPos.length - this._tailCnt;i++) {
      this._tailPos.pop();
    }

    // draw tail
    for(let i=0;i<this._tailPos.length;i++) {
      if( i == this._tailPos.length - 1) {
        fill(this._tailColor);  
      }
      else {
        fill(this._bodyColor);
      }
      
      rect(this._tailPos[i][0], this._tailPos[i][1], _scl, _scl);
    }
    
    // draw head
    fill(this._headColor);
    rect(this._cx, this._cy, _scl, _scl);
  }
  
  getHeadPos() {
    return [this._cx, this._cy];
  }
  
  getWholeBody() {
    return this._tailPos;
  }
 
  setDir(dir) {
    this._pdir = this._cdir;
    this._cdir = dir;
    // console.log('setDir', this._pdir, this._cdir);
  }
  
  
  addTail(dirx, diry) {
    this._tailCnt++;
    // console.log('addTail called', this._tailCnt);
  }


  checkEat(food) {
    if(this._cx == food._x && this._cy == food._y) {
      this.addTail(this._cy, this._cy);
      _foodLeft--;
      _gameScore++;
      let newFood = food.relocate();
      while( newFood == false ) {
        newFood = food.relocate();
      }
    }
  }
  
  checkDead() {
    let dead = 0;
    
    // check collision with a wall
    // if( this._cx <= 0 || this._cx >= _cw || this._cy <= 0 || this._cy >= _ch) {
    //   console.log('Dead wall');
    // } 
    // console.log('dead', this._cx, this._cy, _cw, _ch, this._cdir[0], this._cdir[1]);
    
    if( this._cx <= 0 && this._cdir[0] < 0 )  {
      dead = 1;
    } else if( this._cx >= _cw - _scl && this._cdir[0] > 0 )  {
      dead = 2;
    } else if( this._cy <= 0 && this._cdir[1] < 0 )  {
      dead = 3;
    } else if( this._cy >= _ch - _scl && this._cdir[1] > 0 )  {
      dead = 4;
    } 
    
    // check eat itself
    for(let i=0; i<this._tailPos.length; i++) {  
      if(this._cx == this._tailPos[i][0] && this._cy == this._tailPos[i][1]) {
        dead = 5; 
      }
    }
    
    if(dead != 0) {
      console.log('DEAD DEAD DEAD', dead);
      noLoop();
    }
  }
}


class Food {
  constructor(x=-1, y=-1) {
    this._color = color(255,70,70);
    
    if( x== -1 || y == -1){
      let newPos = this.getNewPos();
      x = newPos[0];
      y = newPos[1];
    }
    
    this._x = x - (x % _scl);
    this._y = y - (y % _scl);
    
    // console.log('Food.con', this._x, this._y);
  }
  
  draw() {
    fill(this._color);
    rect(this._x, this._y, _scl, _scl);
  }
  
  relocate() {
    let newPos = this.getNewPos();
    let result = true;
    
    // check it collides with snake's body
    let snakeBody = _snake.getWholeBody();
    for(let i=0;i<snakeBody.length;i++) {
      if( snakeBody[i][0] == newPos[0] && snakeBody[i][1] == newPos[1]) {
        result = false;
      }
    }
    
    if( result == true ) {
      this._x = newPos[0];
      this._y = newPos[1];  
    }
    
    return result;
  }  
  
  getNewPos() {
    let x = constrain(floor(random(_cw)), _scl*2, _cw - _scl*2);
    let y = constrain(floor(random(_ch)), _scl*2, _ch - _scl*2);
    
    x = x - (x % _scl);
    y = y - (y % _scl);
    
    return [x, y];
        
  }
}

