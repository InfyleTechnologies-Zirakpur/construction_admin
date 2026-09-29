import { useState } from "react";
import { Calculator, Loader2, Play } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { calculatorsApi, apiError } from "../../api";

// Field configs mirror backend @Query params in calculators.controller.ts
const TOOLS = [
  { key: "concrete", name: "Concrete", fields: ["length", "breadth", "height", "mixRatio"], defaults: { mixRatio: "1:2:4" } },
  { key: "cement", name: "Cement", fields: ["area", "thickness", "mixRatio"], defaults: { mixRatio: "1:4" } },
  { key: "sand", name: "Sand", fields: ["area", "thickness", "mixRatio"], defaults: { mixRatio: "1:4" } },
  { key: "aggregate", name: "Aggregate", fields: ["length", "breadth", "height", "mixRatio"], defaults: { mixRatio: "1:2:4" } },
  { key: "brick", name: "Brick", fields: ["wallLength", "wallHeight", "wallThickness", "mortarThickness"], defaults: { mortarThickness: "0.01" } },
  { key: "steel", name: "Steel", fields: ["length", "breadth", "depth", "steelPercentage"], defaults: { steelPercentage: "1" } },
  { key: "flooring", name: "Flooring", fields: ["roomLength", "roomBreadth", "tileLength", "tileBreadth", "wastagePercent"], defaults: { wastagePercent: "5" } },
  { key: "paint", name: "Paint", fields: ["wallArea", "coats", "coveragePerLitre"], defaults: { coats: "2", coveragePerLitre: "12" } },
  { key: "plaster", name: "Plaster", fields: ["area", "thickness", "mixRatio"], defaults: { mixRatio: "1:4" } },
  { key: "materialEstimation", name: "Material estimation", fields: ["area", "thickness", "materialType"], defaults: { thickness: "0.15", materialType: "concrete" } },
];

export default function Tools() {
  const [active, setActive] = useState(TOOLS[0]);
  const [inputs, setInputs] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const mutation = useMutation({
    mutationFn: (params) => calculatorsApi[active.key](params),
    onSuccess: (data) => {
      setError(null);
      setResult(data?.data ?? data);
    },
    onError: (e) => {
      setResult(null);
      setError(apiError(e));
    },
  });

  const run = () => {
    const params = {};
    for (const f of active.fields) {
      const v = inputs[`${active.key}.${f}`] ?? active.defaults[f] ?? "";
      if (v !== "") params[f] = v;
    }
    mutation.mutate(params);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Tools</h1>
        <p className="mt-2 text-slate-600">
          {TOOLS.length} construction calculators · live via GET /calculators/*
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TOOLS.map((tool) => (
          <button
            key={tool.key}
            onClick={() => {
              setActive(tool);
              setResult(null);
              setError(null);
            }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              active.key === tool.key
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {tool.name}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Calculator size={18} /> {active.name} inputs
          </h2>
          <div className="mt-4 space-y-3">
            {active.fields.map((field) => (
              <label key={field} className="block">
                <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">{field}</span>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                  placeholder={active.defaults[field] ?? "value"}
                  value={inputs[`${active.key}.${field}`] ?? ""}
                  onChange={(e) => setInputs({ ...inputs, [`${active.key}.${field}`]: e.target.value })}
                />
              </label>
            ))}
          </div>
          <button
            onClick={run}
            disabled={mutation.isPending}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-medium text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary-600 disabled:opacity-50"
          >
            {mutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
            Calculate
          </button>
          {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Result</h2>
          {result ? (
            <dl className="mt-4 space-y-2">
              {Object.entries(result).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between border-b border-slate-100 py-2 text-sm last:border-0">
                  <dt className="font-medium text-slate-500">{k}</dt>
                  <dd className="font-bold text-slate-900">{String(v)}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-4 text-sm text-slate-500">Enter inputs and press Calculate</p>
          )}
        </div>
      </div>
    </div>
  );
}
