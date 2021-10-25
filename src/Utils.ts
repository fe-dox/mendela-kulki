import {Color} from './Game';

/**
 *
 * @param on
 * @decorator
 */
function MakeColorBlind(on: boolean) {
    return function (target: any, name: string, descriptor: PropertyDescriptor) {
        let org = descriptor.value;
        descriptor.value = function (...args: any[]) {
            if (!on) {
                return org.apply(this, args);
            }
            let color = args[0];
            if (color == Color.Empty || color == Color.Trace || color == Color.Move) {
                return org.apply(this, args);
            }
            return "black";
        };
    };
}

export default class Utils {
    public static Delay(milliseconds: number) {
        return new Promise<void>(resolve => {
            setTimeout(() => resolve(), milliseconds);
        });
    }

    @MakeColorBlind(!!new URLSearchParams(window.location.search).get("colorBlind"))
    public static GetCssFromColor(color: Color) {
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
}
