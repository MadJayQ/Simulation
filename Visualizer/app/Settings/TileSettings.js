var TileSettings = {
    /*
        <format>
        tileIdx: { //Use undefined for tiles that do not have that specific field
            traversable: <true/false>,
            crowdSourcer: <idx>,
            car: <idx>
        }
        </format>
    */
    0: {
        traversable: true,
        crowdSourcer: undefined,
        carIdx: 0
    },
    6: {
        traversable: true,
        crowdSourcer: 0,
        carIdx: undefined
    }
}

module.exports = TileSettings;