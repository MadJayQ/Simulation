from utils import indexToCoordinates
from utils import coordinatesToIndex
from utils import getNeighboringCells
from utils import ncr;

paths = [];
skipSelf = True
def calculateExpectedUtility(world, targetCell, currentCar):
    width = world["settings"]["worldSettings"]["tileWidth"];
    height = world["settings"]["worldSettings"]["tileHeight"];
    reward = int(world["tiles"][str(targetCell)]["reward"]);
    print(reward);
    cellPosition = indexToCoordinates(targetCell, width);
    neighboringCells = getNeighboringCells(cellPosition[0], cellPosition[1], width, height); #Calculate our neighboring cells
    print(cellPosition);
    print("~~~");
    neighboringCars = [];
    for neighbor in neighboringCells: #Loop through all these cells, and count the number of cars
        print(indexToCoordinates(neighbor, width));
        neighborTile = world["tiles"][str(neighbor)];
        neighborEnts = neighborTile["attachedEnts"];
        print("///");
        for ent in neighborEnts: #If not a car, discard
            if "car-" not in ent: 
                continue;
            if ent == currentCar and skipSelf: #Don't count ourselves?
                continue;
            neighboringCars.append(neighborEnts[ent]);
    totalNeighbors = len(neighboringCars);
    print(totalNeighbors);
    combinedProbabilityDenominator = 0
    combinedProbability = 0
    print("...............");
    for n in range(0, totalNeighbors): #Sum the combined combinations formula
        combinedProbabilityDenominator += ncr(totalNeighbors - 1, n - 1);
    print(combinedProbabilityDenominator)
    print("...............");
    for n in range(0, totalNeighbors):
        n = ncr(totalNeighbors - 1, n - 1);
        nd = float(n) / float(combinedProbabilityDenominator)
        print(nd)
        combinedProbability += nd
    print("/////////////////");
    print(combinedProbability)

    return combinedProbability * (reward / (totalNeighbors ** 2));

def simulationTick(world, timestamp):
    cars = world["settings"]["carSettings"];
    tiles = world["tiles"];
    width = world["settings"]["worldSettings"]["tileWidth"];
    height = world["settings"]["worldSettings"]["tileHeight"];
    for tileIdx in tiles:
        tile = world["tiles"][tileIdx];
        attachedEnts = tile["attachedEnts"];
        if len(attachedEnts) > 0:
            tilePos = indexToCoordinates(tileIdx, width);
            currentCar = list(attachedEnts)[0];
            if currentCar == 'car-3':
                adjacentCells = getNeighboringCells(tilePos[0], tilePos[1], width, height);
                for i in range(0, len(adjacentCells)):
                    adjacentCells[i] = calculateExpectedUtility(world, tileIdx, currentCar);
                print(adjacentCells);