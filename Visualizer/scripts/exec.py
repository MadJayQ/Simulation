import sys, json, time

from model import simulationTick

running = True;

def chunkify(seq, num):
    avg = len(seq) / float(num)
    out = []
    last = 0.0
    while last < len(seq):
        out.append(seq[int(last):int(last + avg)])
        last += avg
    return out
def findStart(car, grid, size):
    for i in range(0, size):
        for j in range(0, size):
            if grid[i][j] == car:
                return (i, j);
    return (0, 0);
def findEnd(car, grid, size):
    for i in range(0, size):
        for j in range(0, size):
            if grid[i][j] == -car:
                return (i, j);
    return (0, 0);
def runSimulation():
    worldJSON = json.loads(sys.argv[1]);
    timeStep = worldJSON["settings"]["timeSettings"]["timeStep"];
    time = 0
    maxTime = worldJSON["settings"]["timeSettings"]["maxTime"]
    res = simulationTick(worldJSON, time);
    print("done")
    running = False;
    return res;
def main():
    while running:
        command = sys.stdin.readline().split('\n')[0];
        if command == "start":
            sys.stdout.flush();
            newWorld = runSimulation();
            sys.stdout.flush();
            print(newWorld);
            sys.stdout.flush();
        time.sleep(0.1);
        

if __name__ == '__main__':
    main();