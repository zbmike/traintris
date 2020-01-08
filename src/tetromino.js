class Piece {
    constructor(tetromino, color) {
        this.tetromino = tetromino;
        this.color = color;
    }
}


const t1 = [
    [0, 0, 0],
    [1, 1, 1],
    [0, 1, 0]
]

const t2 = [
    [0, 1, 0],
    [1, 1, 0],
    [0, 1, 0]
]

const t3 = [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0]
]

const t4 = [
    [0, 1, 0],
    [0, 1, 1],
    [0, 1, 0]
]

module.exports = {t1, t2, t3, t4};