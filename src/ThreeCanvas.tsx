import React, { useRef, useEffect } from 'react'; 
import * as THREE from 'three'; 
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { LoopSubdivision } from 'three-subdivide';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

const ThreeCanvas: React.FC = () => { 
    const mountRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {

        // Initialize scene, camera, and renderer
        const clock = new THREE.Clock();
        const scene = new THREE.Scene(); 
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true }); 
        const stats = new Stats(); 
        renderer.setSize(window.innerWidth, window.innerHeight);

        // Append renderer to the DOM
        if (mountRef.current) { 
            mountRef.current.appendChild(renderer.domElement); 
            mountRef.current.appendChild(stats.dom);
        }

        // Add mouse listening 
        let mouseX = 0; 
        let mouseY = 0; 

        document.addEventListener('mousemove', (event) => {
            mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            mouseY = (event.clientY / window.innerHeight) * 2 - 1;
        }); 

        // Function to load STL asynchronously using a Promise
        const loadSTL = (url: string): Promise<THREE.BufferGeometry> => {
            return new Promise((resolve, reject) => {
                const loader = new STLLoader();
                loader.load(
                    url,
                    (geometry) => resolve(geometry as THREE.BufferGeometry),  // On success
                    undefined,
                    (error) => reject(error)  // On error
                );
            });
        };

        // Main setup function
        const init = async () => {
            try {
                // Load the STL geometry
                const geometry: THREE.BufferGeometry = await loadSTL('/blockM.stl');

                // Then need to subdivide the geometry to get more points
                const iterations = 2;

                const params = {
                    split:          false,       // optional, default: true
                    uvSmooth:       false,      // optional, default: false
                    preserveEdges:  false,      // optional, default: false
                    flatOnly:       false,      // optional, default: false
                    maxTriangles:   Infinity,   // optional, default: Infinity
                };

                const subdividedGeometry = LoopSubdivision.modify(geometry, iterations, params);
                
                // Center the geometry
                subdividedGeometry.center();

                // // Rotate the geometry to make it upright
                // geometry.rotateX(-Math.PI / 2);

                // // Then move it some distance back
                // geometry.translate(0, 0, -100);
                // geometry.rotateY(Math.PI / 4);

                const material = new THREE.PointsMaterial({ size: 0.4, color: 0xffffff });
                const blockM = new THREE.Points(subdividedGeometry, material);
                //const blockM = new THREE.Mesh(subdividedGeometry, material);
                scene.add(blockM);

                // Create a pivot object for the block to fix axes 
                const pivot = new THREE.Object3D();
                pivot.add(blockM);
                scene.add(pivot);

                pivot.rotateX(-Math.PI / 2);
                pivot.translateY(70); 
                // pivot.translateX(-100); 
                pivot.translateZ(30); 
                

                // Start the animation loop
                animate(pivot);
                
            } catch (error) {
                console.error('An error occurred while loading the STL file:', error);
            }
        };

        // Particles geometry 
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 5000; 

        const posArray = new Float32Array(particlesCount * 3); 
        for (let i = 0; i < particlesCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 100; 
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3)); 

        const loader = new THREE.TextureLoader();
        const star = loader.load('/star_white.png');
        const particlesMaterial = new THREE.PointsMaterial({ 
            size: 0.2, 
            color: 0xffffff, 
            map: star, 
            transparent: true,
        });

        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial); 
        scene.add(particlesMesh);

        // Position the camera 
        camera.position.z = 30; 

        // Set renderer settings 
        renderer.setClearColor(new THREE.Color('#17191B'), 1); 

        // Handle window resize 
        const handleResize = () => {
            if (mountRef.current) { 
                const width = mountRef.current.clientWidth; 
                const height = mountRef.current.clientHeight; 
                renderer.setSize(width, height); 
                camera.aspect = width/height; 
                camera.updateProjectionMatrix(); 
            }
        };

        window.addEventListener('resize', handleResize);

        // Start the initial setup
        init();

        // Animation function (moved to bottom for clarity)
        const animate = (blockM: any) => {
            requestAnimationFrame(() => animate(blockM));
            const elapsedTime = clock.getElapsedTime();

            // Update the blockM geometry
            // blockM.rotation.x += 0.01;
            // blockM.rotation.y += 0.01;

            // Update particles position
            let tempPosArray = posArray.slice(); 
            for (let i = 0; i < particlesCount; i++) {
                const i3 = i * 3; 
                const x = tempPosArray[i3]; 
                const y = tempPosArray[i3 + 1]; 

                const randomDirection = Math.random() * 0.1;
                tempPosArray[i3] = x + 3*Math.sin((elapsedTime + i)/3) + Math.sin(randomDirection) * 0.1;
                tempPosArray[i3 + 1] = y + 3*Math.cos((elapsedTime + i)/3) + Math.cos(randomDirection) * 0.1;
            }
            particlesGeometry.setAttribute('position', new THREE.BufferAttribute(tempPosArray, 3));
            
            // Make the particles of blockM phase in and out
            blockM.rotation.z = elapsedTime * 0.1;
            blockM.rotation.y = elapsedTime * 0.1;


            // Render the frame and update stats
            renderer.render(scene, camera); 
            stats.update(); 
        };

        // Cleanup function 
        return () => {
            window.removeEventListener('resize', handleResize); 
            mountRef.current?.removeChild(renderer.domElement); 
        };

    }, []);

    return <div ref={mountRef} style={{ width: '100vw', height: '100vh' }} />; 
};

export default ThreeCanvas;
