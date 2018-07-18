def coordinatesToIndex(x, y, width):
    return x + width * y;
def indexToCoordinates(index, width):
    idx = int(index);
    x = idx % width;
    y = idx / width;
    return [x, y];
def getNeighboringCells(x, y, width, height): 
    targetPos = [x, y];
    neighboringCells = [];
    if targetPos[0] - 1 >= 0:
        neighboringCells.append(
            coordinatesToIndex(targetPos[0] - 1, targetPos[1], width)
        );
        if targetPos[1] + 1 < height:
            neighboringCells.append(
                coordinatesToIndex(targetPos[0] - 1, targetPos[1] + 1, width)
            );
        if targetPos[1] - 1 >= 0:
            neighboringCells.append(
                coordinatesToIndex(targetPos[0] - 1, targetPos[1] - 1, width)
            );
    if targetPos[0] + 1 < width:
        neighboringCells.append(
            coordinatesToIndex(targetPos[0] + 1, targetPos[1], width)
        );
        if targetPos[1] + 1 < height:
            neighboringCells.append(
                coordinatesToIndex(targetPos[0] + 1, targetPos[1] + 1, width)
            );
        if targetPos[1] - 1 >= 0:
            neighboringCells.append(
                coordinatesToIndex(targetPos[0] + 1, targetPos[1] - 1, width)
            );
    if targetPos[1] - 1 > 0:
        neighboringCells.append(
            coordinatesToIndex(targetPos[0], targetPos[1] - 1, width)
        );
    if targetPos[1] + 1 < height:
        neighboringCells.append(
            coordinatesToIndex(targetPos[0], targetPos[1] + 1, width)
        );
    return neighboringCells;
#Credits: https://stackoverflow.com/questions/4941753/is-there-a-math-ncr-function-in-python
import operator as op
def ncr(n, r):
    r = min(r, n-r)
    numer = reduce(op.mul, xrange(n, n-r, -1), 1)
    denom = reduce(op.mul, xrange(1, r+1), 1)
    return numer//denom