import Circle from "../shape/Circle";
import Polygon from "../shape/Polygon";
import Vector from "../utils/Vector";
import CollisionDetails from "../collision/CollisionDetails";
import World from "../World";
import Constraint from "../utils/Constraint";
import {BaseCollisions, PointCollisions} from "../collision/Collider";
import {Body} from "./Body";

export type RigidBodyCreationOptions = {
    isStatic?: boolean; mass?: number; position?: Vector; velocity?: Vector; angularVelocity?: number; world?: World;
};

export default class RigidBody extends Body {
    position = new Vector;

    velocity = new Vector;
    angularVelocity = 0;
    isStatic = false;
    mass = 1;
    world: World = null!;
    shapeName: "Circle" | "Polygon";
    constraints: Constraint[] = [];
    collisionVelocityLoss = 0.1;
    restitution = 2;

    static create(shape: Circle | Polygon, options: RigidBodyCreationOptions = {}) {
        const body = new RigidBody(shape);

        body.isStatic = options.isStatic ?? false;
        body.mass = options.mass ?? 1;
        body.position = options.position ?? new Vector;
        body.velocity = options.velocity ?? new Vector;
        body.angularVelocity = options.angularVelocity ?? 0;

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
            const details = <CollisionDetails>fn(<never>this.shape, <never>other.shape, true);

            if (details) {
                details.bodyA = this;
                details.bodyB = other;
                return details;
            }
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

    applyForce(force: Vector, t = 0.1) {
        const c = t / this.mass;
        this.velocity.x += force.x * c;
        this.velocity.y += force.y * c;
    };

    applyTorque(torque: number, t = 0.1) {
        const c = t / this.mass;
        this.angularVelocity += torque * c;
    };

    update(dt: number) {
        if (!this.isStatic) {
            this.applyForce(this.world.gravity.scaleCopy(this.mass), dt);

            for (let i = 0; i < this.constraints.length; i++) {
                this.constraints[i].apply(this, dt);
            }

            const dx = this.velocity.x * dt;
            const dy = this.velocity.y * dt;
            this.position.x += dx;
            this.position.y += dy;

            const current = this.currentCollision;

            if (current) {

                this.position.sub(current.overlapV);
                this.velocity.setFrom(this.velocity.reflectUnit(current.overlapUnit).reverse().scale(1 - this.collisionVelocityLoss));
                /*return;
                const other = <RigidBody>current.bodyB;

                const ma = this.mass;
                const mb = other.mass;
                const m_total = ma + mb;
                const ra = this.restitution;
                const rb = other.isStatic ? 0 : other.restitution;
                const vax = this.velocity.x;
                const vay = this.velocity.y;
                const vbx = other.velocity.x;
                const vby = other.velocity.y;

                // this.velocity.setFrom(va.scale(ma / (ma + mb) * ra).sub(vb.scale(mb / (ma + mb) * rb).reverse()).scale(1 - this.collisionVelocityLoss));
                const ca1 = ma - ra * mb;
                const ca2 = (1 + ra) * mb;
                this.velocity.x = -(vax * ca1 + vbx * ca2) / m_total;
                this.velocity.y = (vay * ca1 + vby * ca2) / m_total;

                if (other.isStatic) return;

                const cb1 = mb - rb * ma;
                const cb2 = (1 + rb) * ma;
                other.velocity.x = -(vbx * cb1 + vax * cb2) / m_total;
                other.velocity.y = (vby * cb1 + vay * cb2) / m_total;*/
            }
        }
    };
};
