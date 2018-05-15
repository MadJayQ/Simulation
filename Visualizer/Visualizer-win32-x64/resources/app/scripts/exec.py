import sys, json

from model import solvePath


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
def findEnd(car, grid, size):
    for i in range(0, size):
        for j in range(0, size):
            if grid[i][j] == -car:
                return (i, j);
def main():
    while True:
        command = sys.stdin.readline()
        command = command.split('\n')[0]
        if command == "start":
            gridSize = int(sys.argv[2]);
            grid = chunkify([int(i) for i in sys.argv[1].split(',')], gridSize);
            numCars = int(sys.argv[3]);
            data = {}
            for i in range(1, numCars + 1):
                data[i] = {};
                start = findStart(i, grid, gridSize);
                end = findEnd(i, grid, gridSize);
                data[i]["path"] = solvePath(grid, i, start, end);
                data[i]["start"] = start;
                data[i]["end"] = end;
            print(json.dumps(data));
        sys.stdout.flush();

if __name__ == '__main__':
    main();