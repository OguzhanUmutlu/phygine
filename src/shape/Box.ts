import Vector from "../utils/Vector";
import Polygon from "./Polygon";

export default class Box extends Polygon {
    constructor(protected _width = 0, protected _height = 0, position = new Vector) {
        super([], position);
        this._recalculatePoints();
    };

    get width() {
        return this._width;
    };

    set width(width: number) {
        this._width = width;
        this._recalculatePoints();
    };

    get height() {
        return this._height;
    };

    set height(height: number) {
        this._height = height;
        this._recalculatePoints();
    };

    setSize(width: number, height: number) {
        this._width = width;
        this._height = height;
        this._recalculatePoints();
    };

    private _recalculatePoints() {
        this.points = [
            new Vector(-this._width / 2, -this._height / 2),
            new Vector(this._width / 2, -this._height / 2),
            new Vector(this._width / 2, this._height / 2),
            new Vector(-this._width / 2, this._height / 2),
        ];
    };
};