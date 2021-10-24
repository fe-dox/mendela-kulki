import {BasicCoordinates, Coordinates} from './Coordinates';

export type Grid = GridElement[][];

export class PathFindingEngine {
    private readonly grid: Grid;

    constructor(grid: Grid) {
        this.grid = grid;
    }

    public static InstantiateAndFind(grid: Grid, start: Coordinates, end: Coordinates): GridElement[] {
        let engine = new PathFindingEngine(grid);
        return engine.Search(start, end);
    }

    public Search(start: Coordinates, end: Coordinates): GridElement[] {
        let toVisit: GridElement[] = [];
        if (!this.CoordinatesAreValid(start) || !this.CoordinatesAreValid(end)) {
            return [];
        }

        let startGridElement = this.GetElementAtCoordinates(start);
        startGridElement.g = 0;
        startGridElement.h = PathFindingEngine.GetHeuristicDistance(startGridElement.position, end);

        toVisit.push(startGridElement);
        while (toVisit.length > 0) {
            let currentNodeIndex = 0;
            for (let i = 0; i < toVisit.length; i++) {
                if (toVisit[i].f < toVisit[currentNodeIndex].f) {
                    currentNodeIndex = i;
                }
            }

            let currentNode = toVisit[currentNodeIndex];
            if (currentNode.position.Equals(end)) {
                let tmpCurrent = currentNode;
                let path = [];
                while (!!tmpCurrent.parent) {
                    path.push(tmpCurrent.position);
                    tmpCurrent = tmpCurrent.parent;
                }
                return path.reverse();
            }
            toVisit.splice(currentNodeIndex, 1);
            currentNode.closed = true;

            for (let neighbor of this.GetNeighbors(currentNode)) {

                if (neighbor.closed || neighbor.isWall()) {
                    continue;
                }

                let gScore = currentNode.g + 1;
                let gScoreIsBest = false;

                if (!neighbor.visited) {
                    gScoreIsBest = true;
                    neighbor.h = PathFindingEngine.GetHeuristicDistance(neighbor.position, end);
                    neighbor.visited = true;
                    toVisit.push(neighbor);
                } else if (gScore < neighbor.g) {
                    gScoreIsBest = true;
                }

                if (gScoreIsBest) {
                    neighbor.parent = currentNode;
                    neighbor.g = gScore;
                }
            }
        }
        return [];
    }

    private CoordinatesAreValid(coordinates: Coordinates): boolean {
        if (coordinates.y >= 0 && coordinates.y < this.grid.length) {
            if (coordinates.x >= 0 && coordinates.x < this.grid[coordinates.y].length) {
                return true;
            }
        }
        return false;
    }

    private GetElementAtCoordinates(coordinates: Coordinates) {
        return this.grid[coordinates.y]?.[coordinates.x];
    }

    private GetNeighbors(element: GridElement): GridElement[] {
        let tmp: GridElement[] = [];
        let x = element.position.x;
        let y = element.position.y;
        let coords1 = new BasicCoordinates(x, y + 1);
        if (this.CoordinatesAreValid(coords1)) {
            tmp.push(this.GetElementAtCoordinates(coords1));
        }
        let coords2 = new BasicCoordinates(x, y - 1);
        if (this.CoordinatesAreValid(coords2)) {
            tmp.push(this.GetElementAtCoordinates(coords2));
        }
        let coords3 = new BasicCoordinates(x + 1, y);
        if (this.CoordinatesAreValid(coords3)) {
            tmp.push(this.GetElementAtCoordinates(coords3));
        }
        let coords4 = new BasicCoordinates(x - 1, y);
        if (this.CoordinatesAreValid(coords4)) {
            tmp.push(this.GetElementAtCoordinates(coords4));
        }
        return tmp;
    }

    private static GetHeuristicDistance(startPosition: Coordinates, endPosition: Coordinates) {
        return Math.abs(startPosition.x - endPosition.x) + Math.abs(startPosition.y - endPosition.y);
    }

}

export abstract class GridElement {
    public get f() {
        return this.g + this.h;
    }

    public g: number;
    public h: number;
    public parent: GridElement;
    public visited: boolean;
    public closed: boolean;
    public abstract position: Coordinates;

    abstract isWall(): boolean

    protected constructor() {
        this.g = null;
        this.h = null;
        this.parent = undefined;
        this.visited = false;
        this.closed = false;
    }
}
