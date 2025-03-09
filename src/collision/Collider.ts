import Vector from "../utils/Vector";
import Circle from "../shape/Circle";
import Polygon from "../shape/Polygon";
import CollisionDetails from "./CollisionDetails";

const LEFT_VORONOI_REGION = -1;
const MIDDLE_VORONOI_REGION = 0;
const RIGHT_VORONOI_REGION = 1;

const tempVectors: Vector[] = [];
const details = new CollisionDetails();
const testPoint = new Polygon([
    new Vector, new Vector(1e-6, 0),
    new Vector(1e-6, 1e-6), new Vector(0, 1e-6)
]);
for (let i = 0; i < 10; i++) tempVectors.push(new Vector());

export const BaseCollisions = {
    CircleCircle: testCircleCircle,
    CirclePolygon: testCirclePolygon,
    PolygonCircle: testPolygonCircle,
    PolygonPolygon: testPolygonPolygon
};

export const PointCollisions = {
    Circle: pointInCircle,
    Polygon: pointInPolygon
};

function voronoiRegion(line: Vector, point: Vector) {
    const len2 = line.len2();
    const dp = point.dot(line);

    if (dp < 0) return LEFT_VORONOI_REGION;

    else if (dp > len2) return RIGHT_VORONOI_REGION;

    else return MIDDLE_VORONOI_REGION;
}

function flattenPointsOn(points: Vector[], normal: Vector, result: number[]) {
    let min = Number.MAX_VALUE;
    let max = -Number.MAX_VALUE;

    const len = points.length;

    for (let i = 0; i < len; i++) {
        const dot = points[i].dot(normal);

        if (dot < min) min = dot;
        if (dot > max) max = dot;
    }

    result[0] = min;
    result[1] = max;
}

function isSeparatingAxis(aPos: Vector, bPos: Vector, aPoints: Vector[], bPoints: Vector[], axis: Vector, collisionDetails?: CollisionDetails): boolean {
    const rangeA: number[] = [];
    const rangeB: number[] = [];

    const offsetV = tempVectors.pop()!.setFrom(bPos).sub(aPos);
    const projectedOffset = offsetV.dot(axis);

    flattenPointsOn(aPoints, axis, rangeA);
    flattenPointsOn(bPoints, axis, rangeB);

    rangeB[0] += projectedOffset;
    rangeB[1] += projectedOffset;

    if (rangeA[0] > rangeB[1] || rangeB[0] > rangeA[1]) {
        tempVectors.push(offsetV);

        return true;
    }

    if (collisionDetails) {
        let overlap: number;

        if (rangeA[0] < rangeB[0]) {
            collisionDetails.aInB = false;

            if (rangeA[1] < rangeB[1]) {
                overlap = rangeA[1] - rangeB[0];

                collisionDetails.bInA = false;
            } else {
                const option1 = rangeA[1] - rangeB[0];
                const option2 = rangeB[1] - rangeA[0];

                overlap = option1 < option2 ? option1 : -option2;
            }
        } else {
            collisionDetails.bInA = false;

            if (rangeA[1] > rangeB[1]) {
                overlap = rangeA[0] - rangeB[1];

                collisionDetails.aInB = false;
            } else {
                const option1 = rangeA[1] - rangeB[0];
                const option2 = rangeB[1] - rangeA[0];

                overlap = option1 < option2 ? option1 : -option2;
            }
        }

        const absOverlap = Math.abs(overlap);

        if (absOverlap < collisionDetails.overlap) {
            collisionDetails.overlap = absOverlap;
            collisionDetails.overlapUnit.setFrom(axis);

            if (overlap < 0) collisionDetails.overlapUnit.reverse();
        }
    }

    tempVectors.push(offsetV);

    return false;
}

export function pointInCircle(point: Vector, circle: Circle) {
    const differenceV = tempVectors.pop()!.setFrom(point).sub(circle.position).sub(circle.offset);

    const radiusSq = circle.radius * circle.radius;
    const distanceSq = differenceV.len2();

    tempVectors.push(differenceV);

    return distanceSq <= radiusSq;
}

export function pointInPolygon(point: Vector, polygon: Polygon) {
    testPoint.position.setFrom(point);
    details.clear();

    let result: (boolean | CollisionDetails) = testPolygonPolygon(testPoint, polygon, true);

    if (result) result = details.aInB;

    return result;
}

export function testCircleCircle(a: Circle, b: Circle, giveDetails = false): (boolean | CollisionDetails) {
    const differenceV = tempVectors.pop()!.setFrom(b.position).add(b.offset).sub(a.position).sub(a.offset);

    const totalRadius = a.radius + b.radius;
    const totalRadiusSq = totalRadius * totalRadius;
    const distanceSq = differenceV.len2();

    if (distanceSq > totalRadiusSq) {
        tempVectors.push(differenceV);

        return false;
    }

    if (giveDetails) {
        details.clear();

        const dist = Math.sqrt(distanceSq);

        details.a = a;
        details.b = b;

        details.overlap = totalRadius - dist;
        details.overlapUnit.setFrom(differenceV.normalize());
        details.overlapV.setFrom(differenceV).scale(details.overlap);

        details.aInB = a.radius <= b.radius && dist <= b.radius - a.radius;
        details.bInA = b.radius <= a.radius && dist <= a.radius - b.radius;

        tempVectors.push(differenceV);

        return details;
    }

    tempVectors.push(differenceV);

    return true;
}

export function testPolygonPolygon(a: Polygon, b: Polygon, hasDetails: boolean = false): (boolean | CollisionDetails) {
    details.clear();

    const aPoints = a.calcPoints;
    const aLen = aPoints.length;

    const bPoints = b.calcPoints;
    const bLen = bPoints.length;

    for (let i = 0; i < aLen; i++) {
        if (isSeparatingAxis(a.position, b.position, aPoints, bPoints, a.normals[i], details)) {
            return false;
        }
    }

    for (let i = 0; i < bLen; i++) {
        if (isSeparatingAxis(a.position, b.position, aPoints, bPoints, b.normals[i], details)) {
            return false;
        }
    }

    if (hasDetails) {
        details.a = a;
        details.b = b;

        details.overlapV.setFrom(details.overlapUnit).scale(details.overlap);

        return details;
    }

    return true;
}

export function testPolygonCircle(polygon: Polygon, circle: Circle, hasDetails = false): (boolean | CollisionDetails) {
    details.clear();

    const circlePos = tempVectors.pop()!.setFrom(circle.position).add(circle.offset).sub(polygon.position);

    const radius = circle.radius;
    const radius2 = radius * radius;

    const points = polygon.calcPoints;
    const len = points.length;

    const edge = tempVectors.pop()!;
    const point = tempVectors.pop()!;

    for (let i = 0; i < len; i++) {
        const next = i === len - 1 ? 0 : i + 1;
        const prev = i === 0 ? len - 1 : i - 1;

        let overlap = 0;
        let overlapUnit = null;

        edge.setFrom(polygon.edges[i]);

        point.setFrom(circlePos).sub(points[i]);

        if (hasDetails && point.len2() > radius2) details.aInB = false;

        let region = voronoiRegion(edge, point);

        if (region === LEFT_VORONOI_REGION) {
            edge.setFrom(polygon.edges[prev]);

            const point2 = tempVectors.pop()!.setFrom(circlePos).sub(points[prev]);

            region = voronoiRegion(edge, point2);

            if (region === RIGHT_VORONOI_REGION) {
                const dist = point.len();

                if (dist > radius) {
                    tempVectors.push(circlePos);
                    tempVectors.push(edge);
                    tempVectors.push(point);
                    tempVectors.push(point2);

                    return false;
                } else if (hasDetails) {
                    details.bInA = false;

                    overlapUnit = point.normalize();
                    overlap = radius - dist;
                }
            }

            tempVectors.push(point2);

        } else if (region === RIGHT_VORONOI_REGION) {
            edge.setFrom(polygon.edges[next]);

            point.setFrom(circlePos).sub(points[next]);

            region = voronoiRegion(edge, point);

            if (region === LEFT_VORONOI_REGION) {
                const dist = point.len();

                if (dist > radius) {
                    tempVectors.push(circlePos);
                    tempVectors.push(edge);
                    tempVectors.push(point);

                    return false;
                } else if (hasDetails) {
                    details.bInA = false;

                    overlapUnit = point.normalize();
                    overlap = radius - dist;
                }
            }
        } else {
            const normal = edge.perp().normalize();

            const dist = point.dot(normal);
            const distAbs = Math.abs(dist);

            if (dist > 0 && distAbs > radius) {
                tempVectors.push(circlePos);
                tempVectors.push(normal);
                tempVectors.push(point);

                return false;
            } else if (hasDetails) {
                overlapUnit = normal;
                overlap = radius - dist;

                if (dist >= 0 || overlap < 2 * radius) details.bInA = false;
            }
        }

        if (overlapUnit && hasDetails && Math.abs(overlap) < Math.abs(details.overlap)) {
            details.overlap = overlap;
            details.overlapUnit.setFrom(overlapUnit);
        }
    }

    if (hasDetails) {
        details.a = polygon;
        details.b = circle;

        details.overlapV.setFrom(details.overlapUnit).scale(details.overlap);
    }

    tempVectors.push(circlePos);
    tempVectors.push(edge);
    tempVectors.push(point);

    if (hasDetails) return details;

    return true;
}

export function testCirclePolygon(circle: Circle, polygon: Polygon, details: boolean = false): (boolean | CollisionDetails) {
    const result = testPolygonCircle(polygon, circle, details);

    if (result && details) {
        const collisionDetails = result as CollisionDetails;

        const a = collisionDetails.a;
        const aInB = collisionDetails.aInB;

        collisionDetails.overlapUnit.reverse();
        collisionDetails.overlapV.reverse();

        collisionDetails.a = collisionDetails.b;
        collisionDetails.b = a;

        collisionDetails.aInB = collisionDetails.bInA;
        collisionDetails.bInA = aInB;
    }

    return result;
}