import React, { useRef, useEffect } from 'react'; 
import * as THREE from 'three'; 

const ThreeCanvas: React.FC = () => { 
    const mountRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        // Create scene, camera, and renderer
        const scene = new THREE.Scene(); 
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true}); 
        renderer.setSize(window.innerWidth, window.innerHeight);

        // Append renderer to the DOM
        if (mountRef.current) { 
            mountRef.current.appendChild(renderer.domElement); 
        }

        // Create a torus geometry and add it to the scene 
        const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const torus = new THREE.Mesh(geometry, material); 
        scene.add(torus); 

        // Position the camera 
        camera.position.z = 30; 

        // Animation function 
        const animate = () => {
            requestAnimationFrame(animate); 
            torus.rotation.x += 0.01; 
            torus.rotation.y += 0.01; 
            renderer.render(scene, camera); 
        }

        animate(); 

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

        // Cleanup function 
        return () => {
            window.removeEventListener('resize', handleResize); 
            mountRef.current?.removeChild(renderer.domElement); 
        };

    }, []);

    return <div ref={mountRef} style={{ width: '100vw', height: '100vh' }} />; 
};

export default ThreeCanvas; 