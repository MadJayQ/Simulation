paths = [];
def simulationTick(world, timestamp):
    cars = world["settings"]["carSettings"];
    for carIdx in cars:
        car = world["settings"]["carSettings"][carIdx];
        print(car)