export function makeCanvas(parent = document.body, width = null, height = null) {
    const canvas = document.createElement("canvas");
    if (width) canvas.width = width;
    if (height) canvas.height = height;
    parent.appendChild(canvas);
    return canvas;
}

export function expectInstance(thing: any, clazz: any, a: string) {
    if (!(thing instanceof clazz))
        throw new Error("Expected the '" + a + "' to be an instance of a " + clazz.name + ".");
}

export function expectAny(thing: any, a: string) {
    if (thing === undefined)
        throw new Error("Expected the '" + a + "' to have a valid value.");
}

export function expectType(thing: any, type: string, a: string) {
    if (typeof thing !== type)
        throw new Error("Expected the '" + a + "' to have the type '" + type + "'.");
}

export function makeRectangleShape(width: number, height: number) {
    const A = new Float32Array(8);
    A[0] = -width / 2;
    A[1] = -height / 2;
    A[2] = width / 2;
    A[3] = -height / 2;
    A[4] = width / 2;
    A[5] = height / 2;
    A[6] = -width / 2;
    A[7] = height / 2;
    // {x: -width / 2, y: -height / 2},
    // {x: width / 2, y: -height / 2},
    // {x: width / 2, y: height / 2},
    // {x: -width / 2, y: height / 2}
    return A;
}

export function __TODO__makeEllipseShape(radiusX: number, radiusY: number) {
    // todo: special rendering and collision detection for ellipse
}