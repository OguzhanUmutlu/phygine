import Controller from "./Controller";

export default class ZoomController extends Controller {
    requireMouse = true;

    onWheel(e: WheelEvent) {
        const renderer = this.renderer;
        const canvas = renderer.canvas;
        const scale = renderer.scale;
        const translation = renderer.translation;
        const width = canvas.width;
        const height = canvas.height;

        scale.x *= Math.exp(-e.deltaY / 1000);
        scale.y *= Math.exp(-e.deltaY / 1000);
        translation.x -= (e.offsetX - width / 2) / scale.x * (e.deltaY / 1000);
        translation.y -= (e.offsetY - height / 2) / scale.y * (e.deltaY / 1000);
    };
};
