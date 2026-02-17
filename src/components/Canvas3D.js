"use client";
import { Canvas, useLoader, useThree, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  useAnimations,
  useCursor,
  AccumulativeShadows,
  RandomizedLight,
  Environment as EnvironmentImpl,
} from "@react-three/drei";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { create } from "zustand";

const rootPosition = [0, -1, 0];
const hoverColor = new THREE.Color("#4543b1");
const markedColor = new THREE.Color("#DA1E28");

// const sensors = ["temperature", "windSpeed"];

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

const IntroCamera = ({ stationID, target, duration = 1, factor = 10 }) => {
  const { camera } = useThree();
  const startPos = useRef(new THREE.Vector3());
  const targetPos = useRef(new THREE.Vector3());
  const startTime = useRef(0);
  const playingRef = useRef(false);
  const lastStationRef = useRef(null);

  useEffect(() => {
    // Avoid double init in React 18 StrictMode while already animating
    if (playingRef.current && lastStationRef.current === stationID) return;

    // Initialize animation for this station
    targetPos.current.set(target[0], target[1], target[2]);
    startPos.current.set(
      target[0] * factor,
      target[1] * factor,
      target[2] * factor,
    );
    camera.position.copy(startPos.current);
    startTime.current = performance.now();
    playingRef.current = true;
    lastStationRef.current = stationID;
  }, [stationID, target, camera, factor]);

  useFrame(() => {
    if (!playingRef.current) return;
    const t = (performance.now() - startTime.current) / (duration * 1000);
    const clamped = Math.min(t, 1);
    const ease = 1 - Math.pow(1 - clamped, 5); // easeOut
    camera.position.lerpVectors(startPos.current, targetPos.current, ease);
    camera.lookAt(0, 26, 0);
    if (clamped >= 1) playingRef.current = false;
  });

  return null;
};

export default function Canvas3D({
  selectedStationID,
  parameterSelectedIndexProp,
  handleCanvasParameterSelect,
  sensors,
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

  const enableMeshShadows = (root) => {
    root.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
  };

  const CameraTracker = () => {
    const { camera } = useThree();
    useFrame(() =>
      setPosition([camera.position.x, camera.position.y, camera.position.z]),
    );
    return null;
  };

  const Environment = memo(function Environment({ direction = [5, 5, 5] }) {
    return (
      <>
        <directionalLight
          castShadow
          position={[10, 20, 15]}
          shadow-camera-right={8}
          shadow-camera-top={8}
          shadow-camera-left={-8}
          shadow-camera-bottom={-8}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          intensity={2}
          shadow-bias={-0.0001}
        />
        {/* </AccumulativeShadows> */}
        <EnvironmentImpl preset="city" />
      </>
    );
  });
  Environment.displayName = "Environment";
  const BaseFrame = () => {
    const baseFrame = useLoader(GLTFLoader, "/models/BaseFrame.glb");
    useEffect(() => {
      enableMeshShadows(baseFrame.scene);
    }, [baseFrame.scene]);
    return (
      <primitive
        object={baseFrame.scene}
        position={rootPosition}
        receiveShadow
        castShadow
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
      enableMeshShadows(scene);
      scene.traverse((child) => {
        if (child.isMesh && child.material) {
          registerBaseColor(child);
        }
      });
    }, [actions, names, scene, registerBaseColor]);

    useEffect(() => {
      const isSelected = selectedIndex === index;

      scene.traverse((child) => {
        if (child.isMesh && child.material) {
          const baseColor = getBaseColor(child);
          if (sensors.includes("windSpeed")) {
            child.material.color.copy(markedColor);
          } else if (isSelected || hovered) {
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
        receiveShadow
        castShadow
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
      enableMeshShadows(scene);
      scene.traverse((child) => {
        if (child.isMesh && child.material) {
          registerBaseColor(child);
        }
      });
    }, [actions, names, scene, registerBaseColor]);

    useEffect(() => {
      const isSelected = selectedIndex === index;

      scene.traverse((child) => {
        if (child.isMesh && child.material) {
          const baseColor = getBaseColor(child);
          if (sensors.includes("windDirection")) {
            child.material.color.copy(markedColor);
          } else if (isSelected || hovered) {
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
        receiveShadow
        castShadow
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
      enableMeshShadows(scene);
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
          if (sensors.includes("precipitation")) {
            child.material.color.copy(markedColor);
          } else if (isSelected || hovered) {
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
        receiveShadow
        castShadow
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
      enableMeshShadows(scene);
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
          if (
            sensors.includes("temperature") ||
            sensors.includes("humidity") ||
            sensors.includes("pressure")
          ) {
            child.material.color.copy(markedColor);
          } else if (isSelected || hovered) {
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
        receiveShadow
        castShadow
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
  const SolarPanel = ({ index }) => {
    const { scene } = useLoader(GLTFLoader, "/models/SolarPanel.glb");
    const [hovered, setHovered] = useState(false);

    const registerBaseColor = useSensorStore((s) => s.registerBaseColor);
    const getBaseColor = useSensorStore((s) => s.getBaseColor);
    const selectedIndex = useSensorStore((s) => s.selectedIndex);

    useCursor(hovered);

    useEffect(() => {
      enableMeshShadows(scene);
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
        receiveShadow
        castShadow
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
  const Enclosure = ({ index }) => {
    const { scene } = useLoader(GLTFLoader, "/models/Enclosure.glb");
    const [hovered, setHovered] = useState(false);

    const registerBaseColor = useSensorStore((s) => s.registerBaseColor);
    const getBaseColor = useSensorStore((s) => s.getBaseColor);
    const selectedIndex = useSensorStore((s) => s.selectedIndex);

    useCursor(hovered);

    useEffect(() => {
      enableMeshShadows(scene);
      scene.traverse((child) => {
        if (child.isMesh && child.material) {
          registerBaseColor(child);
        }
      });
    }, [scene, registerBaseColor]);

    useEffect(() => {
      const isSelected = selectedIndex === index || selectedIndex === index+1;

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
        receiveShadow
        castShadow
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const canvasElement = useMemo(
    () => (
      <Canvas
        shadows
        camera={{
          position, // <-- sets where the camera starts
        }}
      >
        <Environment />

        <BaseFrame />
        <Anemometer index={4} />
        <WindVane index={5} />
        <RainSensor index={0} />
        <TPH_Sensor index={1} />
        <SolarPanel index={6} />
        <Enclosure index={7} />

        {/* <IntroCamera stationID={selectedStationID} target={position} /> */}
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
