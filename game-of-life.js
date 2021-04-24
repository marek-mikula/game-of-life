const options = {
    /**
     * value: number of milliseconds
     *
     * Canvas is updated in the frequency of
     * this number of milliseconds
     */
    frequency: 50, // in milliseconds
    canvas: {
        height: 100,
        width: 100,
    },
    spot: {
        width: 5,
        height: 5,
    },
    /**
     * value: "custom" or "random"
     */
    mode: "random",
    /**
     * value: array of elements
     *
     * Custom elements setup when "custom" mode is selected
     */
    customElements: [],
    /**
     * value: 1 - 10
     *
     * The higher the value the bigger the chance to create the spot alive
     * by default.
     */
    randomAliveChance: 2
};

const ALIVE = 1;
const DEAD = 0;

// Pattern types
const PATTERN_BLOCK = [
    [ALIVE, ALIVE],
    [ALIVE, ALIVE],
];
const PATTERN_BEE_HIVE = [
    [DEAD, ALIVE, ALIVE, DEAD],
    [ALIVE, DEAD, DEAD, ALIVE],
    [DEAD, ALIVE, ALIVE, DEAD]
];
const PATTERN_LOAF = [
    [DEAD, ALIVE, ALIVE, DEAD],
    [ALIVE, DEAD, DEAD, ALIVE],
    [DEAD, ALIVE, DEAD, ALIVE],
];
const PATTERN_BOAT = [
    [ALIVE, ALIVE, DEAD],
    [ALIVE, DEAD, ALIVE],
    [DEAD, ALIVE, DEAD],
];
const PATTERN_TUB = [
    [DEAD, ALIVE, DEAD],
    [ALIVE, DEAD, ALIVE],
    [DEAD, ALIVE, DEAD],
];

class Canvas {
    #canvas = document.getElementById("game-canvas");

    #ctx = this.#canvas.getContext('2d');

    #height = options.canvas.height * options.spot.height;
    #width = options.canvas.width * options.spot.width;

    /**
     * Matrix of spots
     *
     * @type {[[Spot]]}
     */
    #grid = [];

    constructor() {
        this.setupCanvas();
        this.createGrid();
        this.findNeighbours();
    }

    /**
     * Sets up the canvas, sets the height and width
     */
    setupCanvas() {
        this.#canvas.setAttribute('height', this.#height);
        this.#canvas.setAttribute('width', this.#width);
    }

    /**
     * Gets the spot by X and Y value
     *
     * @param {Number} x
     * @param {Number} y
     * @returns Spot
     */
    getSpot(x, y) {
        [x, y] = this.normalizeCords(x, y);
        return this.#grid[x][y];
    }

    /**
     * Sets the spot to matrix
     *
     * @param {Number} x
     * @param {Number} y
     * @param {Spot} spot
     */
    setSpot(x, y, spot) {
        [x, y] = this.normalizeCords(x, y);
        this.#grid[x][y] = spot;
    }

    /**
     * Fills the grid with spots, draw them and loads the neighbours
     */
    createGrid() {
        for (let x = 1; x <= options.canvas.width; x++) {
            this.#grid[x] = [];
            for (let y = 1; y <= options.canvas.height; y++) {
                this.setSpot(x, y, new Spot(x, y, this));
            }
        }
    }

    /**
     * Finds all neighbours of the spot
     *
     * If we hit the edge of the canvas, count in
     * the spots on the other side to make canvas
     * "infinite"
     */
    findNeighbours() {
        let iterator = this.getIterator();

        for (let spot of iterator) {
            for (let NY = 0; NY < 3; NY++) {
                for (let NX = 0; NX < 3; NX++) {
                    let neighbourX = (spot.getX() - 1) + NX;
                    let neighbourY = (spot.getY() - 1) + NY;

                    // Same spot
                    if (
                        neighbourX === spot.getX() &&
                        neighbourY === spot.getY()
                    ) {
                        continue;
                    }

                    spot.addNeighbour(
                        this.getSpot(neighbourX, neighbourY)
                    );
                }
            }
        }
    }

    /**
     * Normalizes cords so we can make the canvas
     * "infinite"
     * @param {Number} x
     * @param {Number} y
     * @returns {Number[]}
     */
    normalizeCords(x, y) {
        if (x < 1) {
            x = options.canvas.width;
        }

        if (x > options.canvas.width) {
            x = 1;
        }

        if (y < 1) {
            y = options.canvas.height;
        }

        if (y > options.canvas.height) {
            y = 1;
        }
        return [x, y];
    }

    getContext() {
        return this.#ctx;
    }

    /**
     * Creates easy iterator over all Spots
     * in matrix
     *
     * @returns {Generator<Spot, number, *>}
     */
    * getIterator() {
        for (let x = 1; x <= options.canvas.width; x++) {
            for (let y = 1; y <= options.canvas.height; y++) {
                yield this.#grid[x][y];
            }
        }
    }

    /**
     * Applies given pattern to given
     * position
     *
     * @param {Number} x
     * @param {Number} y
     * @param {[[Number]]} pattern
     */
    applyPattern(x, y, pattern) {
        pattern.forEach((row) => {
            row.forEach((state) => {
                this.getSpot(x, y).setNextState(state);
            });
            y++;
        });
    }
}

class Spot {
    #x;
    #y;

    #canvas;

    /**
     * Current state before redrawing
     * @type {Number}
     */
    #state = null;

    /**
     * Next state that is used when redrawing
     * the spot
     * @type {Number}
     */
    #nextState;

    #width = options.spot.width;
    #height = options.spot.height;

    /**
     * Array of all neighbours
     *
     * @type {[Spot]}
     */
    #neighbours = [];

    constructor(x, y, canvas) {
        this.#x = x;
        this.#y = y;
        this.#canvas = canvas;
        this.#nextState = this.getDefaultState();

        this.draw(); // Draw spot when constructed
    }

    draw() {
        let ctx = this.#canvas.getContext();
        this.#state = this.#nextState; // flip state
        ctx.fillStyle = this.getBackground();
        ctx.fillRect(
            (this.#x * this.#width),
            (this.#y * this.#height),
            this.#width,
            this.#height
        );
    }

    /**
     * Adds neighbour to the array
     *
     * @param {Spot} neighbour
     */
    addNeighbour(neighbour) {
        this.#neighbours.push(neighbour);
    }

    /**
     * Calculates next state based of current state
     */
    calcNextState() {
        let alive = 0;
        let dead = 0;

        this.#neighbours.forEach((spot) => {
            if (spot.alive()) {
                alive += 1;
            } else {
                dead += 1;
            }
        });

        if (this.#state === ALIVE && (alive < 2 || alive > 3)) {
            this.die();
        }
        if (this.#state === DEAD && alive === 3) {
            this.respawn();
        }
    }

    setNextState(state) {
        this.#nextState = state;
    }

    die() {
        this.setNextState(DEAD);
    }

    respawn() {
        this.setNextState(ALIVE);
    }

    /**
     * Gets default state for spot. Returns DEAD if in custom
     * mode because the spot states are then calculated in other
     * method
     *
     * @returns {number}
     */
    getDefaultState() {
        if (options.mode === "custom") {
            return DEAD;
        }

        return (Math.floor(Math.random() * 10) + 1) > options.randomAliveChance
            ? DEAD
            : ALIVE;
    }

    getX() {
        return this.#x;
    }

    getY() {
        return this.#y;
    }

    getState() {
        return this.#state;
    }

    getBackground() {
        return this.#state === DEAD ? 'white' : 'black';
    }

    alive() {
        return this.getState() === ALIVE;
    }

    dead() {
        return this.getState() === DEAD;
    }
}

class Game {
    #canvas = new Canvas();
    #interval = null;

    start() {
        this.setPauseEvent();
        this.startInterval();
    }

    /**
     * Switches the interval meaning
     * it either stops or releases the interval
     *
     * Allows to pause the interval if user wants
     */
    switchInterval() {
        if (this.#interval === null) {
            this.startInterval();
        } else {
            this.clearInterval();
        }
    }

    /**
     * Starts the interval
     */
    startInterval() {
        this.#interval = setInterval(this.update.bind(this), options.frequency);
    }

    /**
     * Clears the interval
     */
    clearInterval() {
        clearInterval(this.#interval);
        this.#interval = null;
    }

    /**
     * Set keydown event so user can stop the interval with space
     */
    setPauseEvent() {
        document.addEventListener("keydown", (event) => {
            if (event.which === 32) {
                event.preventDefault();
                this.switchInterval();
            }
        });
    }

    /**
     * Updates the array of Spots
     *
     * First it calculates next states and then
     * it rewrites the
     */
    update() {
        let iterator = this.#canvas.getIterator();

        for (let spot of iterator) {
            spot.calcNextState();
        }

        iterator = this.#canvas.getIterator();

        for (let spot of iterator) {
            spot.draw();
        }
    }
}

new Game().start(); // Start the game!