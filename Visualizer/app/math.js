const { PI } = Math;

module.exports.randInt = (min, max) => {
    return Math.round(Math.random() * (max - min) + min);
}

module.exports.indexToCoordinates = (idx, width) => {
    var row = Math.floor(idx / width);
    var col = idx % width;

    return [row, col];
}

module.exports.coordinatesToIndex = (row, col, width) => {
    return (row * width) + col;
}