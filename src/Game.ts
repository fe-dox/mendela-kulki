import {BasicCoordinates, Coordinates} from './Coordinates';
import {GridElement, PathFindingEngine} from './PathFindingEngine';
import Utils from './Utils';

export const GAME_TABLE_SIZE = 9;

export type GameArea = Color[][];
export type ColorGrid = ColorGridElement[][];

export enum GameState {
    Ready,
    Computing,
    Finished
}

/**
 *
 * @decorator IsAsync
 */
function IsAsync() {
    return function (target: any, name: string, descriptor: PropertyDescriptor) {
        let org = descriptor.value;
        descriptor.value = async function (...args: any[]) {
            this._gameState = GameState.Computing;
            let result = await org.apply(this, args);
            this._gameState = GameState.Ready;
            return result;
        };
    };
}

type Direction = 1 | -1


export default class Game {
    private readonly _gameArea: GameArea;
    private _onRender: Function;
    private _onFinish: Function;
    private nextBallsGenerator: PlannedRandomGenerator<Color>;
    private _gameState: GameState;
    private points: number = 0;
    private _start: number;


    get gameState(): GameState {
        return this._gameState;
    }

    constructor() {
        this._gameArea = Array.from({length: GAME_TABLE_SIZE}, () => Array.from({length: GAME_TABLE_SIZE}, () => Color.Empty));
        this.nextBallsGenerator = new PlannedRandomGenerator<Color>([Color.Green, Color.Red, Color.Blue, Color.Yellow, Color.Cyan, Color.Magenta, Color.Lime], 3);
    }

    public Init() {
        this.AddBalls();
        this._gameState = GameState.Ready;
        this._start = Date.now();
        this.Render();
    }

    public PreviewMove(from: Coordinates, to: Coordinates) {
        let tmpGameArea: GameArea = JSON.parse(JSON.stringify(this._gameArea));
        let colorGrid = this.PrepareGrid(tmpGameArea);
        let path = PathFindingEngine.InstantiateAndFind(colorGrid, from, to);
        for (let i = 0; i < path.length; i++) {
            let tile = path[i];
            tmpGameArea[tile.y][tile.x] = Color.Move;
        }
        this.Render(tmpGameArea);
    }

    @IsAsync()
    public async Move(from: Coordinates, to: Coordinates): Promise<boolean> {
        let colorGrid = this.PrepareGrid();
        let path = PathFindingEngine.InstantiateAndFind(colorGrid, from, to);
        if (path.length == 0) {
            return false;
        }
        this._gameArea[to.y][to.x] = this._gameArea[from.y][from.x];
        this._gameArea[from.y][from.x] = Color.Trace;
        for (let i = 0; i < path.length - 1; i++) {
            let coords = path[i];
            this._gameArea[coords.y][coords.x] = Color.Trace;
        }
        this.Render();
        await Utils.Delay(500);
        this.Clear();
        if (!this.Delete()) {
            this.AddBalls();
            this.Delete();
        }
        this.Render();
        return true;
    }

    private Clear() {
        for (let i = 0; i < this._gameArea.length; i++) {
            for (let j = 0; j < this._gameArea[i].length; j++) {
                if (this._gameArea[i][j] === Color.Trace) this._gameArea[i][j] = Color.Empty;
            }
        }
    }

    private DeleteDiagonally(start: Coordinates, direction: Direction): Coordinates[] {
        let vectorX = 0;
        let vectorY = 0;
        let prevColor = Color.Rainbow;
        let toDelete: Coordinates[] = [];
        let positions: Coordinates[] = [];
        while (this._gameArea[start.y + vectorY]?.[start.x + vectorX] !== undefined) {
            let x = start.x + vectorX;
            let y = start.y + vectorY;
            if (prevColor != this._gameArea[y][x]) {
                if (positions.length > 4 && prevColor != Color.Empty) {
                    toDelete.push(...positions);
                }
                prevColor = this._gameArea[y][x];
                positions = [new BasicCoordinates(x, y)];
            } else {
                positions.push(new BasicCoordinates(x, y));
            }
            vectorX += direction;
            vectorY += 1;
        }
        if (positions.length > 4 && prevColor != Color.Empty) {
            toDelete.push(...positions);
        }
        return toDelete;
    }

    private Delete(): boolean {
        let toDelete: Coordinates[] = [];
        //noinspection Duplicates
        for (let y = 0; y < this._gameArea.length; y++) {
            let prevColor = Color.Rainbow;
            let positions: Coordinates[] = [];
            for (let x = 0; x < this._gameArea[y].length; x++) {
                if (prevColor != this._gameArea[y][x]) {
                    if (positions.length > 4 && prevColor != Color.Empty) {
                        toDelete.push(...positions);
                    }
                    prevColor = this._gameArea[y][x];
                    positions = [new BasicCoordinates(x, y)];
                } else {
                    positions.push(new BasicCoordinates(x, y));
                }
            }
            if (positions.length > 4 && prevColor != Color.Empty) {
                toDelete.push(...positions);
            }
        }
        //noinspection Duplicates
        for (let x = 0; x < this._gameArea.length; x++) {
            let prevColor = Color.Rainbow;
            let positions: Coordinates[] = [];
            for (let y = 0; y < this._gameArea[x].length; y++) {
                if (prevColor != this._gameArea[y][x]) {
                    if (positions.length > 4 && prevColor != Color.Empty) {
                        toDelete.push(...positions);
                    }
                    prevColor = this._gameArea[y][x];
                    positions = [new BasicCoordinates(x, y)];
                } else {
                    positions.push(new BasicCoordinates(x, y));
                }
            }
            if (positions.length > 4 && prevColor != Color.Empty) {
                toDelete.push(...positions);
            }
        }

        for (let x = 0; x < GAME_TABLE_SIZE; x++) {
            toDelete.push(...this.DeleteDiagonally(new BasicCoordinates(x, 0), 1));
            toDelete.push(...this.DeleteDiagonally(new BasicCoordinates(x, 0), -1));
        }

        for (let y = 1; y < this._gameArea.length; y++) {
            toDelete.push(...this.DeleteDiagonally(new BasicCoordinates(0, y), 1));
            toDelete.push(...this.DeleteDiagonally(new BasicCoordinates(GAME_TABLE_SIZE - 1, y), -1));
        }

        for (let coordinate of toDelete) {
            if (this._gameArea[coordinate.y][coordinate.x] != Color.Empty) {
                this._gameArea[coordinate.y][coordinate.x] = Color.Empty;
                this.points += 1;
            }
        }
        return toDelete.length > 0;
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

    private AddBalls() {
        let ballsToAdd = this.nextBallsGenerator.GetElements();
        let emptyCells = [];
        for (let y = 0; y < this._gameArea.length; y++) {
            for (let x = 0; x < this._gameArea[y].length; x++) {
                if (this._gameArea[y][x] == Color.Empty) {
                    emptyCells.push(new BasicCoordinates(x, y));
                }
            }
        }

        if (emptyCells.length <= ballsToAdd.length) {
            this.Finish();
            return;
        }
        for (let i = 0; i < ballsToAdd.length; i++) {
            let index = Math.round(Math.random() * (emptyCells.length - 1));
            let coordinates = emptyCells.splice(index, 1)[0] as BasicCoordinates;
            this._gameArea[coordinates.y][coordinates.x] = ballsToAdd[i];
        }
    }

    public GetElementAtCoordinates(coordinates: Coordinates) {
        return this._gameArea[coordinates.y]?.[coordinates.x];
    }

    public OnFinish(fn: Function): void {
        this._onFinish = fn;
    }

    public Finish() {
        this._gameState = GameState.Finished;
        if (!!this._onFinish) {
            this._onFinish(this.points, Date.now() - this._start);
        }
    }

    public OnRender(fn: Function): void {
        this._onRender = fn;
    }

    public Render(gameArea = this._gameArea, points = this.points, nextBalls = this.nextBallsGenerator.nextElements): void {
        if (!!this._onRender) {
            this._onRender({
                gameArea: gameArea,
                points: points,
                nextBalls: nextBalls
            });
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
        this.Generate();
    }

    private Generate() {
        this._futureElements = [];
        for (let i = 0; i < this.numberOfElementsToGenerate; i++) {
            let n = Math.round(Math.random() * (this.options.length - 1));
            this._futureElements.push(this.options[n]);
        }
    }

    public GetElements(): T[] {
        let tmp = this._futureElements;
        this.Generate();
        return tmp;
    }

    get nextElements(): T[] {
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
    Move,
    Trace,
    Rainbow
}

