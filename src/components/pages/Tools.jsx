import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  Loader2,
  Play,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { calculatorsApi, apiError } from "../../api";
import ConstructionViewer from "../common/ConstructionViewer";

// ─── TOOLS CONFIGURATION WITH SPECIFICATION SCHEMAS ──────────────────
const TOOLS = [
  {
    key: "brick",
    name: "Brick Wall",
    badge: "Masonry",
    icon: "🧱",
    description: "Calculate brick count, mortar volume, cement bags, and sand for any wall.",
    fields: [
      { key: "wallLength", label: "Wall Width / Length", type: "dimension", placeholder: "500" },
      { key: "wallHeight", label: "Wall Height", type: "dimension", placeholder: "500" },
      { key: "wallThickness", label: "Wall Thickness / Depth", type: "dimension", placeholder: "23" },
      {
        key: "mortarRatio",
        label: "Mortar Mix Ratio",
        type: "select",
        options: ["1:4", "1:5", "1:6", "1:3"],
        placeholder: "1:6",
      },
      { key: "wastagePercent", label: "Wastage Allowance (%)", type: "number", placeholder: "5" },
    ],
    defaults: {
      cm: { wallLength: "500", wallHeight: "500", wallThickness: "23", mortarRatio: "1:6", wastagePercent: "5" },
      m: { wallLength: "5", wallHeight: "5", wallThickness: "0.23", mortarRatio: "1:6", wastagePercent: "5" },
    },
    presets: [
      { name: "Room Wall (500×500 cm)", cm: { wallLength: "500", wallHeight: "500", wallThickness: "23" } },
      { name: "Partition Wall (300×280 cm)", cm: { wallLength: "300", wallHeight: "280", wallThickness: "11.5" } },
      { name: "Boundary Wall (1000×200 cm)", cm: { wallLength: "1000", wallHeight: "200", wallThickness: "23" } },
    ],
  },
  {
    key: "concrete",
    name: "Concrete Member",
    badge: "Structure",
    icon: "🏗️",
    description: "Estimate wet/dry volume, cement bags, sand, aggregate, and rebar.",
    fields: [
      { key: "length", label: "Length", type: "dimension", placeholder: "600" },
      { key: "breadth", label: "Breadth / Width", type: "dimension", placeholder: "400" },
      { key: "height", label: "Height / Depth", type: "dimension", placeholder: "15" },
      {
        key: "grade",
        label: "Concrete Grade",
        type: "select",
        options: ["M15", "M20", "M25", "M10", "M7.5", "M5"],
        placeholder: "M15",
      },
      { key: "wastagePercent", label: "Wastage (%)", type: "number", placeholder: "0" },
      { key: "quantity", label: "Quantity (Count)", type: "number", placeholder: "1" },
    ],
    defaults: {
      cm: { length: "600", breadth: "400", height: "15", grade: "M15", wastagePercent: "0", quantity: "1" },
      m: { length: "6", breadth: "4", height: "0.15", grade: "M15", wastagePercent: "0", quantity: "1" },
    },
    presets: [
      { name: "Floor Slab (600×400×15 cm)", cm: { length: "600", breadth: "400", height: "15" } },
      { name: "RC Beam (450×30×45 cm)", cm: { length: "450", breadth: "30", height: "45" } },
      { name: "Column Footing (200×200×50 cm)", cm: { length: "200", breadth: "200", height: "50" } },
    ],
  },
  {
    key: "steel",
    name: "Steel Reinforcement",
    badge: "Rebar",
    icon: "⚙️",
    description: "Calculate rebar tonnage, density, and volume for slabs, beams, or columns.",
    fields: [
      { key: "length", label: "Length", type: "dimension", placeholder: "500" },
      { key: "breadth", label: "Breadth / Width", type: "dimension", placeholder: "400" },
      { key: "depth", label: "Depth / Thickness", type: "dimension", placeholder: "15" },
      { key: "steelPercentage", label: "Steel Volume (%)", type: "number", placeholder: "1" },
    ],
    defaults: {
      cm: { length: "500", breadth: "400", depth: "15", steelPercentage: "1" },
      m: { length: "5", breadth: "4", depth: "0.15", steelPercentage: "1" },
    },
    presets: [
      { name: "RC Slab (500×400×15 cm, 1%)", cm: { length: "500", breadth: "400", depth: "15", steelPercentage: "1" } },
      { name: "RC Beam (400×30×50 cm, 1.5%)", cm: { length: "400", breadth: "30", depth: "50", steelPercentage: "1.5" } },
      { name: "RC Column (30×30×300 cm, 2%)", cm: { length: "30", breadth: "30", depth: "300", steelPercentage: "2" } },
    ],
  },
  {
    key: "flooring",
    name: "Flooring & Tiles",
    badge: "Finishes",
    icon: "📐",
    description: "Determine tile count, adhesive requirement, and cut wastage for room floors.",
    fields: [
      { key: "roomLength", label: "Room Length", type: "dimension", placeholder: "600" },
      { key: "roomBreadth", label: "Room Breadth", type: "dimension", placeholder: "400" },
      { key: "tileLength", label: "Tile Length", type: "dimension", placeholder: "60" },
      { key: "tileBreadth", label: "Tile Breadth", type: "dimension", placeholder: "60" },
      { key: "wastagePercent", label: "Tile Cut Wastage (%)", type: "number", placeholder: "5" },
    ],
    defaults: {
      cm: { roomLength: "600", roomBreadth: "400", tileLength: "60", tileBreadth: "60", wastagePercent: "5" },
      m: { roomLength: "6", roomBreadth: "4", tileLength: "0.6", tileBreadth: "0.6", wastagePercent: "5" },
    },
    presets: [
      { name: "Hall (600×400 cm | 60×60 cm tile)", cm: { roomLength: "600", roomBreadth: "400", tileLength: "60", tileBreadth: "60" } },
      { name: "Bedroom (400×350 cm | 60×60 cm tile)", cm: { roomLength: "400", roomBreadth: "350", tileLength: "60", tileBreadth: "60" } },
      { name: "Kitchen (300×250 cm | 30×30 cm tile)", cm: { roomLength: "300", roomBreadth: "250", tileLength: "30", tileBreadth: "30" } },
    ],
  },
  {
    key: "plaster",
    name: "Plaster Render",
    badge: "Surfaces",
    icon: "🧰",
    description: "Compute mortar, cement bags, and sand for wall render coats.",
    fields: [
      { key: "length", label: "Wall Length", type: "dimension", placeholder: "500" },
      { key: "height", label: "Wall Height", type: "dimension", placeholder: "500" },
      { key: "thickness", label: "Plaster Thickness", type: "dimension", placeholder: "1.2" },
      {
        key: "mixRatio",
        label: "Plaster Mix Ratio",
        type: "select",
        options: ["1:4", "1:3", "1:6"],
        placeholder: "1:4",
      },
      { key: "wastagePercent", label: "Wastage (%)", type: "number", placeholder: "5" },
    ],
    defaults: {
      cm: { length: "500", height: "500", thickness: "1.2", mixRatio: "1:4", wastagePercent: "5" },
      m: { length: "5", height: "5", thickness: "0.012", mixRatio: "1:4", wastagePercent: "5" },
    },
    presets: [
      { name: "Room Wall (500×500 cm | 12mm)", cm: { length: "500", height: "500", thickness: "1.2" } },
      { name: "Ceiling Plaster (600×400 cm | 8mm)", cm: { length: "600", height: "400", thickness: "0.8" } },
    ],
  },
  {
    key: "paint",
    name: "Wall Paint",
    badge: "Finishes",
    icon: "🎨",
    description: "Calculate paint liters and gallons based on wall surface area and coat count.",
    fields: [
      { key: "length", label: "Wall Length", type: "dimension", placeholder: "500" },
      { key: "height", label: "Wall Height", type: "dimension", placeholder: "500" },
      { key: "coats", label: "Number of Coats", type: "number", placeholder: "2" },
      { key: "coveragePerLitre", label: "Coverage (sq. m / Litre)", type: "number", placeholder: "12" },
    ],
    defaults: {
      cm: { length: "500", height: "500", coats: "2", coveragePerLitre: "12" },
      m: { length: "5", height: "5", coats: "2", coveragePerLitre: "12" },
    },
    presets: [
      { name: "Standard Wall (500×500 cm, 2 coats)", cm: { length: "500", height: "500", coats: "2" } },
      { name: "Full Room Perimeter (1800×300 cm)", cm: { length: "1800", height: "300", coats: "2" } },
    ],
  },
  {
    key: "cement",
    name: "Cement Mortar",
    badge: "Material",
    icon: "🧪",
    description: "Calculate dry volume, bags, and weight of cement for mortar screeds.",
    fields: [
      { key: "length", label: "Length", type: "dimension", placeholder: "500" },
      { key: "breadth", label: "Breadth / Width", type: "dimension", placeholder: "500" },
      { key: "thickness", label: "Thickness", type: "dimension", placeholder: "5" },
      {
        key: "mixRatio",
        label: "Mix Ratio",
        type: "select",
        options: ["1:4", "1:3", "1:5", "1:6"],
        placeholder: "1:4",
      },
      { key: "wastagePercent", label: "Wastage (%)", type: "number", placeholder: "0" },
    ],
    defaults: {
      cm: { length: "500", breadth: "500", thickness: "5", mixRatio: "1:4", wastagePercent: "0" },
      m: { length: "5", breadth: "5", thickness: "0.05", mixRatio: "1:4", wastagePercent: "0" },
    },
    presets: [
      { name: "Floor Screed (500×500×5 cm)", cm: { length: "500", breadth: "500", thickness: "5" } },
    ],
  },
  {
    key: "sand",
    name: "Sand / Fine Aggregate",
    badge: "Material",
    icon: "🏖️",
    description: "Volume and CFT weight calculation of construction sand.",
    fields: [
      { key: "length", label: "Length", type: "dimension", placeholder: "500" },
      { key: "breadth", label: "Breadth / Width", type: "dimension", placeholder: "500" },
      { key: "thickness", label: "Thickness", type: "dimension", placeholder: "5" },
      {
        key: "mixRatio",
        label: "Mix Ratio",
        type: "select",
        options: ["1:4", "1:3", "1:5", "1:6"],
        placeholder: "1:4",
      },
      { key: "wastagePercent", label: "Wastage (%)", type: "number", placeholder: "0" },
    ],
    defaults: {
      cm: { length: "500", breadth: "500", thickness: "5", mixRatio: "1:4", wastagePercent: "0" },
      m: { length: "5", breadth: "5", thickness: "0.05", mixRatio: "1:4", wastagePercent: "0" },
    },
    presets: [
      { name: "Bed Layer (500×500×5 cm)", cm: { length: "500", breadth: "500", thickness: "5" } },
    ],
  },
  {
    key: "aggregate",
    name: "Coarse Aggregate",
    badge: "Material",
    icon: "🪨",
    description: "Gravel volume, weight (kg), and CFT requirement for concrete batches.",
    fields: [
      { key: "length", label: "Length", type: "dimension", placeholder: "600" },
      { key: "breadth", label: "Breadth / Width", type: "dimension", placeholder: "400" },
      { key: "height", label: "Height", type: "dimension", placeholder: "15" },
      {
        key: "grade",
        label: "Grade",
        type: "select",
        options: ["M15", "M20", "M25", "M10"],
        placeholder: "M15",
      },
      { key: "wastagePercent", label: "Wastage (%)", type: "number", placeholder: "0" },
    ],
    defaults: {
      cm: { length: "600", breadth: "400", height: "15", grade: "M15", wastagePercent: "0" },
      m: { length: "6", breadth: "4", height: "0.15", grade: "M15", wastagePercent: "0" },
    },
    presets: [
      { name: "Slab (600×400×15 cm)", cm: { length: "600", breadth: "400", height: "15" } },
    ],
  },
  {
    key: "materialEstimation",
    name: "General Estimation",
    badge: "Multi-Purpose",
    icon: "📊",
    description: "Quick cross-material estimation for concrete, plaster, or mortar slabs.",
    fields: [
      { key: "length", label: "Length", type: "dimension", placeholder: "500" },
      { key: "breadth", label: "Breadth / Width", type: "dimension", placeholder: "500" },
      { key: "thickness", label: "Thickness", type: "dimension", placeholder: "15" },
      {
        key: "materialType",
        label: "Material Type",
        type: "select",
        options: ["concrete", "plaster", "mortar"],
        placeholder: "concrete",
      },
    ],
    defaults: {
      cm: { length: "500", breadth: "500", thickness: "15", materialType: "concrete" },
      m: { length: "5", breadth: "5", thickness: "0.15", materialType: "concrete" },
    },
    presets: [
      { name: "Concrete Slab (500×500×15 cm)", cm: { length: "500", breadth: "500", thickness: "15", materialType: "concrete" } },
      { name: "Plaster Wall (500×500×1.5 cm)", cm: { length: "500", breadth: "500", thickness: "1.5", materialType: "plaster" } },
    ],
  },
];

export default function Tools() {
  const [activeTool, setActiveTool] = useState(TOOLS[0]);
  const [unit, setUnit] = useState("cm"); // "cm" or "m"
  const [inputs, setInputs] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  // Tabs scroll navigation state
  const tabsRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Check scroll boundary to update arrow button disabled states
  const checkScroll = useCallback(() => {
    if (tabsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
      setCanScrollLeft(scrollLeft > 2);
      // Content has scrollable overflow and hasn't reached the end
      const hasOverflow = scrollWidth > clientWidth + 2;
      const atEnd = scrollLeft + clientWidth >= scrollWidth - 4;
      setCanScrollRight(hasOverflow && !atEnd);
    }
  }, []);

  // Slide tabs left or right smoothly
  const handleSlide = (direction) => {
    if (!tabsRef.current) return;
    const container = tabsRef.current;
    // Scroll by 280px or 75% of visible track width
    const scrollAmount = Math.max(260, Math.floor(container.clientWidth * 0.75));
    const targetLeft =
      direction === "left"
        ? Math.max(0, container.scrollLeft - scrollAmount)
        : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: targetLeft,
      behavior: "smooth",
    });

    // Check boundary states after animation
    setTimeout(checkScroll, 100);
    setTimeout(checkScroll, 350);
    setTimeout(checkScroll, 500);
  };

  // Setup scroll and resize observers
  useEffect(() => {
    const el = tabsRef.current;
    if (!el) return;

    checkScroll();
    const t1 = setTimeout(checkScroll, 100);
    const t2 = setTimeout(checkScroll, 400);

    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);

    let ro;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => {
        checkScroll();
      });
      ro.observe(el);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
      if (ro) ro.disconnect();
    };
  }, [checkScroll]);

  // Center active tool tab smoothly when changed
  useEffect(() => {
    if (tabsRef.current) {
      const activeEl = tabsRef.current.querySelector(`[data-tool-key="${activeTool.key}"]`);
      if (activeEl) {
        const container = tabsRef.current;
        const activeRect = activeEl.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        if (activeRect.left < containerRect.left + 10 || activeRect.right > containerRect.right - 10) {
          const delta =
            activeRect.left - containerRect.left - containerRect.width / 2 + activeRect.width / 2;
          container.scrollTo({
            left: container.scrollLeft + delta,
            behavior: "smooth",
          });
        }
      }
      setTimeout(checkScroll, 350);
    }
  }, [activeTool.key, checkScroll]);

  // Initialize defaults whenever active tool or unit changes
  useEffect(() => {
    const defs = activeTool.defaults[unit] || {};
    const newInputs = { ...inputs };
    for (const [k, v] of Object.entries(defs)) {
      if (!newInputs[`${activeTool.key}.${k}`]) {
        newInputs[`${activeTool.key}.${k}`] = v;
      }
    }
    setInputs(newInputs);
    setValidationErrors({});
  }, [activeTool.key, unit]);

  // Mutation to execute calculation via backend API
  const mutation = useMutation({
    mutationFn: (params) => {
      const apiFn = calculatorsApi[activeTool.key];
      if (!apiFn) throw new Error(`Endpoint not found for ${activeTool.key}`);
      return apiFn(params);
    },
    onSuccess: (data) => {
      setResult(data?.data ?? data);
    },
    onError: (e) => {
      setResult(null);
    },
  });

  // Convert inputs to backend format & validate
  const validateAndPrepareParams = () => {
    const errors = {};
    const params = {};
    const currentDefs = activeTool.defaults[unit] || {};

    for (const f of activeTool.fields) {
      const rawVal = inputs[`${activeTool.key}.${f.key}`] ?? currentDefs[f.key] ?? "";
      const trimmed = String(rawVal).trim();

      if (trimmed === "") {
        errors[f.key] = "Required";
        continue;
      }

      if (f.type === "dimension" || f.type === "number") {
        const num = parseFloat(trimmed);
        if (isNaN(num)) {
          errors[f.key] = "Must be a number";
          continue;
        }
        if (num <= 0 && f.key !== "wastagePercent") {
          errors[f.key] = "Must be > 0";
          continue;
        }
        if (f.key === "wastagePercent" && (num < 0 || num > 20)) {
          errors[f.key] = "0 - 20%";
          continue;
        }

        // Unit conversion for dimensions when unit is cm:
        // Backend expects meters for all linear dimensions
        if (f.type === "dimension") {
          params[f.key] = unit === "cm" ? num / 100 : num;
        } else {
          params[f.key] = num;
        }
      } else {
        // String / select fields
        params[f.key] = trimmed;
      }
    }

    // Special parameter mapping for tools that accept area on backend:
    // Plaster, Paint, Cement, Sand, MaterialEstimation
    if (["plaster", "cement", "sand", "materialEstimation"].includes(activeTool.key)) {
      const l = params.length || params.wallLength || 5;
      const b = params.breadth || params.height || 5;
      params.area = parseFloat((l * b).toFixed(4));
      delete params.length;
      delete params.breadth;
      delete params.height;
    } else if (activeTool.key === "paint") {
      const l = params.length || 5;
      const h = params.height || 5;
      params.wallArea = parseFloat((l * h).toFixed(4));
      delete params.length;
      delete params.height;
    }

    setValidationErrors(errors);
    return { isValid: Object.keys(errors).length === 0, params };
  };

  const handleCalculate = () => {
    const { isValid, params } = validateAndPrepareParams();
    if (isValid) {
      mutation.mutate(params);
    }
  };

  // Debounced auto-recalculate whenever inputs, tool, or unit changes
  useEffect(() => {
    const timer = setTimeout(() => {
      const { isValid, params } = validateAndPrepareParams();
      if (isValid) {
        mutation.mutate(params);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [inputs, activeTool.key, unit]);

  // Apply a quick preset
  const applyPreset = (preset) => {
    const newInputs = { ...inputs };
    const values = preset[unit] || preset.cm;
    for (const [k, v] of Object.entries(values)) {
      newInputs[`${activeTool.key}.${k}`] = v;
    }
    setInputs(newInputs);
    setValidationErrors({});

    // Auto-calculate on preset select
    setTimeout(() => {
      const { isValid, params } = validateAndPrepareParams();
      if (isValid) mutation.mutate(params);
    }, 50);
  };

  // Switch dimension unit (cm <-> m) and smoothly convert values
  const handleUnitToggle = (newUnit) => {
    if (newUnit === unit) return;
    const factor = newUnit === "m" ? 0.01 : 100;
    const newInputs = { ...inputs };

    for (const f of activeTool.fields) {
      if (f.type === "dimension") {
        const currentVal = parseFloat(inputs[`${activeTool.key}.${f.key}`]);
        if (!isNaN(currentVal)) {
          const converted = currentVal * factor;
          newInputs[`${activeTool.key}.${f.key}`] = String(
            Number(converted.toFixed(3))
          );
        }
      }
    }

    setUnit(newUnit);
    setInputs(newInputs);
    setValidationErrors({});
  };

  // Extract dimensions for the 3D Canvas
  const canvasDimensions = useMemo(() => {
    const getVal = (key, fallback) => {
      const v = parseFloat(inputs[`${activeTool.key}.${key}`] ?? activeTool.defaults[unit]?.[key] ?? fallback);
      return isNaN(v) ? fallback : v;
    };

    let w = 500;
    let h = 500;
    let d = 23;
    let tileW = 60;
    let tileB = 60;

    const isM = unit === "m";
    if (activeTool.key === "brick") {
      w = getVal("wallLength", isM ? 5 : 500);
      h = getVal("wallHeight", isM ? 5 : 500);
      d = getVal("wallThickness", isM ? 0.23 : 23);
    } else if (activeTool.key === "concrete") {
      w = getVal("length", isM ? 6 : 600);
      h = getVal("breadth", isM ? 4 : 400);
      d = getVal("height", isM ? 0.15 : 15);
    } else if (activeTool.key === "steel") {
      w = getVal("length", isM ? 5 : 500);
      h = getVal("breadth", isM ? 4 : 400);
      d = getVal("depth", isM ? 0.15 : 15);
    } else if (activeTool.key === "flooring") {
      w = getVal("roomLength", isM ? 6 : 600);
      h = getVal("roomBreadth", isM ? 4 : 400);
      d = isM ? 0.05 : 5;
      tileW = getVal("tileLength", isM ? 0.6 : 60);
      tileB = getVal("tileBreadth", isM ? 0.6 : 60);
    } else if (activeTool.key === "plaster") {
      w = getVal("length", isM ? 5 : 500);
      h = getVal("height", isM ? 5 : 500);
      d = getVal("thickness", isM ? 0.012 : 1.2);
    } else if (activeTool.key === "paint") {
      w = getVal("length", isM ? 5 : 500);
      h = getVal("height", isM ? 5 : 500);
      d = isM ? 0.2 : 20;
    } else {
      w = getVal("length", isM ? 5 : 500);
      h = getVal("breadth", isM ? 5 : 500);
      d = getVal("thickness", isM ? 0.15 : 15);
    }

    const toMeters = (val) => (unit === "cm" ? val / 100 : val);

    return {
      widthMeters: toMeters(w),
      heightMeters: toMeters(h),
      depthMeters: toMeters(d),
      tileLengthMeters: toMeters(tileW),
      tileBreadthMeters: toMeters(tileB),
      widthDisplay: String(w),
      heightDisplay: String(h),
      depthDisplay: String(d),
      unit,
    };
  }, [inputs, activeTool.key, unit]);

  const copySummary = () => {
    if (!result) return;
    const lines = [`${activeTool.name} Calculation Summary:`, `-------------------------------`];
    for (const [k, v] of Object.entries(result)) {
      if (typeof v !== "object") lines.push(`${k}: ${v}`);
    }
    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* ─── PAGE HEADER ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Construction Calculators
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Real-time quantity takeoff, mathematical analysis, and interactive 3D Canvas BIM visualization.
          </p>
        </div>

        {/* Global Dimension Unit Switcher */}
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
          <span className="px-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Input Unit
          </span>
          <button
            type="button"
            onClick={() => handleUnitToggle("cm")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              unit === "cm"
                ? "bg-primary-500 text-white shadow-md shadow-primary-500/20"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Centimeters (cm)
          </button>
          <button
            type="button"
            onClick={() => handleUnitToggle("m")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              unit === "m"
                ? "bg-primary-500 text-white shadow-md shadow-primary-500/20"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Meters (m)
          </button>
        </div>
      </div>

      {/* ─── TOOL SELECTOR TABS WITH SLIDE NAVIGATION ───────────── */}
      <div className="relative flex items-center gap-2">
        {/* Left Arrow Button */}
        <button
          type="button"
          onClick={() => handleSlide("left")}
          disabled={!canScrollLeft}
          title="Slide to previous tools"
          aria-label="Previous tools"
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all ${
            canScrollLeft
              ? "border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:scale-95 cursor-pointer"
              : "border-slate-100 bg-slate-50/50 text-slate-300 cursor-not-allowed opacity-40"
          }`}
        >
          <ChevronLeft size={18} />
        </button>

        {/* Scrollable Tabs Track */}
        <div
          ref={tabsRef}
          onScroll={checkScroll}
          className="flex flex-1 min-w-0 items-center gap-2 overflow-x-auto py-1 scrollbar-none"
        >
          {TOOLS.map((tool) => {
            const isSelected = activeTool.key === tool.key;
            return (
              <button
                key={tool.key}
                data-tool-key={tool.key}
                onClick={() => {
                  setActiveTool(tool);
                  setResult(null);
                }}
                className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                  isSelected
                    ? "bg-slate-900 text-white shadow-md shadow-slate-900/10 scale-[1.02]"
                    : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span className="text-base">{tool.icon}</span>
                <span>{tool.name}</span>
              </button>
            );
          })}
        </div>

        {/* Right Arrow Button */}
        <button
          type="button"
          onClick={() => handleSlide("right")}
          disabled={!canScrollRight}
          title="Slide to next tools"
          aria-label="Next tools"
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all ${
            canScrollRight
              ? "border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:scale-95 cursor-pointer"
              : "border-slate-100 bg-slate-50/50 text-slate-300 cursor-not-allowed opacity-40"
          }`}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* ─── MAIN TWO-COLUMN WORKSPACE ──────────────────────────── */}
      <div className="grid gap-6 xl:grid-cols-12">
        {/* ─── LEFT: INPUT CONTROLS & SPECIFICATION (5 Cols) ──── */}
        <div className="space-y-5 xl:col-span-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            {/* Tool Title & Badge */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{activeTool.icon}</span>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{activeTool.name}</h2>
                  <p className="text-xs text-slate-500">{activeTool.description}</p>
                </div>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {activeTool.badge}
              </span>
            </div>

            {/* Quick Presets */}
            {activeTool.presets && activeTool.presets.length > 0 && (
              <div className="mt-4">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Quick Dimension Presets
                </label>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {activeTool.presets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors hover:border-primary-400 hover:bg-primary-50 hover:text-primary-800"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Form Fields */}
            <div className="mt-5 space-y-4">
              {activeTool.fields.map((field) => {
                const val = inputs[`${activeTool.key}.${field.key}`] ?? activeTool.defaults[unit]?.[field.key] ?? "";
                const err = validationErrors[field.key];
                const isDimension = field.type === "dimension";

                return (
                  <div key={field.key} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                        {field.label}
                      </label>
                      {isDimension && (
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                          {unit}
                        </span>
                      )}
                    </div>

                    {field.type === "select" ? (
                      <select
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        value={val}
                        onChange={(e) => {
                          setInputs({ ...inputs, [`${activeTool.key}.${field.key}`]: e.target.value });
                        }}
                      >
                        {field.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="relative">
                        <input
                          type={field.type === "number" || field.type === "dimension" ? "number" : "text"}
                          step="any"
                          className={`w-full rounded-xl border px-3.5 py-2.5 text-sm font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 ${
                            err
                              ? "border-red-400 bg-red-50/50 text-red-900 focus:border-red-500 focus:ring-red-200"
                              : "border-slate-200 bg-white text-slate-900 focus:border-primary-500 focus:ring-primary-500/20"
                          }`}
                          placeholder={activeTool.defaults[unit]?.[field.key] ?? field.placeholder}
                          value={val}
                          onChange={(e) => {
                            setInputs({ ...inputs, [`${activeTool.key}.${field.key}`]: e.target.value });
                            if (err) {
                              setValidationErrors({ ...validationErrors, [field.key]: null });
                            }
                          }}
                        />
                        {isDimension && (
                          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                            {unit}
                          </span>
                        )}
                      </div>
                    )}

                    {err && (
                      <p className="flex items-center gap-1 text-[11px] font-medium text-red-600">
                        <AlertCircle size={12} /> {err}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Calculate Button */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
              <button
                type="button"
                onClick={handleCalculate}
                disabled={mutation.isPending}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary-500/25 transition-all hover:bg-primary-600 active:scale-[0.99] disabled:opacity-50"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Analyzing & Computing...</span>
                  </>
                ) : (
                  <>
                    <Play size={18} fill="currentColor" />
                    <span>Calculate & Generate 3D</span>
                  </>
                )}
              </button>

              <button
                type="button"
                title="Reset to Defaults"
                onClick={() => {
                  const defs = activeTool.defaults[unit];
                  const reset = { ...inputs };
                  for (const [k, v] of Object.entries(defs)) {
                    reset[`${activeTool.key}.${k}`] = v;
                  }
                  setInputs(reset);
                  setValidationErrors({});
                  handleCalculate();
                }}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <RotateCcw size={18} />
              </button>
            </div>

            {mutation.isError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700 flex items-center gap-2">
                <AlertCircle size={16} className="text-red-600 shrink-0" />
                <span>{apiError(mutation.error)}</span>
              </div>
            )}
          </div>
        </div>

        {/* ─── RIGHT: 3D CANVAS & CONSTRUCTION ANALYSIS (7 Cols) ──── */}
        <div className="space-y-6 xl:col-span-7">
          {/* 1. INTERACTIVE 3D CANVAS VIEWPORT */}
          <ConstructionViewer
            toolKey={activeTool.key}
            dimensions={canvasDimensions}
            calculationResult={result}
          />

          {/* 2. ENGINEERING CALCULATION BREAKDOWN */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 font-bold">
                  ✓
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Construction Takeoff Analysis
                  </h3>
                  <p className="text-xs text-slate-500">
                    Verified calculations linked with live 3D geometric dimensions
                  </p>
                </div>
              </div>

              {result && (
                <button
                  type="button"
                  onClick={copySummary}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  <span>{copied ? "Copied!" : "Copy Summary"}</span>
                </button>
              )}
            </div>

            {result ? (
              <div className="mt-5 space-y-6">
                {/* PRIMARY METRIC CARDS */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {/* Brick Wall Results */}
                  {activeTool.key === "brick" && (
                    <>
                      <div className="rounded-xl border border-primary-200 bg-primary-50/60 p-4 shadow-sm">
                        <span className="text-xs font-semibold uppercase tracking-wider text-primary-800">
                          Total Bricks Required
                        </span>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-2xl font-black text-slate-900">
                            {result.numberOfBricks?.toLocaleString()}
                          </span>
                          <span className="text-xs font-bold text-primary-700">bricks</span>
                        </div>
                        <span className="mt-1 inline-block text-[11px] text-slate-600">
                          Net: {result.bricksWithoutWastage?.toLocaleString()} (+{result.wastagePercent}% wastage)
                        </span>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                          Wall Gross Volume
                        </span>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-2xl font-black text-slate-900">
                            {result.wallVolumeM3}
                          </span>
                          <span className="text-xs font-bold text-slate-600">m³</span>
                        </div>
                        <span className="mt-1 inline-block text-[11px] text-slate-500">
                          ~{(result.wallVolumeM3 * 35.3147).toFixed(1)} CFT
                        </span>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                          Cement Bags (Mortar)
                        </span>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-2xl font-black text-slate-900">
                            {result.cementBags}
                          </span>
                          <span className="text-xs font-bold text-slate-600">bags</span>
                        </div>
                        <span className="mt-1 inline-block text-[11px] text-slate-500">
                          ~{(result.cementBags * 50).toFixed(0)} kg ({result.mortarRatio} ratio)
                        </span>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                          Sand Volume
                        </span>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-2xl font-black text-slate-900">
                            {result.sandVolumeM3}
                          </span>
                          <span className="text-xs font-bold text-slate-600">m³</span>
                        </div>
                        <span className="mt-1 inline-block text-[11px] text-slate-500">
                          ~{(result.sandVolumeM3 * 35.3147).toFixed(1)} CFT
                        </span>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                          Wet Mortar Volume
                        </span>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-2xl font-black text-slate-900">
                            {result.mortarVolumeM3}
                          </span>
                          <span className="text-xs font-bold text-slate-600">m³</span>
                        </div>
                        <span className="mt-1 inline-block text-[11px] text-slate-500">
                          Dry: {result.mortarDryM3} m³
                        </span>
                      </div>
                    </>
                  )}

                  {/* Concrete Results */}
                  {activeTool.key === "concrete" && (
                    <>
                      <div className="rounded-xl border border-primary-200 bg-primary-50/60 p-4 shadow-sm">
                        <span className="text-xs font-semibold uppercase tracking-wider text-primary-800">
                          Concrete Volume
                        </span>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-2xl font-black text-slate-900">
                            {result.wetVolumeM3}
                          </span>
                          <span className="text-xs font-bold text-primary-700">m³ wet</span>
                        </div>
                        <span className="mt-1 inline-block text-[11px] text-slate-600">
                          Dry Volume: {result.dryVolumeM3} m³
                        </span>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                          Cement Bags
                        </span>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-2xl font-black text-slate-900">
                            {result.cementBags}
                          </span>
                          <span className="text-xs font-bold text-slate-600">bags</span>
                        </div>
                        <span className="mt-1 inline-block text-[11px] text-slate-500">
                          Grade {result.grade || result.mixRatio}
                        </span>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                          Steel Reinforcement
                        </span>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-2xl font-black text-slate-900">
                            {result.steelKg}
                          </span>
                          <span className="text-xs font-bold text-slate-600">kg</span>
                        </div>
                        <span className="mt-1 inline-block text-[11px] text-slate-500">
                          ~{(result.steelKg / 100).toFixed(2)} Quintal
                        </span>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                          Sand Quantity
                        </span>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-2xl font-black text-slate-900">
                            {result.sandKg?.toLocaleString()}
                          </span>
                          <span className="text-xs font-bold text-slate-600">kg</span>
                        </div>
                        <span className="mt-1 inline-block text-[11px] text-slate-500">
                          {result.sandCft} CFT ({result.sandM3} m³)
                        </span>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                          Coarse Aggregate
                        </span>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-2xl font-black text-slate-900">
                            {result.aggregateKg?.toLocaleString()}
                          </span>
                          <span className="text-xs font-bold text-slate-600">kg</span>
                        </div>
                        <span className="mt-1 inline-block text-[11px] text-slate-500">
                          {result.aggregateCft} CFT ({result.aggregateM3} m³)
                        </span>
                      </div>
                    </>
                  )}

                  {/* Steel Results */}
                  {activeTool.key === "steel" && (
                    <>
                      <div className="rounded-xl border border-primary-200 bg-primary-50/60 p-4 shadow-sm">
                        <span className="text-xs font-semibold uppercase tracking-wider text-primary-800">
                          Steel Rebar Weight
                        </span>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-2xl font-black text-slate-900">
                            {result.steelWeightKg?.toLocaleString()}
                          </span>
                          <span className="text-xs font-bold text-primary-700">kg</span>
                        </div>
                        <span className="mt-1 inline-block text-[11px] text-slate-600">
                          {result.steelWeightQuintal} Quintals
                        </span>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                          Concrete Volume
                        </span>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-2xl font-black text-slate-900">
                            {result.concreteVolumeM3}
                          </span>
                          <span className="text-xs font-bold text-slate-600">m³</span>
                        </div>
                        <span className="mt-1 inline-block text-[11px] text-slate-500">
                          Steel @ {result.steelPercentage}% volume
                        </span>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                          Steel Volume
                        </span>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-2xl font-black text-slate-900">
                            {result.steelVolumeM3}
                          </span>
                          <span className="text-xs font-bold text-slate-600">m³</span>
                        </div>
                        <span className="mt-1 inline-block text-[11px] text-slate-500">
                          Density: 7,850 kg/m³
                        </span>
                      </div>
                    </>
                  )}

                  {/* Flooring Results */}
                  {activeTool.key === "flooring" && (
                    <>
                      <div className="rounded-xl border border-primary-200 bg-primary-50/60 p-4 shadow-sm">
                        <span className="text-xs font-semibold uppercase tracking-wider text-primary-800">
                          Total Tiles (with Cut Wastage)
                        </span>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-2xl font-black text-slate-900">
                            {result.tilesWithWastage?.toLocaleString()}
                          </span>
                          <span className="text-xs font-bold text-primary-700">tiles</span>
                        </div>
                        <span className="mt-1 inline-block text-[11px] text-slate-600">
                          Net: {result.tilesRequired} tiles (+{result.wastagePercent}%)
                        </span>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                          Room Floor Area
                        </span>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-2xl font-black text-slate-900">
                            {result.roomAreaSqM}
                          </span>
                          <span className="text-xs font-bold text-slate-600">sq. m</span>
                        </div>
                        <span className="mt-1 inline-block text-[11px] text-slate-500">
                          ~{(result.roomAreaSqM * 10.764).toFixed(1)} sq. ft
                        </span>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                          Tile Adhesive Required
                        </span>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-2xl font-black text-slate-900">
                            {result.adhesiveKg}
                          </span>
                          <span className="text-xs font-bold text-slate-600">kg</span>
                        </div>
                        <span className="mt-1 inline-block text-[11px] text-slate-500">
                          @ 4.5 kg / sq. m coverage
                        </span>
                      </div>
                    </>
                  )}

                  {/* Paint Results */}
                  {activeTool.key === "paint" && (
                    <>
                      <div className="rounded-xl border border-primary-200 bg-primary-50/60 p-4 shadow-sm">
                        <span className="text-xs font-semibold uppercase tracking-wider text-primary-800">
                          Paint Required
                        </span>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-2xl font-black text-slate-900">
                            {result.paintLitres}
                          </span>
                          <span className="text-xs font-bold text-primary-700">Litres</span>
                        </div>
                        <span className="mt-1 inline-block text-[11px] text-slate-600">
                          {result.paintGallons} Gallons
                        </span>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                          Wall Surface Area
                        </span>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-2xl font-black text-slate-900">
                            {result.wallAreaSqM}
                          </span>
                          <span className="text-xs font-bold text-slate-600">sq. m</span>
                        </div>
                        <span className="mt-1 inline-block text-[11px] text-slate-500">
                          Coats: {result.coats} · Coverage: {result.coveragePerLitre} m²/L
                        </span>
                      </div>
                    </>
                  )}

                  {/* Plaster / Cement / Sand / Aggregate results fallback */}
                  {!["brick", "concrete", "steel", "flooring", "paint"].includes(activeTool.key) && (
                    <>
                      {result.wetVolumeM3 !== undefined && (
                        <div className="rounded-xl border border-primary-200 bg-primary-50/60 p-4 shadow-sm">
                          <span className="text-xs font-semibold uppercase tracking-wider text-primary-800">
                            Wet Volume
                          </span>
                          <div className="mt-1 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-slate-900">
                              {result.wetVolumeM3}
                            </span>
                            <span className="text-xs font-bold text-primary-700">m³</span>
                          </div>
                          <span className="mt-1 inline-block text-[11px] text-slate-600">
                            Dry Volume: {result.dryVolumeM3} m³
                          </span>
                        </div>
                      )}

                      {result.cementBags !== undefined && (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                            Cement Bags
                          </span>
                          <div className="mt-1 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-slate-900">
                              {result.cementBags}
                            </span>
                            <span className="text-xs font-bold text-slate-600">bags</span>
                          </div>
                          <span className="mt-1 inline-block text-[11px] text-slate-500">
                            Mix: {result.mixRatio}
                          </span>
                        </div>
                      )}

                      {result.sandKg !== undefined && (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                            Sand Quantity
                          </span>
                          <div className="mt-1 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-slate-900">
                              {result.sandKg?.toLocaleString()}
                            </span>
                            <span className="text-xs font-bold text-slate-600">kg</span>
                          </div>
                          <span className="mt-1 inline-block text-[11px] text-slate-500">
                            {result.sandCft} CFT ({result.sandVolumeM3 || result.sandM3} m³)
                          </span>
                        </div>
                      )}

                      {result.aggregateKg !== undefined && (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                            Coarse Aggregate
                          </span>
                          <div className="mt-1 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-slate-900">
                              {result.aggregateKg?.toLocaleString()}
                            </span>
                            <span className="text-xs font-bold text-slate-600">kg</span>
                          </div>
                          <span className="mt-1 inline-block text-[11px] text-slate-500">
                            {result.aggregateCft} CFT
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* DETAILED MATERIAL SPECIFICATION TABLE */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600">
                    Material Specification & Constant Factors
                  </div>
                  <dl className="divide-y divide-slate-100 text-sm">
                    {Object.entries(result)
                      .filter(([k]) => !["trucks", "constantsUsed"].includes(k))
                      .map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50/50">
                          <dt className="font-medium text-slate-500 capitalize">
                            {k.replace(/([A-Z])/g, " $1")}
                          </dt>
                          <dd className="font-bold text-slate-900">
                            {typeof v === "number" ? v.toLocaleString() : String(v)}
                          </dd>
                        </div>
                      ))}
                  </dl>
                </div>
              </div>
            ) : (
              <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 p-8 text-center">
                <Sparkles size={28} className="text-primary-500 mb-2" />
                <h4 className="text-sm font-bold text-slate-800">Ready for Calculation</h4>
                <p className="mt-1 text-xs text-slate-500 max-w-sm">
                  Adjust dimensions or select a preset on the left, then click Calculate to update the 3D model and generate full material quantities.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
