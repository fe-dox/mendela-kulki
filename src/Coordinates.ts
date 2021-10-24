export interface Coordinates {
    x: number,
    y: number,

    Equals(coords: Coordinates): boolean
}

export class BasicCoordinates implements Coordinates {
    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public Equals(coords: Coordinates): boolean {
        return coords != undefined && this.x === coords.x && this.y === coords.y;
    }
}
