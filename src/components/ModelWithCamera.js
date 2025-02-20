import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import useInitialStateStore from "../stores";
import CameraProjection from "./Projection";
const ModelWithCamera = ({ url }) => {
    const gltf = useGLTF(url); // Load the GLB file
    const nodes = Array.isArray(gltf) ? gltf[0].nodes : gltf.nodes;
    const camera = useThree((state) => state.camera); // Access the camera
    const emptyRef = useRef(null);
    const setCameraPosition = useInitialStateStore((state) => state.setCameraPosition);
    const [glassMaterial, setGlassMaterial] = useState(null);
    // Position the camera relative to an empty object
    useEffect(() => {
        if (emptyRef.current) {
            // Adjust camera position and lookAt based on the empty object
            const emptyPosition = emptyRef.current.position;
            camera.position.set(emptyPosition.x, emptyPosition.y, emptyPosition.z); // Adjust offsets as needed
            setCameraPosition(camera.position);
        }
    }, [camera]);
    useEffect(() => {
        if (nodes) {
            for (const key of Object.keys(nodes)) {
                if (key.includes("window")) {
                    const window = nodes[key];
                    window.material.transparent = true;
                    window.material.opacity = 1;
                    if (window.material === glassMaterial) {
                        console.log("Glass material already set");
                    }
                    else {
                        setGlassMaterial(window.material);
                    }
                }
            }
        }
    }, [nodes]);
    useEffect(() => {
        console.log(nodes);
    }, [nodes]);
    return (_jsxs("group", { children: [_jsx("primitive", { object: nodes.Scene }), glassMaterial !== null && (_jsx(CameraProjection, { cameraPosition: nodes.CameraPosRef?.position || [0, 0, 0], targetPosition: nodes.target?.position || [0, 0, 0], meshMaterial: glassMaterial })), _jsx("mesh", { ref: emptyRef, position: nodes.CameraPosRef?.position || [0, 0, 0], visible: false })] }));
};
export default ModelWithCamera;
