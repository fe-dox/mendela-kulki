import Game, {Color, GAME_TABLE_SIZE, GameArea, GameState} from "./Game";
import {BasicCoordinates, Coordinates} from './Coordinates';

(async function () {
    const mountPoint = document.getElementById("gameArea");

    const pointsMount = document.getElementById("points");

    const futureBallsMount = document.getElementById("futureBalls");
    let futureBallsTable = document.createElement("table");
    futureBallsMount.append(futureBallsTable);

    let futureBallsRow = document.createElement("tr");
    futureBallsTable.append(futureBallsRow);

    const futureBalls: HTMLElement[] = [];

    for (let i = 0; i < 3; i++) {
        let td = document.createElement('td');
        futureBallsRow.append(td);
        let div = document.createElement("div");
        td.append(div);
        futureBalls.push(div);
    }

    const game = new Game();

    const table = document.createElement('table');
    const gameDivs: HTMLElement[][] = [];
    let selectedCoordinates: Coordinates = undefined;

    for (let y = 0; y < GAME_TABLE_SIZE; y++) {
        let tr = document.createElement('tr');
        let tmpInnerDivsArr: HTMLElement[] = [];
        for (let x = 0; x < GAME_TABLE_SIZE; x++) {
            let td = document.createElement('td');
            let innerDiv = document.createElement('div');
            td.append(innerDiv);

            let thisCoordinates = new BasicCoordinates(x, y);

            td.addEventListener('click', async () => {
                if (game.gameState != GameState.Ready) return;
                if (selectedCoordinates != undefined) {
                    if (thisCoordinates.Equals(selectedCoordinates)) {
                        innerDiv.classList.remove("selected");
                        selectedCoordinates = undefined;
                    } else if (game.GetElementAtCoordinates(thisCoordinates) == Color.Empty) {
                        let success = await game.Move(selectedCoordinates, thisCoordinates);
                        if (success) {
                            gameDivs[selectedCoordinates.y][selectedCoordinates.x].classList.remove("selected");
                            selectedCoordinates = undefined;
                        }
                    } else {
                        gameDivs[selectedCoordinates.y][selectedCoordinates.x].classList.remove("selected");
                        innerDiv.classList.add("selected");
                        selectedCoordinates = thisCoordinates;
                    }
                } else if (game.GetElementAtCoordinates(thisCoordinates) != Color.Empty) {
                    selectedCoordinates = new BasicCoordinates(x, y);
                    innerDiv.classList.add("selected");
                }

            });

            td.addEventListener('mouseover', () => {
                if (selectedCoordinates == undefined || game.gameState != GameState.Ready) {
                    return;
                }
                game.PreviewMove(selectedCoordinates, thisCoordinates);
            });


            tr.append(td);
            tmpInnerDivsArr.push(innerDiv);
        }
        gameDivs.push(tmpInnerDivsArr);
        table.append(tr);
    }
    mountPoint.append(table);
    game.OnRender(({gameArea, points, nextBalls}: { gameArea: GameArea, points: number, nextBalls: Color[] }) => {
        for (let y = 0; y < gameArea.length; y++) {
            for (let x = 0; x < gameArea[y].length; x++) {
                let color: Color = gameArea[y][x];
                gameDivs[y][x].style.background = GetCssFromColor(color);
            }
        }
        pointsMount.innerText = String(points);
        futureBalls[0].style.background = GetCssFromColor(nextBalls[0]);
        futureBalls[1].style.background = GetCssFromColor(nextBalls[1]);
        futureBalls[2].style.background = GetCssFromColor(nextBalls[2]);
    });

    game.OnFinish(() => {
        document.getElementById("GameOver").innerText = "Koniec gry, serdeczne gratulacje";
    });

    game.Init();


})();

function GetCssFromColor(color: Color) {
    switch (color) {
        case Color.Empty:
            return "white";
        case Color.Green:
            return "lightgreen";
        case Color.Red:
            return "coral";
        case Color.Blue:
            return "skyblue";
        case Color.Yellow:
            return "wheat";
        case Color.Cyan:
            return "mediumaquamarine";
        case Color.Magenta:
            return "mediumorchid";
        case Color.Lime:
            return "greenyellow";
        case Color.Move:
            return "lightgray";
        case Color.Trace:
            return "silver";
        default:
            return "white";
    }

}
