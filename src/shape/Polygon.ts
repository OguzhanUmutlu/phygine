import Vector from "../utils/Vector";
import {Shape} from "./Shape";

export default class Polygon extends Shape {
    protected _points: Vector[] = [];
    protected _pointsGeneric: number[] = [];
    protected _angle = 0;
    protected _calcPoints: Vector[] = [];
    protected _edges: Vector[] = [];
    protected _normals: Vector[] = [];

    static make(points: (Vector | [number, number])[]) {
        return new Polygon(points.map(p => p instanceof Vector ? p : new Vector(p[0], p[1])));
    };

    constructor(points: Vector[] = [], position = new Vector) {
        super(position);
        this.points = points;
    };

    get points() {
        return this._points;
    };

    set points(points: Vector[]) {
        if (points.length === 0) return;

        const lengthChanged = !this._points || this._points.length !== points.length;

        if (lengthChanged) {
            this._calcPoints = <Vector[]>[];
            this._edges = [];
            this._normals = [];

            for (let i = 0; i < points.length; i++) {
                const p1 = points[i];
                const p2 = i < points.length - 1 ? points[i + 1] : points[0];

                this._pointsGeneric.push(points[i].x, points[i].y);

                if (p1 !== p2 && p1.x === p2.x && p1.y === p2.y) {
                    points.splice(i, 1);
                    i -= 1;
                    continue;
                }

                this._calcPoints.push(new Vector);
                this._edges.push(new Vector);
                this._normals.push(new Vector);
            }
        }

        this._points = points;

        this._recalculate();
    };

    get pointsGeneric() {
        return this._pointsGeneric;
    };

    get calcPoints() {
        return this._calcPoints;
    };

    get edges() {
        return this._edges;
    };

    get normals() {
        return this._normals;
    };

    set angle(angle: number) {
        this._angle = angle;

        this._recalculate();
    };

    set offset(offset: Vector) {
        this._offset = offset;
        this._recalculate();
    };

    rotate(angle: number) {
        const points = this._points;
        const len = points.length;

        for (let i = 0; i < len; i++) points[i].rotate(angle);

        this._recalculate();
    };

    translate(x: number, y: number) {
        const points: Vector[] = this._points;
        const len: number = points.length;

        for (let i: number = 0; i < len; i++) {
            points[i].x += x;
            points[i].y += y;
        }

        this._recalculate();
    };

    private _recalculate() {
        const calcPoints: Vector[] = this._calcPoints;

        const edges = this._edges;
        const normals = this._normals;
        const points = this._points;
        const offset = this._offset;
        const angle = this._angle;

        const len: number = points.length;
        let i: number;

        for (i = 0; i < len; i++) {
            const calcPoint = calcPoints[i].setFrom(points[i]);

            calcPoint.x += offset.x;
            calcPoint.y += offset.y;

            if (angle !== 0) calcPoint.rotate(angle);
        }

        for (i = 0; i < len; i++) {
            const p1: Vector = calcPoints[i];
            const p2: Vector = i < len - 1 ? calcPoints[i + 1] : calcPoints[0];

            const e: Vector = edges[i].setFrom(p2).sub(p1);

            normals[i].setFrom(e).perp().normalize();
        }
    };

    getCenter(): Vector {
        const points: Vector[] = this._calcPoints;
        const len: number = points.length;

        let cx: number = 0;
        let cy: number = 0;
        let ar: number = 0;

        for (let i = 0; i < len; i++) {
            const p1: Vector = points[i];
            const p2: Vector = i === len - 1 ? points[0] : points[i + 1];

            const a: number = p1["x"] * p2["y"] - p2["x"] * p1["y"];

            cx += (p1["x"] + p2["x"]) * a;
            cy += (p1["y"] + p2["y"]) * a;
            ar += a;
        }

        ar = ar * 3;
        cx = cx / ar;
        cy = cy / ar;

        return new Vector(cx, cy);
    };
};