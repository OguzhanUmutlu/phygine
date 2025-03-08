import Vector from "../utils/Vector";
import {Shape} from "./Shape";

export default class Circle extends Shape {
    protected _radius = 0;

    constructor(radius: number = 0, position = new Vector) {
        super(position);
        this._radius = radius;
    };

    get radius() {
        return this._radius;
    };

    set radius(radius: number) {
        this._radius = radius;
    };

    getCenter() {
        return this._position.clone();
    };
}
