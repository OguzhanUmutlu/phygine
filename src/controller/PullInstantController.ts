import Controller from "./Controller";
import {Body} from "../body/Body";

export default class PullInstantController extends Controller {
    requireMouse = true;
    holding: Body | null = null;
    button = 0;

    onMouseDown(e: MouseEvent) {
        if (e.button !== this.button) return;

        const mouse = this.renderer.mouse;
        const body = mouse.getBody(mouse.rin);

        if (body) {
            this.holding = body;
        }
    };

    onMouseMove() {
        if (this.holding) {
            const mouse = this.renderer.mouse;

            this.holding.position.setFrom(mouse.rin);
        }
    };

    onMouseUp() {
        if (this.holding) {
            this.holding = null;
        }
    };
};
