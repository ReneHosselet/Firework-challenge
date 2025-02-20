import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Trail } from '@react-three/drei';
import { Vector3 } from 'three';
import { randomIntFromInterval } from './helper';
const Particle = ({ position, color }) => {
    const velocityRef = useRef(new Vector3(Math.random() * 0.12 - 0.06, // Adjust the range of x-component
    Math.random() * 0.06 - 0.015, // Adjust the range of y-component
    0 // Adjust the range of z-component
    ));
    const meshRef = useRef(null);
    const trailRef = useRef(null);
    useEffect(() => {
        const disposeTimeout = setTimeout(() => {
            if (meshRef.current) {
                meshRef.current.geometry.dispose();
                meshRef.current.material.dispose();
                if (trailRef.current) {
                    trailRef.current.geometry.dispose();
                    trailRef.current.material.dispose();
                }
                if (meshRef.current.parent) {
                    meshRef.current.parent.remove(meshRef.current);
                }
            }
        }, 3000); // Dispose after time
        return () => clearTimeout(disposeTimeout);
    }, []);
    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.position.add(velocityRef.current);
            velocityRef.current.y -= 0.0007; // gravity
        }
    });
    return (_jsx(Trail, { ref: trailRef, width: 0.3, decay: 0.5, length: 5, color: color, attenuation: (t) => t * t, children: _jsxs("mesh", { ref: meshRef, position: position, children: [_jsx("sphereGeometry", { args: [0.02, 0, 0.01] }), _jsx("meshStandardMaterial", { color: color, emissive: color, metalness: 10, emissiveIntensity: 100 })] }) }));
};
const Firework = ({ position, color, explodeTime }) => {
    const [exploded, setExploded] = useState(false);
    const [particles, setParticles] = useState([]);
    const fireworkRef = useRef(null);
    // const lightRef = useRef<PointLight>(null);
    const [velocity, setVelocity] = useState(3);
    useEffect(() => {
        setVelocity(randomIntFromInterval(3.5, 4));
    }, []);
    useEffect(() => {
        const timeout = setTimeout(() => {
            setExploded(true);
            createParticles();
        }, explodeTime * 1000);
        return () => clearTimeout(timeout);
    }, [explodeTime]);
    const createParticles = () => {
        const newParticles = [];
        for (let i = 0; i < Math.floor(randomIntFromInterval(60, 100)); i++) {
            newParticles.push(fireworkRef.current.position.clone());
        }
        setParticles(newParticles);
    };
    useFrame((state, delta) => {
        if (!exploded && fireworkRef.current) {
            fireworkRef.current.position.y += delta * velocity;
            // if (lightRef.current) {
            //   lightRef.current.position.copy(fireworkRef.current.position);
            // }
        }
    });
    // Clean up particles and trails when the component unmounts
    useEffect(() => {
        return () => {
            particles.forEach((particle) => {
                // Dispose of particle geometries and materials
                // This is handled in the Particle component, but we ensure cleanup here
            });
        };
    }, [particles]);
    return (_jsxs(_Fragment, { children: [!exploded && (_jsx(_Fragment, { children: _jsx(Trail, { width: 1, length: 4, color: color, decay: 1, attenuation: (t) => t * t, children: _jsx(Sphere, { ref: fireworkRef, position: position, args: [0.01, 16, 16], children: _jsx("meshStandardMaterial", { color: color, emissive: color }) }) }) })), exploded &&
                particles.map((particlePosition, index) => (_jsx(Particle, { position: particlePosition, color: color }, index)))] }));
};
export default Firework;
