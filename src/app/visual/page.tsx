"use client";

import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";

interface Modal {
    component: React.ReactNode;
    position: {
        x: number;
        y: number;
    };
}

function Page() {
    const canvasRef = useRef<HTMLDivElement>(null);
    const [modal, setModal] = useState<Modal | null>(null);

    useEffect(() => {
        const ref = canvasRef.current;
        if (!ref) return;
        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000,
        );
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        ref.appendChild(renderer.domElement);

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        // Add objects to the scene (e.g., a cube)
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        // Camera position
        camera.position.z = 5;

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);

            // Update objects (e.g., rotate the cube)
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;

            renderer.render(scene, camera);
        };

        animate();

        // Handle resizing
        const handleResize = () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        };

        const onCanvasClick = (event: MouseEvent) => {
            // Convert the mouse position to NDC
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            // Update the raycaster with the camera and mouse position
            raycaster.setFromCamera(mouse, camera);

            // Calculate objects intersecting the picking ray
            const intersects = raycaster.intersectObjects(scene.children);

            const first = intersects[0];
            if (!first) {
                setModal(null);
                return;
            }
            const { point } = first;
            setModal({
                component: <div>hello</div>,
                position: {
                    x: event.clientX,
                    y: event.clientY,
                },
            });
        };

        window.addEventListener("resize", handleResize);
        ref.addEventListener("click", onCanvasClick);

        // Cleanup
        return () => {
            window.removeEventListener("resize", handleResize);
            ref.removeEventListener("click", onCanvasClick);
            ref.removeChild(renderer.domElement);
        };
    }, []);

    return (
        <div className="relative">
            <div ref={canvasRef} />
            {modal && (
                <div
                    className="absolute"
                    style={{
                        left: modal.position.x,
                        top: modal.position.y,
                    }}
                >
                    {modal.component}
                </div>
            )}
        </div>
    );
}

export default Page;
