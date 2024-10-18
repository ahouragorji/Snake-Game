const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const levelElement = document.getElementById("level");
const timeElement = document.getElementById("time");
const stopsElement = document.getElementById("stops");
const scoreElement = document.getElementById("score");

const worms = [];
const points = [];
const obstacles = [];
const maxWorms = 3;  // Maximum number of worms
const maxPoints = 10; // Maximum number of points
const obstacleCount = 2; // Number of obstacles

// Game parameters
let score = 0;
let level = 1;
let time = 6000;
let stops = 0;
let gameInterval;

// Worm constructor
class Worm {
    constructor(x, y) {
        // this.body = [{ x: x, y: y }, { x: x, y: y - 10 }, { x: x, y: y - 20 }, { x: x, y: y - 30 }];
        this.body = [{ x: x, y: y }];
        this.target = null;
        this.size = 10; // Size of each segment
        this.speed = 1; // Speed of the worm
        this.headColor = "orange"; // Head color of the worm
        this.length = 3; // Fixed length of the worm
        this.direction = { x: 0, y: -1 }; // Initially moving upwards
    }

    setTarget(target) {
        this.target = target;
    }
    move() {
        if (this.target) {
            const dx = this.target.x - this.body[0].x;
            const dy = this.target.y - this.body[0].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
    
            // Move towards the target
            if (distance > this.speed) {
                const newHead = {
                    x: this.body[0].x + (dx / distance) * this.speed,
                    y: this.body[0].y + (dy / distance) * this.speed
                };
    
                // Check for collision with canvas boundaries
                if (newHead.x < 0 || newHead.x > canvas.width - this.size || 
                    newHead.y < 0 || newHead.y > canvas.height - this.size) {
                    this.changeDirection(); // Change direction on boundary collision
                } else {
                    // Check for collision with points and obstacles
                    const collisionResult = checkCollision_point(newHead.x, newHead.y);
                    
                    if (collisionResult === "obstacle") {
                        this.changeDirection(); // Change direction on obstacle collision
                    } else if (collisionResult === "point") {
                        // Eat the target and set it to null
                        score += 10;
                        scoreElement.textContent = score;
                        this.target = null;
                        generateNewTarget(this);
                    } else {
                        // No collision, move the worm
                        this.body.unshift(newHead);
                        this.body.pop();
                    }
                }
            }
        }
    }
    
     changeDirection() {
        // Change direction randomly for now; you can customize this
        this.direction.x = Math.random() < 0.5 ? 1 : -1; // Change horizontal direction
        this.direction.y = Math.random() < 0.5 ? 1 : -1; // Change vertical direction
    //     this.target=null;
    //     await setTimeout (()=>{

    //     generateNewTarget(this)

    //     }, 5000)
     }

    // Method to draw the worm
    draw() {
        // Draw the head of the worm
        ctx.fillStyle = this.headColor; // Set the head color for the first segment
        ctx.beginPath(); // Start a new path
        ctx.arc(this.body[0].x + this.size / 2, this.body[0].y + this.size / 2, this.size / 2, 0, Math.PI * 2); // Draw head as a circle
        ctx.fill(); // Fill the circle

        // Draw the remaining body segments as circles
        ctx.fillStyle = "blue"; // Set a different color for the body segments
        for (let i = 1; i < this.body.length; i++) {
            ctx.beginPath(); // Start a new path for each segment
            ctx.arc(this.body[i].x + this.size / 2, this.body[i].y + this.size / 2, this.size / 2, 0, Math.PI * 2); // Draw the body segment as a circle
            ctx.fill(); // Fill the circle
        }
    }
}

// Point constructor
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 5; // Size of the point
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
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
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

// Function to generate points
function generatePoints() {
    for (let i = 0; i < maxPoints; i++) {
        const pos = getRandomPosition();
        points.push(new Point(pos.x, pos.y));
    }
}

// Function to generate obstacles
function generateObstacles() {
    for (let i = 0; i < obstacleCount; i++) {
        const pos = getRandomPosition();
        obstacles.push(new Obstacle(pos.x, pos.y, 50, 10)); // Fixed size obstacles
    }
}
function checkCollision_point(x, y) {
    // Check for collision with points
    const pointIndex = points.findIndex(point =>
        x < point.x + point.size &&
        x + 10 > point.x &&
        y < point.y + point.size &&
        y + 10 > point.y
    );

    if (pointIndex !== -1) {
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
    ctx.fillStyle = "red";
    points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw worms and move them
    worms.forEach(worm => {
        const collisionResult = checkCollision_point(worm.body[0].x, worm.body[0].y);
        
        if (collisionResult === "obstacle") {
            worm.changeDirection(); // Change direction on obstacle collision
        } else if (collisionResult !== null) {
            // Handle point collision (already removed in checkCollision_point)
        } else {
            worm.move();
            worm.draw(); // Draw the worm
        }
    });

    // Adjust time and level display
    time--;
    timeElement.textContent = time;

    if (time <= 0) {
        clearInterval(gameInterval);
        alert("Game Over! Your score: " + score);
    }
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

    gameInterval = setInterval(updateGame, 1000 / 30); // Update game at 30 FPS
}

// Start the game on page load
window.onload = startGame;
