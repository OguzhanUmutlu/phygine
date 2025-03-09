import Vector from "../utils/Vector";
import Circle from "../shape/Circle";
import Polygon from "../shape/Polygon";
import {Body} from "../body/Body";

export default class CollisionDetails {
    a!: (Circle | Polygon);
    b!: (Circle | Polygon);
    overlapUnit = new Vector();
    overlapV = new Vector();
    overlap = Number.MAX_VALUE;
    aInB = true;
    bInA = true;
    bodyA: Body = null!;
    bodyB: Body = null!;

    clear() {
        this.aInB = true;
        this.bInA = true;
        this.overlap = Number.MAX_VALUE;
    };
};