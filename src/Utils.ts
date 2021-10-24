export default class Utils {
    public static Delay(milliseconds: number) {
        return new Promise<void>(resolve => {
            setTimeout(() => resolve(), milliseconds);
        });
    }
}
