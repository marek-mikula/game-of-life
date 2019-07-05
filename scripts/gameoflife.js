const version = '1.0.0';
const author = 'Marek Mikula';

const options = {
	wrapperSelector: '#game',
	frequency: 50,
	canvas: {
		height: 600,
		width: 1200,
		startingPopulation: 1,
		background: {
			R: 203,
			G: 255,
			B: 189,
		},
	},
	cells: {
		shape: 'circle',
		width: 4,
		height: 4,
		diameter: 4,
	},

	/**
	 * All the possible genders
	 */
	relationships: {
		genders: [
			//Man
			{
				id: 1,
				chance: 10,
				description: 'Man',
				kids: {
					1: false,
					2: true,
				},
				interest: {
					2: 10,
					1: 2,
				},
				color: {
					R: 66,
					G: 206,
					B: 245,
				}
			},
			//Woman
			{
				id: 2,
				chance: 10,
				description: 'Woman',
				kids: {
					1: true,
					2: false,
				},
				interest: {
					2: 10,
					1: 2,
				},
				color: {
					R: 245,
					G: 66,
					B: 221,
				}
			}
		]
	}
};

/**
 * Main variable for interval
 */
let interval;

/**
 * Main array for all the cells in the map
 * @type {Array}
 */
let cells = [];

let canvas = new Canvas();

/**
 * Function that runs as interval
 * The main function where all the required parts are called
 */
function update() {
	canvas.clear();
	canvas.descriptions();

	$.each(cells, function(i, element) {
		element.draw();
	});
}

/**
 * @constructor
 */
function Canvas() {
	/**
	 * Main selector of canvas
	 */
	this.canvas = $('<canvas></canvas>');

	this.background = {
		R : options.canvas.background.R,
		G : options.canvas.background.G,
		B : options.canvas.background.B,
	};

	this.height = options.canvas.height;
	this.width = options.canvas.width;

	this.ctx = null;

	this.start = function() {
		/**
		 * Build the canvas
		 */
		this.createCanvas();
		/**
		 * Start the interval
		 */

		/**
		 * Spawns set amount of cells
		 */
		spawnCell(options.canvas.startingPopulation);

		interval = setInterval(update,options.frequency);
	};

	this.createCanvas = function() {
		this.canvas.attr('height', this.height);
		this.canvas.attr('width', this.width);
		this.ctx = this.canvas[0].getContext('2d');
		/**
		 * Appends the canvas
		 */
		$(options.wrapperSelector).append(this.canvas);
	};

	/**
	 * Draws rectangle all over the whole canvas
	 * Clears all existing cells
	 */
	this.clear = function() {
		this.ctx.fillStyle = "rgb("+ this.background.R +","+ this.background.G +","+ this.background.B +")";
		this.ctx.fillRect(0, 0, this.width, this.height);
	};

	this.descriptions = function() {

		let self = this;

		self.ctx.textBaseline = "top";
		self.ctx.fillStyle = "black";
		self.ctx.textAlign = "left";
		self.ctx.font = "10px Arial";
		self.ctx.fillText('Version: ' + version,15,15);
		self.ctx.fillText('Author: ' + author,15,35);
		self.ctx.fillText('Available genders:',15,55);

		/**
		 * living cells
		 */
		self.ctx.fillText('Living cells: ' + cells.length ,15,75);

		/**
		 * Show available genders
		 */
		$.each(options.relationships.genders, function(i, gender) {

			let description = typeof gender.description === 'undefined' ? 'Undefined' : gender.description;

			self.ctx.fillStyle = "rgb("+ gender.color.R +","+ gender.color.G +","+ gender.color.B +")";
			self.ctx.fillRect(15, 95 + (i * 20), 10, 10);
			self.ctx.fillStyle = "black";
			self.ctx.fillText(description,30,95 + (i * 20));
		});

		// this.ctx.fillText(canvas.time.value(),15,45);

		//informace o pohlaví
		// var i = 1;
		// for(var l in genderArrays) {
		// 	this.ctx.fillText(l+": "+genderArrays[l].length,15,45 + i*20);
		// 	i++
		// }

		// this.ctx.textAlign = "end";
		// this.ctx.fillText(author,this.width-15,25);
	};
}

canvas.start();

/**
 * Function that spawns new cell
 * @param num Number of cells to spawn
 * @param x
 * @param y
 * @param genes
 */
function spawnCell(num, x = null, y = null, genes = null) {
	for(let i = 0; i < num; i++) {
		let xCord = x === null ? getRandomX() : x;
		let yCord = y === null ? getRandomY() : y;
		cells.push ( new Cell(xCord, yCord, genes) );
	}
}

/**
 * Cell object constructor
 * @param x
 * @param y
 * @param genes
 * @constructor
 */
function Cell(x, y, genes) {

	this.x = x;
	this.y = y;

	this.moveY = 0;
	this.moveX = 0;

	this.gender = getGenderByChance();

	this.width = options.cells.width;
	this.height = options.cells.height;
	this.diameter = options.cells.diameter;

	this.color = {
		R: '',
		G: '',
		B: '',
	};

	this.update = function() {

	};

	/**
	 * Draws the cell to the canvas
	 */
	this.draw = function() {
		let ctx = canvas.ctx;
		ctx.fillStyle = "rgb("+ this.color.R +","+ this.color.G +","+ this.color.B +")";
		ctx.fillRect(this.x, this.y, this.width, this.height);
	};
}

/**
 * Functions picks one gender object by its chance
 */
function getGenderByChance() {
	let arr = []; // pole ze kterého budu vybírat pohlaví
	$.each(options.relationships.genders, function(index, gender) {
		for(let a = 0; a < options.relationships.genders[index].chance ; a++) {
			arr.push(index);
		}
	});

	let n = randomInt(0, arr.length - 1);

	let gender = options.relationships.genders[arr[n]];

	console.log(gender);
}

/**
 * generates random X coordinate
 */
function getRandomX() {
	if(options.cells.shape === 'circle') {
		return randomInt(options.canvas.width - (options.cells.diameter / 2), 0);
	} else if (options.cells.shape === 'square') {
		return randomInt(options.canvas.width - options.cells.width, 0);
	}
}

/**
 * generates random X coordinate
 */
function getRandomY() {
	if(options.cells.shape === 'circle') {
		return randomInt(options.canvas.height - (options.cells.diameter / 2), 0);
	} else if (options.cells.shape === 'square') {
		return randomInt(options.canvas.height - options.cells.height, 0);
	}
}

/**
 * Generates a new random integer
 * @param min
 * @param max
 * @returns {*}
 */
function randomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}