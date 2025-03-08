import Vector from "../utils/Vector";
import Renderer from "./Renderer";

export default class Mouse {
    pos = new Vector;
    in = new Vector;
    rin = new Vector;
    down = [false, false, false];

    constructor(public renderer: Renderer) {
    };

    getBody(in_ = this.in) {
        return this.renderer.world.getBodies().find(i => i.collidesWithPoint(in_));
    };
}