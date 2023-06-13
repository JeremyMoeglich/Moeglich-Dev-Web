import { ThisReturn, UnMarkThis } from "~/code/bundle";
import { Interpolate } from "~/code/funcs/interpolator";
import { Point } from "./point";

export interface Transformable3d {
    translate3d(point: Point3d): this;
    rotate3d(angle: Point3d, origin?: Point3d): this;
    scale3d(factor: number): this;
}

export class Point3d implements Interpolate {
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
}

export interface Camera extends Transformable3d {
    project(point: Point3d): Point;
    look_at(point: Point3d): this;
    zoom(factor: number): this;
}

function vec3ToPoint3d(vec: vec3): Point3d {
    return new Point3d(vec[0], vec[1], vec[2]);
}


import { vec3, mat4 } from 'gl-matrix';

export class PerspectiveCamera implements Camera {
    private position: vec3;
    private rotation: vec3;
    private focalLength: number;
    private transformationMatrix: mat4;

    constructor(position: Point3d, rotation: Point3d, focalLength: number = 1) {
        this.position = vec3.fromValues(position.x, position.y, position.z);
        this.rotation = vec3.fromValues(rotation.x, rotation.y, rotation.z);
        this.focalLength = focalLength;

        // Compute the transformation matrix
        this.transformationMatrix = mat4.create();
        mat4.rotateX(this.transformationMatrix, this.transformationMatrix, this.rotation[0]);
        mat4.rotateY(this.transformationMatrix, this.transformationMatrix, this.rotation[1]);
        mat4.rotateZ(this.transformationMatrix, this.transformationMatrix, this.rotation[2]);
        mat4.translate(this.transformationMatrix, this.transformationMatrix, vec3.negate(vec3.create(), this.position));
    }

    project(point: Point3d): Point {
        // Convert point to vec3
        const pointVec3 = vec3.fromValues(point.x, point.y, point.z);

        // Apply camera transformation
        vec3.transformMat4(pointVec3, pointVec3, this.transformationMatrix);

        // Perspective projection
        const factor = this.focalLength / pointVec3[2];

        return new Point(
            pointVec3[0] * factor,
            pointVec3[1] * factor
        )
    }

    translate3d(offset: Point3d): this {
        const newPosition = vec3.add(vec3.create(), this.position, vec3.fromValues(offset.x, offset.y, offset.z));
        return new PerspectiveCamera(vec3ToPoint3d(newPosition), vec3ToPoint3d(this.rotation), this.focalLength) as this;
    }

    rotate3d(angles: Point3d): this {
        const newRotation = vec3.add(vec3.create(), this.rotation, vec3.fromValues(angles.x, angles.y, angles.z));
        return new PerspectiveCamera(vec3ToPoint3d(this.position), vec3ToPoint3d(newRotation), this.focalLength) as this;
    }

    look_at(target: Point3d): this {
        const direction = vec3.sub(vec3.create(), vec3.fromValues(target.x, target.y, target.z), this.position);
        const pitch = Math.atan2(direction[1], Math.sqrt(direction[0] ** 2 + direction[2] ** 2));
        const yaw = Math.atan2(-direction[0], direction[2]);
        return new PerspectiveCamera(vec3ToPoint3d(this.position), {x: pitch, y: yaw, z: 0} as Point3d, this.focalLength) as this;
    }

    zoom(amount: number): this {
        return new PerspectiveCamera(vec3ToPoint3d(this.position), vec3ToPoint3d(this.rotation), this.focalLength * amount) as this;
    }
}
