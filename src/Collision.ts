export function collisionOrientation(
    px: number, py: number,
    qx: number, qy: number,
    rx: number, ry: number
) {
    const val = (qy - py) * (rx - qx) - (qx - px) * (ry - qy);
    if (val === 0) return 0;
    return val > 0 ? 1 : 2;
}

export function doLineSegmentsIntersect(
    p1x: number, p1y: number,
    p2x: number, p2y: number,
    q1x: number, q1y: number,
    q2x: number, q2y: number
) {
    const o1 = collisionOrientation(p1x, p1y, p2x, p2y, q1x, q1y);
    const o2 = collisionOrientation(p1x, p1y, p2x, p2y, q2x, q2y);
    const o3 = collisionOrientation(q1x, q1y, q2x, q2y, p1x, p1y);
    const o4 = collisionOrientation(q1x, q1y, q2x, q2y, p2x, p2y);

    return (o1 !== o2 && o3 !== o4) ||
        (o1 === 0 && isOnSegment(p1x, p1y, q1x, q1y, p2x, p2y)) ||
        (o2 === 0 && isOnSegment(p1x, p1y, q2x, q2y, p2x, p2y)) ||
        (o3 === 0 && isOnSegment(q1x, q2y, p1x, p1y, q2x, q2y)) ||
        o4 === 0 && isOnSegment(q1x, q1y, p2x, p2y, q2x, q2y);
}

export function isOnSegment(
    px: number, py: number,
    qx: number, qy: number,
    rx: number, ry: number
) {
    return qx <= Math.max(px, rx) &&
        qx >= Math.min(px, rx) &&
        qy <= Math.max(py, ry) &&
        qy >= Math.min(py, ry);
}

export function doPolygonsIntersect(polygon1: Float32Array, polygon2: Float32Array) {
    for (let i = 0, ii = polygon1.length - 2; i < polygon1.length; ii = i, i += 2) {
        const p1x = polygon1[i];
        const p1y = polygon1[i + 1];
        const p2x = polygon1[ii];
        const p2y = polygon1[ii + 1];

        for (let j = 0, jj = polygon2.length - 2; j < polygon2.length; jj = j, j += 2) {
            const q1x = polygon2[j];
            const q1y = polygon2[j + 1];
            const q2x = polygon2[jj];
            const q2y = polygon2[jj + 1];

            if (doLineSegmentsIntersect(p1x, p1y, p2x, p2y, q1x, q1y, q2x, q2y)) {
                const res = new Float32Array(8);
                res[0] = p1x;
                res[1] = p1y;
                res[2] = p2x;
                res[3] = p2y;
                res[4] = q1x;
                res[5] = q1y;
                res[6] = q2x;
                res[7] = q2y;
                return res;
            }
        }
    }
    return null;
}

export function isPointInsidePolygon(x: number, y: number, polygon: Float32Array) {
    let inside = false;
    for (let i = 0, j = polygon.length - 2; i < polygon.length; j = i, i += 2) {
        const xi = polygon[i];
        const yi = polygon[i + 1];
        const xj = polygon[j];
        const yj = polygon[j + 1];
        const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
        if (intersect) inside = !inside;
    }
    return inside;
}

export function isInPolygon(polygon1: Float32Array, polygon2: Float32Array) {
    for (let i = 0; i < polygon1.length; i += 2) {
        if (!isPointInsidePolygon(polygon1[i], polygon1[i + 1], polygon2)) {
            return false;
        }
    }
    return true;
}