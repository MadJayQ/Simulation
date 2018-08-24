const { PI } = Math;

const gen = require('random-seed');
var randomizer = gen.create("Hello World!");

module.exports.randomizer = randomizer;

module.exports.randInt = (min, max) => {
    return Math.round(Math.random() * (max - min) + min);
}

module.exports.randNum = (min, max) => {
    return Math.random() * (max - min) + min;
}

module.exports.indexToCoordinates = (idx, width) => {
    var row = Math.floor(idx / width);
    var col = idx % width;

    return [row, col];
}

module.exports.coordinatesToIndex = (row, col, width) => {
    return (row * width) + col;
}

module.exports.setRandomSeed = (seed) => {
    randomizer = gen.create(seed);
}

module.exports.seededRandInt = (min, max) => {
    return randomizer.intBetween(min, max);
}

module.exports.seededRandFloat = (min, max) => {
    return randomizer.floatBetween(min, max);
}