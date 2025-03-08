import Vector from "../utils/Vector";
import World from "../World";
import CollisionDetails from "../collision/CollisionDetails";

export abstract class Body {
    world: World = null!;

    abstract getCollisionWith(other: Body): CollisionDetails | null;
    abstract collidesWithPoint(point: Vector): boolean;
    abstract getCenter(): Vector;
    abstract update(dt: number): void;
}