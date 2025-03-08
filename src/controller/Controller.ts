import Renderer from "../render/Renderer";

export default abstract class Controller {
    requireMouse = false;
    requireKeyboard = false;

    constructor(public renderer: Renderer) {
    };

    init(): void {
    };

    onMouseDown(e: MouseEvent) {
    };

    onMouseUp(e: MouseEvent) {
    };

    onMouseMove(e: MouseEvent) {
    };

    onClick(e: MouseEvent) {
    };

    onKeyDown(e: KeyboardEvent) {
    };

    onKeyPress(e: KeyboardEvent) {
    };

    onKeyUp(e: KeyboardEvent) {
    };

    onWheel(e: WheelEvent) {
    };
};
