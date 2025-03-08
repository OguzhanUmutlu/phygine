import World from "../World";
import Vector from "../utils/Vector";
import Circle from "../shape/Circle";
import Controller from "../controller/Controller";
import Mouse from "./Mouse";
import RigidBody from "../body/RigidBody";

export default class Renderer {
    private frameId: number = -1;
    translation = new Vector;
    renderTranslation = new Vector;
    scale = new Vector(1, 1);
    renderScale = new Vector(1, 1);
    controllers: Controller[] = [];
    canvas: HTMLCanvasElement;
    mouse = new Mouse(this);
    keyboard: Record<string, boolean> = {};
    smoothTranslation = 0.1;
    smoothScaling = 0.1;
    showFps = true;
    showUps = true;
    renderCollisions = true;
    renderVelocities = true;
    renderConstraints = true;
    private fpsList: number[] = [];
    private handlingMouse = false;
    private handlingKeyboard = false;

    constructor(public readonly world: World, public ctx: CanvasRenderingContext2D) {
        this.canvas = ctx.canvas;
    };

    get fps() {
        return this.fpsList.length;
    };

    private updateMouseIn() {
        this.mouse.in.x = (this.mouse.pos.x - this.canvas.width / 2) / this.scale.x + this.translation.x;
        this.mouse.in.y = -(this.mouse.pos.y - this.canvas.height / 2) / this.scale.y - this.translation.y;
        this.mouse.rin.x = (this.mouse.pos.x - this.canvas.width / 2) / this.renderScale.x + this.renderTranslation.x;
        this.mouse.rin.y = -(this.mouse.pos.y - this.canvas.height / 2) / this.renderScale.y - this.renderTranslation.y;
    };

    private mouseDownEvent = (e: MouseEvent) => {
        this.mouse.down[e.button] = true;
        this.mouse.pos.x = e.offsetX;
        this.mouse.pos.y = e.offsetY;
        this.updateMouseIn();

        for (const controller of this.controllers) controller.onMouseDown(e);
    };

    private mouseUpEvent = (e: MouseEvent) => {
        delete this.mouse.down[e.button];

        for (const controller of this.controllers) controller.onMouseUp(e);
    };

    private mouseMoveEvent = (e: MouseEvent) => {
        this.mouse.pos.x = e.offsetX;
        this.mouse.pos.y = e.offsetY;
        this.updateMouseIn();

        for (const controller of this.controllers) controller.onMouseMove(e);
    };

    private clickEvent = (e: MouseEvent) => {
        for (const controller of this.controllers) controller.onClick(e);
    };

    private wheelEvent = (e: WheelEvent) => {
        for (const controller of this.controllers) controller.onWheel(e);
    };

    private keyDownEvent = (e: KeyboardEvent) => {
        const key = e.key;
        this.keyboard[key.length > 1 ? key : key.toLowerCase()] = true;

        for (const controller of this.controllers) controller.onKeyDown(e);
    };

    private keyPressEvent = (e: KeyboardEvent) => {
        for (const controller of this.controllers) controller.onKeyPress(e);
    };

    private keyUpEvent = (e: KeyboardEvent) => {
        const key = e.key;
        delete this.keyboard[key.length > 1 ? key : key.toLowerCase()];

        for (const controller of this.controllers) controller.onKeyUp(e);
    };

    private blurEvent = () => {
        this.mouse.down[0] = false;
        this.mouse.down[1] = false;
        this.mouse.down[2] = false;
    };

    private contextMenuEvent = (e: Event) => e.preventDefault();

    private registerBlurEvent() {
        addEventListener("blur", this.blurEvent);
    };

    private unregisterBlurEvent() {
        removeEventListener("blur", this.blurEvent);
    };

    registerMouseEvents() {
        if (this.handlingMouse) return;
        addEventListener("mousedown", this.mouseDownEvent);
        addEventListener("mouseup", this.mouseUpEvent);
        this.canvas.addEventListener("mousemove", this.mouseMoveEvent);
        this.canvas.addEventListener("wheel", this.wheelEvent);
        this.canvas.addEventListener("click", this.clickEvent);
        this.registerBlurEvent();
        this.handlingMouse = true;
    };

    unregisterMouseEvents() {
        if (!this.handlingMouse) return;
        removeEventListener("mousedown", this.mouseDownEvent);
        removeEventListener("mouseup", this.mouseUpEvent);
        this.canvas.removeEventListener("mousemove", this.mouseMoveEvent);
        this.canvas.removeEventListener("wheel", this.wheelEvent);
        this.canvas.removeEventListener("click", this.clickEvent);
        this.handlingMouse = false;
        if (!this.handlingKeyboard) this.unregisterBlurEvent();
    };

    registerKeyboardEvents() {
        if (this.handlingKeyboard) return;
        addEventListener("keydown", this.keyDownEvent);
        addEventListener("keypress", this.keyPressEvent);
        addEventListener("keyup", this.keyUpEvent);
        this.registerBlurEvent();
        this.handlingKeyboard = true;
    };

    unregisterKeyboardEvents() {
        if (!this.handlingKeyboard) return;
        removeEventListener("keydown", this.keyDownEvent);
        removeEventListener("keypress", this.keyPressEvent);
        removeEventListener("keyup", this.keyUpEvent);
        this.handlingKeyboard = false;
        if (!this.handlingMouse) this.unregisterBlurEvent();
    };

    noContextMenu() {
        this.canvas.addEventListener("contextmenu", this.contextMenuEvent);
    };

    disableNoContextMenu() {
        this.canvas.removeEventListener("contextmenu", this.contextMenuEvent);
    };

    addController(...classes: { new(renderer: Renderer): Controller }[]) {
        const controllers = classes.map(clazz => {
            const controller = new clazz(this);
            if (controller.requireMouse) this.registerMouseEvents();
            if (controller.requireKeyboard) this.registerKeyboardEvents();
            controller.init();
            return controller;
        });
        this.controllers.push(...controllers);
        return controllers;
    };

    autoResize(percentageX = 1, percentageY = 1) {
        const canvas = this.canvas;

        canvas.width = innerWidth * percentageX;
        canvas.height = innerHeight * percentageY;

        addEventListener("resize", () => {
            canvas.width = innerWidth * percentageX;
            canvas.height = innerHeight * percentageY;
        });
    };

    drawCircle(pos: Vector, radius: number) {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.arc(pos.x, -pos.y, radius, 0, 2 * Math.PI);
    };

    drawPolygon(pos: Vector, points: Vector[]) {
        const ctx = this.ctx;
        ctx.beginPath();

        const ox = pos.x;
        const oy = pos.y;

        const p0 = points[0];
        ctx.moveTo(ox + p0.x, -oy - p0.y);

        for (let i = 1; i < points.length; i++) {
            const point = points[i];
            ctx.lineTo(ox + point.x, -oy - point.y);
        }

        ctx.lineTo(ox + p0.x, -oy - p0.y);

        ctx.closePath();
    };

    drawVector(pos: Vector, vector: Vector) {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.moveTo(pos.x, -pos.y);
        ctx.lineTo(pos.x + vector.x, -pos.y - vector.y);
        ctx.stroke();
    };

    render() {
        const canvas = this.canvas;
        const ctx = this.ctx;
        const width = canvas.width;
        const height = canvas.height;
        ctx.strokeStyle = "white";
        ctx.lineWidth = 1;

        this.renderTranslation.scale(1 - this.smoothTranslation).add(this.translation.clone().scale(this.smoothTranslation));
        this.renderScale.scale(1 - this.smoothScaling).add(this.scale.clone().scale(this.smoothScaling));

        const t = Date.now();
        this.fpsList = this.fpsList.filter(i => t - i < 1000);
        this.fpsList.push(t);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.font = "30px monospace";
        if (this.showFps) ctx.fillText("FPS: " + this.fps, 0, 30);
        if (this.showUps) ctx.fillText("UPS: " + this.world.ups, 0, 60);

        ctx.save();

        ctx.translate(width / 2, height / 2);
        ctx.scale(this.renderScale.x, this.renderScale.y);
        ctx.translate(-this.renderTranslation.x, -this.renderTranslation.y);

        const bodies = this.world.getBodies();

        if (this.renderConstraints) for (let i = 0; i < bodies.length; i++) {
            const body = bodies[i];
            if (!(body instanceof RigidBody)) continue;

            const constraints = body.constraints;
            for (let i = 0; i < constraints.length; i++) {
                const constraint = constraints[i];
                ctx.strokeStyle = "white";
                this.drawVector(body.position, constraint.target.clone().sub(body.position));
            }
        }

        for (let i = 0; i < bodies.length; i++) {
            const body = bodies[i];
            if (!(body instanceof RigidBody)) continue;

            const shape = body.shape;
            const pos = body.position;

            if (shape instanceof Circle) this.drawCircle(pos, shape.radius);
            else this.drawPolygon(pos, shape.calcPoints);
            ctx.stroke();

            const collision = body.currentCollision;

            if (collision && this.renderCollisions) {
                ctx.fillStyle = "red";
                this.drawCircle(collision.overlapUnit.clone().scale((<Circle>body.shape).radius).add(pos), 5);
                ctx.fill();

                ctx.strokeStyle = "white";
                this.drawVector(pos, collision.overlapUnit.clone().scale(10));
                ctx.stroke();
            }

            if (this.renderVelocities) {
                ctx.strokeStyle = "green";
                this.drawVector(pos, body.velocity.clone().scale(1 / 10));
                ctx.stroke();
                ctx.strokeStyle = "white";
            }
        }

        ctx.restore();
    };

    private frameLoop() {
        this.render();
        requestAnimationFrame(() => this.frameLoop());
    };

    startFrameLoop() {
        this.stopFrameLoop();
        this.frameLoop();
    };

    stopFrameLoop() {
        clearInterval(this.frameId);
        this.frameId = -1;
    };
};
