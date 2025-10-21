"use client";
import { Canvas, useLoader, useThree, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  useAnimations,
  useCursor,
} from "@react-three/drei";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader";
import { useEffect, useMemo, useRef, useState } from "react";
import { create } from "zustand";

const rootPosition = [0, -1, 0];
const hoverColor = new THREE.Color("#4543b1");

const useCameraStore = create((set) => ({
  position: [23, 41, 10],
  setPosition: (pos) => set({ position: pos }),
}));

const useSensorStore = create((set, get) => ({
  baseColors: new Map(), // Stores original colors (key: mesh.name)
  selectedIndex: null, // Which parameter is currently selected

  // Save original color if not already saved
  registerBaseColor: (mesh) => {
    const { baseColors } = get();
    if (!baseColors.has(mesh.name)) {
      baseColors.set(mesh.name, mesh.material.color.clone());
    }
  },

  // Get the base color for a mesh
  getBaseColor: (mesh) => {
    const color = get().baseColors.get(mesh.name);
    return color ? color.clone() : mesh.material.color.clone();
  },

  // Update which sensor is selected (index-based)
  setSelectedIndex: (index) => set({ selectedIndex: index }),
}));

export default function Canvas3D({
  parameterSelectedIndexProp,
  handleCanvasParameterSelect,
}) {
  const { position, setPosition } = useCameraStore();
  const setSelectedIndex = useSensorStore((s) => s.setSelectedIndex);

  useEffect(() => {
    if (parameterSelectedIndexProp === 2 || parameterSelectedIndexProp === 3) {
      setSelectedIndex(1);
    } else {
      setSelectedIndex(parameterSelectedIndexProp);
    }
  }, [parameterSelectedIndexProp, setSelectedIndex]);

  // console.log(position);

  const CameraTracker = () => {
    const { camera } = useThree();
    useFrame(() =>
      setPosition([camera.position.x, camera.position.y, camera.position.z]),
    );
    return null;
  };

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
  const Anemometer = ({ index }) => {
    const group = useRef();
    const { scene, animations } = useGLTF("/models/Anemometer.glb");
    const { actions, names } = useAnimations(animations, scene);
    const [hovered, setHovered] = useState(false);

    const registerBaseColor = useSensorStore((s) => s.registerBaseColor);
    const getBaseColor = useSensorStore((s) => s.getBaseColor);
    const selectedIndex = useSensorStore((s) => s.selectedIndex);

    useCursor(hovered);

    useEffect(() => {
      if (actions[names[0]]) actions[names[0]].play();
    }, [actions, names]);

    useEffect(() => {
      scene.traverse((child) => {
        if (child.isMesh && child.material) {
          registerBaseColor(child);
        }
      });
    }, [scene, registerBaseColor]);

    useEffect(() => {
      const isSelected = selectedIndex === index;

      scene.traverse((child) => {
        if (child.isMesh && child.material) {
          const baseColor = getBaseColor(child);
          if (isSelected || hovered) {
            child.material.color.copy(hoverColor);
          } else {
            child.material.color.copy(baseColor);
          }
        }
      });
    }, [hovered, selectedIndex, scene, getBaseColor, index]);

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
        onClick={(e) => {
          e.stopPropagation();
          handleCanvasParameterSelect(index);
        }}
      />
    );
  };
  const WindVane = ({ index }) => {
    const group = useRef();
    const { scene, animations } = useGLTF("/models/WindVane.glb");
    const { actions, names } = useAnimations(animations, scene);
    const [hovered, setHovered] = useState(false);

    const registerBaseColor = useSensorStore((s) => s.registerBaseColor);
    const getBaseColor = useSensorStore((s) => s.getBaseColor);
    const selectedIndex = useSensorStore((s) => s.selectedIndex);

    useCursor(hovered);

    useEffect(() => {
      if (actions[names[0]]) actions[names[0]].play();
    }, [actions, names]);

    useEffect(() => {
      scene.traverse((child) => {
        if (child.isMesh && child.material) {
          registerBaseColor(child);
        }
      });
    }, [scene, registerBaseColor]);

    useEffect(() => {
      const isSelected = selectedIndex === index;

      scene.traverse((child) => {
        if (child.isMesh && child.material) {
          const baseColor = getBaseColor(child);
          if (isSelected || hovered) {
            child.material.color.copy(hoverColor);
          } else {
            child.material.color.copy(baseColor);
          }
        }
      });
    }, [hovered, selectedIndex, scene, getBaseColor, index]);

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
        onClick={(e) => {
          e.stopPropagation();
          handleCanvasParameterSelect(index);
        }}
      />
    );
  };
  const RainSensor = ({ index }) => {
    const { scene } = useLoader(GLTFLoader, "/models/RainSensor.glb");
    const [hovered, setHovered] = useState(false);

    const registerBaseColor = useSensorStore((s) => s.registerBaseColor);
    const getBaseColor = useSensorStore((s) => s.getBaseColor);
    const selectedIndex = useSensorStore((s) => s.selectedIndex);

    useCursor(hovered);

    useEffect(() => {
      scene.traverse((child) => {
        if (child.isMesh && child.material) {
          registerBaseColor(child);
        }
      });
    }, [scene, registerBaseColor]);

    useEffect(() => {
      const isSelected = selectedIndex === index;

      scene.traverse((child) => {
        if (child.isMesh && child.material) {
          const baseColor = getBaseColor(child);
          if (isSelected || hovered) {
            child.material.color.copy(hoverColor);
          } else {
            child.material.color.copy(baseColor);
          }
        }
      });
    }, [hovered, selectedIndex, scene, getBaseColor, index]);

    return (
      <primitive
        object={scene}
        position={rootPosition}
        children-0-castShadow
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => {
          setHovered(false);
        }}
        onClick={(e) => {
          e.stopPropagation();
          handleCanvasParameterSelect(index);
        }}
      />
    );
  };
  const TPH_Sensor = ({ index }) => {
    const { scene } = useLoader(GLTFLoader, "/models/TPH_Sensor.glb");
    const [hovered, setHovered] = useState(false);

    const registerBaseColor = useSensorStore((s) => s.registerBaseColor);
    const getBaseColor = useSensorStore((s) => s.getBaseColor);
    const selectedIndex = useSensorStore((s) => s.selectedIndex);

    useCursor(hovered);

    useEffect(() => {
      scene.traverse((child) => {
        if (child.isMesh && child.material) {
          registerBaseColor(child);
        }
      });
    }, [scene, registerBaseColor]);

    useEffect(() => {
      const isSelected = selectedIndex === index;

      scene.traverse((child) => {
        if (child.isMesh && child.material) {
          const baseColor = getBaseColor(child);
          if (isSelected || hovered) {
            child.material.color.copy(hoverColor);
          } else {
            child.material.color.copy(baseColor);
          }
        }
      });
    }, [hovered, selectedIndex, scene, getBaseColor, index]);

    return (
      <primitive
        object={scene}
        position={rootPosition}
        children-0-castShadow
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => {
          setHovered(false);
        }}
        onClick={(e) => {
          e.stopPropagation();
          handleCanvasParameterSelect(index);
        }}
      />
    );
  };

  const canvasElement = useMemo(
    () => (
      <Canvas
        shadows
        camera={{
          position, // <-- sets where the camera starts
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
        <Anemometer index={4} />
        <WindVane index={5} />
        <RainSensor index={0} />
        <TPH_Sensor index={1} />

        <CameraTracker />
        <OrbitControls enablePan={false} maxDistance={50} target={[0, 26, 0]} />
      </Canvas>
    ),
    [],
  );

  return (
    <div className="bg-secondary h-full w-full overflow-hidden rounded-xl">
      {canvasElement}
    </div>
  );
}
