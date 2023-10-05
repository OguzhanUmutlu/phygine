import RigidBody from "./RigidBody";
import {expectType} from "./Utils";

const DEFAULT_OPTIONS = {
    gravity: {x: 0, y: -9.807}
} as const;

export type EngineOptions = {
    gravity?: { x: number, y: number }
};

export default class Engine {
    ups: number = 0;
    __lastUpdate = 0;
    __updateCb = () => this.__update();
    __fixedCounter = 0;
    fixedDeltaTime = 0.002;
    bodies: RigidBody[] = [];
    options;
    canUpdate = true;
    gravity: Float32Array = new Float32Array(2);

    constructor(options: EngineOptions = {}) {
        if (typeof options !== "object") options = {};
        options = {...DEFAULT_OPTIONS, ...options};
        if (options.gravity) {
            expectType(options.gravity, "object", "gravity");
            this.gravity[0] = options.gravity.x;
            this.gravity[1] = options.gravity.y;
        }
        this.options = options;
        this.__update();
    };

    __update() {
        const deltaTime = (Date.now() - this.__lastUpdate) / 1000;
        this.ups = 1 / deltaTime;
        this.__lastUpdate = Date.now();
        setTimeout(this.__updateCb);
        if (!this.canUpdate) return;
        if ((this.__fixedCounter += deltaTime) >= this.fixedDeltaTime) {
            this.__fixedCounter -= this.fixedDeltaTime;
            for (let i = 0; i < this.bodies.length; i++) {
                const body = this.bodies[i];
                body.fixedUpdate(this);
            }
        }
    };

    add(...bodies: RigidBody[]) {
        for (const body of bodies) {
            if (this.bodies.includes(body)) continue;
            this.bodies.push(body);
        }
    };
}