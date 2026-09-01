import * as THREE from "three";

const canvas = document.getElementById("three-bg");

if (!canvas) {
    console.warn("No #three-bg canvas found.");
} else {

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        100
    );

    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true
    });

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
    );

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );


    // PARTICLES

    const particleCount = 700;

    const positions = new Float32Array(
        particleCount * 3
    );

    const originalPositions = new Float32Array(
        particleCount * 3
    );

    for (let i = 0; i < particleCount * 3; i += 3) {

        const x = (Math.random() - 0.5) * 20;
        const y = (Math.random() - 0.5) * 12;
        const z = (Math.random() - 0.5) * 10;

        positions[i] = x;
        positions[i + 1] = y;
        positions[i + 2] = z;

        originalPositions[i] = x;
        originalPositions[i + 1] = y;
        originalPositions[i + 2] = z;
    }


    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(
            positions,
            3
        )
    );


    const material = new THREE.PointsMaterial({
        color: 0x57a882,
        size: 0.040,
        transparent: true,
        opacity: 0.45
    });


    const particles = new THREE.Points(
        geometry,
        material
    );

    scene.add(particles);


    // MOUSE

    const mouse = {
        x: 0,
        y: 0
    };

    window.addEventListener("pointermove", (event) => {

        mouse.x =
            (event.clientX / window.innerWidth) * 2 - 1;

        mouse.y =
            -(event.clientY / window.innerHeight) * 2 + 1;

    });


    // RESIZE

    window.addEventListener("resize", () => {

        camera.aspect =
            window.innerWidth / window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

    });


    // ANIMATION

    const clock = new THREE.Clock();

    function animate() {

        requestAnimationFrame(animate);

        const time = clock.getElapsedTime();

        const particlePositions =
            geometry.attributes.position.array;


        for (let i = 0; i < particleCount; i++) {

            const index = i * 3;

            const originalX =
                originalPositions[index];

            const originalY =
                originalPositions[index + 1];


            // Convert mouse into scene space

            const mouseX = mouse.x * 5;
            const mouseY = mouse.y * 3;


            const dx =
                originalX - mouseX;

            const dy =
                originalY - mouseY;

            const distance =
                Math.sqrt(dx * dx + dy * dy);


            // Mouse influence

            const radius = 1.5;

            if (distance < radius) {

                const force =
                    (1 - distance / radius) * 0.5;

                particlePositions[index] +=
                    (dx / distance) * force;

                particlePositions[index + 1] +=
                    (dy / distance) * force;
            }


            // Slowly return particles

            particlePositions[index] +=
                (originalX - particlePositions[index]) * 0.015;

            particlePositions[index + 1] +=
                (originalY - particlePositions[index + 1]) * 0.015;


            // Tiny organic movement

            particlePositions[index + 1] +=
                Math.sin(time * 0.4 + i) * 0.0003;
        }


        geometry.attributes.position.needsUpdate = true;


        // Slow overall movement

        particles.rotation.y =
            time * 0.015;

        particles.rotation.x =
            Math.sin(time * 0.1) * 0.02;


        renderer.render(
            scene,
            camera
        );
    }

    animate();
}