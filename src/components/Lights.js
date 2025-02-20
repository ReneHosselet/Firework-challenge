import { jsx as _jsx } from "react/jsx-runtime";
import { useFrame } from "@react-three/fiber";
import { forwardRef, useRef, useState, useImperativeHandle } from "react";
import { Color } from "three";
const DynamicSpotlight = ({ initialColor }, ref) => {
    const spotlightRef = useRef(null);
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
            spotlightRef.current.intensity = currentIntensityRef.current / 1.5;
        }
    });
    useImperativeHandle(ref, () => ({
        updateColor: (newColor, intensity = 3) => {
            setTargetColor(new Color(newColor));
            targetIntensityRef.current = intensity; // Update the target intensity
        }
    }));
    return (_jsx("pointLight", { ref: spotlightRef, position: [0.8, 0.5, -0.6], intensity: currentIntensityRef.current, color: currentColor, castShadow: true }));
};
export default forwardRef(DynamicSpotlight);
