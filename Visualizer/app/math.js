const { PI } = Math;

exports.randInt = (min, max) => {
    return Math.round(Math.random() * (max - min) + min);
}