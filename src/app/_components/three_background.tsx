"use client";
import { range } from "functional-utilities";
import React, { useEffect } from "react";
import * as THREE from "three";

const ThreeBackground = () => {
    useEffect(() => {
        // Setup the scene, camera, and renderer
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000,
        );
        camera.position.z = 5; // Adjust initial camera position as needed

        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.domElement.style.position = "fixed"; // Make canvas fixed
        renderer.domElement.style.top = "0";
        renderer.domElement.style.left = "0";
        renderer.domElement.style.zIndex = "1"; // Ensure canvas is behind other content
        document.body.appendChild(renderer.domElement);

        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({ color: 0xaaaaff });

        let cubes: THREE.Mesh[] = [];

        function generate_cubes_for_screen(screen_size: {
            x: number;
            y: number;
        }) {
            cubes.forEach((cube) => {
                scene.remove(cube);
            });
            cubes = [];
            const cube_count_x = Math.ceil(screen_size.x / 100)+2;
            const cube_count_y = Math.ceil(screen_size.y / 100)+2;
            const cube_count = cube_count_x * cube_count_y;
            const cube_spacing = 1;
            const cube_offset_x = (cube_count_x * cube_spacing) / 2;
            const cube_offset_y = (cube_count_y * cube_spacing) / 2;
            range(cube_count).forEach((i) => {
                const cube = new THREE.Mesh(geometry, material);
                cube.position.x =
                    (i % cube_count_x) * cube_spacing - cube_offset_x + 0.5;
                cube.position.y =
                    Math.floor(i / cube_count_x) * cube_spacing -
                    cube_offset_y +
                    0.5;
                cubes.push(cube);
                scene.add(cube);
            });
        }
        generate_cubes_for_screen({
            x: window.innerWidth,
            y: window.innerHeight,
        });

        // const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        // scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(0,0,2);
        directionalLight.castShadow = true; // Enable shadows for this light
        scene.add(directionalLight);

        // Handle window resize
        const onWindowResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            generate_cubes_for_screen({
                x: window.innerWidth,
                y: window.innerHeight,
            });
        };
        window.addEventListener("resize", onWindowResize, false);

        // Update camera position based on scroll
        const onScroll = () => {
            const scrollY = window.scrollY;
            camera.position.y = scrollY * -0.01;
        };
        window.addEventListener("scroll", onScroll, false);

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);

            // Rotate cubes according to their position
            cubes.forEach((cube) => {
                cube.rotation.x += cube.position.x * 0.001;
                cube.rotation.y += cube.position.y * 0.001;
            });

            renderer.render(scene, camera);
        };
        animate();

        // Cleanup
        return () => {
            document.body.removeChild(renderer.domElement);
            window.removeEventListener("resize", onWindowResize);
            window.removeEventListener("scroll", onScroll);
        };
    }, []);

    return null; // The component does not render anything itself
};

export default ThreeBackground;
