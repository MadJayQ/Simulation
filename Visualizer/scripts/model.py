from utils import indexToCoordinates
from utils import coordinatesToIndex
from utils import getNeighboringCells
from utils import ncr;
from utils import findShortestPath
import random
import json

paths = [];
skipSelf = False;
def calculateTimeSensing(world, targetCell, currentCar):
    width = world["settings"]["worldSettings"]["tileWidth"];
    height = world["settings"]["worldSettings"]["tileHeight"];
    tile = world["tiles"][str(targetCell)];
    reward = float(tile["reward"]);
    cost = float(tile["cost"]);
    numParticipants = len(tile["attachedEnts"]) + 1; #Add one to the number of entities to represent ourselves in the current iteration
    if(numParticipants < 2):
        numParticipants = 2;
    #print("COST, NUMPARTIC");
    #print(cost);
    #print(numParticipants)
    #print("/COST");
    totalCost = float(cost)  * float(numParticipants);
    predictedReward = float(numParticipants - 1) * reward;
    timeSensingPlan = float(predictedReward / totalCost) * (1.0 / float(numParticipants));
    #print(timeSensingPlan);
    return timeSensingPlan;
def calculateExpectedUtility(world, targetCell, currentCar):
    width = world["settings"]["worldSettings"]["tileWidth"];
    height = world["settings"]["worldSettings"]["tileHeight"];
    reward = int(world["tiles"][str(targetCell)]["reward"]);
    #print(reward);
    cellPosition = indexToCoordinates(targetCell, width);
    neighboringCells = getNeighboringCells(cellPosition[0], cellPosition[1], width, height); #Calculate our neighboring cells
    #print(cellPosition);
    #print("~~~");
    neighboringCars = [];
    for neighbor in neighboringCells: #Loop through all these cells, and count the number of cars
        #print(indexToCoordinates(neighbor, width));
        neighborTile = world["tiles"][str(neighbor)];
        neighborEnts = neighborTile["attachedEnts"];
        #print("///");
        for ent in neighborEnts: #If not a car, discard
            if "car-" not in ent: 
                continue;
            if ent == currentCar and skipSelf: #Don't count ourselves?
                continue;
            neighboringCars.append(neighborEnts[ent]);
    totalNeighbors = len(neighboringCars);
    #print(totalNeighbors);
    combinedProbabilityDenominator = 0
    combinedProbability = 0
    expectedUtility = 0
    #print("...............");
    for n in range(0, totalNeighbors): #Sum the combined combinations formula
        combinedProbabilityDenominator += ncr(totalNeighbors - 1, n - 1);
    #print(combinedProbabilityDenominator)
    #print("...............");
    for n in range(1, totalNeighbors):
        n = ncr(totalNeighbors - 1, n - 1);
        utility = float(n * reward) / float(combinedProbabilityDenominator * (n ** 2));
        expectedUtility += utility; 
    #print("/////////////////");
    #print(expectedUtility);
    return expectedUtility;

def simulationTick(world, timestamp):
    cars = world["settings"]["carSettings"];
    tiles = world["tiles"];
    width = int(world["settings"]["worldSettings"]["tileWidth"]);
    height = int(world["settings"]["worldSettings"]["tileHeight"]);
    moves = {};
    for tileIdx in tiles:
        tile = world["tiles"][tileIdx];
        attachedEnts = tile["attachedEnts"];
        if len(attachedEnts) > 0:
            tilePos = indexToCoordinates(tileIdx, width);
            currentCar = list(attachedEnts)[0];
            if currentCar == 'car-3':
                carObj = attachedEnts[currentCar];
                start = carObj["startPos"];
                finish = carObj["endPos"];
                adjacentCells = getNeighboringCells(tilePos[0], tilePos[1], width, height);
                evs = [];
                shortestPathes = [];
                coords = [];
                timeSensingPlans = [];
                capacity = carObj["capacity"];
                for i in range(0, len(adjacentCells)):
                    adjacentCell = adjacentCells[i];
                    evs.append(calculateExpectedUtility(world, adjacentCell, currentCar));
                    timeSensingPlans.append(calculateTimeSensing(world, adjacentCell, currentCar));
                    coords.append(indexToCoordinates(adjacentCell, width));
                    shortestPathes.append(findShortestPath(coords[i], finish, width, height));
                print("BEFORE PRUNTING========");
                print(evs);
                print(timeSensingPlans);
                print(coords);
                print(shortestPathes);
                print("==============");
                smallestPath = 99999;
                toDelete = [];
                for i in range(0, len(timeSensingPlans)):
                    if timeSensingPlans[i] > capacity:
                        toDelete.append(i);
                for i in range(0, len(toDelete)):
                    evs.pop(toDelete[i]);
                    timeSensingPlans.pop(toDelete[i]);
                    coords.pop(toDelete[i]);
                    shortestPathes.pop(toDelete[i]);
                for i in range(0, len(shortestPathes)):
                    shortestPath = shortestPathes[i];
                    if shortestPath < smallestPath:
                        smallestPath = shortestPath
                toDelete = [];
                for i in range(0, len(shortestPathes)):
                    if shortestPathes[i] != smallestPath:
                        toDelete.append(i);
                toDelete = sorted(toDelete, key=int, reverse=True); 
                for i in range(0, len(toDelete)):
                    evs.pop(toDelete[i]);
                    timeSensingPlans.pop(toDelete[i]);
                    coords.pop(toDelete[i]);
                    shortestPathes.pop(toDelete[i]);
                largestUtility = -9999;
                for i in range(0, len(evs)):
                    expectedUtility = evs[i];
                    if expectedUtility > largestUtility:
                        largestUtility = expectedUtility;
                toDelete = [];
                for i in range(0, len(evs)):
                    if evs[i] != largestUtility:
                        toDelete.append(i);
                toDelete = sorted(toDelete, key=int, reverse=True);
                for i in range(0, len(toDelete)):
                    timeSensingPlans.pop(toDelete[i]);
                    coords.pop(toDelete[i]);
                    shortestPathes.pop(toDelete[i]);
                    evs.pop(toDelete[i]);
                print(evs);
                print(timeSensingPlans);
                print(coords);
                print(shortestPathes);
                idx = 0;
                if len(coords) > 1:
                    idx = random.randint(0, len(coords));
                newLocation = coords[idx];
                newCapacity = capacity - timeSensingPlans[idx];
                print(newLocation);
                newIdx = coordinatesToIndex(newLocation[0], newLocation[1], width);
                if currentCar in world["tiles"][tileIdx]["attachedEnts"]: del world["tiles"][tileIdx]["attachedEnts"][currentCar];
                world["tiles"][str(newIdx)]["attachedEnts"][currentCar] = carObj;
                print(world["tiles"][str(newIdx)]["attachedEnts"]);
                moves[currentCar] = {
                    'previous': tileIdx,
                    'new': newIdx,
                    'newCapacity': newCapacity
                };
    return json.dumps(moves);

                