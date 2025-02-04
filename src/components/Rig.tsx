import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Vector3 } from "three";
import useInitialStateStore from "../stores";

function Rig() {
  const { camera, mouse } = useThree();
  const vec = new Vector3();
  const initialPos = useRef(new Vector3()); // To store the camera's initial position
  const cameraPosition = useInitialStateStore((state) => state.cameraPosition);

  useEffect(() => {
    // Store the initial position of the camera
    initialPos.current.copy(camera.position);
  }, [cameraPosition]);

  return useFrame(() => {
    // Define the target position based on mouse movement
    const maxOffset = 5; // Maximum movement offset
    vec.set(
      initialPos.current.x + mouse.x * maxOffset, // Offset by mouse x
      initialPos.current.y + mouse.y * maxOffset, // Offset by mouse y
      initialPos.current.z // Keep the z position fixed
    );

    // Lerp the camera position towards the target
    camera.position.lerp(vec, 0.025); // Smooth movement;
  });
}

export default Rig;
