var Settings = {
    worldSettings: {
        tileWidth: 13,
        tileHeight: 9,
        minCars: 15,
        maxCars: 30,
        minReward: 150,
        maxReward: 250,
        minCost: 0.1,
        maxCost: 0.9,
        minCapacity: 1,
        maxCapacity: 10
    },
    timeSettings: {
        minTime: 0,
        maxTime: 60,
        timeScale: 1.0,
        timeStep: 0.015625
    },
    miscSettings: {
        seed: 'Hello World!',
        machEps: 1e-13
    }
}

module.exports= Settings;