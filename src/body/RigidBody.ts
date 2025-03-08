import Circle from "../shape/Circle";
import Polygon from "../shape/Polygon";
import Vector from "../utils/Vector";
import CollisionDetails from "../collision/CollisionDetails";
import World from "../World";
import Constraint from "../utils/Constraint";
import {BaseCollisions, PointCollisions} from "../collision/Collider";
import {Body} from "./Body";

export type RigidBodyCreationOptions = {
    isStatic?: boolean; mass?: number; position?: Vector; velocity?: Vector; acceleration?: Vector; world?: World;
};

export default class RigidBody extends Body {
    position = new Vector;

    velocity = new Vector;
    acceleration = new Vector;
    isStatic = false;
    mass = 1;
    world: World = null!;
    shapeName: "Circle" | "Polygon";
    constraints: Constraint[] = [];
    collisionVelocityLoss = 0.9;

    static create(shape: Circle | Polygon, options: RigidBodyCreationOptions = {}) {
        const body = new RigidBody(shape);

        body.isStatic = options.isStatic ?? false;
        body.mass = options.mass ?? 1;
        body.position = options.position ?? new Vector;
        body.velocity = options.velocity ?? new Vector;
        body.acceleration = options.acceleration ?? new Vector;

        shape.position = body.position;

        body.world = options.world!;

        if (options.world) {
            options.world.addBody(body);
        }

        return body;
    }

    constructor(public shape: Circle | Polygon) {
        super();
        this.shapeName = this.shape instanceof Circle ? "Circle" : "Polygon";
    };

    addConstraint(constraint: Constraint) {
        this.constraints.push(constraint);
        return this;
    };

    removeConstraint(constraint: Constraint) {
        const index = this.constraints.indexOf(constraint);
        if (index === -1) return this;
        this.constraints.splice(index);
        return this;
    };

    constrainWith(other: RigidBody, minLength: number, k: number) {
        this.addConstraint(new Constraint(other.position, minLength, k));
        other.addConstraint(new Constraint(this.position, minLength, k));
        return this;
    };

    getCollisionWith(other: Body) {
        if (other instanceof RigidBody) {
            const fn = BaseCollisions[<keyof typeof BaseCollisions>(this.shapeName + other.shapeName)];
            return <CollisionDetails>fn(<never>this.shape, <never>other.shape, true);
        }

        return null;
    };

    collidesWithPoint(point: Vector) {
        return PointCollisions[<keyof typeof PointCollisions>this.shapeName](<never>point, <never>this.shape);
    };

    get currentCollision() {
        const bodies = this.world.getBodies();

        for (let i = 0; i < bodies.length; i++) {
            const other = bodies[i];
            if (other === this) continue;
            const collision = this.getCollisionWith(other);
            if (collision) return collision;
        }

        return null;
    };

    getCenter() {
        return this.shape.getCenter();
    };

    update(dt: number) {
        if (!this.isStatic) {
            this.velocity.add(this.world.gravity.clone().scale(dt));

            for (let i = 0; i < this.constraints.length; i++) {
                this.constraints[i].apply(this, dt);
            }

            this.velocity.x += this.acceleration.x * dt;
            this.velocity.y += this.acceleration.y * dt;
            const dx = this.velocity.x * dt;
            const dy = this.velocity.y * dt;
            this.position.x += dx;
            this.position.y += dy;

            const current = this.currentCollision;

            if (current) {
                this.acceleration.x = 0;
                this.acceleration.y = 0;

                this.position.sub(current.overlapV);
                this.velocity.setFrom(this.velocity.reflectUnit(current.overlapUnit).reverse().scale(this.collisionVelocityLoss));
            }
        }
    };
};
