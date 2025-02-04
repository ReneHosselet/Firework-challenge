import { useFrame } from "@react-three/fiber";
import { forwardRef, useRef, useState, useImperativeHandle, useEffect } from "react";
import { Color, Object3D } from "three";

interface DynamicSpotlightProps {
  initialColor: string;
}

export interface DynamicSpotlightRef {
  updateColor: (newColor: string, intensity?: number) => void;
}

const DynamicSpotlight: React.ForwardRefRenderFunction<DynamicSpotlightRef, DynamicSpotlightProps> = ({ initialColor }, ref) => {
  const spotlightRef = useRef<SpotLight>(null);
  const [targetColor, setTargetColor] = useState(new Color(initialColor));
  const [currentColor, setCurrentColor] = useState(new Color(initialColor));
  const targetIntensityRef = useRef(1); // Use useRef for target intensity
  const currentIntensityRef = useRef(1); // Use useRef for current intensity

  useFrame((_, delta) => {
    if (spotlightRef.current) {
      // Lerp the current color towards the target color
      currentColor.lerp(targetColor, 0.05);
      spotlightRef.current.color.copy(currentColor);

      // Lerp the current intensity towards the target intensity
      currentIntensityRef.current += (targetIntensityRef.current - currentIntensityRef.current) * 0.1;
      spotlightRef.current.intensity = currentIntensityRef.current /1.5;
    }
  });

  useImperativeHandle(ref, () => ({
    updateColor: (newColor: string, intensity: number = 3) => {
      setTargetColor(new Color(newColor));
      targetIntensityRef.current = intensity; // Update the target intensity
    }
  }));

  return (
    <pointLight
      ref={spotlightRef}
      position={[0.8, 0.5, -0.6]}
      intensity={currentIntensityRef.current}
      color={currentColor}
      castShadow
    />
  );
};

export default forwardRef(DynamicSpotlight);