import {BasicCoordinates, Coordinates} from './Coordinates';
import {GridElement, PathFindingEngine} from './PathFindingEngine';

const GAME_TABLE_SIZE = 9;

export type GameArea = Color[][];
export type ColorGrid = ColorGridElement[][];

export default class Game {
    private readonly _gameArea: GameArea;
    private _onRender: Function;
    private _nextBallsGenerator: PlannedRandomGenerator<Color>;

    constructor(mountPoint: HTMLElement) {
        this._gameArea = Array.from({length: GAME_TABLE_SIZE}, () => Array.from({length: GAME_TABLE_SIZE}, () => Color.Empty));
        this._nextBallsGenerator = new PlannedRandomGenerator<Color>([Color.Green, Color.Red, Color.Blue, Color.Yellow, Color.Cyan, Color.Magenta, Color.Lime], 3);
    }

    public PreviewMove(from: Coordinates, to: Coordinates): GameArea {
        let tmpGameArea: GameArea = JSON.parse(JSON.stringify(this._gameArea));
        let colorGrid = this.PrepareGrid(tmpGameArea);
        let path = PathFindingEngine.InstantiateAndFind(colorGrid, from, to);
        for (let i = 1; i < path.length; i++) {
            let tile = path[i];
            tmpGameArea[tile.position.y][tile.position.x] = Color.Move;
        }
        return tmpGameArea;
    }

    public Move(from: Coordinates, to: Coordinates, on: GameArea = this._gameArea): boolean {
        return false;
    }

    private PrepareGrid(from: GameArea = this._gameArea): ColorGrid {
        let yArray = [];
        for (let y = 0; y < from.length; y++) {
            let xArray = [];
            for (let x = 0; x < from[y].length; x++) {
                xArray.push(new ColorGridElement(x, y, from[y][x]));
            }
            yArray.push(xArray);
        }
        return yArray;
    }

    public OnRender(fn: Function): void {
        this._onRender = fn;
    }

    public Render(): void {
        if (!!this._onRender) {
            this._onRender(this._gameArea);
        }
    }
}

class PlannedRandomGenerator<T> {
    private readonly options: T[];
    private readonly numberOfElementsToGenerate: number;
    private _futureElements: T[];


    constructor(options: T[], numberOfElementsToGenerate: number) {
        this.options = options;
        this.numberOfElementsToGenerate = numberOfElementsToGenerate;
        this._futureElements = [];
    }

    public Generate() {
        this._futureElements = [];
        for (let i = 0; i < this.numberOfElementsToGenerate; i++) {
            let n = Math.round(Math.random() * (this.options.length - 1));
            this._futureElements.push(this.options[n]);
        }
    }

    get elements(): T[] {
        return this._futureElements;
    }
}

class ColorGridElement extends GridElement {
    public color: Color;
    public position: Coordinates;

    constructor(x: number, y: number, color: Color) {
        super();
        this.position = new BasicCoordinates(x, y);
        this.color = color;
    }

    public isWall(): boolean {
        return this.color != Color.Empty;
    }

}

export enum Color {
    Empty,
    Green,
    Red,
    Blue,
    Yellow,
    Cyan,
    Magenta,
    Lime,
    Move
}

