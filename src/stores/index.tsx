import { Vector3 } from "three";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface initialState {
  cameraPosition: Vector3;
  setCameraPosition: (position: Vector3) => void;
}

const useInitialStateStore = create<initialState>()(
  devtools(
    persist(
      (set) => ({
        cameraPosition: new Vector3(0, 0, 0),
        setCameraPosition: (position) => set({ cameraPosition: position }),
      }),
      {
        name: "bear-storage",
      }
    )
  )
);

export default useInitialStateStore;
