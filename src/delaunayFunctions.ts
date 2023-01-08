import Delaunator from 'delaunator'

export function nextHalfedge(e: number) {
    return e % 3 === 2 ? e - 2 : e + 1
}
export function prevHalfedge(e: number) {
    return e % 3 === 0 ? e + 2 : e - 1
}

export function triangleOfEdge(e: number) {
    return Math.floor(e / 3)
}
export function edgesOfTriangle(t: number) {
    return [3 * t, 3 * t + 1, 3 * t + 2]
}
export function pointsOfTriangle(delaunay: Delaunator<ArrayLike<number>>, t: number) {
    return edgesOfTriangle(t).map((e) => delaunay.triangles[e])
}
export function circumcenter(a: number[], b: number[], c: number[]) {
    const ad = a[0] * a[0] + a[1] * a[1]
    const bd = b[0] * b[0] + b[1] * b[1]
    const cd = c[0] * c[0] + c[1] * c[1]
    const D = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1]))
    return [
        (1 / D) * (ad * (b[1] - c[1]) + bd * (c[1] - a[1]) + cd * (a[1] - b[1])),
        (1 / D) * (ad * (c[0] - b[0]) + bd * (a[0] - c[0]) + cd * (b[0] - a[0])),
    ]
}
export function triangleCenter(points: number[][], delaunay: Delaunator<ArrayLike<number>>, t: number) {
    const vertices = pointsOfTriangle(delaunay, t).map((p) => points[p])
    return circumcenter(vertices[0], vertices[1], vertices[2])
}
