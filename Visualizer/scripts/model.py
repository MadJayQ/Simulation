paths = [];
def solvePath(grid, car, start, finish):
    if len(paths) <= car:
        paths.append([]);
    paths[car - 1].insert(0, start);
    paths[car - 1].append(finish);
    return paths[car - 1];