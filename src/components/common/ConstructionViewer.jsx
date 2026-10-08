import React, { useState, useMemo, useRef, useEffect } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Grid } from "@react-three/drei";
import * as THREE from "three";
import {
  RotateCcw,
  Grid3X3,
  Layers,
  Ruler,
  Compass,
  Box,
} from "lucide-react";

/**
 * Creates high-quality procedural canvas textures offline without network requests.
 */
function createProceduralTexture(type, options = {}) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture();

  if (type === "brick") {
    // Light warm mortar background
    ctx.fillStyle = "#cfc8bc";
    ctx.fillRect(0, 0, 512, 512);

    const rows = 16;
    const rowHeight = 512 / rows;
    const brickWidth = 64;
    const mortar = 4;

    for (let r = 0; r < rows; r++) {
      const y = r * rowHeight;
      const offsetX = (r % 2) * (brickWidth / 2);
      for (let x = -brickWidth; x < 512 + brickWidth; x += brickWidth) {
        // Subtle brick color variation
        const shade = Math.floor(Math.sin(r * 13 + x * 7) * 15);
        const rVal = 180 + shade;
        const gVal = 62 + Math.floor(shade * 0.4);
        const bVal = 44 + Math.floor(shade * 0.3);
        ctx.fillStyle = `rgb(${rVal}, ${gVal}, ${bVal})`;

        ctx.fillRect(x + offsetX + mortar / 2, y + mortar / 2, brickWidth - mortar, rowHeight - mortar);

        // Subtle brick face texture
        ctx.fillStyle = "rgba(0, 0, 0, 0.06)";
        ctx.fillRect(x + offsetX + mortar / 2, y + rowHeight - mortar - 2, brickWidth - mortar, 2);
      }
    }
  } else if (type === "concrete") {
    // Concrete industrial grey with stipple aggregate
    ctx.fillStyle = "#9ca3af";
    ctx.fillRect(0, 0, 512, 512);

    // Speckling
    for (let i = 0; i < 4000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const radius = Math.random() * 1.8 + 0.4;
      const dark = Math.random() > 0.5;
      ctx.fillStyle = dark ? "rgba(55, 65, 81, 0.18)" : "rgba(243, 244, 246, 0.22)";
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === "tiles") {
    // Ceramic tiles with dark grout lines
    ctx.fillStyle = "#64748b"; // grout
    ctx.fillRect(0, 0, 512, 512);

    const tileSize = 64;
    const grout = 3;
    for (let x = 0; x < 512; x += tileSize) {
      for (let y = 0; y < 512; y += tileSize) {
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(x + grout / 2, y + grout / 2, tileSize - grout, tileSize - grout);

        // Subtle marble sheen
        ctx.fillStyle = "rgba(226, 232, 240, 0.6)";
        ctx.fillRect(x + grout / 2, y + grout / 2, tileSize - grout, (tileSize - grout) / 2);
      }
    }
  } else if (type === "plaster") {
    // Smooth stucco plaster
    ctx.fillStyle = "#f1efe7";
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 2500; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      ctx.fillStyle = Math.random() > 0.5 ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.4)";
      ctx.fillRect(x, y, 2, 2);
    }
  } else if (type === "paint") {
    // Satin painted wall
    ctx.fillStyle = options.color || "#e0f2fe";
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 1500; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.fillRect(x, y, 3, 3);
    }
  } else if (type === "sand") {
    // Sand yellow-gold
    ctx.fillStyle = "#d4a359";
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 5000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      ctx.fillStyle = Math.random() > 0.5 ? "rgba(120, 80, 20, 0.15)" : "rgba(255, 230, 160, 0.25)";
      ctx.fillRect(x, y, 1.5, 1.5);
    }
  } else if (type === "aggregate") {
    // Gravel / crushed stone
    ctx.fillStyle = "#64748b";
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 1200; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const r = Math.random() * 4 + 2;
      ctx.fillStyle = Math.random() > 0.5 ? "#475569" : "#94a3b8";
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * Dimension measurement annotation with tick marks and crisp HTML badge.
 */
function DimensionLine({
  start,
  end,
  label,
  valueText,
  color = "#3b82f6",
  tickAxis = "y",
  tickLength = 0.15,
  visible = true,
}) {
  if (!visible) return null;

  const points = useMemo(() => [new THREE.Vector3(...start), new THREE.Vector3(...end)], [start, end]);

  // Midpoint for badge
  const midpoint = useMemo(
    () => [
      (start[0] + end[0]) / 2,
      (start[1] + end[1]) / 2,
      (start[2] + end[2]) / 2,
    ],
    [start, end]
  );

  // Ticks at both ends
  const ticks = useMemo(() => {
    const s = new THREE.Vector3(...start);
    const e = new THREE.Vector3(...end);
    let tVec = new THREE.Vector3(0, tickLength, 0);
    if (tickAxis === "x") tVec = new THREE.Vector3(tickLength, 0, 0);
    if (tickAxis === "z") tVec = new THREE.Vector3(0, 0, tickLength);

    return [
      [s.clone().sub(tVec), s.clone().add(tVec)],
      [e.clone().sub(tVec), e.clone().add(tVec)],
    ];
  }, [start, end, tickAxis, tickLength]);

  return (
    <group>
      {/* Main dimension line */}
      <line>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            attach="attributes-position"
            count={points.length}
            array={new Float32Array(points.flatMap((p) => [p.x, p.y, p.z]))}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial attach="material" color={color} linewidth={2} />
      </line>

      {/* Start Tick */}
      <line>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array(ticks[0].flatMap((p) => [p.x, p.y, p.z]))}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial attach="material" color={color} linewidth={2} />
      </line>

      {/* End Tick */}
      <line>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array(ticks[1].flatMap((p) => [p.x, p.y, p.z]))}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial attach="material" color={color} linewidth={2} />
      </line>

      {/* HTML Annotation Badge */}
      <Html position={midpoint} center distanceFactor={12}>
        <div
          className="pointer-events-none select-none rounded-full border border-slate-700/80 bg-slate-950/85 px-2.5 py-1 text-[11px] font-semibold text-white shadow-xl backdrop-blur-md transition-transform hover:scale-105"
          style={{ whiteSpace: "nowrap" }}
        >
          <span className="inline-block h-2 w-2 rounded-full mr-1.5" style={{ backgroundColor: color }} />
          <span className="text-slate-300 font-normal">{label}:</span>{" "}
          <span className="font-bold text-white">{valueText}</span>
        </div>
      </Html>
    </group>
  );
}

/**
 * Steel Reinforcement Cage for concrete/steel elements.
 */
function RebarCage({ width, height, length, visible, steelPercentage = 1 }) {
  if (!visible) return null;

  const mult = Math.max(0.8, Math.min(2.5, Math.sqrt(steelPercentage || 1)));
  const barRadius = Math.max(0.015, Math.min(width, height, length) * 0.04 * mult);
  const cover = barRadius * 2.5;

  const wInner = Math.max(0.05, width - cover * 2);
  const hInner = Math.max(0.05, height - cover * 2);
  const lInner = Math.max(0.1, length - cover * 2);

  // 4 main longitudinal bars
  const barPositions = [
    [-wInner / 2, -hInner / 2 + height / 2, 0],
    [wInner / 2, -hInner / 2 + height / 2, 0],
    [-wInner / 2, hInner / 2 + height / 2, 0],
    [wInner / 2, hInner / 2 + height / 2, 0],
  ];

  // Stirrups dynamically scaled along the length
  const baseStirrups = Math.floor(length / 0.5);
  const numStirrups = Math.max(3, Math.min(16, Math.round(baseStirrups * mult)));
  const stirrupStep = lInner / (numStirrups - 1 || 1);

  return (
    <group>
      {/* 4 Longitudinal bars */}
      {barPositions.map((pos, idx) => (
        <mesh key={`bar-${idx}`} position={pos} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[barRadius, barRadius, length, 12]} />
          <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.25} />
        </mesh>
      ))}

      {/* Stirrup ties */}
      {Array.from({ length: numStirrups }).map((_, i) => {
        const zPos = -lInner / 2 + i * stirrupStep;
        return (
          <group key={`stirrup-${i}`} position={[0, height / 2, zPos]}>
            <lineSegments>
              <edgesGeometry
                attach="geometry"
                args={[new THREE.BoxGeometry(wInner, hInner, barRadius * 1.5)]}
              />
              <lineBasicMaterial attach="material" color="#f59e0b" linewidth={2} />
            </lineSegments>
          </group>
        );
      })}
    </group>
  );
}

/**
 * Camera framing controller to auto-center when dimensions change.
 */
function CameraController({ maxDim, targetY, viewAngle }) {
  const { camera } = useThree();
  const controlsRef = useRef();

  useEffect(() => {
    const dist = Math.max(2, maxDim * 1.8);
    if (viewAngle === "front") {
      camera.position.set(0, targetY, dist * 1.6);
    } else if (viewAngle === "top") {
      camera.position.set(0, targetY + dist * 1.8, 0.001);
    } else if (viewAngle === "side") {
      camera.position.set(dist * 1.8, targetY, 0);
    } else {
      // Isometric 3D default
      camera.position.set(dist * 1.2, targetY + dist * 0.6, dist * 1.4);
    }
    camera.lookAt(0, targetY, 0);
    if (controlsRef.current) {
      controlsRef.current.target.set(0, targetY, 0);
      controlsRef.current.update();
    }
  }, [maxDim, targetY, viewAngle, camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.05}
      minDistance={0.5}
      maxDistance={maxDim * 10}
    />
  );
}

/**
 * Main 3D Construction Model renderer.
 */
function ConstructionModel({
  toolKey,
  dimensions,
  calculationResult,
  wireframe,
  showDimensions,
  showRebar,
  autoRotate,
}) {
  const groupRef = useRef();

  // Gentle auto-rotation if toggled
  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.35;
    }
  });

  const {
    widthMeters = 5,
    heightMeters = 3,
    depthMeters = 0.23,
    widthDisplay = "500",
    heightDisplay = "300",
    depthDisplay = "23",
    unit = "cm",
  } = dimensions;

  // Clamped dimensions for robust 3D representation
  const w = Math.max(0.1, widthMeters);
  const h = Math.max(0.1, heightMeters);
  const d = Math.max(0.04, depthMeters);

  // Textures
  const brickTexture = useMemo(() => {
    const t = createProceduralTexture("brick");
    t.repeat.set(Math.max(1, Math.round(w / 0.23)), Math.max(1, Math.round(h / 0.075)));
    return t;
  }, [w, h]);

  const concreteTexture = useMemo(() => {
    const t = createProceduralTexture("concrete");
    t.repeat.set(Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
    return t;
  }, [w, h]);

  const tileTexture = useMemo(() => {
    const t = createProceduralTexture("tiles");
    const tW = dimensions.tileLengthMeters || 0.6;
    const tH = dimensions.tileBreadthMeters || 0.6;
    t.repeat.set(Math.max(1, Math.round(w / tW)), Math.max(1, Math.round(d / tH)));
    return t;
  }, [w, d, dimensions.tileLengthMeters, dimensions.tileBreadthMeters]);

  const plasterTexture = useMemo(() => createProceduralTexture("plaster"), []);
  const paintTexture = useMemo(() => createProceduralTexture("paint", { color: "#bae6fd" }), []);
  const sandTexture = useMemo(() => createProceduralTexture("sand"), []);
  const aggregateTexture = useMemo(() => createProceduralTexture("aggregate"), []);

  // Dimension line offsets
  const xOffset = w / 2 + Math.min(0.8, w * 0.15);
  const zOffset = d / 2 + Math.min(0.8, w * 0.15);
  const yOffset = h + Math.min(0.5, h * 0.1);

  return (
    <group ref={groupRef}>
      {/* ────────────────── 1. BRICK WALL ────────────────── */}
      {toolKey === "brick" && (
        <group>
          {/* Main Masonry Wall */}
          <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial
              map={brickTexture}
              roughness={0.88}
              metalness={0.05}
              wireframe={wireframe}
            />
          </mesh>

          {/* Wall Edge highlights */}
          <lineSegments position={[0, h / 2, 0]}>
            <edgesGeometry attach="geometry" args={[new THREE.BoxGeometry(w, h, d)]} />
            <lineBasicMaterial attach="material" color="#475569" linewidth={1} />
          </lineSegments>

          {/* Concrete Foundation Footing */}
          <mesh position={[0, -0.06, 0]} receiveShadow>
            <boxGeometry args={[w * 1.05, 0.12, d * 1.6]} />
            <meshStandardMaterial map={concreteTexture} roughness={0.9} color="#94a3b8" />
          </mesh>
        </group>
      )}

      {/* ────────────────── 2. CONCRETE MEMBER ────────────────── */}
      {toolKey === "concrete" && (
        <group>
          <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial
              map={concreteTexture}
              roughness={0.75}
              metalness={0.1}
              color="#e2e8f0"
              transparent={showRebar}
              opacity={showRebar ? 0.45 : 1}
              wireframe={wireframe}
            />
          </mesh>

          <lineSegments position={[0, h / 2, 0]}>
            <edgesGeometry attach="geometry" args={[new THREE.BoxGeometry(w, h, d)]} />
            <lineBasicMaterial attach="material" color="#64748b" linewidth={1} />
          </lineSegments>

          {/* Internal steel reinforcement */}
          <RebarCage
            width={w}
            height={h}
            length={d}
            visible={showRebar}
            steelPercentage={calculationResult?.steelPercentage || 1}
          />
        </group>
      )}

      {/* ────────────────── 3. STEEL / REBAR ────────────────── */}
      {toolKey === "steel" && (
        <group>
          {/* Ghosted concrete envelope */}
          <mesh position={[0, h / 2, 0]}>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial
              color="#38bdf8"
              transparent
              opacity={0.25}
              roughness={0.2}
              wireframe={wireframe}
            />
          </mesh>

          {/* Inner Rebar Cage always prominent */}
          <RebarCage
            width={w}
            height={h}
            length={d}
            visible={true}
            steelPercentage={calculationResult?.steelPercentage || 1}
          />
        </group>
      )}

      {/* ────────────────── 4. FLOORING / TILES ────────────────── */}
      {toolKey === "flooring" && (
        <group>
          {/* Base substrate concrete slab */}
          <mesh position={[0, -0.05, 0]} receiveShadow>
            <boxGeometry args={[w, 0.1, d]} />
            <meshStandardMaterial map={concreteTexture} roughness={0.9} color="#cbd5e1" />
          </mesh>

          {/* Tiled surface */}
          <mesh position={[0, 0.005, 0]} receiveShadow>
            <boxGeometry args={[w, 0.01, d]} />
            <meshStandardMaterial
              map={tileTexture}
              roughness={0.2}
              metalness={0.08}
              wireframe={wireframe}
            />
          </mesh>

          {/* Perimeter wall skirting / borders */}
          <lineSegments position={[0, 0.01, 0]}>
            <edgesGeometry attach="geometry" args={[new THREE.BoxGeometry(w, 0.02, d)]} />
            <lineBasicMaterial attach="material" color="#0284c7" linewidth={2} />
          </lineSegments>
        </group>
      )}

      {/* ────────────────── 5. PLASTER ────────────────── */}
      {toolKey === "plaster" && (
        <group>
          {/* Masonry backing */}
          <mesh position={[0, h / 2, -d * 0.4]} receiveShadow>
            <boxGeometry args={[w, h, d * 0.8]} />
            <meshStandardMaterial map={brickTexture} roughness={0.9} />
          </mesh>

          {/* Plaster finish layer */}
          <mesh position={[0, h / 2, d * 0.1]} castShadow receiveShadow>
            <boxGeometry args={[w, h, d * 0.2]} />
            <meshStandardMaterial
              map={plasterTexture}
              roughness={0.95}
              color="#fafaf9"
              wireframe={wireframe}
            />
          </mesh>
        </group>
      )}

      {/* ────────────────── 6. PAINT ────────────────── */}
      {toolKey === "paint" && (
        <group>
          <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial
              map={paintTexture}
              roughness={0.4}
              metalness={0.02}
              wireframe={wireframe}
            />
          </mesh>

          <lineSegments position={[0, h / 2, 0]}>
            <edgesGeometry attach="geometry" args={[new THREE.BoxGeometry(w, h, d)]} />
            <lineBasicMaterial attach="material" color="#0ea5e9" linewidth={1} />
          </lineSegments>
        </group>
      )}

      {/* ────────────────── 7. CEMENT / SAND / AGGREGATE / MATERIAL ────────────────── */}
      {["cement", "sand", "aggregate", "materialEstimation"].includes(toolKey) && (
        <group>
          <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial
              map={
                toolKey === "sand"
                  ? sandTexture
                  : toolKey === "aggregate"
                  ? aggregateTexture
                  : concreteTexture
              }
              roughness={0.9}
              wireframe={wireframe}
            />
          </mesh>

          <lineSegments position={[0, h / 2, 0]}>
            <edgesGeometry attach="geometry" args={[new THREE.BoxGeometry(w, h, d)]} />
            <lineBasicMaterial attach="material" color="#f59e0b" linewidth={1} />
          </lineSegments>
        </group>
      )}

      {/* ────────────────── DIMENSION LINES & BADGES ────────────────── */}
      {showDimensions && (
        <group>
          {/* WIDTH / LENGTH (along X) */}
          <DimensionLine
            start={[-w / 2, 0.05, zOffset]}
            end={[w / 2, 0.05, zOffset]}
            label={toolKey === "flooring" ? "Room Length" : "Width"}
            valueText={`${widthDisplay} ${unit}`}
            color="#3b82f6"
            tickAxis="y"
          />

          {/* HEIGHT / BREADTH (along Y) */}
          {toolKey !== "flooring" ? (
            <DimensionLine
              start={[-xOffset, 0, 0]}
              end={[-xOffset, h, 0]}
              label="Height"
              valueText={`${heightDisplay} ${unit}`}
              color="#10b981"
              tickAxis="x"
            />
          ) : (
            <DimensionLine
              start={[-w / 2 - 0.2, 0.05, -d / 2]}
              end={[-w / 2 - 0.2, 0.05, d / 2]}
              label="Room Breadth"
              valueText={`${heightDisplay} ${unit}`}
              color="#10b981"
              tickAxis="y"
            />
          )}

          {/* DEPTH / THICKNESS (along Z) */}
          <DimensionLine
            start={[w / 2 + 0.15, yOffset, -d / 2]}
            end={[w / 2 + 0.15, yOffset, d / 2]}
            label={toolKey === "brick" ? "Thickness" : "Depth"}
            valueText={`${depthDisplay} ${unit}`}
            color="#f59e0b"
            tickAxis="x"
          />
        </group>
      )}

      {/* ────────────────── FLOATING CALCULATION RESULT BADGE ────────────────── */}
      {calculationResult && (
        <Html position={[0, h + 0.35, 0]} center distanceFactor={14}>
          <div className="pointer-events-none select-none rounded-full border border-primary-500/50 bg-slate-950/90 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xl backdrop-blur-md flex items-center gap-2 whitespace-nowrap">
            {toolKey === "brick" && (
              <>
                <span className="text-primary-400">🧱</span>
                <span>{calculationResult.numberOfBricks?.toLocaleString()} Bricks</span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-300 font-medium">{calculationResult.wallVolumeM3} m³</span>
              </>
            )}
            {toolKey === "concrete" && (
              <>
                <span className="text-primary-400">🏗️</span>
                <span>{calculationResult.wetVolumeM3} m³ Concrete</span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-300 font-medium">{calculationResult.cementBags} Bags</span>
              </>
            )}
            {toolKey === "steel" && (
              <>
                <span className="text-primary-400">⚙️</span>
                <span>{calculationResult.steelWeightKg?.toLocaleString()} kg Rebar</span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-300 font-medium">{calculationResult.steelWeightQuintal} Qtl</span>
              </>
            )}
            {toolKey === "flooring" && (
              <>
                <span className="text-primary-400">📐</span>
                <span>{calculationResult.tilesWithWastage?.toLocaleString()} Tiles</span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-300 font-medium">{calculationResult.roomAreaSqM} m²</span>
              </>
            )}
            {toolKey === "paint" && (
              <>
                <span className="text-primary-400">🎨</span>
                <span>{calculationResult.paintLitres} L Paint</span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-300 font-medium">{calculationResult.wallAreaSqM} m²</span>
              </>
            )}
            {!["brick", "concrete", "steel", "flooring", "paint"].includes(toolKey) && (
              <>
                <span className="text-primary-400">📊</span>
                <span>
                  {(calculationResult.wetVolumeM3 || calculationResult.dryVolumeM3 || calculationResult.sandVolumeM3 || calculationResult.aggregateVolumeM3)?.toLocaleString()} m³
                </span>
                {calculationResult.cementBags && (
                  <>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-300 font-medium">{calculationResult.cementBags} Bags</span>
                  </>
                )}
              </>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

/**
 * Robust ConstructionViewer Component with Canvas and OrbitControls.
 */
export default function ConstructionViewer({
  toolKey = "brick",
  dimensions = {},
  calculationResult = null,
}) {
  const [wireframe, setWireframe] = useState(false);
  const [showDimensions, setShowDimensions] = useState(true);
  const [showRebar, setShowRebar] = useState(toolKey === "steel");
  const [autoRotate, setAutoRotate] = useState(false);
  const [viewAngle, setViewAngle] = useState("iso");

  // Keep rebar state synced when tool changes to steel
  useEffect(() => {
    if (toolKey === "steel") setShowRebar(true);
  }, [toolKey]);

  const maxDim = Math.max(
    dimensions.widthMeters || 5,
    dimensions.heightMeters || 3,
    dimensions.depthMeters || 0.23
  );

  const targetY = (dimensions.heightMeters || 3) / 2;

  return (
    <div className="relative flex flex-col h-[520px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-900 to-slate-950 shadow-inner">
      {/* TOP OVERLAY: Dimension Summary HUD */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 pointer-events-none">
        <div className="flex items-center gap-2 rounded-xl bg-slate-900/85 px-3 py-1.5 border border-slate-700/70 text-xs shadow-lg backdrop-blur-md">
          <Box size={14} className="text-primary-400" />
          <span className="font-semibold text-white capitalize">{toolKey} Model</span>
          <span className="h-3 w-px bg-slate-700" />
          <span className="text-slate-300">
            {dimensions.widthDisplay} × {dimensions.heightDisplay}
            {dimensions.depthDisplay ? ` × ${dimensions.depthDisplay}` : ""}{" "}
            <span className="font-medium text-primary-300">{dimensions.unit}</span>
          </span>
        </div>

        {calculationResult && (
          <div className="hidden sm:flex items-center gap-2 rounded-xl bg-slate-900/90 px-3 py-1.5 border border-emerald-500/40 text-xs shadow-lg backdrop-blur-md text-emerald-300 font-semibold">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              {toolKey === "brick" && `${calculationResult.numberOfBricks?.toLocaleString()} Bricks · ${calculationResult.wallVolumeM3} m³`}
              {toolKey === "concrete" && `${calculationResult.wetVolumeM3} m³ Concrete · ${calculationResult.cementBags} Bags`}
              {toolKey === "steel" && `${calculationResult.steelWeightKg?.toLocaleString()} kg Rebar (${calculationResult.steelWeightQuintal} Qtl)`}
              {toolKey === "flooring" && `${calculationResult.tilesWithWastage?.toLocaleString()} Tiles · ${calculationResult.roomAreaSqM} m²`}
              {toolKey === "paint" && `${calculationResult.paintLitres} L Paint · ${calculationResult.wallAreaSqM} m²`}
              {!["brick", "concrete", "steel", "flooring", "paint"].includes(toolKey) &&
                `Volume: ${calculationResult.wetVolumeM3 || calculationResult.dryVolumeM3 || calculationResult.sandVolumeM3 || calculationResult.aggregateVolumeM3 || 0} m³`}
            </span>
          </div>
        )}
      </div>

      {/* TOP-RIGHT CONTROLS TOOLBAR */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 rounded-xl bg-slate-900/85 p-1.5 border border-slate-700/70 shadow-xl backdrop-blur-md">
        <button
          type="button"
          title="Toggle Dimensions"
          onClick={() => setShowDimensions(!showDimensions)}
          className={`rounded-lg p-2 text-xs font-medium transition-all ${
            showDimensions
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <Ruler size={16} />
        </button>

        <button
          type="button"
          title="Toggle Wireframe"
          onClick={() => setWireframe(!wireframe)}
          className={`rounded-lg p-2 text-xs font-medium transition-all ${
            wireframe
              ? "bg-amber-600 text-white shadow-sm"
              : "text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <Grid3X3 size={16} />
        </button>

        {(toolKey === "concrete" || toolKey === "steel") && (
          <button
            type="button"
            title="Inspect Rebar Reinforcement"
            onClick={() => setShowRebar(!showRebar)}
            className={`rounded-lg p-2 text-xs font-medium transition-all ${
              showRebar
                ? "bg-primary-600 text-white shadow-sm"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Layers size={16} />
          </button>
        )}

        <button
          type="button"
          title="Toggle Auto-Rotate"
          onClick={() => setAutoRotate(!autoRotate)}
          className={`rounded-lg p-2 text-xs font-medium transition-all ${
            autoRotate
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <RotateCcw size={16} />
        </button>

        <div className="h-4 w-px bg-slate-700 mx-0.5" />

        <button
          type="button"
          title="3D Isometric View"
          onClick={() => setViewAngle("iso")}
          className={`rounded-lg px-2 py-1 text-xs font-semibold transition-all ${
            viewAngle === "iso" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          3D
        </button>

        <button
          type="button"
          title="Front Elevation"
          onClick={() => setViewAngle("front")}
          className={`rounded-lg px-2 py-1 text-xs font-semibold transition-all ${
            viewAngle === "front" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          Front
        </button>

        <button
          type="button"
          title="Top Plan View"
          onClick={() => setViewAngle("top")}
          className={`rounded-lg px-2 py-1 text-xs font-semibold transition-all ${
            viewAngle === "top" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          Top
        </button>
      </div>

      {/* 3D WEBGL CANVAS VIEWPORT */}
      <div className="relative flex-1 w-full h-full cursor-grab active:cursor-grabbing">
        <Canvas
          shadows
          camera={{ position: [maxDim * 1.3, targetY + maxDim * 0.6, maxDim * 1.5], fov: 45 }}
          gl={{ antialias: true, alpha: false }}
        >
          {/* Lighting */}
          <ambientLight intensity={0.75} />
          <directionalLight
            position={[maxDim * 2, maxDim * 3, maxDim * 2]}
            intensity={1.4}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <pointLight position={[-maxDim * 2, maxDim * 1.5, -maxDim * 2]} intensity={0.5} />
          <hemisphereLight skyColor="#ffffff" groundColor="#334155" intensity={0.4} />

          {/* Ground Grid */}
          <Grid
            position={[0, -0.01, 0]}
            args={[Math.max(20, maxDim * 4), Math.max(20, maxDim * 4)]}
            cellSize={0.5}
            cellThickness={0.7}
            cellColor="#334155"
            sectionSize={2}
            sectionThickness={1.2}
            sectionColor="#64748b"
            fadeDistance={maxDim * 6}
          />

          {/* 3D Construction Element */}
          <ConstructionModel
            toolKey={toolKey}
            dimensions={dimensions}
            calculationResult={calculationResult}
            wireframe={wireframe}
            showDimensions={showDimensions}
            showRebar={showRebar}
            autoRotate={autoRotate}
          />

          {/* Interactive Controls & Camera Framing */}
          <CameraController maxDim={maxDim} targetY={targetY} viewAngle={viewAngle} />
        </Canvas>
      </div>

      {/* BOTTOM HINT FOOTER */}
      <div className="absolute bottom-3 left-4 right-4 z-10 flex items-center justify-between text-[11px] text-slate-400 pointer-events-none">
        <div className="flex items-center gap-3">
          <span>🖱️ Left Click: Rotate</span>
          <span className="hidden sm:inline">· ✋ Right Click: Pan</span>
          <span>· 🔍 Scroll: Zoom</span>
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <Compass size={13} className="text-primary-400" />
          <span>Interactive 3D Canvas</span>
        </div>
      </div>
    </div>
  );
}
