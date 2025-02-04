import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Trail } from '@react-three/drei';
import { Material, Mesh, PointLight, Vector3 } from 'three';
import { randomIntFromInterval } from './helper';

interface ParticleProps {
  position: Vector3;
  color: string;
}

const Particle: React.FC<ParticleProps> = ({ position, color }) => {
  const velocityRef = useRef(
    new Vector3(
      Math.random() * 0.12 - 0.06, // Adjust the range of x-component
      Math.random() * 0.06 - 0.015, // Adjust the range of y-component
      0 // Adjust the range of z-component
    )
  );

  const meshRef = useRef<Mesh>(null!);
  const trailRef = useRef<any>(null!);

  useEffect(() => {
    const disposeTimeout = setTimeout(() => {
      if (meshRef.current) {
        meshRef.current.geometry.dispose();
        (meshRef.current.material as Material).dispose();
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

  return (
    <Trail
      ref={trailRef}
      width={0.3}
      decay={0.5}
      length={5}
      color={color}
      attenuation={(t) => t * t}
    >
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[0.02, 0, 0.01]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          metalness={10}
          emissiveIntensity={100}
          // @ts-ignore
        //   shininess={100}
        />
      </mesh>
    </Trail>
  );
};

interface FireworkProps {
  position: [number, number, number];
  color: string;
  explodeTime: number;
}

const Firework: React.FC<FireworkProps> = ({ position, color, explodeTime }) => {
  const [exploded, setExploded] = useState(false);
  const [particles, setParticles] = useState<Vector3[]>([]);
  const fireworkRef = useRef<Mesh>(null);
  // const lightRef = useRef<PointLight>(null);
  const [velocity, setVelocity] = useState<number>(3);

  useEffect(() => {
    setVelocity(randomIntFromInterval(3.5,4 ));
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setExploded(true);
      createParticles();
    }, explodeTime * 1000);

    return () => clearTimeout(timeout);
  }, [explodeTime]);

  const createParticles = () => {
    const newParticles: Vector3[] = [];
    for (let i = 0; i < Math.floor(randomIntFromInterval(60, 100)); i++) {
      newParticles.push(fireworkRef.current!.position.clone());
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

  return (
    <>
      {!exploded && (
        <>
          <Trail
            width={1}
            length={4}
            color={color}
            decay={1}
            attenuation={(t) => t * t}
          >
            <Sphere ref={fireworkRef} position={position} args={[0.01, 16, 16]}>
              <meshStandardMaterial color={color} emissive={color} />
            </Sphere>
          </Trail>
        </>
      )}
      {exploded &&
        particles.map((particlePosition, index) => (
          <Particle key={index} position={particlePosition} color={color} />
        ))}
    </>
  );
};

export default Firework;