import Vector from "./utils/Vector";
import {Body} from "./body/Body";
import Circle from "./shape/Circle";
import Polygon from "./shape/Polygon";
import RigidBody, {RigidBodyCreationOptions} from "./body/RigidBody";

export default class World {
    private bodies: Body[] = [];
    private interval: NodeJS.Timeout | number = -1;
    gravity = new Vector(0, -500);
    updateList: number[] = [];

    get ups() {
        return this.updateList.length;
    };

    createRigidBody(shape: Circle | Polygon, options: Exclude<RigidBodyCreationOptions, "world"> = {}) {
        return RigidBody.create(shape, {...options, world: this});
    };

    addBody(body: Body) {
        if (this.bodies.includes(body)) return;
        this.bodies.push(body);
        body.world = this;
    };

    getBodies() {
        return this.bodies;
    };

    setBodies(bodies: Body[]) {
        this.bodies = bodies;
        for (const body of bodies) body.world = this;
    };

    update(dt: number) {
        if (dt <= 0) return;

        dt = Math.min(1 / 60, dt);
        const bodies = this.bodies;

        for (let i = 0; i < bodies.length; i++) {
            const body = bodies[i];
            body.update(dt);
        }
    };

    startInterval() {
        this.stopInterval();
        let lastUpdate = performance.now();
        this.interval = setInterval(() => {
            const now = performance.now();
            this.updateList = this.updateList.filter(i => now - i < 1000);
            this.updateList.push(now);

            const dt = (now - lastUpdate) / 1000;
            lastUpdate = now;
            this.update(dt);
        });
    };

    stopInterval() {
        clearInterval(this.interval);
        this.interval = -1;
    };

    startWorker() {
    };
};
