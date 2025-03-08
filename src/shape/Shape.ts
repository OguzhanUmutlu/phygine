import Vector from "../utils/Vector";

export abstract class Shape {
    protected _offset = new Vector;
    protected _angle = 0;

    protected constructor(protected _position = new Vector) {
    };

    get position() {
        return this._position;
    };

    set position(position: Vector) {
        this._position = position;
    };

    get offset() {
        return this._offset;
    };

    set offset(offset: Vector) {
        this._offset = offset;
    };

    get angle() {
        return this._angle;
    };

    set angle(angle: number) {
        this._angle = angle;
    };

    abstract getCenter(): Vector;
}