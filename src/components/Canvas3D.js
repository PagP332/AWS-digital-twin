"use client";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  useAnimations,
  useCursor,
} from "@react-three/drei";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader";
import { useEffect, useRef, useState } from "react";

const rootPosition = [0, -1, 0];
const hoverColor = "#4543b1";

export default function Canvas3D() {
  const BaseFrame = () => {
    const baseFrame = useLoader(GLTFLoader, "/models/BaseFrame.glb");
    return (
      <primitive
        object={baseFrame.scene}
        position={rootPosition}
        children-0-castShadow
      />
    );
  };
  const Anemometer = () => {
    const group = useRef();
    const { scene, animations } = useGLTF("/models/Anemometer.glb");
    const { actions, names } = useAnimations(animations, scene);
    const [hovered, setHovered] = useState(false);

    useCursor(hovered);

    useEffect(() => {
      if (actions[names[0]]) actions[names[0]].play();
    }, [actions, names]);

    const originalColors = useRef(new Map());

    useEffect(() => {
      scene.traverse((child) => {
        if (child.isMesh && child.material) {
          originalColors.current.set(child.uuid, child.material.color.clone());
        }
      });
    }, [scene]);

    useEffect(() => {
      scene.traverse((child) => {
        if (child.isMesh && child.material) {
          const baseColor = originalColors.current.get(child.uuid);
          if (hovered) {
            child.material.color = new THREE.Color(hoverColor);
          } else if (baseColor) {
            child.material.color.copy(baseColor);
          }
        }
      });
    }, [hovered, scene]);

    return (
      <primitive
        object={scene}
        ref={group}
        position={rootPosition}
        children-0-castShadow
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => {
          setHovered(false);
        }}
      />
    );
  };
  const WindVane = () => {
    const group = useRef();
    const { scene, animations } = useGLTF("/models/WindVane.glb");
    const { actions, names } = useAnimations(animations, scene);
    const [hovered, setHovered] = useState(false);

    // console.log(actions.names[0]);

    useCursor(hovered);

    useEffect(() => {
      if (actions[names[0]]) actions[names[0]].play();
    }, [actions, names]);

    const originalColors = useRef(new Map());

    useEffect(() => {
      scene.traverse((child) => {
        if (child.isMesh && child.material) {
          originalColors.current.set(child.uuid, child.material.color.clone());
        }
      });
    }, [scene]);

    useEffect(() => {
      scene.traverse((child) => {
        if (child.isMesh && child.material) {
          const baseColor = originalColors.current.get(child.uuid);
          if (hovered) {
            child.material.color = new THREE.Color(hoverColor);
          } else if (baseColor) {
            child.material.color.copy(baseColor);
          }
        }
      });
    }, [hovered, scene]);

    return (
      <primitive
        object={scene}
        ref={group}
        position={rootPosition}
        children-0-castShadow
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => {
          setHovered(false);
        }}
      />
    );
  };
  const RainSensor = () => {
    const mesh = useLoader(GLTFLoader, "/models/RainSensor.glb");
    const [hovered, setHovered] = useState(false);

    useCursor(hovered);

    const originalColors = useRef(new Map());

    useEffect(() => {
      mesh.scene.traverse((child) => {
        if (child.isMesh && child.material) {
          originalColors.current.set(child.uuid, child.material.color.clone());
        }
      });
    }, [mesh.scene]);

    useEffect(() => {
      mesh.scene.traverse((child) => {
        if (child.isMesh && child.material) {
          const baseColor = originalColors.current.get(child.uuid);
          if (hovered) {
            child.material.color = new THREE.Color(hoverColor);
          } else if (baseColor) {
            child.material.color.copy(baseColor);
          }
        }
      });
    }, [hovered, mesh.scene]);

    return (
      <primitive
        object={mesh.scene}
        position={rootPosition}
        children-0-castShadow
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => {
          setHovered(false);
        }}
      />
    );
  };
  const TPH_Sensor = () => {
    const mesh = useLoader(GLTFLoader, "/models/TPH_Sensor.glb");
    const [hovered, setHovered] = useState(false);

    useCursor(hovered);

    const originalColors = useRef(new Map());

    useEffect(() => {
      mesh.scene.traverse((child) => {
        if (child.isMesh && child.material) {
          originalColors.current.set(child.uuid, child.material.color.clone());
        }
      });
    }, [mesh.scene]);

    useEffect(() => {
      mesh.scene.traverse((child) => {
        if (child.isMesh && child.material) {
          const baseColor = originalColors.current.get(child.uuid);
          if (hovered) {
            child.material.color = new THREE.Color(hoverColor);
          } else if (baseColor) {
            child.material.color.copy(baseColor);
          }
        }
      });
    }, [hovered, mesh.scene]);

    return (
      <primitive
        object={mesh.scene}
        position={rootPosition}
        children-0-castShadow
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => {
          setHovered(false);
        }}
      />
    );
  };

  return (
    <div className="h-full w-full rounded-xl bg-secondary overflow-hidden">
      <Canvas
        shadows
        camera={{
          position: [23, 41, 10], // <-- sets where the camera starts
        }}
      >
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
        <BaseFrame />
        <Anemometer />
        <WindVane />
        <RainSensor />
        <TPH_Sensor />
        {/* <CameraLogger /> */}
        <OrbitControls enablePan={false} maxDistance={50} target={[0, 26, 0]} />
      </Canvas>
    </div>
  );
}
