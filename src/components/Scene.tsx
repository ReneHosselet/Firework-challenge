import {
  Gltf,
  GradientTexture,
  OrbitControls,
  Plane,
  Stage,
  useGLTF,
  useCursor,
  Text,
  Sphere,
  Outlines,
} from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Fog, MathUtils, Vector3 } from "three";
import CameraProjection from "./Projection";
import Firework from "./Firework";
import { randomIntFromInterval } from "./helper";
import { Leva, useControls } from "leva";
import DynamicSpotlight, { DynamicSpotlightRef } from "./Lights";

const cameraSettings = {
  fov: 30,
  near: 0.1,
  far: 1000,
  position: new Vector3(0, 0, -5),
};

const crtTvModel = "./models/crt_tv_2.glb";

const Scene = () => {
  const [ref, setRef] = useState<any>(null);
  const [visibleFireworks, setVisibleFireworks] = useState<number[]>([]);
  const [showControls, setShowControls] = useState<boolean>(true);
  const spotlightRef = useRef<DynamicSpotlightRef>(null);
  const textRef = useRef<any>(null);
  const textRef2 = useRef<any>(null);
  const controlsRef = useRef<any>(null);
  const [visibleText, setVisibleText] = useState<boolean>(false);
  const [showFireWorks, setShowFireWorks] = useState<boolean>(true);
  const [showScreen, setShowScreen] = useState<boolean>(true);

  const [hoverScreen, setHoverScreen] = useState(false);
  const [hoverFireworks, setHoverFireworks] = useState(false);
  const [hoverText, setHoverText] = useState(false);

  useCursor(hoverScreen || hoverFireworks || hoverText);

  const {
    maxOffset,
    minOffset,
    amountOfFireworks,
    delayBetweenFireworks,
    maxVisibleFireworks,
  } = useControls({
    maxOffset: { value: 26, min: 5, max: 50, step: 1 },
    minOffset: { value: 14, min: 5, max: 50, step: 1 },
    amountOfFireworks: { value: 50, min: 1, max: 500, step: 1 },
    delayBetweenFireworks: { value: 1000, min: 100, max: 2000, step: 100 },
    maxVisibleFireworks: { value: 6, min: 1, max: 50, step: 1 },
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Control") {
        setShowControls((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showControls]);

  const projectedMaterial = useMemo(() => {
    if (ref) {
      let material = getMaterialByName("TVScreen", ref);
      return material;
    }
  }, [ref]);

  function getMaterialByName(name: string, Object: any) {
    if (Object.material) {
      if (Object.material.name === name) {
        return Object.material;
      } else if (Object.children?.length > 0) {
        for (const child of Object.children) {
          const result: any = getMaterialByName(name, child);
          if (result) return result;
        }
      }
    } else if (Object.children?.length > 0) {
      for (const child of Object.children) {
        const result: any = getMaterialByName(name, child);
        if (result) return result;
      }
    }
    return undefined;
  }

  const fireworks = useMemo(() => {
    return Array.from({ length: amountOfFireworks }).map((_, index) => {
      const x = randomIntFromInterval(minOffset, maxOffset);
      const y = -5;
      const z = 0;
      const color = `hsl(${Math.random() * 360}, 100%, 50%)`;
      const explodeTime = randomIntFromInterval(1.5, 2);
      return {
        key: index,
        position: [x, y, z],
        color,
        explodeTime,
      };
    });
  }, [amountOfFireworks, maxOffset, minOffset]);

  useEffect(() => {
    setVisibleFireworks([]);
    const timeouts: NodeJS.Timeout[] = [];

    const addFirework = (index: number) => {
      setVisibleFireworks((prev) => {
        const newVisibleFireworks = [...prev, index];
        if (newVisibleFireworks.length > maxVisibleFireworks) {
          newVisibleFireworks.shift();
        }
        return newVisibleFireworks;
      });

      handleColorChange(fireworks[index].color);

      const nextIndex = (index + 1) % amountOfFireworks;
      const timeout = setTimeout(
        () => addFirework(nextIndex),
        delayBetweenFireworks
      );
      timeouts.push(timeout);
    };

    addFirework(0);

    return () => timeouts.forEach((timeout) => clearTimeout(timeout));
  }, [
    fireworks,
    delayBetweenFireworks,
    maxVisibleFireworks,
    amountOfFireworks,
  ]);

  const handleColorChange = (color: string) => {
    if (spotlightRef.current) {
      spotlightRef.current.updateColor(color, 3);
    }
  };

  const handleExplode = () => {
    if (spotlightRef.current) {
      spotlightRef.current.updateColor("white", 0);
    }
  };

  const handleCameraChange = () => {
    if (textRef.current && textRef2.current) {
      textRef.current.scale.set(1, 1, 1);
      textRef.current.lookAt(controlsRef.current.object.position);
      textRef2.current.scale.set(1, 1, 1);
      textRef2.current.lookAt(controlsRef.current.object.position);
    }
  };

  const toggleScreen = () => {
    setShowScreen(!showScreen);
  };

  const toggleFireworks = () => {
    setShowFireWorks(!showFireWorks);
  };

  const toggleText = () => {
    setVisibleText(!visibleText);
  };

  return (
    <>
      <Leva hidden={showControls} />
      <Canvas id="main-canvas" camera={cameraSettings} gl={{ antialias: true }}>
        <Suspense fallback={null}>
          <DynamicSpotlight ref={spotlightRef} initialColor="white" />
          <Stage
            environment="city"
            intensity={0}
            adjustCamera={false}
            shadows={true}
          >
            <Gltf
              src={crtTvModel}
              position={[0, 0, 0]}
              ref={(newRef) => setRef(newRef)}
            />
          </Stage>
          <ambientLight intensity={1} />
          <Sphere
            position={[0.115, -0.175, -0.19]}
            args={[0.007, 16, 16]}
            onClick={toggleScreen}
            onPointerOver={() => setHoverScreen(true)}
            onPointerOut={() => setHoverScreen(false)}
          >
            <meshBasicMaterial transparent opacity={0} />
            <Outlines visible color={"white"} />
          </Sphere>
          <Sphere
            position={[0.04, -0.175, -0.19]}
            args={[0.006, 16, 16]}
            onClick={toggleFireworks}
            onPointerOver={() => setHoverFireworks(true)}
            onPointerOut={() => setHoverFireworks(false)}
          >
            <meshBasicMaterial transparent opacity={0} />
          </Sphere>
          <Sphere
            position={[0.0245, -0.175, -0.19]}
            args={[0.006, 16, 16]}
            onClick={toggleText}
            onPointerOver={() => setHoverText(true)}
            onPointerOut={() => setHoverText(false)}
          >
            <meshBasicMaterial transparent opacity={0} />
          </Sphere>
          {visibleText && (
            <>
              <Text
                ref={textRef2}
                // position={[-.8, 0, 0]}
                position={[-0.65, 0, 0]}
                scale={[-1, 1, 1]}
                // maxWidth={.5}
                maxWidth={0.2}
                fontWeight="bold"
                fontSize={0.05}
                rotation={[0, MathUtils.degToRad(-45), 0]}
                color="white"
              >
                {/* Camera problems
              Shader problems              
              Bad performance
              Bad optimization */}
                CRT TV 640x480 4:3
              </Text>
              <Text
                ref={textRef2}
                position={[0.6, 0, 0]}
                scale={[-1, 1, 1]}
                maxWidth={0.3}
                fontWeight="bold"
                fontSize={0.05}
                rotation={[0, MathUtils.degToRad(45), 0]}
                color="white"
              >
                useFBO Shaders Particles Trails Gradients useGLTF
              </Text>
            </>
          )}
          {showFireWorks && (
            <>
              {visibleFireworks.map((index) => (
                <Firework
                  key={fireworks[index].key}
                  position={fireworks[index].position}
                  color={fireworks[index].color}
                  explodeTime={fireworks[index].explodeTime}
                  onExplode={handleExplode}
                />
              ))}
            </>
          )}
          <Plane
            args={[15, 15]}
            position={[0, -0.22, 0]}
            rotation={[-MathUtils.degToRad(90), 0, 0]}
          >
            <meshBasicMaterial attach="material" color="black" />
          </Plane>
          <Plane
            args={[25, 25]}
            position={[20, 0, 2]}
            rotation={[0, MathUtils.degToRad(180), 0]}
          >
            <meshBasicMaterial attach="material">
              <GradientTexture
                stops={[0, 1]}
                colors={["darkgreen", "blue"]}
                size={1024}
              />
            </meshBasicMaterial>
          </Plane>
          <CameraProjection
            cameraPosition={[20, 1, -15]}
            targetPosition={[20, 1.1, 0]}
            meshMaterial={projectedMaterial}
            showScreen={showScreen}
            visibleText={visibleText}
          />
        </Suspense>
        <OrbitControls
          ref={controlsRef}
          target={[0, 0, -0.35]}
          enablePan={false}
          minDistance={0.5}
          maxDistance={1}
          maxPolarAngle={MathUtils.degToRad(90)}
          minPolarAngle={MathUtils.degToRad(0)}
          maxAzimuthAngle={MathUtils.degToRad(-140)}
          minAzimuthAngle={MathUtils.degToRad(140)}
          onChange={handleCameraChange}
        />
      </Canvas>
    </>
  );
};

export default Scene;
