import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { PerspectiveCamera, Text, useFBO } from "@react-three/drei";
import { useEffect, useRef, useMemo, useLayoutEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MeshBasicMaterial, Vector3, ShaderMaterial, Vector2, MathUtils, } from "three";
import { CRTShader } from "../shaders/CRTShader";
function CameraProjection({ cameraPosition, targetPosition, meshMaterial, showScreen, visibleText, }) {
    const secondaryCameraRef = useRef(null);
    const fbo = useFBO(640, 480); // Create a framebuffer for rendering
    const postProcessFBO = useFBO(640, 480); // Create a second FBO for post-processing
    const textRef = useRef(null);
    const scaleRef = useRef(1); // Track the current scale
    const [scaleDirection, setScaleDirection] = useState(1); // 1 for growing, -1 for shrinking
    const { gl, scene, size } = useThree();
    // Create CRT shader material
    const crtMaterial = useMemo(() => {
        const material = new ShaderMaterial({
            ...CRTShader,
            uniforms: {
                ...CRTShader.uniforms,
                tDiffuse: { value: fbo.texture },
                resolution: { value: new Vector2(640, 480) },
            },
        });
        return material;
    }, [fbo.texture]);
    useEffect(() => {
        if (meshMaterial) {
            // Use the post-processed texture
            meshMaterial.map = postProcessFBO.texture;
            meshMaterial.needsUpdate = true;
        }
    }, [meshMaterial, postProcessFBO.texture]);
    // Render the secondary camera's view into the FBO
    useFrame((_, delta) => {
        //limit the speed to 30 fps
        delta = Math.min(delta, 1 / 30);
        setTimeout(() => {
            if (showScreen) {
                if (textRef.current) {
                    const scaleSpeed = 0.75; // Speed of scaling
                    const minScale = 3.5; // Minimum scale
                    const maxScale = 4.5; // Maximum scale
                    // Update the scale
                    scaleRef.current += scaleDirection * scaleSpeed * delta;
                    // Reverse direction if scale exceeds min or max
                    if (scaleRef.current > maxScale || scaleRef.current < minScale) {
                        setScaleDirection(-scaleDirection);
                    }
                    // Clamp the scale to ensure it stays within bounds
                    scaleRef.current = MathUtils.clamp(scaleRef.current, minScale, maxScale);
                    // Apply the scale to the text
                    textRef.current.scale.set(-scaleRef.current, scaleRef.current, scaleRef.current);
                }
                if (secondaryCameraRef.current) {
                    // First pass: Render scene to FBO
                    gl.autoClear = true;
                    gl.setRenderTarget(fbo);
                    gl.render(scene, secondaryCameraRef.current);
                    // Second pass: Apply CRT effect
                    gl.setRenderTarget(postProcessFBO);
                    gl.clear();
                    gl.setClearColor(0x000000);
                    // Render a full-screen quad with the CRT shader
                    const camera = secondaryCameraRef.current;
                    scene.overrideMaterial = crtMaterial;
                    gl.render(scene, camera);
                    scene.overrideMaterial = null;
                    // Reset render target
                    gl.setRenderTarget(null);
                }
            }
            else {
                if (secondaryCameraRef.current) {
                    // Render a completely black screen when showScreen is false
                    gl.autoClear = true;
                    gl.setRenderTarget(fbo);
                    gl.setClearColor(0x000000);
                    gl.clear();
                    // Apply CRT effect to the black screen
                    gl.setRenderTarget(postProcessFBO);
                    gl.clear();
                    gl.setClearColor(0x000000);
                    const camera = secondaryCameraRef.current;
                    scene.overrideMaterial = new MeshBasicMaterial({ color: 0x000000 });
                    gl.render(scene, camera);
                    scene.overrideMaterial = null;
                    // Reset render target
                    gl.setRenderTarget(null);
                }
            }
        }, delta);
    });
    useLayoutEffect(() => {
        if (secondaryCameraRef.current) {
            secondaryCameraRef.current.updateProjectionMatrix();
        }
    }, [window.innerWidth]);
    return (_jsxs(_Fragment, { children: [_jsx(PerspectiveCamera, { ref: secondaryCameraRef, position: cameraPosition, fov: 55, onUpdate: (self) => {
                    self.lookAt(new Vector3(...targetPosition));
                }, makeDefault: false }), _jsx(Text, { color: "white", anchorX: "center", anchorY: "middle", scale: 0.5, position: [
                    cameraPosition[0] - 5.5,
                    cameraPosition[1] + 3.1,
                    cameraPosition[2] + 11.5,
                ], rotation: [0, Math.PI, 0], children: "CH07" }), visibleText && (_jsx(Text, { ref: textRef, position: [
                    cameraPosition[0],
                    cameraPosition[1] + 0.2,
                    cameraPosition[2] + 5,
                ], scale: [scaleRef.current, scaleRef.current, scaleRef.current], fontWeight: "bold", fontSize: 0.1, color: "white", children: "FIREWORK CHALLENGE" }))] }));
}
export default CameraProjection;
