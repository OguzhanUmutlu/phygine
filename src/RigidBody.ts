import Engine from "./Engine";
import {doPolygonsIntersect} from "./Collision";
import Renderer from "./Renderer";

const DEFAULT_OPTIONS = {} as const;

export type RigidBodyOptions = {};

export default class RigidBody {
    options;
    __vertices: Float32Array = new Float32Array(0);
    __rotatedVertices: Float32Array = new Float32Array(0);
    __transformedRotatedVertices: Float32Array = new Float32Array(0);
    force: Float32Array = new Float32Array(2);
    velocity: Float32Array = new Float32Array(2);
    x: number = 0;
    y: number = 0;
    rotation: number = 0;
    canUpdate = true;
    ropedTo: RigidBody[] = [];

    constructor(options: RigidBodyOptions = {}) {
        if (typeof options !== "object") options = {};
        options = {...DEFAULT_OPTIONS, ...options};
        this.options = options;
        this.recalculateVertices();
    };

    fixedUpdate(engine: Engine, deltaTime: number) {
        if (!this.canUpdate) return;

        const vx = this.velocity[0] += (this.force[0] + engine.gravity[0]) * deltaTime;
        const vy = this.velocity[1] += (this.force[1] + engine.gravity[1]) * deltaTime;

        const dx = vx * deltaTime;
        const dy = vy * deltaTime;

        this.doMove(engine, dx, dy);
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
        ctx.stroke();
        ctx.closePath();
    };

    doMove(engine: Engine, dx: number, dy: number) {
        const hasInitialCollision = this.collidesWithAnyBody(engine.bodies);
        this.x += dx;
        this._doShapeTransform();
        if (hasInitialCollision === null) {
            const xCollision = this.collidesWithAnyBody(engine.bodies);
            if (xCollision !== null) {
                this.x -= dx;
                this.velocity[0] = 0;
                this._doShapeTransform();
            }
        }

        this.y += dy;
        this._doShapeTransform();
        if (hasInitialCollision === null) {
            const yCollision = this.collidesWithAnyBody(engine.bodies);
            if (yCollision !== null) {
                this.y -= dy;
                this.velocity[1] = 0;
                this._doShapeTransform();
            }
        }
    };

    collidesWith(body: RigidBody) {
        return doPolygonsIntersect(this.__transformedRotatedVertices, body.__transformedRotatedVertices);
    };

    collidesWithAnyBody(bodies: RigidBody[]) {
        for (let i = 0; i < bodies.length; i++) {
            const body = bodies[i];
            if (body !== this && this.collidesWith(body)) return body;
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
        const {x, y, rotation} = this;
        this.__rotatedVertices = new Float32Array(this.__vertices.length);
        for (let i = 0; i < this.__vertices.length; i += 2) {
            const vertexX = this.__vertices[i];
            const vertexY = this.__vertices[i + 1];

            const cosx = Math.cos(rotation);
            const sinx = Math.sin(rotation);

            const deltaX = vertexX - x;
            const deltaY = vertexY - y;

            this.__rotatedVertices[i] = x + deltaX * cosx - deltaY * sinx;
            this.__rotatedVertices[i + 1] = y + deltaX * sinx + deltaY * cosx;
        }
    };

    setVerticesFromVectorArray(array: { x: number, y: number }[]) {
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