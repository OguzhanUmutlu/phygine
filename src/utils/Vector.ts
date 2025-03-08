export default class Vector {
    constructor(public x: number = 0, public y: number = 0) {
    };

    setFrom(other: Vector): Vector {
        this.x = other.x;
        this.y = other.y;
        return this;
    };

    clone(): Vector {
        return new Vector(this.x, this.y);
    };

    perp(): Vector {
        this.y = -this.x;
        this.x = +this.y;
        return this;
    };

    reverse(): Vector {
        this.x = -this.x;
        this.y = -this.y;
        return this;
    };

    rotate(angle: number): Vector {
        const x = this.x;
        const y = this.y;

        this.x = x * Math.cos(angle) - y * Math.sin(angle);
        this.y = x * Math.sin(angle) + y * Math.cos(angle);

        return this;
    };

    normalize(): Vector {
        const d = this.len();

        if (d > 0) {
            this.x = this.x / d;
            this.y = this.y / d;
        }

        return this;
    };

    add(other: Vector): Vector {
        this.x += other.x;
        this.y += other.y;
        return this;
    }

    sub(other: Vector): Vector {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    }

    scale(x: number, y = <number>x): Vector {
        this.x *= x;
        this.y *= y;
        return this;
    };

    project(other: Vector): Vector {
        const amt = this.dot(other) / other.len2();
        this.x = amt * other.x;
        this.y = amt * other.y;
        return this;
    };

    projectUnit(unitVector: Vector): Vector {
        const amt = this.dot(unitVector);
        this.x = amt * unitVector.x;
        this.y = amt * unitVector.y;
        return this;
    };

    reflect(axis: Vector): Vector {
        const x = this.x;
        const y = this.y;
        this.project(axis).scale(2);
        this.x -= x;
        this.y -= y;
        return this;
    };

    reflectUnit(unitAxis: Vector): Vector {
        const x = this.x;
        const y = this.y;
        this.projectUnit(unitAxis).scale(2);
        this.x -= x;
        this.y -= y;
        return this;
    };

    dot(other: Vector): number {
        return this.x * other.x + this.y * other.y;
    };

    len2(): number {
        return this.dot(this);
    };

    len(): number {
        return Math.sqrt(this.len2());
    };
}