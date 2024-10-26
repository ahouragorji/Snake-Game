const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const levelElement = document.getElementById("level");
const timeElement = document.getElementById("time");
const stopsElement = document.getElementById("stops");
const scoreElement = document.getElementById("score");
const message = document.getElementById("message")
const score1 = document.getElementById("score1")
const score2 = document.getElementById("score2")
const stopsButton = document.getElementById("stops")
const level = document.getElementById("level").textContent;
const worms = [];
const points = [];
const obstacles = [];
const maxWorms = 3;  
const maxPoints1 = 6; 
const maxPoints2 = 4; 
const obstacleCount = 4; 


let score = 0;
let time = 60;
let stops = 0;
let gameInterval;
let isPaused = false;


class Worm {
    constructor(x, y) {
        this.body = [{ x: x, y: y }, { x: x, y: y - 10 }, { x: x, y: y - 20 }, { x: x, y: y - 30 },{ x: x, y: y - 40 },{ x: x, y: y - 50}];
        
        this.target = null;
        this.size = 10; 
        this.speed = 5; 
        if(level==2){this.speed+=4;}
        this.headColor = "black"; 
        this.length = 6; 
        this.direction = { x: 0, y: -1 }; 
        this.dx = 0;
        this.dy=0;
        this.distance= 0;
    }

    setTarget(target) {
        this.target = target;
    }
    move() {
        if (this.target) {

             this.dx = this.target.x - this.body[0].x;
             this.dy = this.target.y - this.body[0].y;
             this.distance = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
            this.direction.x = (this.dx / this.distance)
            this.direction.y = (this.dy / this.distance)
        }
        
            
            if (this.distance > 4) {
                const newHead = {
                    x: this.body[0].x + this.direction.x * this.speed,
                    y: this.body[0].y + this.direction.y * this.speed
                };
    
                
                if (newHead.x < 0 || newHead.x > canvas.width - this.size || 
                    newHead.y < 0 || newHead.y > canvas.height - this.size) {
                        console.log("collistion happened obstacle")
                        this.target = null;
                        this.changeDirection(); 
                        setTimeout(() => generateNewTarget(this), 1000);

                } else {
                    
                    const collisionResult = checkCollision(newHead.x, newHead.y);
                    
                    if (collisionResult === "obstacle") {
                        console.log("collistion happened obstacle")
                        this.target = null;
                        this.changeDirection(); 
                        setTimeout(() => generateNewTarget(this), 500);
                    }

                    else if (collisionResult === "point") {
                        
                        
                        
                        
                        this.target = null;
                        worms.forEach(worm => {
                            generateNewTarget(worm);
                        });

                    } else {
                        
                        this.body.unshift(newHead);
                        this.body.pop();
                    }
                }
            }
    }
    
    changeDirection() {
        
        
        const randomAngle = Math.random() * 2 * Math.PI;
        
        this.direction.x = Math.cos(randomAngle);
        this.direction.y = Math.sin(randomAngle);
    }
    


    

    
    draw() {
        
        ctx.fillStyle = this.headColor; 
        ctx.beginPath(); 
        ctx.arc(this.body[0].x + this.size / 2, this.body[0].y + this.size / 2, this.size / 2, 0, Math.PI * 2); 
        ctx.fill(); 

        
        ctx.fillStyle = "black"; 
        for (let i = 1; i < this.body.length; i++) {
            ctx.beginPath(); 
            ctx.arc(this.body[i].x + this.size / 2, this.body[i].y + this.size / 2, this.size / 2, 0, Math.PI * 2); 
            ctx.fill(); 
        }
    }
}

stopsButton.addEventListener("click",(event)=>{
    isPaused = !isPaused;
    if (isPaused) {
        
        document.getElementById('stops').textContent = '⏯️';
    } else {
        
        document.getElementById('stops').textContent = '⏸️';
    }
    })

canvas.addEventListener("click", (event) => {
    const clickX = event.offsetX;
    const clickY = event.offsetY;
    const killRange = 50; 

    
    worms.forEach((worm, index) => {
        const dx = worm.body[0].x - clickX;
        const dy = worm.body[0].y - clickY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= killRange) {
            worms.splice(index, 1); 
            score += 8; 
            scoreElement.textContent = score; 
        }
    });
});


class Point {
    constructor(x, y,type) {
        this.x = x;
        this.y = y;
        this.size = 5; 
        this.type = type
    }
}


class Obstacle {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}


function getRandomPosition() {
    return {
        x: Math.random() * (canvas.width - 40) + 20, 
        y: Math.random() * (canvas.height - 40) + 20 
    };
}


function generateNewTarget(worm) {
    if (points.length > 0) {
        let closestPoint = null;
        let closestDistance = Infinity; 

        points.forEach(point => {
            
            const dx = point.x - worm.body[0].x;
            const dy = point.y - worm.body[0].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestPoint = point;
            }
        });
        
        worm.setTarget(closestPoint);
    }
}
function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
  }

function generatePoints() {
    const max1 = getRandomNumber(1,maxPoints1)
    for (let i = 0; i < max1; i++) {
         pos = getRandomPosition();
        while( pos.x < 0 || pos.x > canvas.width-20 || pos.y <0 || pos.y > canvas.height -20){
            pos = getRandomPosition()
        }
        points.push(new Point(pos.x, pos.y,1));
    }
    const max2= getRandomNumber(1,maxPoints2)
    
    for (let i = 0; i < max2; i++) {
        pos = getRandomPosition();
       while( pos.x < 0 || pos.x > canvas.width-20 || pos.y <0 || pos.y > canvas.height -20){
           pos = getRandomPosition()
       }
       points.push(new Point(pos.x, pos.y, 2));
   }
}


function generateObstacles() {
    obsmax = getRandomNumber(1,obstacleCount)
    for (let i = 0; i < obsmax; i++) {
         pos = getRandomPosition();
        points.forEach(point => {
            while (pos.x > point.x - 20 && pos.x < point.x + 20 && 
                pos.y > point.y - 20 && pos.y < point.y + 20) {
             pos = getRandomPosition();
         }
        });
        obstacles.push(new Obstacle(pos.x, pos.y, 10, 10)); 
    }
}

function checkCollision(x, y) {
    
    const pointIndex = points.findIndex(point =>
        x < point.x + point.size &&
        x + 5 > point.x &&
        y < point.y + point.size &&
        y + 5 > point.y
    );

    if (pointIndex !== -1) {
        if (points[pointIndex].type ===1){
            console.log("got an A")
        score -= 2;
        }
        else if (points[pointIndex].type===2){
            console.log("got a B")
        score-=4;
        }
        scoreElement.textContent = score;
        points.splice(pointIndex, 1); 
        return "point"; 
    }

    
    const collidedWithObstacle = obstacles.some(obstacle =>
        x < obstacle.x + obstacle.width &&
        x + 10 > obstacle.x &&
        y < obstacle.y + obstacle.height &&
        y + 10 > obstacle.y
    );

    if (collidedWithObstacle) {
        return "obstacle"; 
    }

    return null; 
}



function updateGame() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    
    ctx.fillStyle = "green";
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });

    
    ctx.fillStyle = "blue";
    points.forEach(point => {
        if(point.type==2){
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
        ctx.fill();}
    });
    ctx.fillStyle = "red";
    points.forEach(point => {
        if(point.type==1){
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
        ctx.fill();}
    });


    
    worms.forEach(worm => {
        worm.move();
        worm.draw();
        
        
        
        
        
        
        
        
        
        
        
    });

    
  

    if (time <= 0) {
        if(points.length!=0){
            clearInterval(gameInterval);
            clearInterval(timeInterval);
            isPaused = true;
            const prevScore = localStorage.getItem('score1');
            if(score > prevScore){
                localStorage.setItem("score1",score);
                showAlert("Cangrats! you broke your record! :"+score)
            }
            else{
                showAlert("You won! Your score: " + score);
            }
        }
    }
    if(points.length==0){
        clearInterval(gameInterval);
        clearInterval(timeInterval);
        isPaused= true;

        
        showAlert("Game Over!");
 
    }
}

function showAlert(message) {
    document.getElementById("alertMessage").textContent = message;
    document.getElementById("customAlert").style.display = "block";
    
}


function hideAlert() {
    document.getElementById("customAlert").style.display = "none";
}


function replay() {
    if(level==2){
    window.location.href = 'play2.html'

    }
    else{
    window.location.href = 'play.html'
    }
    console.log("replaied!"); 
    hideAlert();
}


function home() {
    window.location.href = 'start.html'
    console.log("start page!"); 
    hideAlert();
}


function startGame() {
    generatePoints();
    generateObstacles();

    for (let i = 0; i < maxWorms; i++) {
        const randomX = Math.random() * (canvas.width - 10); 
        const worm = new Worm(randomX, 0); 
        generateNewTarget(worm);
        worms.push(worm);
    }
    
    
    wormInterval = setInterval(()=>{
        if (!isPaused){
           makeAworm()
       }
       },3000)

    gameInterval = setInterval(()=>{
         if (!isPaused){
            updateGame()
        }
        }
    , 1000 / 30); 

    timeInterval = setInterval(()=>{if(!isPaused){
        timer()
    }
    },1000)

}

function timer(){
  time--;
    timeElement.textContent = time;
}

function makeAworm(){
    const randomX = Math.random() * (canvas.width - 10); 
    const worm = new Worm(randomX, 0); 
    generateNewTarget(worm);
    worms.push(worm);
}

window.onload = startGame;
