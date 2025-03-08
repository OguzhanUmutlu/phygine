import Controller from "./Controller";
import RigidBody from "../body/RigidBody";
import Constraint from "../utils/Constraint";

export default class PullConstraintController extends Controller {
    requireMouse = true;
    holding: RigidBody | null = null;
    holdingConstraint: Constraint | null = null;
    button = 0;

    onMouseDown(e: MouseEvent) {
        if (e.button !== this.button) return;

        const mouse = this.renderer.mouse;
        const body = mouse.getBody(mouse.rin);

        if (body && body instanceof RigidBody) {
            this.holding = body;
            body.addConstraint(this.holdingConstraint = new Constraint(mouse.rin, 0, 10));
        }
    };

    onMouseUp() {
        if (this.holding) {
            this.holding.removeConstraint(this.holdingConstraint!);
            this.holding = null;
        }
    };
};
