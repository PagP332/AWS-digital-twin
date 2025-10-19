"use client";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader";

export default function Canvas3D() {
  const gltf = useLoader(GLTFLoader, "/models/defaultcube.glb");
  return (
    <div className="h-full w-full rounded-xl bg-secondary overflow-hidden">
      <Canvas shadows>
        <directionalLight
          position={[3.3, 1.0, 4.4]}
          castShadow
          intensity={Math.PI * 2}
        />
        <ambientLight intensity={1} />
        <primitive
          object={gltf.scene}
          position={[0, -1, 0]}
          children-0-castShadow
        />
        <OrbitControls enablePan={false} maxDistance={10} target={[0, 0, 0]} />
      </Canvas>
    </div>
  );
}
