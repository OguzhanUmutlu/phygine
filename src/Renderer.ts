import {expectAny, expectInstance, expectType} from "./Utils";
import Engine from "./Engine";

const DEFAULT_OPTIONS = {} as const;

export type RendererOptions = Partial<typeof DEFAULT_OPTIONS> & {
    canvas: HTMLCanvasElement,
    engine: Engine,
    maximize?: boolean
};

export default class Renderer {
    __canvas;
    __engine;
    __context;
    __maximizeCb: any;
    fps: number = 0;
    __lastRender = 0;
    __renderCb = () => this.__render();
    __fpsAttached: Element | null = null;
    camera: Float32Array = new Float32Array(2);
    zoom: number = 1;
    options;
    canRender = true;
    renderBodyCenters = true;

    constructor(options: RendererOptions) {
        expectType(options, "object", "options");
        options = {...DEFAULT_OPTIONS, ...options};
        expectAny(options.canvas, "canvas");
        expectAny(options.engine, "engine");
        this.__canvas = options.canvas;
        this.__context = options.canvas.getContext("2d");
        this.__engine = options.engine;
        if (options.maximize) this.maximize();
        this.options = options;
        this.__render();
    };

    __render() {
        const deltaTime = (Date.now() - this.__lastRender) / 1000;
        this.fps = 1 / deltaTime;
        if (this.__fpsAttached) this.__fpsAttached.innerHTML = Math.floor(this.fps).toString();
        this.__lastRender = Date.now();
        requestAnimationFrame(this.__renderCb);
        if (!this.canRender || !this.__context) return;
        this.__context.clearRect(0, 0, this.__canvas.width, this.__canvas.height);
        for (let i = 0; i < this.__engine.bodies.length; i++) {
            const body = this.__engine.bodies[i];
            body.render(this);
            if (this.renderBodyCenters) {
                this.__context.fillStyle = "#00ff00";
                this.__context.fillRect(body.x + innerWidth / 2 - 2, -body.y + innerHeight / 2 - 2, 4, 4);
            }
        }
    };

    maximize() {
        if (this.__maximizeCb) return;
        addEventListener("resize", this.__maximizeCb = () => {
            this.__canvas.width = innerWidth;
            this.__canvas.height = innerHeight;
        });
        this.__maximizeCb();
    };

    unmaximize() {
        if (!this.__maximizeCb) return;
        removeEventListener("resize", this.__maximizeCb);
        this.__maximizeCb = undefined;
    };

    attachFPS(element: Element | null) {
        this.__fpsAttached = element;
    };

    setCanvas(v: HTMLCanvasElement) {
        expectInstance(v, HTMLCanvasElement, "canvas");
        this.__canvas = v;
        this.__context = v.getContext("2d");
    };

    setEngine(v: Engine) {
        expectInstance(v, Engine, "engine");
        this.__engine = v;
    };
}