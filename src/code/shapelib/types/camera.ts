import { vec3, mat4, vec4 } from "gl-matrix";
import { type Point3d, vec3ToPoint3d } from "./point3d";
import { Point } from "./point";

export class IsometricCamera implements Camera {
    private position: Point3d;
    private rotation: Point3d;
    private zoom_factor: number;
    private transformationMatrix: mat4;

    constructor(position: Point3d, rotation: Point3d, zoom = 1) {
        this.position = position;
        this.rotation = rotation;
        this.zoom_factor = zoom;

        // Compute the transformation matrix
        this.transformationMatrix = mat4.create();
        // First, translate the position
        mat4.translate(
            this.transformationMatrix,
            this.transformationMatrix,
            vec3.negate(vec3.create(), this.position.to_vec3())
        );

        // Then apply the rotations
        mat4.rotateX(
            this.transformationMatrix,
            this.transformationMatrix,
            this.rotation.x
        );
        mat4.rotateY(
            this.transformationMatrix,
            this.transformationMatrix,
            this.rotation.y
        );
        mat4.rotateZ(
            this.transformationMatrix,
            this.transformationMatrix,
            this.rotation.z
        );
    }

    project(point: Point3d): Point {
        // Convert point to vec3
        const pointVec3 = vec3.fromValues(point.x, point.y, point.z);

        // Apply camera transformation
        vec3.transformMat4(pointVec3, pointVec3, this.transformationMatrix);

        // Isometric projection
        const x = pointVec3[0] - pointVec3[1];
        const y = (pointVec3[0] + pointVec3[1]) / 2 - pointVec3[2];

        // Apply zoom
        const finalX = this.zoom_factor * x;
        const finalY = this.zoom_factor * y;

        return new Point(finalX, finalY);
    }

    z_depth(point: Point3d): number {
        // Convert point to vec3
        const pointVec3 = vec3.fromValues(point.x, point.y, point.z);

        // Apply camera transformation
        vec3.transformMat4(pointVec3, pointVec3, this.transformationMatrix);

        // Return the transformed z coordinate
        return pointVec3[2];
    }

    translate3d(offset: Point3d): this {
        const newPosition = vec3.add(
            vec3.create(),
            this.position.to_vec3(),
            offset.to_vec3()
        );
        return new IsometricCamera(
            vec3ToPoint3d(newPosition),
            this.rotation,
            this.zoom_factor
        ) as this;
    }

    rotate3d(angles: Point3d): this {
        const newRotation = vec3.add(
            vec3.create(),
            this.rotation.to_vec3(),
            angles.to_vec3()
        );
        return new IsometricCamera(
            this.position,
            vec3ToPoint3d(newRotation),
            this.zoom_factor
        ) as this;
    }

    scale3d(factor: number, origin?: Point3d): this {
        const o = origin ?? this.position;
        return new IsometricCamera(
            this.position.scale3d(factor, o),
            this.rotation,
            this.zoom_factor
        ) as this;
    }

    look_at(target: Point3d): this {
        const direction = vec3.sub(
            vec3.create(),
            vec3.fromValues(target.x, target.y, target.z),
            this.position.to_vec3()
        );
        const pitch = Math.atan2(
            direction[1],
            Math.sqrt(direction[0] ** 2 + direction[2] ** 2)
        );
        const yaw = Math.atan2(-direction[0], direction[2]);
        return new IsometricCamera(
            this.position,
            { x: pitch, y: yaw, z: 0 } as Point3d,
            this.zoom_factor
        ) as this;
    }

    zoom(factor: number): this {
        return new IsometricCamera(
            this.position,
            this.rotation,
            this.zoom_factor * factor
        ) as this;
    }
}

export interface Camera extends Transformable3d {
    project(point: Point3d): Point;
    look_at(point: Point3d): this;
    zoom(factor: number): this;
    z_depth(point: Point3d): number;
}

export interface Transformable3d {
    translate3d(point: Point3d): this;
    rotate3d(angle: Point3d, origin?: Point3d): this;
    scale3d(factor: number, origin?: Point3d): this;
}

export class PerspectiveCamera implements Camera {
    private position: Point3d;
    private rotation: Point3d;
    private aspectRatio: number;
    private near: number;
    private far: number;
    private fieldOfView: number;
    private transformationMatrix: mat4;

    constructor(
        position: Point3d,
        rotation: Point3d,
        aspectRatio: number,
        near: number,
        far: number,
        fieldOfView: number
    ) {
        this.position = position;
        this.rotation = rotation;
        this.aspectRatio = aspectRatio;
        this.near = near;
        this.far = far;
        this.fieldOfView = fieldOfView;

        // Compute the transformation matrix
        this.transformationMatrix = mat4.create();

        // First, translate the camera to its position
        mat4.translate(
            this.transformationMatrix,
            this.transformationMatrix,
            vec3.negate(vec3.create(), this.position.to_vec3())
        );

        // Then rotate it to its orientation
        mat4.rotateX(
            this.transformationMatrix,
            this.transformationMatrix,
            this.rotation.x
        );
        mat4.rotateY(
            this.transformationMatrix,
            this.transformationMatrix,
            this.rotation.y
        );
        mat4.rotateZ(
            this.transformationMatrix,
            this.transformationMatrix,
            this.rotation.z
        );
    }

    z_depth(point: Point3d): number {
        // Convert point to vec3
        const pointVec3 = vec3.fromValues(point.x, point.y, point.z);

        // Apply camera transformation
        vec3.transformMat4(pointVec3, pointVec3, this.transformationMatrix);

        // Return the transformed z coordinate
        return pointVec3[2];
    }

    project(point: Point3d): Point {
        // Convert point to vec3 and append w coordinate
        const pointVec4 = vec4.fromValues(point.x, point.y, point.z, 1.0);

        // Apply camera transformation
        vec4.transformMat4(pointVec4, pointVec4, this.transformationMatrix);

        // Perspective projection
        const fov_rad = this.fieldOfView * (Math.PI / 180);
        const f = 1.0 / Math.tan(fov_rad / 2);
        const rangeInv = 1.0 / (this.far - this.near);
        const projMatrix = mat4.create();

        projMatrix[0] = f / this.aspectRatio;
        projMatrix[5] = f;
        projMatrix[10] = -(this.far + this.near) * rangeInv;
        projMatrix[14] = -2.0 * this.near * this.far * rangeInv;
        projMatrix[11] = 1.0;

        vec4.transformMat4(pointVec4, pointVec4, projMatrix);

        // Homogeneous division
        if (pointVec4[3] !== 0) {
            pointVec4[0] /= pointVec4[3];
            pointVec4[1] /= pointVec4[3];
        }

        return new Point(pointVec4[0], pointVec4[1]);
    }

    translate3d(offset: Point3d): this {
        const newPosition = vec3.add(
            vec3.create(),
            this.position.to_vec3(),
            offset.to_vec3()
        );
        return new PerspectiveCamera(
            vec3ToPoint3d(newPosition),
            this.rotation,
            this.aspectRatio,
            this.near,
            this.far,
            this.fieldOfView
        ) as this;
    }

    rotate3d(angles: Point3d): this {
        const newRotation = vec3.add(
            vec3.create(),
            this.rotation.to_vec3(),
            angles.to_vec3()
        );
        return new PerspectiveCamera(
            this.position.rotate3d(angles),
            vec3ToPoint3d(newRotation),
            this.aspectRatio,
            this.near,
            this.far,
            this.fieldOfView
        ) as this;
    }

    scale3d(factor: number, origin?: Point3d): this {
        const o = origin ?? this.position;
        return new PerspectiveCamera(
            this.position.scale3d(factor, o),
            this.rotation,
            this.aspectRatio,
            this.near,
            this.far,
            this.fieldOfView
        ) as this;
    }

    look_at(target: Point3d): this {
        const direction = vec3.sub(
            vec3.create(),
            vec3.fromValues(target.x, target.y, target.z),
            this.position.to_vec3()
        );
        const pitch = Math.atan2(
            direction[1],
            Math.sqrt(direction[0] ** 2 + direction[2] ** 2)
        );
        let yaw = Math.atan2(direction[0], direction[2]);

        if (direction[2] < 0) {
            if (yaw < 0) {
                yaw += Math.PI;
            } else {
                yaw -= Math.PI;
            }
        }

        return new PerspectiveCamera(
            this.position,
            { x: pitch, y: -yaw, z: 0 } as Point3d,
            this.aspectRatio,
            this.near,
            this.far,
            this.fieldOfView
        ) as this;
    }

    zoom(amount: number): this {
        return new PerspectiveCamera(
            this.position,
            this.rotation,
            this.aspectRatio,
            this.near,
            this.far,
            this.fieldOfView * amount
        ) as this;
    }
}
