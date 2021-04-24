const options = {
    frequency: 500, // in milliseconds
    canvas: {
        height: 250,
        width: 250,
    },
    spot: {
        width: 3,
        height: 3,
    }
};

const ALIVE = 1;
const DEAD = 0;

class Spot {
    #x;
    #y;
    #state;

    #width = options.spot.width;
    #height = options.spot.height;

    #neighbours = [];

    constructor(x, y, state = DEAD) {
        this.#x = x;
        this.#y = y;
        this.#state = state;
    }

    draw(ctx) {
        ctx.fillStyle = this.getBackground();
        ctx.fillRect(
            (this.#x * this.#width),
            (this.#y * this.#height),
            this.#width,
            this.#height
        );
    }

    getBackground() {
        return this.#state === DEAD ? 'white' : 'black';
    }

    addNeighbour(neighbour) {
        this.#neighbours.push(neighbour);
    }

    update() {

    }
}

class Canvas {
    #canvas = document.getElementById("game-canvas");

    #ctx = this.#canvas.getContext('2d');

    #height = (options.canvas.height * options.spot.height);
    #width = (options.canvas.width * options.spot.width);

    /**
     * Grid of cells
     * @type {Array}
     */
    #grid = [];

    constructor() {
        this.prepareCanvas();
        this.initGrid();
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
     * @param {Number} x
     * @param {Number} y
     * @param {Spot} spot
     */
    setSpot(x, y, spot) {
        this.#grid[x][y] = spot;
    }

    /**
     * Fills the grid with spots, draw them and loads the neighbours
     */
    initGrid() {
        // Fill grid with spots
        for (let x = 1; x <= this.#width; x++) {
            this.#grid[x] = [];
            for (let y = 1; y <= this.#height; y++) {
                let spot = new Spot(x, y);

                this.setSpot(x, y, spot);

                spot.draw(this.#ctx);
            }
        }

        // Add neighbours
        for (let x = 1; x <= this.#width; x++) {
            for (let y = 1; y <= this.#height; y++) {

            }
        }
    }

    prepareCanvas() {
        this.setCanvasHeight(this.#height);
        this.setCanvasWidth(this.#width);
    }

    getWidth() {
        return this.#width;
    }

    getHeight() {
        return this.#height;
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
        for (let x = 1; x <= this.#canvas.getWidth(); x++) {
            for (let y = 1; y <= this.#canvas.getHeight(); y++) {
                this.#canvas.getSpot(x, y).update();
            }
        }
    }
}

let game = new Game();

game.start(); // Start the game!

/**
 * Set keydown event so user can stop the interval with space
 */
document.addEventListener("keydown", function (event) {
    if (event.which === 32) {
        game.switchInterval();
    }
});
