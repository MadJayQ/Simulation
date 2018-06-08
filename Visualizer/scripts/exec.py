import sys, json, time

from model import solvePath

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
    print(worldJSON["settings"]["carSettings"]);
    sys.stdout.flush();
    running = False;
def main():
    while running:
        command = sys.stdin.readline().split('\n')[0];
        sys.stdout.write(command);
        sys.stdout.flush();
        if command == "start":
            runSimulation()
        time.sleep(0.1);
        

if __name__ == '__main__':
    main();