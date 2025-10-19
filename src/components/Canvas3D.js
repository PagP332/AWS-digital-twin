"use client";
import { Canvas, useLoader } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  useAnimations,
  useCursor,
} from "@react-three/drei";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader";
import { useEffect, useRef, useState } from "react";

export default function Canvas3D() {
  const Scene = () => {
    const baseFrame = useLoader(GLTFLoader, "/models/BaseFrame.glb");
    const { scene, animations } = useGLTF("/models/Anemometer.glb");
    const { actions } = useAnimations(animations, scene);

    const anemoRef = useRef();
    const [hovered, setHovered] = useState(false);

    // console.log(actions);
    useCursor(hovered /*'pointer', 'auto', document.body*/);

    useEffect(() => {
      actions.SphereAction.play();

      scene.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color("#ffffff"),
          });
        }
      });
    }, [actions, scene]);

    useEffect(() => {
      if (anemoRef.current) {
        scene.traverse((child) => {
          if (child.isMesh) {
            child.material.color = new THREE.Color(hovered ? "#3b43b1" : "W");
          }
        });
      }
    }, [hovered, scene]);

    return (
      <>
        <primitive
          object={baseFrame.scene}
          position={[0, -1, 0]}
          children-0-castShadow
        />
        <primitive
          object={scene}
          ref={anemoRef}
          position={[0, -1, 0]}
          children-0-castShadow
          onClick={(e) => {
            e.stopPropagation();
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
          }}
          onPointerOut={() => {
            setHovered(false);
          }}
        />
      </>
    );
  };

  return (
    <div className="h-full w-full rounded-xl bg-secondary overflow-hidden">
      <Canvas shadows>
        <directionalLight
          position={[3.3, 1.0, 4.4]}
          castShadow
          intensity={Math.PI * 2}
        />
        <directionalLight
          position={[-3.3, 1.0, -4.4]}
          castShadow
          intensity={Math.PI / 2}
        />
        <Scene />
        <OrbitControls enablePan={false} maxDistance={50} target={[0, 25, 0]} />
      </Canvas>
    </div>
  );
}
