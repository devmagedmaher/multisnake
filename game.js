
// helpers 

function isCollide(obj1, obj2) {
  return obj1.x === obj2.x && obj1.y === obj2.y;
}

function getArrayRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}


// canvas area
const canvas = document.getElementById('canvas');
const c = canvas.getContext('2d');
canvas.width = 500;//window.innerWidth;
canvas.height = 400;//window.innerHeight - canvasTop.height;
  
game= {
  size: 10,
  playing: false,
  gameOver: false,

  snakes: {},
  apples: [],

  snakeColors: ['#00ff00', '#0000ff', '#ffff00', '#ff00ff'],

  controls: {
    arrows: [37, 38, 39, 40],
    wasd: [65, 87, 68, 83],
    uhjk: [72, 85, 75, 74],
    numpad: [97, 101, 99, 98]
  },

  points: [],
  updatePoints: function() {
    this.points = [];
    for (let y = 0; y < canvas.height; y += this.size) {
      for (let x = 0; x < canvas.width; x += this.size) {
        game.points.push(`${x},${y}`);
      }
    }
  },

  takePoint: function(x, y) {
    this.points.splice(this.points.indexOf(`${x},${y}`), 1);
  }
}
game.updatePoints();






// ask how many players
document.querySelector('#players').onclick = function (e) {
  if (+e.target.id > 0 && +e.target.id < 5) {
    for (let i = 0; i < +e.target.id; i++) {
      game.snakes[i+1] = new Snake(100*(i+1), 100, game.snakeColors[i]);
    }
    this.remove();
    console.log(game.snakes);
  }
}



// draw first frame


  // let apple = new Apple();
  // game.apples.push(apple);
  // game.takePoint(apple.x, apple.y);



class Apple {
  constructor() {
    this._point = getArrayRandom(game.points).split(',');
    this._x = +this._point[0];
    this._y = +this._point[1];
    this._size = game.size;
    game.takePoint(this._point);
  }

  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }

  render() {
    this._draw();
  }

  _draw() {
    c.beginPath();
    c.fillStyle = 'rgb(0,255,0)';
    c.fillRect(this._x, this._y, this._size, this._size);
  }

}








class Snake {
  constructor(x, y, color = '#ffffff') {
    this._x = x;
    this._y = y;
    this._direction = [4];
    this._long = 3;
    this._size = game.size;
    this._spacing = 1;
    this._step = this._size; 
    this._speed = 10;
    this._maxDirections = 2;
    // [bodyColor, headColor]
    this._color = ['#ffffff', color];
    this._parts = this._buildParts(); 
    // start property for speed calculations
    this._start = 0;
    this._score = 0;
  }

  setStart(value) {
    this._start = value;
  }

  get start() {
    return this._start;
  }

  get speed() {
    return this._speed;
  }

  get score() {
    return this._score;
  }

  get parts() {
    return this._parts;
  }

  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }

  _buildParts() {
    let parts = [{
      x: this._x,
      y: this._y,
      d: 4
    }];
    for (let i = 0; i < this._long; i++) {
      parts.push({
        x: this._x,
        y: this._y - (this._step * i),
        d: 4
      });
    }
    return parts;
  }

  render() {
    this._warp();
    this._draw();
  }

  _draw() {        
    for (let i = 0; i < this._parts.length; i++) {
      if (this._parts[i].hide) continue
      c.beginPath();
      c.fillStyle = this._color[+!(i > 1)];
        c.fillRect(this._parts[i].x + this._spacing, this._parts[i].y + this._spacing, this._step - this._spacing*2, this._step - this._spacing*2);
    }
  }

  _warp() {
    this._parts.forEach((p) => {
      if      (p.x >= canvas.width)  p.x -= canvas.width;
      else if (p.y >= canvas.height) p.y -= canvas.height; 
      else if (p.x < 0) p.x += canvas.width;
      else if (p.y < 0) p.y += canvas.height;
    });
  }

  move() {
    this._setDirection();
    this._follow();
    this._movement();
    this._damage();
    this._eatApple();
  }

  _setDirection() {
    if (this._direction.length > 1) this._direction.splice(0, 1);
    this._parts[0].d = this._direction[0];
  }

  _movement() {
    this._parts.forEach((p) => {
      switch(p.d) {
        case 1:
          p.x -= this._step;
          break;
        case 2:
          p.y -= this._step;
          break;
        case 3:
          p.x += this._step;
          break;
        case 4:
          p.y += this._step;
          break;
      }
      this._takePoint(p.x, p.y);
    });
    this._x = this._parts[0].x;
    this._y = this._parts[0].y;
  }

  _takePoint(x, y) {
    game.takePoint(x, y);
  }

  _follow() {
    for (let i = this._parts.length - 1; i >= 0; i--) {
        if (this._parts[i-1]) this._parts[i].d = this._parts[i-1].d;
    }
  }

  _damage() {
    for (let player in game.snakes) {
      game.snakes[player].parts.forEach((p, i) => {
      let condition = (game.snakes[player] == this) ? i > 1 && isCollide(this, p) : isCollide(this, p);
        if (condition) {
          p.hide = true;
          gameOver();
        }
      });
    }
  }

  _eatApple() {
    game.apples.forEach((a) => {
      if (isCollide(this, a)) {
        game.apples.splice(game.apples.indexOf(a), 1);
        game.apples.push(new Apple());
        this.addPart();
        this._score++;
      }   
    });
  }


  addPart() {
    let part = {
      x: this._parts[this._parts.length-1].x,
      y: this._parts[this._parts.length-1].y,
      d: this._parts[this._parts.length-1].d,
    }
    switch(part.d) {
      case 1:
        part.x += this._step;
        break;
      case 2:
        part.y += this._step;
        break;
      case 3:
        part.x -= this._step;
        break;
      case 4:
        part.y -= this._step;
        break;
    }
    this._parts.push(part);
  }

  changeDirection(direction) {
    if (direction % 2 && !(this._direction[this._direction.length-1] % 2) || 
      !(direction % 2) && this._direction[this._direction.length-1] % 2) {
      // if (this._direction.length < this.maxDirections) 
        if (this._direction.length <= 2) {
          this._direction.push(direction);
        }
    }
  }

}









function drawScore() {
  c.beginPath();
  c.font = '16px tahoma';
  c.textBaseline = 'middle';
  c.textAlign = 'left';
  for (let player in game.snakes) {
    c.fillStyle = game.snakeColors[player-1];
    c.fillText(`score: ${game.snakes[player].score}`, 20, player*20);    
  }
}




function gameOver() {
  game.playing = false;
  game.gameOver = true;
}


function drawGameOverText() {
  c.beginPath();
  c.textBaseline = 'middle';
  c.textAlign = 'center';
  c.fillStyle = '#eee'
  c.strokeStyle = '#900';
  c.lineWidth = 16;
  c.font = 'bold 48px tahoma';
  c.strokeText('Game Over', canvas.width/2, canvas.height/2);
  c.fillText('Game Over', canvas.width/2, canvas.height/2);
}



function startGame() {
  game.playing = true;
  game.apples.push(new Apple());
}




// let start = 0;
function draw(timestamp) {
  c.clearRect(0, 0, canvas.width, canvas.height);


  game.updatePoints();

  for (let player in game.snakes) {
    game.snakes[player].render();  
    if (timestamp - game.snakes[player].start > 1000 / game.snakes[player].speed && game.playing) {
      game.snakes[player].setStart(timestamp);
      game.snakes[player].move();
    }
  }


  // render apple
  game.apples.forEach((a) => {
    a.render();
  });

  if (game.gameOver) {
    drawGameOverText();
  } else {
    drawScore();
  }


  requestAnimationFrame(draw);
}
draw();
    // drawGameOverText();



document.body.addEventListener('keyup', function(e) {

  if (!game.playing && !game.gameOver) startGame();

  if (!!~game.controls.arrows.indexOf(e.keyCode)) {
    game.snakes[1].changeDirection(game.controls.arrows.indexOf(e.keyCode) + 1);
  } 

  if (!!~game.controls.wasd.indexOf(e.keyCode)) {
    game.snakes[2].changeDirection(game.controls.wasd.indexOf(e.keyCode) + 1);
  }

  if (!!~game.controls.uhjk.indexOf(e.keyCode)) {
    game.snakes[3].changeDirection(game.controls.uhjk.indexOf(e.keyCode) + 1);
  }
 
  if (!!~game.controls.numpad.indexOf(e.keyCode)) {
    game.snakes[4].changeDirection(game.controls.numpad.indexOf(e.keyCode) + 1);
  }
  
});



