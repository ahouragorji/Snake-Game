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

const worms = [];
const points = [];
const obstacles = [];
const maxWorms = 3;  // Maximum number of worms
const maxPoints1 = 6; // Maximum number of points
const maxPoints2 = 4; // Maximum number of points
const obstacleCount = 4; // Number of obstacles

// Game parameters
let score = 0;
let level = 1;
let time = 60;
let stops = 0;
let gameInterval;
let isPaused = false;

// Worm constructor
class Worm {
    constructor(x, y) {
        this.body = [{ x: x, y: y }, { x: x, y: y - 10 }, { x: x, y: y - 20 }, { x: x, y: y - 30 },{ x: x, y: y - 40 },{ x: x, y: y - 50}];
        //this.body = [{ x: x, y: y }];
        this.target = null;
        this.size = 10; // Size of each segment
        this.speed = 5; // Speed of the worm
        this.headColor = "black"; // Head color of the worm
        this.length = 6; // Fixed length of the worm
        this.direction = { x: 0, y: -1 }; // Initially moving upwards
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
        
            // Move towards the target
            if (this.distance > this.speed) {
                const newHead = {
                    x: this.body[0].x + this.direction.x * this.speed,
                    y: this.body[0].y + this.direction.y * this.speed
                };
    
                // Check for collision with canvas boundaries
                if (newHead.x < 0 || newHead.x > canvas.width - this.size || 
                    newHead.y < 0 || newHead.y > canvas.height - this.size) {
                        console.log("collistion happened obstacle")
                        this.target = null;
                        this.changeDirection(); // Change direction on obstacle collision
                        setTimeout(() => generateNewTarget(this), 1000);

                } else {
                    // Check for collision with points and obstacles
                    const collisionResult = checkCollision(newHead.x, newHead.y);
                    
                    if (collisionResult === "obstacle") {
                        console.log("collistion happened obstacle")
                        this.target = null;
                        this.changeDirection(); // Change direction on obstacle collision
                        setTimeout(() => generateNewTarget(this), 500);
                    }

                    else if (collisionResult === "point") {
                        // Eat the target and set it to null
                        // score += -10;
                        // scoreElement.textContent = score;
                        //this.changeDirection()
                        this.target = null;
                        worms.forEach(worm => {
                            generateNewTarget(worm);
                        });

                    } else {
                        // No collision, move the worm
                        this.body.unshift(newHead);
                        this.body.pop();
                    }
                }
            }
    }
    
    changeDirection() {
        // Generate a random angle between 0 and 2 * π (360 degrees)
        
        const randomAngle = Math.random() * 2 * Math.PI;
        // Set the new direction using the random angle
        this.direction.x = Math.cos(randomAngle);
        this.direction.y = Math.sin(randomAngle);
    }
    


    

    // Method to draw the worm
    draw() {
        // Draw the head of the worm
        ctx.fillStyle = this.headColor; // Set the head color for the first segment
        ctx.beginPath(); // Start a new path
        ctx.arc(this.body[0].x + this.size / 2, this.body[0].y + this.size / 2, this.size / 2, 0, Math.PI * 2); // Draw head as a circle
        ctx.fill(); // Fill the circle

        // Draw the remaining body segments as circles
        ctx.fillStyle = "black"; // Set a different color for the body segments
        for (let i = 1; i < this.body.length; i++) {
            ctx.beginPath(); // Start a new path for each segment
            ctx.arc(this.body[i].x + this.size / 2, this.body[i].y + this.size / 2, this.size / 2, 0, Math.PI * 2); // Draw the body segment as a circle
            ctx.fill(); // Fill the circle
        }
    }
}

stopsButton.addEventListener("click",(event)=>{
isPaused = !isPaused;
if (isPaused) {
    // Stop the game loop by clearing the interval and set button text to "Resume"
    // clearInterval(gameInterval);
    document.getElementById('stops').textContent = '⏯️';
} else {
    // Resume the game loop and set button text back to "Pause"
    startGameLoop();
    document.getElementById('pauseButton').textContent = 'Pause';
}
})
// Function to handle mouse click on the canvas
canvas.addEventListener("click", (event) => {
    const clickX = event.offsetX;
    const clickY = event.offsetY;
    const killRange = 50; // Set the range within which worms are killed

    // Filter out worms that are within the kill range
    worms.forEach((worm, index) => {
        const dx = worm.body[0].x - clickX;
        const dy = worm.body[0].y - clickY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= killRange) {
            worms.splice(index, 1); // Remove worm from array
            score += 8; // Increment score for each worm killed
            scoreElement.textContent = score; // Update score display
        }
    });
});

// Point constructor
class Point {
    constructor(x, y,type) {
        this.x = x;
        this.y = y;
        this.size = 5; // Size of the point
        this.type = type
    }
}

// Obstacle constructor
class Obstacle {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}

// Function to generate random positions
function getRandomPosition() {
    return {
        x: Math.random() * (canvas.width - 40) + 20, // Ensures x is between 20 and canvas.width - 20
        y: Math.random() * (canvas.height - 40) + 20 // Ensures y is between 20 and canvas.height - 20
    };
}

// Function to generate new targets for worms
function generateNewTarget(worm) {
    if (points.length > 0) {
        let closestPoint = null;
        let closestDistance = Infinity; // Start with a very large distance

        points.forEach(point => {
            // Calculate the distance from the worm's head to the point
            const dx = point.x - worm.body[0].x;
            const dy = point.y - worm.body[0].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Check if this point is closer than the previously found closest point
            if (distance < closestDistance) {
                closestDistance = distance;
                closestPoint = point;
            }
        });
        // Set the closest point as the new target
        worm.setTarget(closestPoint);
    }
}
function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
  }
// Function to generate points
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

// Function to generate obstacles
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
        obstacles.push(new Obstacle(pos.x, pos.y, 10, 10)); // Fixed size obstacles
    }
}

function checkCollision(x, y) {
    // Check for collision with points
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
        points.splice(pointIndex, 1); // Remove the eaten point
        return "point"; // Return that a point was eaten
    }

    // Check for collision with obstacles
    const collidedWithObstacle = obstacles.some(obstacle =>
        x < obstacle.x + obstacle.width &&
        x + 10 > obstacle.x &&
        y < obstacle.y + obstacle.height &&
        y + 10 > obstacle.y
    );

    if (collidedWithObstacle) {
        return "obstacle"; // Return that an obstacle was hit
    }

    return null; // No collision
}


// Function to update the game
function updateGame() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw obstacles
    ctx.fillStyle = "green";
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });

    // Draw points
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


    // Draw worms and move them
    worms.forEach(worm => {
        worm.move();
        worm.draw();
        // const collisionResult = checkCollision(worm.body[0].x, worm.body[0].y);
        
        // if (collisionResult === "obstacle") {
        //     this.target= null;
        //     worm.changeDirection(); // Change direction on obstacle collision
        // } else if (collisionResult !== null) {
        //     // Handle point collision (already removed in checkCollision)
        // } else {
        //     worm.move();
        //     worm.draw(); // Draw the worm
        // }
    });

    // Adjust time and level display
  

    if (time <= 0) {
        if(points.length!=0){
            clearInterval(gameInterval);
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
        showAlert("Game Over!");
 
    }
}
// Function to show the custom alert
function showAlert(message) {
    document.getElementById("alertMessage").textContent = message;
    document.getElementById("customAlert").style.display = "block";
    
}

// Function to hide the custom alert
function hideAlert() {
    document.getElementById("customAlert").style.display = "none";
}

// Action for the "Confirm" button
function replay() {
    window.location.href = 'play.html'
    console.log("replaied!"); // Add your confirm action here
    hideAlert();
}

// Action for the "Cancel" button
function home() {
    window.location.href = 'start.html'
    console.log("start page!"); // Add your cancel action here
    hideAlert();
}

// Start the game
function startGame() {
    generatePoints();
    generateObstacles();

    for (let i = 0; i < maxWorms; i++) {
        const randomX = Math.random() * (canvas.width - 10); // Random x-coordinate within canvas
        const worm = new Worm(randomX, 0); // Spawn at the top (y = 0)
        generateNewTarget(worm);
        worms.push(worm);
    }
    
    // wormInterval = setInterval(makeAworm,3000)
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
    , 1000 / 30); // Update game at 30 FPS
    timeInterval = setInterval(timer,1000)
}

function timer(){
  time--;
    timeElement.textContent = time;
}

function makeAworm(){
    const randomX = Math.random() * (canvas.width - 10); // Random x-coordinate within canvas
    const worm = new Worm(randomX, 0); // Spawn at the top (y = 0)
    generateNewTarget(worm);
    worms.push(worm);
}
// Start the game on page load
window.onload = startGame;
