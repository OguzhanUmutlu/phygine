import Vector from "./Vector";
import RigidBody from "../body/RigidBody";

export default class Constraint {
    constructor(public target: Vector, public minLength: number, public k: number) {
    };

    apply(body: RigidBody, dt: number) {
        const diff = this.target.clone().sub(body.position);
        const dist = diff.len();

        if (dist < this.minLength) return;

        const x = dist - this.minLength;
        const force = diff.normalize().scale(this.k * x);

        body.velocity.add(force.scale(1 / body.mass * dt));
    };
}