const options = {
    frequency: 50, // in milliseconds
    canvas: {
        height: 100,
        width: 100,
    },
    spot: {
        width: 5,
        height: 5,
    }
};

const ALIVE = 1;
const DEAD = 0;

class Canvas {
    #canvas = document.getElementById("game-canvas");

    #ctx = this.#canvas.getContext('2d');

    #height = options.canvas.height * options.spot.height;
    #width = options.canvas.width * options.spot.width;

    /**
     * Matrix of spots
     * @type {[[Spot]]}
     */
    #grid = [];

    constructor() {
        this.setCanvasHeight(this.#height);
        this.setCanvasWidth(this.#width);
        this.fillGrid();
        this.findNeighbours();
    }

    /**
     * @param {Number} height
     */
    setCanvasHeight(height) {
        this.#canvas.setAttribute('height', height);
    }

    /**
     * @param {Number} width
     */
    setCanvasWidth(width) {
        this.#canvas.setAttribute('width', width);
    }

    /**
     * @param {Number} x
     * @param {Number} y
     * @returns Spot
     */
    getSpot(x, y) {
        return this.#grid[x][y];
    }

    /**
     * Fills the grid with spots, draw them and loads the neighbours
     */
    fillGrid() {
        // Fill grid with spots
        for (let x = 1; x <= this.#width; x++) {
            this.#grid[x] = [];
            for (let y = 1; y <= this.#height; y++) {
                let state = (Math.floor(Math.random() * 10) + 1) > 1 ? DEAD : ALIVE;
                let spot = new Spot(x, y, state); // build spot
                this.#grid[x][y] = spot; // set spot to matrix
                spot.draw(this.#ctx); // draw the spot
            }
        }
    }

    findNeighbours() {
        const iterator = this.getIterator();
        let spot = iterator.next();
        while (!spot.done) {
            for (let NY = 0; NY < 3; NY++) {
                for (let NX = 0; NX < 3; NX++) {
                    let neighbourX = (spot.value.getX() - 1) + NX;
                    let neighbourY = (spot.value.getY() - 1) + NY;

                    // Same spot
                    if (
                        neighbourX === spot.value.getX() &&
                        neighbourY === spot.value.getY()
                    ) {
                        continue;
                    }

                    if (neighbourX < 1 || neighbourX > options.canvas.width) {
                        continue;
                    }

                    if (neighbourY < 1 || neighbourY > options.canvas.height) {
                        continue;
                    }

                    spot.value.addNeighbour(
                        this.getSpot(neighbourX, neighbourY)
                    );
                }
            }

            spot = iterator.next();
        }
    }

    getContext() {
        return this.#ctx;
    }

    * getIterator() {
        let iterationCount = 0;

        for (let x = 1; x <= this.#width; x++) {
            for (let y = 1; y <= this.#height; y++) {
                iterationCount++;
                yield this.#grid[x][y];
            }
        }

        return iterationCount;
    }
}

class Spot {
    #x;
    #y;
    #state;

    #nextState = null;

    #width = options.spot.width;
    #height = options.spot.height;

    #neighbours = [];

    constructor(x, y, state = DEAD) {
        this.#x = x;
        this.#y = y;
        this.#nextState = state;
    }

    draw(ctx) {
        this.#state = this.#nextState;
        ctx.fillStyle = this.getBackground();
        ctx.fillRect(
            (this.#x * this.#width),
            (this.#y * this.#height),
            this.#width,
            this.#height
        );
    }

    getState() {
        return this.#state;
    }

    getBackground() {
        return this.#state === DEAD ? 'white' : 'black';
    }

    addNeighbour(neighbour) {
        this.#neighbours.push(neighbour);
    }

    update() {
        let alive = 0;
        let dead = 0;

        this.#neighbours.forEach((spot) => {
            if (spot.getState() === ALIVE) {
                alive += 1;
            } else {
                dead += 1;
            }
        });

        if (this.#state === ALIVE && (alive < 2 || alive > 3)) {
            this.#nextState = DEAD;
        }
        if (this.#state === DEAD && alive === 3) {
            this.#nextState = ALIVE;
        }
    }

    getX() {
        return this.#x;
    }

    getY() {
        return this.#y;
    }
}

class Game {
    #canvas = new Canvas();
    #interval = null;

    start() {
        this.startInterval();
    }

    /**
     * Switches the interval meaning
     * it either stops or releases the interval
     */
    switchInterval() {
        if (this.#interval === null) {
            this.startInterval();
        } else {
            this.clearInterval();
        }
    }

    startInterval() {
        this.#interval = setInterval(this.update.bind(this), options.frequency);
    }

    clearInterval() {
        clearInterval(this.#interval);
        this.#interval = null;
    }

    update() {
        let iterator = this.#canvas.getIterator();
        let spot = iterator.next();
        while (!spot.done) {
            spot.value.update();
            spot = iterator.next();
        }

        iterator = this.#canvas.getIterator();

        spot = iterator.next();
        while (!spot.done) {
            spot.value.draw(this.#canvas.getContext());
            spot = iterator.next();
        }
    }
}

let game = new Game();

game.start(); // Start the game!

/**
 * Set keydown event so user can stop the interval with space
 */
document.addEventListener("keydown", (event) => {
    if (event.which === 32) {
        game.switchInterval();
    }
});
