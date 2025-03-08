import Controller from "./Controller";

export default class PanController extends Controller {
    button: 0 | 1 | 2 = 2;

    onMouseMove(e: MouseEvent) {
        if (!this.renderer.mouse.down[this.button]) return;

        const renderer = this.renderer;
        const scale = renderer.scale;
        const translation = renderer.translation;

        translation.x -= e.movementX / scale.x;
        translation.y -= e.movementY / scale.y;
    };
};
