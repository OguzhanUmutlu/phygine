import Engine from "./Engine";
import {doPolygonsIntersect} from "./Collision";
import Renderer from "./Renderer";

const DEFAULT_OPTIONS = {} as const;

export type RigidBodyOptions = {};
export type RigidBodyRenderOptions = {
    fillStyle: string | null,
    strokeStyle: string | null
};

export default class RigidBody {
    options;
    __vertices: Float32Array = new Float32Array(0);
    __rotatedVertices: Float32Array = new Float32Array(0);
    __transformedRotatedVertices: Float32Array = new Float32Array(0);
    renderOptions: RigidBodyRenderOptions = {
        fillStyle: null,
        strokeStyle: null
    };
    velocity: Float32Array = new Float32Array(3); // [velocityX, velocityY, angularVelocity]
    x: number = 0;
    y: number = 0;
    rotation: number = 0;
    canUpdate = true;
    ropes: RigidBody[] = [];
    mass = 1; // kg
    momentOfInertia = 0.5;

    constructor(options: RigidBodyOptions = {}) {
        if (typeof options !== "object") options = {};
        options = {...DEFAULT_OPTIONS, ...options};
        this.options = options;
        this.recalculateVertices();
    };

    fixedUpdate(engine: Engine, deltaTime: number) {
        if (!this.canUpdate) return;

        this.applyGravity(engine);
        this.applyAirFriction(engine);

        const dx = this.velocity[0] * deltaTime;
        const dy = this.velocity[1] * deltaTime;
        const dr = this.velocity[2] * deltaTime;

        this.drag(engine, dx, dy);
        this.turn(engine, dr);
    };

    render(renderer: Renderer) {
        const vertices = this.__transformedRotatedVertices;
        if (vertices.length < 2) return;
        const ctx = renderer.__context;
        if (ctx === null) return;
        const cameraX = renderer.camera[0];
        const cameraY = renderer.camera[1];
        ctx.beginPath();
        const startX = vertices[0] + cameraX + innerWidth / 2;
        const startY = -vertices[1] + cameraY + innerHeight / 2;
        ctx.moveTo(startX, startY);
        for (let i = 2; i < vertices.length; i += 2) {
            const x1 = vertices[i];
            const y1 = vertices[i + 1];
            ctx.lineTo(x1 + cameraX + innerWidth / 2, -y1 + cameraY + innerHeight / 2);
        }
        ctx.lineTo(startX, startY);
        if (this.renderOptions.fillStyle) {
            ctx.fillStyle = this.renderOptions.fillStyle;
            ctx.fill();
        }
        if (this.renderOptions.strokeStyle) {
            ctx.strokeStyle = this.renderOptions.strokeStyle;
            ctx.stroke();
        }
        ctx.closePath();
    };

    turnTo(engine: Engine, r: number) {
        this.turn(engine, this.rotation - r);
    };

    turn(engine: Engine, dr: number) {
        this.rotation += dr;
        this._doShapeRotation();
        this._doShapeTransform();
        const rCollision = this.collidesWithAnyBody(engine.bodies, true);
        if (rCollision !== null) {
            this.rotation -= dr;
            this.onHitBody(rCollision.body, rCollision.data);
            this._doShapeRotation();
            this._doShapeTransform();
        }
    };

    dragTo(engine: Engine, x: number, y: number) {
        this.drag(engine, x - this.x, y - this.y);
    };

    drag(engine: Engine, dx: number, dy: number) {
        this.x += dx;
        this._doShapeTransform();
        const xCollision = this.collidesWithAnyBody(engine.bodies, true);
        if (xCollision !== null) {
            this.x -= dx;
            this.onHitBody(xCollision.body, xCollision.data);
            this._doShapeTransform();
        }

        this.y += dy;
        this._doShapeTransform();
        const yCollision = this.collidesWithAnyBody(engine.bodies, true);
        if (yCollision !== null) {
            this.y -= dy;
            this.onHitBody(yCollision.body, yCollision.data);
            this._doShapeTransform();
        }
    };

    applyForce(engine: Engine, x: number, y: number) {
        this.velocity[0] += x * engine.fixedDeltaTime;
        this.velocity[1] += y * engine.fixedDeltaTime;
    };

    applyTorque(engine: Engine, torque: number) {
        this.velocity[2] += torque * engine.fixedDeltaTime;
    };

    applyGravity(engine: Engine) {
        this.applyForce(engine, engine.gravity[0], engine.gravity[1]);
    };

    applyAirFriction(engine: Engine) {
        this.velocity[0] *= (1 - engine.airFrictionCoefficient);
        this.velocity[1] *= (1 - engine.airFrictionCoefficient);
    };

    onHitBody(body: RigidBody, collision: Float32Array) {
        if (collision.length !== 10) throw new Error("Expected the collision to have the hit point information.");
        const COR = 0.5;
        const relativeVelocity = {
            x: body.velocity[0] - this.velocity[0],
            y: body.velocity[1] - this.velocity[1],
        };
        const dx = this.x - body.x;
        const dy = this.y - body.y;
        const len = Math.sqrt(dx ** 2 + dy ** 2);
        const normalizedX = dx / len;
        const normalizedY = dy / len;
        const J1 = (-COR * (normalizedX * relativeVelocity.x + normalizedY * relativeVelocity.y)) / this.momentOfInertia;
        const J2 = (-COR * (normalizedX * relativeVelocity.x + normalizedY * relativeVelocity.y)) / body.momentOfInertia;
        const deltaAngularVelocity1 = ((collision[8] - this.x) * normalizedY - (collision[9] - this.y) * normalizedX) * J1;
        const deltaAngularVelocity2 = ((collision[8] - body.x) * normalizedY - (collision[9] - body.y) * normalizedX) * J2;
        this.velocity[2] += deltaAngularVelocity1;
        body.velocity[2] += deltaAngularVelocity2;
        if (!body.canUpdate) {
            if (this.y > collision[5] && this.y > collision[7]) this.velocity[1] = 0;
            return;
        }
        const totalMass = this.mass + body.mass;
        const totalInertia = this.momentOfInertia + body.momentOfInertia;
        const dm = this.mass - body.mass;
        const di = this.momentOfInertia - body.momentOfInertia;
        const v1x = this.velocity[0];
        const v1y = this.velocity[1];
        const v2x = body.velocity[0];
        const v2y = body.velocity[1];
        const w1 = this.velocity[2];
        const w2 = body.velocity[2];
        this.velocity[0] = (2 * body.mass * v2x + dm * v1x) / totalMass;
        this.velocity[1] = (2 * body.mass * v2y + dm * v1y) / totalMass;
        this.velocity[2] = (2 * body.momentOfInertia * w2 + di * w1) / totalInertia;
        body.velocity[0] = (2 * this.mass * v1x - dm * v2x) / totalMass;
        body.velocity[1] = (2 * this.mass * v1y - dm * v2y) / totalMass;
        body.velocity[2] = (2 * this.momentOfInertia * w1 - di * w2) / totalInertia;
    };

    collidesWith(body: RigidBody, wantHitPoint: boolean) {
        return doPolygonsIntersect(this.__transformedRotatedVertices, body.__transformedRotatedVertices, wantHitPoint);
    };

    collidesWithAnyBody(bodies: RigidBody[], wantHitPoint: boolean) {
        for (let i = 0; i < bodies.length; i++) {
            const body = bodies[i];
            if (body === this) continue;
            const collision = this.collidesWith(body, wantHitPoint);
            if (collision) return {body, data: collision};
        }
        return null;
    };

    _doShapeTransform() {
        const {x, y} = this;
        this.__transformedRotatedVertices = new Float32Array(this.__rotatedVertices.length);
        for (let i = 0; i < this.__rotatedVertices.length; i += 2) {
            this.__transformedRotatedVertices[i] = this.__rotatedVertices[i] + x;
            this.__transformedRotatedVertices[i + 1] = this.__rotatedVertices[i + 1] + y;
        }
    };

    _doShapeRotation() {
        const {rotation} = this;
        this.__rotatedVertices = new Float32Array(this.__vertices.length);
        for (let i = 0; i < this.__vertices.length; i += 2) {
            const vertexX = this.__vertices[i];
            const vertexY = this.__vertices[i + 1];

            const cosx = Math.cos(rotation);
            const sinx = Math.sin(rotation);

            this.__rotatedVertices[i] = vertexX * cosx - vertexY * sinx;
            this.__rotatedVertices[i + 1] = vertexX * sinx + vertexY * cosx;
        }
    };

    setVerticesFromVectors(array: { x: number, y: number }[]) {
        this.__vertices = new Float32Array(array.length * 2);
        for (let i = 0; i < array.length; i++) {
            this.__vertices[2 * i] = array[i].x;
            this.__vertices[2 * i + 1] = array[i].y;
        }
    };

    setVertices(array: Float32Array) {
        this.__vertices = array;
        this.recalculateVertices();
        return this;
    };

    recalculateVertices() {
        this._doShapeRotation();
        this._doShapeTransform();
    };
}