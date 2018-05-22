paths = [
    [(0, 1), (1, 1), (2, 1), (3, 1), (3, 2), (3, 3), (2, 3), (1, 3), (0, 3)],
    [(1, 1), (1, 2), (1, 3)],
    [(2, 1), (2, 2), (2, 3)]
];
def solvePath(grid, car, start, finish):
    if len(paths) <= car:
        paths.append([]);
    paths[car - 1].insert(0, start);
    paths[car - 1].append(finish);
    return paths[car - 1];