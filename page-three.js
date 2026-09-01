import * as THREE from "three";

const page = document.body.dataset.threePage;

if (!page) {
    console.warn("No Three.js page specified.");
} else {

    // --------------------------------------------------
    // SETUP
    // --------------------------------------------------

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
        55,
        window.innerWidth / window.innerHeight,
        0.1,
        100
    );

    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.id = "three-page-bg";
    document.body.prepend(renderer.domElement);


    // --------------------------------------------------
    // MOUSE & CURSOR PARALLAX / INTERACTION SETUP
    // --------------------------------------------------

    const mouse = {
        x: 0,
        y: 0,
        targetX: 0,
        targetY: 0,
        worldX: 0,
        worldY: 0,
        lastActiveNodeTime: 0
    };

    const raycaster = new THREE.Raycaster();
    const mousePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

    window.addEventListener("pointermove", event => {
        mouse.targetX = (event.clientX / window.innerWidth - 0.5) * 2;
        mouse.targetY = -(event.clientY / window.innerHeight - 0.5) * 2;

        const mouseVec = new THREE.Vector2(mouse.targetX, mouse.targetY);
        raycaster.setFromCamera(mouseVec, camera);
        const intersectPoint = new THREE.Vector3();
        raycaster.ray.intersectPlane(mousePlane, intersectPoint);
        mouse.worldX = intersectPoint.x;
        mouse.worldY = intersectPoint.y;
    });


    // --------------------------------------------------
    // HELPERS
    // --------------------------------------------------

    function random(min, max) {
        return Math.random() * (max - min) + min;
    }


    // --------------------------------------------------
    // 🕳️ RABBIT HOLES
    // --------------------------------------------------

    function createRabbitHoles() {
        const group = new THREE.Group();
        const holes = [];

        const holeCount = Math.floor(random(3, 6));

        for (let i = 0; i < holeCount; i++) {
            const holeGroup = new THREE.Group();
            const zDepth = random(-2, 1);
            
            const basePos = new THREE.Vector3(
                random(-5.5, 5.5),
                random(-3.5, 3.5),
                zDepth
            );
            holeGroup.position.copy(basePos);

            const centerGeo = new THREE.CircleGeometry(random(0.18, 0.32), 32);
            const centerMat = new THREE.MeshBasicMaterial({
                color: 0x030506,
                transparent: true,
                opacity: 0.85,
                side: THREE.DoubleSide
            });
            const center = new THREE.Mesh(centerGeo, centerMat);
            holeGroup.add(center);

            const ringGeo = new THREE.RingGeometry(0.25, 0.32, 32);
            const ringMat = new THREE.MeshBasicMaterial({
                color: 0x57a882,
                transparent: true,
                opacity: 0.15,
                side: THREE.DoubleSide
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            holeGroup.add(ring);

            group.add(holeGroup);

            holes.push({
                object: holeGroup,
                basePos: basePos.clone(),
                phase: random(0, Math.PI * 2),
                breatheSpeed: random(0.6, 1.4),
                driftSpeed: random(0.2, 0.5),
                lastBurst: 0
            });
        }

        const count = 750;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = random(-7, 7);
            positions[i * 3 + 1] = random(-5, 5);
            positions[i * 3 + 2] = random(-2.5, 1.5);

            velocities[i * 3] = random(-0.003, 0.003);
            velocities[i * 3 + 1] = random(-0.003, 0.003);
            velocities[i * 3 + 2] = random(-0.001, 0.001);
        }

        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: 0x57a882,
            size: 0.04,
            transparent: true,
            opacity: 0.45,
            depthWrite: false
        });

        const particles = new THREE.Points(geometry, material);
        group.add(particles);

        return { group, holes, particles, velocities };
    }


    // --------------------------------------------------
    // 🧩 PUZZLES
    // --------------------------------------------------

    function createPuzzleWorld() {
        const group = new THREE.Group();

        const shapes = [];
        const polygonGeometries = [
            new THREE.CircleGeometry(1.8, 6),
            new THREE.CircleGeometry(2.4, 8),
            new THREE.CircleGeometry(3.2, 12),
            new THREE.IcosahedronGeometry(1.6, 0),
            new THREE.OctahedronGeometry(2.2, 0)
        ];

        polygonGeometries.forEach((geo, i) => {
            const wireframe = new THREE.WireframeGeometry(geo);
            const mat = new THREE.LineBasicMaterial({
                color: 0x57a882,
                transparent: true,
                opacity: random(0.06, 0.14)
            });
            const line = new THREE.LineSegments(wireframe, mat);
            line.position.set(random(-2, 2), random(-1.5, 1.5), random(-1.5, 0.5));
            group.add(line);

            shapes.push({
                mesh: line,
                rotSpeed: (i % 2 === 0 ? 1 : -1) * random(0.0005, 0.002),
                targetScale: 1,
                currentScale: 1
            });
        });

        const pointCount = 140;
        const positions = new Float32Array(pointCount * 3);
        const originalPositions = new Float32Array(pointCount * 3);
        const gridStep = 0.6;

        for (let i = 0; i < pointCount; i++) {
            const gx = Math.round(random(-10, 10)) * gridStep;
            const gy = Math.round(random(-6, 6)) * gridStep;
            const gz = random(-2, 1);

            positions[i * 3] = gx;
            positions[i * 3 + 1] = gy;
            positions[i * 3 + 2] = gz;

            originalPositions[i * 3] = gx;
            originalPositions[i * 3 + 1] = gy;
            originalPositions[i * 3 + 2] = gz;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

        const pointsMat = new THREE.PointsMaterial({
            color: 0x57a882,
            size: 0.035,
            transparent: true,
            opacity: 0.35
        });
        const points = new THREE.Points(geometry, pointsMat);
        group.add(points);

        const lineGeo = new THREE.BufferGeometry();
        const linePositions = new Float32Array(pointCount * 3);
        lineGeo.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
        const gridLinesMat = new THREE.LineBasicMaterial({
            color: 0x57a882,
            transparent: true,
            opacity: 0.08
        });
        const gridLines = new THREE.LineSegments(lineGeo, gridLinesMat);
        group.add(gridLines);

        return {
            group,
            shapes,
            points,
            originalPositions,
            gridLines,
            lastReconfig: 0,
            gridStep
        };
    }


    // --------------------------------------------------
    // 🌿 NATURE
    // --------------------------------------------------

    function createNatureWorld() {
        const group = new THREE.Group();

        const count = 450;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const metadata = [];

        for (let i = 0; i < count; i++) {
            positions[i * 3] = random(-6.5, 6.5);
            positions[i * 3 + 1] = random(-6, 5);
            positions[i * 3 + 2] = random(-3, 1.5);

            metadata.push({
                speed: random(0.003, 0.008),
                wobblePhase: random(0, Math.PI * 2),
                wobbleFreq: random(1.2, 2.5),
                drift: random(-0.001, 0.001)
            });
        }

        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: 0xd8d2bd,
            size: 0.03,
            transparent: true,
            opacity: 0.35,
            depthWrite: false
        });

        const particles = new THREE.Points(geometry, material);
        group.add(particles);

        const grains = [];
        const grainCount = 30;

        for (let i = 0; i < grainCount; i++) {
            const zPos = random(-2.5, 1.5);
            const radius = random(0.06, 0.14);
            
            const mainGeo = new THREE.SphereGeometry(radius, 12, 12);
            const mainMat = new THREE.MeshBasicMaterial({
                color: 0xede6d1,
                transparent: true,
                opacity: 0.25,
                wireframe: true
            });

            const mesh = new THREE.Mesh(mainGeo, mainMat);
            mesh.position.set(random(-6.5, 6.5), random(-5.5, 4.5), zPos);
            group.add(mesh);

            const burstCount = 18;
            const burstGeo = new THREE.BufferGeometry();
            const burstPos = new Float32Array(burstCount * 3);
            const burstVels = new Float32Array(burstCount * 3);

            for (let b = 0; b < burstCount; b++) {
                burstPos[b * 3] = 0;
                burstPos[b * 3 + 1] = 0;
                burstPos[b * 3 + 2] = 0;

                const angle = random(0, Math.PI * 2);
                const spd = random(0.02, 0.07);
                burstVels[b * 3] = Math.cos(angle) * spd;
                burstVels[b * 3 + 1] = Math.sin(angle) * spd;
                burstVels[b * 3 + 2] = random(-0.02, 0.02);
            }

            burstGeo.setAttribute("position", new THREE.BufferAttribute(burstPos, 3));
            const burstMat = new THREE.PointsMaterial({
                color: 0xede6d1,
                size: 0.025,
                transparent: true,
                opacity: 0
            });

            const burstPoints = new THREE.Points(burstGeo, burstMat);
            mesh.add(burstPoints);

            grains.push({
                mesh,
                radius,
                speedY: random(0.001, 0.004),
                wobblePhase: random(0, Math.PI * 2),
                popped: false,
                popProgress: 0,
                burstPoints,
                burstVels,
                respawnTimer: 0
            });
        }

        return { group, particles, metadata, grains };
    }


    // --------------------------------------------------
    // 🧠 PSYCHOLOGY
    // --------------------------------------------------

    function createNeuralNetwork() {
        const group = new THREE.Group();

        const nodeCount = 70;
        const nodes = [];
        const nodePositions = new Float32Array(nodeCount * 3);

        const nodeGeo = new THREE.SphereGeometry(0.045, 12, 12);

        for (let i = 0; i < nodeCount; i++) {
            const pos = new THREE.Vector3(
                random(-5.5, 5.5),
                random(-3.5, 3.5),
                random(-2, 1)
            );

            const mat = new THREE.MeshBasicMaterial({
                color: 0x57a882,
                transparent: true,
                opacity: 0.3
            });

            const mesh = new THREE.Mesh(nodeGeo, mat);
            mesh.position.copy(pos);
            group.add(mesh);

            nodes.push({
                mesh,
                basePos: pos.clone(),
                activation: 0,
                phase: random(0, Math.PI * 2),
                neighbors: []
            });

            nodePositions[i * 3] = pos.x;
            nodePositions[i * 3 + 1] = pos.y;
            nodePositions[i * 3 + 2] = pos.z;
        }

        const maxDist = 1.85;
        const dynamicConnections = [];

        for (let i = 0; i < nodeCount; i++) {
            for (let j = i + 1; j < nodeCount; j++) {
                const dist = nodes[i].basePos.distanceTo(nodes[j].basePos);
                if (dist < maxDist) {
                    nodes[i].neighbors.push(j);
                    nodes[j].neighbors.push(i);

                    const lineGeo = new THREE.BufferGeometry();
                    lineGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(6), 3));

                    const lineMat = new THREE.LineBasicMaterial({
                        color: 0x57a882,
                        transparent: true,
                        opacity: 0.05
                    });

                    const line = new THREE.Line(lineGeo, lineMat);
                    group.add(line);

                    dynamicConnections.push({
                        line,
                        nodeA: i,
                        nodeB: j,
                        signalProgress: -1,
                        signalSpeed: random(1.5, 3.0)
                    });
                }
            }
        }

        return { group, nodes, connections: dynamicConnections };
    }


    // --------------------------------------------------
    // ⏳ HISTORY — TEMPORAL CONCENTRIC EPOCHS
    // --------------------------------------------------

    function createHistoryWorld() {
        const group = new THREE.Group();

        const epochRings = [];
        const ringCount = 5;

        for (let i = 0; i < ringCount; i++) {
            const radius = 0.8 + i * 0.75;
            const ringGeo = new THREE.RingGeometry(radius, radius + 0.025, 64);
            const ringMat = new THREE.MeshBasicMaterial({
                color: 0xc8aa78,
                transparent: true,
                opacity: 0.12 - i * 0.018,
                side: THREE.DoubleSide
            });

            const ringMesh = new THREE.Mesh(ringGeo, ringMat);
            ringMesh.position.set(0, 0, -i * 0.4);
            group.add(ringMesh);

            epochRings.push({
                mesh: ringMesh,
                baseRadius: radius,
                rotSpeed: (i % 2 === 0 ? 1 : -1) * random(0.0008, 0.0025),
                baseZ: -i * 0.4
            });
        }

        const moteCount = 380;
        const moteGeo = new THREE.BufferGeometry();
        const motePos = new Float32Array(moteCount * 3);

        for (let i = 0; i < moteCount; i++) {
            motePos[i * 3] = random(-6.5, 6.5);
            motePos[i * 3 + 1] = random(-4.5, 4.5);
            motePos[i * 3 + 2] = random(-2.5, 1.5);
        }

        moteGeo.setAttribute("position", new THREE.BufferAttribute(motePos, 3));

        const moteMat = new THREE.PointsMaterial({
            color: 0xd4b886,
            size: 0.035,
            transparent: true,
            opacity: 0.35,
            depthWrite: false
        });

        const dustMotes = new THREE.Points(moteGeo, moteMat);
        group.add(dustMotes);

        const relics = [];
        const relicCount = 7;

        for (let i = 0; i < relicCount; i++) {
            const geo = new THREE.OctahedronGeometry(random(0.15, 0.35), 0);
            const wireframe = new THREE.WireframeGeometry(geo);
            const mat = new THREE.LineBasicMaterial({
                color: 0xbfa068,
                transparent: true,
                opacity: random(0.1, 0.25)
            });

            const mesh = new THREE.LineSegments(wireframe, mat);
            mesh.position.set(random(-5.5, 5.5), random(-3.5, 3.5), random(-1.5, 0.5));
            group.add(mesh);

            relics.push({
                mesh,
                rotX: random(-0.003, 0.003),
                rotY: random(-0.003, 0.003),
                floatSpeed: random(0.3, 0.8),
                phase: random(0, Math.PI * 2)
            });
        }

        return { group, epochRings, dustMotes, relics };
    }


    // --------------------------------------------------
    // 💡 SUGGEST — INTERACTIVE WIREFRAME GRID CANVAS
    // --------------------------------------------------

    function createSuggestWorld() {
        const group = new THREE.Group();

        // Interactive Deformable Plane Grid (Columns and Rows Wireframe)
        const planeGeo = new THREE.PlaneGeometry(16, 10, 36, 26);
        const planeMat = new THREE.MeshBasicMaterial({
            color: 0x72aed4,
            wireframe: true,
            transparent: true,
            opacity: 0.12
        });

        const planeMesh = new THREE.Mesh(planeGeo, planeMat);
        planeMesh.position.z = -1.0;
        group.add(planeMesh);

        // Store original positions for real-time mesh deformation calculations
        const origPositions = planeGeo.attributes.position.array.slice();

        return { group, planeMesh, origPositions };
    }


    // --------------------------------------------------
    // CREATE PAGE WORLD
    // --------------------------------------------------

    let world;

    if (page === "rabbit") world = createRabbitHoles();
    if (page === "puzzles") world = createPuzzleWorld();
    if (page === "nature") world = createNatureWorld();
    if (page === "psychology") world = createNeuralNetwork();
    if (page === "history") world = createHistoryWorld();
    if (page === "suggest") world = createSuggestWorld();

    if (!world) {
        console.warn("Unknown Three.js page:", page);
    } else {
        scene.add(world.group);

        // --------------------------------------------------
        // ANIMATION LOOP
        // --------------------------------------------------

        const clock = new THREE.Clock();

        function animate() {
            requestAnimationFrame(animate);

            const time = clock.getElapsedTime();

            mouse.x += (mouse.targetX - mouse.x) * 0.05;
            mouse.y += (mouse.targetY - mouse.y) * 0.05;

            world.group.rotation.y = mouse.x * 0.04;
            world.group.rotation.x = -mouse.y * 0.03;


            // RABBIT HOLES LOGIC
            if (page === "rabbit") {
                const pos = world.particles.geometry.attributes.position.array;

                world.holes.forEach(h => {
                    const breathe = 1 + Math.sin(time * h.breatheSpeed + h.phase) * 0.12;
                    h.object.scale.set(breathe, breathe, 1);

                    h.object.position.x = h.basePos.x + Math.sin(time * h.driftSpeed + h.phase) * 0.35;
                    h.object.position.y = h.basePos.y + Math.cos(time * h.driftSpeed * 0.8 + h.phase) * 0.25;

                    if (time - h.lastBurst > random(4, 9)) {
                        h.lastBurst = time;
                        for (let k = 0; k < 12; k++) {
                            const pIndex = Math.floor(random(0, pos.length / 3)) * 3;
                            pos[pIndex] = h.object.position.x;
                            pos[pIndex + 1] = h.object.position.y;
                            pos[pIndex + 2] = h.object.position.z;
                        }
                    }
                });

                for (let i = 0; i < pos.length; i += 3) {
                    let px = pos[i];
                    let py = pos[i + 1];

                    let nearestHole = null;
                    let minDist = Infinity;

                    world.holes.forEach(h => {
                        const dx = h.object.position.x - px;
                        const dy = h.object.position.y - py;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < minDist) {
                            minDist = dist;
                            nearestHole = h;
                        }
                    });

                    const cDx = mouse.worldX - px;
                    const cDy = mouse.worldY - py;
                    const cDist = Math.sqrt(cDx * cDx + cDy * cDy);
                    if (cDist < 2.0) {
                        pos[i] += (cDx / cDist) * 0.004;
                        pos[i + 1] += (cDy / cDist) * 0.004;
                    }

                    if (nearestHole && minDist < 2.2) {
                        const hx = nearestHole.object.position.x;
                        const hy = nearestHole.object.position.y;
                        const dx = hx - px;
                        const dy = hy - py;

                        const pullForce = 0.0035 / Math.max(minDist, 0.1);
                        pos[i] += (dx / minDist) * pullForce;
                        pos[i + 1] += (dy / minDist) * pullForce;

                        pos[i] += (-dy / minDist) * 0.004;
                        pos[i + 1] += (dx / minDist) * 0.004;

                        if (minDist < 0.18) {
                            const otherHoles = world.holes.filter(h => h !== nearestHole);
                            const exitHole = otherHoles[Math.floor(Math.random() * otherHoles.length)] || nearestHole;

                            pos[i] = exitHole.object.position.x + random(-0.3, 0.3);
                            pos[i + 1] = exitHole.object.position.y + random(-0.3, 0.3);
                        }
                    } else {
                        pos[i] += Math.sin(time * 0.4 + py) * 0.001;
                        pos[i + 1] += Math.cos(time * 0.3 + px) * 0.001;
                    }
                }

                world.particles.geometry.attributes.position.needsUpdate = true;
            }


            // PUZZLES LOGIC
            if (page === "puzzles") {
                world.shapes.forEach(s => {
                    s.mesh.rotation.z += s.rotSpeed;
                    s.mesh.rotation.x += s.rotSpeed * 0.5;
                });

                if (time - world.lastReconfig > 5.5) {
                    world.lastReconfig = time;
                    const orig = world.originalPositions;
                    for (let i = 0; i < orig.length; i += 3) {
                        if (Math.random() > 0.6) {
                            orig[i] = Math.round(random(-8, 8)) * world.gridStep;
                            orig[i + 1] = Math.round(random(-5, 5)) * world.gridStep;
                        }
                    }
                }

                const pts = world.points.geometry.attributes.position.array;
                const orig = world.originalPositions;

                for (let i = 0; i < pts.length; i += 3) {
                    let targetX = orig[i];
                    let targetY = orig[i + 1];

                    const dx = mouse.worldX - pts[i];
                    const dy = mouse.worldY - pts[i + 1];
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 1.8) {
                        targetX += (dx / dist) * 0.4;
                        targetY += (dy / dist) * 0.4;
                    }

                    pts[i] += (targetX - pts[i]) * 0.08;
                    pts[i + 1] += (targetY - pts[i + 1]) * 0.08;
                }

                world.points.geometry.attributes.position.needsUpdate = true;

                const linePts = world.gridLines.geometry.attributes.position.array;
                let lineIdx = 0;
                for (let i = 0; i < pts.length - 6; i += 6) {
                    linePts[lineIdx++] = pts[i];
                    linePts[lineIdx++] = pts[i + 1];
                    linePts[lineIdx++] = pts[i + 2];

                    linePts[lineIdx++] = pts[i + 3];
                    linePts[lineIdx++] = pts[i + 4];
                    linePts[lineIdx++] = pts[i + 5];
                }
                world.gridLines.geometry.attributes.position.needsUpdate = true;
            }


            // NATURE LOGIC
            if (page === "nature") {
                const pos = world.particles.geometry.attributes.position.array;

                for (let i = 0; i < pos.length; i += 3) {
                    const idx = i / 3;
                    const meta = world.metadata[idx];

                    pos[i + 1] += meta.speed;
                    pos[i] += Math.sin(time * meta.wobbleFreq + meta.wobblePhase) * 0.0025 + meta.drift;

                    const dx = pos[i] - mouse.worldX;
                    const dy = pos[i + 1] - mouse.worldY;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 1.2) {
                        const push = (1.2 - dist) * 0.003;
                        pos[i] += (dx / dist) * push;
                        pos[i + 1] += (dy / dist) * push;
                    }

                    if (pos[i + 1] > 5.2) {
                        pos[i + 1] = -5.5;
                        pos[i] = random(-6.5, 6.5);
                    }
                }

                world.particles.geometry.attributes.position.needsUpdate = true;

                world.grains.forEach(g => {
                    if (!g.popped) {
                        g.mesh.position.y += g.speedY;
                        g.mesh.position.x += Math.sin(time * 0.8 + g.wobblePhase) * 0.002;

                        const dx = g.mesh.position.x - mouse.worldX;
                        const dy = g.mesh.position.y - mouse.worldY;
                        const dist = Math.sqrt(dx * dx + dy * dy);

                        if (dist < g.radius + 0.22) {
                            g.popped = true;
                            g.popProgress = 1.0;
                            g.mesh.material.opacity = 0;
                            g.burstPoints.material.opacity = 0.8;
                        }

                        if (g.mesh.position.y > 5.5) {
                            g.mesh.position.y = -5.5;
                            g.mesh.position.x = random(-6.5, 6.5);
                        }
                    } else {
                        const bPos = g.burstPoints.geometry.attributes.position.array;
                        for (let k = 0; k < bPos.length / 3; k++) {
                            bPos[k * 3] += g.burstVels[k * 3];
                            bPos[k * 3 + 1] += g.burstVels[k * 3 + 1];
                            bPos[k * 3 + 2] += g.burstVels[k * 3 + 2];
                        }
                        g.burstPoints.geometry.attributes.position.needsUpdate = true;
                        g.burstPoints.material.opacity *= 0.93;

                        g.popProgress -= 0.02;
                        if (g.popProgress <= 0) {
                            g.popped = false;
                            g.mesh.position.set(random(-6.5, 6.5), -5.5, random(-2.5, 1.5));
                            g.mesh.material.opacity = 0.25;
                            g.burstPoints.material.opacity = 0;

                            for (let k = 0; k < bPos.length; k++) bPos[k] = 0;
                            g.burstPoints.geometry.attributes.position.needsUpdate = true;
                        }
                    }
                });
            }


            // PSYCHOLOGY LOGIC
            if (page === "psychology") {
                let activeNodeIdx = -1;
                let minDist = 1.2;

                world.nodes.forEach((n, idx) => {
                    const d = n.mesh.position.distanceTo(new THREE.Vector3(mouse.worldX, mouse.worldY, 0));
                    if (d < minDist) {
                        minDist = d;
                        activeNodeIdx = idx;
                    }
                });

                if (activeNodeIdx !== -1 && time - mouse.lastActiveNodeTime > 0.25) {
                    mouse.lastActiveNodeTime = time;
                    world.nodes[activeNodeIdx].activation = 1.0;

                    const conn = world.connections.find(
                        c => (c.nodeA === activeNodeIdx || c.nodeB === activeNodeIdx) && c.signalProgress < 0
                    );
                    if (conn) conn.signalProgress = 0;
                }

                world.nodes.forEach((node) => {
                    node.mesh.position.x = node.basePos.x + Math.sin(time * 0.5 + node.phase) * 0.08;
                    node.mesh.position.y = node.basePos.y + Math.cos(time * 0.6 + node.phase) * 0.06;

                    if (node.activation > 0) {
                        node.activation -= 0.015;
                    }

                    const currentAct = Math.max(node.activation, 0);
                    const scale = 1 + Math.sin(time * 2 + node.phase) * 0.15 + currentAct * 1.4;
                    node.mesh.scale.setScalar(scale);

                    node.mesh.material.opacity = 0.25 + currentAct * 0.75;
                    node.mesh.material.color.setHex(currentAct > 0.3 ? 0x8be4b5 : 0x57a882);
                });

                world.connections.forEach(c => {
                    const nodeA = world.nodes[c.nodeA];
                    const nodeB = world.nodes[c.nodeB];

                    const linePos = c.line.geometry.attributes.position.array;
                    linePos[0] = nodeA.mesh.position.x;
                    linePos[1] = nodeA.mesh.position.y;
                    linePos[2] = nodeA.mesh.position.z;

                    linePos[3] = nodeB.mesh.position.x;
                    linePos[4] = nodeB.mesh.position.y;
                    linePos[5] = nodeB.mesh.position.z;

                    c.line.geometry.attributes.position.needsUpdate = true;

                    if (c.signalProgress >= 0) {
                        c.signalProgress += 0.025;
                        c.line.material.opacity = 0.6;
                        c.line.material.color.setHex(0x8be4b5);

                        if (c.signalProgress >= 1.0) {
                            c.signalProgress = -1;
                            world.nodes[c.nodeB].activation = 1.0;
                        }
                    } else {
                        c.line.material.opacity = 0.06 + Math.max(nodeA.activation, nodeB.activation) * 0.25;
                        c.line.material.color.setHex(0x57a882);
                    }
                });
            }


            // HISTORY LOGIC
            if (page === "history") {
                world.epochRings.forEach(r => {
                    r.mesh.rotation.z += r.rotSpeed;

                    const dx = r.mesh.position.x - mouse.worldX;
                    const dy = r.mesh.position.y - mouse.worldY;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 2.5) {
                        r.mesh.rotation.x = (mouse.worldY - r.mesh.position.y) * 0.15;
                        r.mesh.rotation.y = (mouse.worldX - r.mesh.position.x) * 0.15;
                    } else {
                        r.mesh.rotation.x *= 0.95;
                        r.mesh.rotation.y *= 0.95;
                    }
                });

                const mPos = world.dustMotes.geometry.attributes.position.array;
                for (let i = 0; i < mPos.length; i += 3) {
                    mPos[i + 1] += 0.0015;
                    mPos[i] += Math.sin(time * 0.5 + mPos[i + 1]) * 0.001;

                    if (mPos[i + 1] > 4.5) {
                        mPos[i + 1] = -4.5;
                        mPos[i] = random(-6.5, 6.5);
                    }
                }
                world.dustMotes.geometry.attributes.position.needsUpdate = true;

                world.relics.forEach(rel => {
                    rel.mesh.rotation.x += rel.rotX;
                    rel.mesh.rotation.y += rel.rotY;
                    rel.mesh.position.y += Math.sin(time * rel.floatSpeed + rel.phase) * 0.0012;
                });
            }


            // SUGGEST LOGIC (PURE WIREFRAME GRID DEFORMATION)
            if (page === "suggest") {
                const planePos = world.planeMesh.geometry.attributes.position.array;
                const orig = world.origPositions;

                for (let i = 0; i < planePos.length; i += 3) {
                    const vx = orig[i];
                    const vy = orig[i + 1];

                    const dx = mouse.worldX - vx;
                    const dy = mouse.worldY - vy;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    // Ambient wave ripples + cursor displacement
                    const wave = Math.sin(dist * 2.2 - time * 2.5) * 0.15;
                    const push = dist < 2.5 ? (2.5 - dist) * 0.4 : 0;

                    planePos[i + 2] = orig[i + 2] + wave + push;
                }

                world.planeMesh.geometry.attributes.position.needsUpdate = true;
            }


            renderer.render(scene, camera);
        }

        animate();
    }


    // --------------------------------------------------
    // RESIZE HANDLER
    // --------------------------------------------------

    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
}