# Simulation


This is a responsive application based on the [Electron Framework](https://electronjs.org). It is for the research performed by Florida Polytechnic University researchers:

    - Dr. Jaimes Luis
    - Dr. Mustafa Ilhan Akbas

More information about their research can be found [here](https://nsf.gov/awardsearch/showAward?AWD_ID=1739409&HistoricalAwards=false)

**This app loads in [Python](https://www.python.org/) modules and is neccesary to use this app**

This application has two associated modules:

- `exec.py` - This python module sets up an IPC Pipe between the Electron **main process** and **render process**.
- `model.py` - This python module is set by the user to process the grid and calculate the path.

## To Use

To clone and run this repository you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer. From your command line:

```bash
# Clone this repository
git clone https://github.com/MadJayQ/Simulation
# Go into the repository
cd Simulation/Visualizer
# Install dependencies
npm install
# Run the app
npm start
```

## Python Module Breakdown

```python
paths = [
    [(0, 0), (0, 1), (1, 1), (2, 1), (3, 1), (3, 2)],
    [(1, 0), (1, 1), (1, 2), (1, 3), (1, 4)],
    [(2, 0), (2, 1), (2, 2), (2, 3), (2 , 4)]
];
def solvePath(grid, car, start, finish):
    return paths[car - 1];
```

## License

[CC0 1.0 (Public Domain)](LICENSE.md)
