import { ThisReturn, UnMarkThis } from "~/code/bundle";
import { Interpolate } from "~/code/funcs/interpolator";
import { Point } from "./point";

export interface Transformable3d {
    translate3d(point: Point3d): this;
    rotate3d(angle: Point3d, origin?: Point3d): this;
    scale3d(factor: number, origin?: Point3d): this;
}

import { vec3, mat4 } from "gl-matrix";
import { Camera } from "./camera";
import { panic } from "functional-utilities";
import { PolygonSolid } from "./polygon_solid";
import { TriangleSolid } from "./triangle_solid";

export function vec3ToPoint3d(vec: vec3): Point3d {
    return new Point3d(vec[0], vec[1], vec[2]);
}

export class Point3d implements Interpolate, Transformable3d {
    x: number;
    y: number;
    z: number;

    can_interpolate(value: unknown): boolean {
        return value instanceof Point3d;
    }

    to_start(): this & ThisReturn {
        return this as this & ThisReturn;
    }

    similarity(to: UnMarkThis<this>): number {
        return this.distance(to);
    }

    distance(to: UnMarkThis<this>): number {
        return Math.sqrt(
            Math.pow(this.x - to.x, 2) +
                Math.pow(this.y - to.y, 2) +
                Math.pow(this.z - to.z, 2)
        );
    }

    interpolate(t: number, to: UnMarkThis<this>): this & ThisReturn {
        return this.lerp(t, to);
    }

    lerp(t: number, to: UnMarkThis<this>): this & ThisReturn {
        return new Point3d(
            this.x + (to.x - this.x) * t,
            this.y + (to.y - this.y) * t,
            this.z + (to.z - this.z) * t
        ) as this & ThisReturn;
    }

    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    cast2d(camera: Camera): Point {
        return camera.project(this);
    }

    to_vec3(): vec3 {
        return vec3.fromValues(this.x, this.y, this.z);
    }

    rotate3d(angle: Point3d, origin?: Point3d | undefined): this {
        const o = origin ?? new Point3d(0, 0, 0);
        const dx = this.x - o.x;
        const dy = this.y - o.y;
        const dz = this.z - o.z;

        const cosX = Math.cos(angle.x);
        const sinX = Math.sin(angle.x);
        const cosY = Math.cos(angle.y);
        const sinY = Math.sin(angle.y);
        const cosZ = Math.cos(angle.z);
        const sinZ = Math.sin(angle.z);

        const x =
            o.x +
            dx * (cosY * cosZ) +
            dy * (-cosX * sinZ + sinX * sinY * cosZ) +
            dz * (sinX * sinZ + cosX * sinY * cosZ);
        const y =
            o.y +
            dx * (cosY * sinZ) +
            dy * (cosX * cosZ + sinX * sinY * sinZ) +
            dz * (-sinX * cosZ + cosX * sinY * sinZ);
        const z = o.z + dx * -sinY + dy * (sinX * cosY) + dz * (cosX * cosY);

        return new Point3d(x, y, z) as this;
    }

    translate3d(point: Point3d): this {
        return new Point3d(
            this.x + point.x,
            this.y + point.y,
            this.z + point.z
        ) as this;
    }

    scale3d(factor: number, origin?: Point3d | undefined): this {
        const o = origin ?? this;
        return new Point3d(
            o.x + (this.x - o.x) * factor,
            o.y + (this.y - o.y) * factor,
            o.z + (this.z - o.z) * factor
        ) as this;
    }

    rotate_around_line(
        line: { start: Point3d; end: Point3d },
        angle: number
    ): Point3d {
        // Translate the point and line so that lineStart is at the origin
        const translatedPoint = this.translate3d(
            line.start.scale3d(-1)
        ).to_vec3();
        const translatedLineEnd = line.end
            .translate3d(line.start.scale3d(-1))
            .to_vec3();

        // Calculate the unit direction vector of the line
        const lineDirection = vec3.normalize(vec3.create(), translatedLineEnd);

        // Calculate the rotation matrix
        const rotationMatrix = mat4.fromRotation(
            mat4.create(),
            angle,
            lineDirection
        );

        // Rotate the point
        const rotatedPoint = vec3.transformMat4(
            vec3.create(),
            translatedPoint,
            rotationMatrix
        );

        // Translate the point back
        const finalPoint = vec3.add(
            vec3.create(),
            rotatedPoint,
            line.start.to_vec3()
        );

        return vec3ToPoint3d(finalPoint);
    }
}

type Concat<L extends any[], R extends any[]> = [...L, ...R];
type Repeat<T, N extends number, R extends any[] = []> = R["length"] extends N
    ? R
    : Repeat<T, N, Concat<R, [T]>>;
type NTuple<T, N extends number> = Repeat<T, N>;

export function get_cube_vertices(size: number): NTuple<Point3d, 8> {
    const half = size / 2;
    return [
        new Point3d(-half, -half, -half),
        new Point3d(half, -half, -half),
        new Point3d(half, half, -half),
        new Point3d(-half, half, -half),
        new Point3d(-half, -half, half),
        new Point3d(half, -half, half),
        new Point3d(half, half, half),
        new Point3d(-half, half, half),
    ];
}

type Face = NTuple<Point3d, 4>;

export function get_cube_quads(size: number): NTuple<Face, 6> {
    const vertices = get_cube_vertices(size);
    return [
        [vertices[0], vertices[1], vertices[2], vertices[3]],
        [vertices[1], vertices[5], vertices[6], vertices[2]],
        [vertices[5], vertices[4], vertices[7], vertices[6]],
        [vertices[4], vertices[0], vertices[3], vertices[7]],
        [vertices[3], vertices[2], vertices[6], vertices[7]],
        [vertices[4], vertices[5], vertices[1], vertices[0]],
    ];
}

export function face_to_poly(
    face: Face,
    camera: Camera
): PolygonSolid {
    return new PolygonSolid([
        face[0].cast2d(camera),
        face[1].cast2d(camera),
        face[2].cast2d(camera),
        face[3].cast2d(camera),
    ]);
}

export function z_sort_faces(
    faces: Face[],
    camera: Camera
) {
    return faces
        .map((face) => {
            const z =
                camera.z_depth(face[0]) +
                camera.z_depth(face[1]) +
                camera.z_depth(face[2]) +
                camera.z_depth(face[3]);
            return { face, z };
        })
        .sort((a, b) => a.z - b.z)
        .map((a) => a.face);
}
