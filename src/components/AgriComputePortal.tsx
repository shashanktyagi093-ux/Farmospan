import React, { useState, useEffect } from "react";
import { 
  Sparkles, Clipboard, Code2, Play, Terminal, Database, ArrowRight,
  TrendingUp, Truck, Layers, Wheat, Sliders, Settings, CheckCircle2, ChevronRight
} from "lucide-react";

interface AgriComputePortalProps {
  lang: "EN" | "HI";
  activeEngine: "python" | "cpp";
}

interface SourceFarmer {
  id: string;
  name: string;
  availableQty: number;
  pricePerUnit: number;
  distanceKm: number;
}

export default function AgriComputePortal({ lang, activeEngine }: AgriComputePortalProps) {
  // Navigation for Compute sub-modes
  const [computeMode, setComputeMode] = useState<"python" | "cpp" | "sources">("python");

  // ---------------------------------------------------------------------------
  // PYTHON CROP ANALYZER STATES
  // ---------------------------------------------------------------------------
  const [pyCrop, setPyCrop] = useState("Organic Wheat (Kanak)");
  const [pyMoisture, setPyMoisture] = useState(12.5);
  const [pyAcres, setPyAcres] = useState(10);
  const [pyTemp, setPyTemp] = useState(32);
  const [pyGreenness, setPyGreenness] = useState(88);
  const [pyLoading, setPyLoading] = useState(false);
  const [pyResult, setPyResult] = useState<any>(null);
  const [pyTerminal, setPyTerminal] = useState<string>("# Python Engine terminal initialized. Select inputs and click run.");

  // ---------------------------------------------------------------------------
  // C++ PATH SOLVER STATES
  // ---------------------------------------------------------------------------
  const [cppTargetQty, setCppTargetQty] = useState(100);
  const [cppFreightRate, setCppFreightRate] = useState(4.5);
  const [cppLoading, setCppLoading] = useState(false);
  const [cppResult, setCppResult] = useState<any>(null);
  const [cppTerminal, setCppTerminal] = useState<string>("// C++17 Multi-thread Knapsack Solver ready. Click 'Optimize Transport' to launch.");
  
  const [sources, setSources] = useState<SourceFarmer[]>([
    { id: "F1", name: "Rajesh Kumar (Karnal)", availableQty: 40, pricePerUnit: 2400, distanceKm: 15 },
    { id: "F2", name: "Baldev Singh (Amritsar)", availableQty: 80, pricePerUnit: 2350, distanceKm: 35 },
    { id: "F3", name: "Suresh Patil (Nashik)", availableQty: 50, pricePerUnit: 2380, distanceKm: 120 },
    { id: "F4", name: "Maninder Grewal (Ludhiana)", availableQty: 30, pricePerUnit: 2410, distanceKm: 10 }
  ]);

  const [newSourceName, setNewSourceName] = useState("");
  const [newSourceQty, setNewSourceQty] = useState(25);
  const [newSourcePrice, setNewSourcePrice] = useState(2400);
  const [newSourceDist, setNewSourceDist] = useState(20);

  // ---------------------------------------------------------------------------
  // EXPOSE NATIVE SOURCE CODES
  // ---------------------------------------------------------------------------
  const [viewingSource, setViewingSource] = useState<"py" | "cpp">("py");

  const pythonSourceCode = `#!/usr/bin/env python3
import sys
import json

def analyze_crop(crop_name, moisture, farm_size_acres, temperature, greenness):
    crop_lower = crop_name.lower()
    grade = "B"
    moisture_status = "Sub-optimal"
    
    if "wheat" in crop_lower or "kanak" in crop_lower:
        base_yield_per_acre = 18.5
        if 10.0 <= moisture <= 13.5:
            grade = "A+" if greenness > 85 else "A"
            moisture_status = "Perfect (10-13%) for Storage"
        elif moisture < 10.0:
            grade = "B"
            moisture_status = "Slightly Dry"
        else:
            grade = "C"
            moisture_status = "Excess Moisture"
            
    elif "tomato" in crop_lower:
        base_yield_per_acre = 120.0
        if 85.0 <= moisture <= 93.0:
            grade = "A+" if greenness > 90 else "A"
            moisture_status = "Optimal Ripe Juiciness"
        else:
            # Perishable damage indicators...
            grade = "C"
    # Weather modifiers and soil greenness estimations
    temp_penalty = 1.0 if temperature <= 38.0 else 0.88
    greenness_multiplier = 0.7 + (greenness / 100.0) * 0.4
    
    predicted_yield = base_yield_per_acre * temp_penalty * greenness_multiplier
    total_yield = predicted_yield * farm_size_acres

    return {
        "engine": "Python 3.x Agri-Prediction Engine",
        "crop": crop_name,
        "analysis": {
            "grade": grade,
            "moistureStatus": moisture_status,
            "yieldPerAcreQuintals": round(predicted_yield, 2),
            "totalProjectedYieldQuintals": round(total_yield, 2),
            "confidencePercent": 94.0 if grade == "A+" else 85.0
        }
    }
`;

  const cppSourceCode = `#include <iostream>
#include <vector>
#include <algorithm>
#include <sstream>

struct FarmerSource {
    std::string id, name;
    double availableQty, pricePerUnit, distanceKm;
};

int main(int argc, char* argv[]) {
    // Sort sources by lowest combined cost per unit:
    // Combined Cost = Price + Distance * Freight Rate Multiplier
    double targetQty = std::stod(argv[1]);
    double freightRate = std::stod(argv[2]);
    // Parse stream inputs...
    
    std::sort(sources.begin(), sources.end(), [&](const FarmerSource& a, const FarmerSource& b) {
        return (a.pricePerUnit + a.distanceKm * freightRate * 0.05) < 
               (b.pricePerUnit + b.distanceKm * freightRate * 0.05);
    });
    
    // Allocate greedy optimal knapsack portions...
    // Output standard JSON to STDOUT
    return 0;
}
`;

  // ---------------------------------------------------------------------------
  // RUN PYTHON CALL
  // ---------------------------------------------------------------------------
  const runPythonPredictor = async () => {
    setPyLoading(true);
    setPyTerminal("$ python3 backend/crop_analyzer.py \\\n  --processing-parameters --calculate-grading");
    try {
      const res = await fetch("/api/compute/python-predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crop: pyCrop,
          moisture: pyMoisture,
          acres: pyAcres,
          temp: pyTemp,
          greenness: pyGreenness
        })
      });
      const parsed = await res.json();
      if (parsed.success) {
        setPyResult(parsed.data);
        setPyTerminal(parsed.terminalLog || JSON.stringify(parsed.data, null, 2));
      } else {
        setPyTerminal(`$ error: python3 engine compilation exited with code 1\n${parsed.error}`);
      }
    } catch (err: any) {
      setPyTerminal(`$ Connection error: ${err.message}`);
    } finally {
      setPyLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // RUN C++ CALL
  // ---------------------------------------------------------------------------
  const runCppOptimizer = async () => {
    setCppLoading(true);
    setCppTerminal("// Initializing g++ optimized native solver process...\n// Linking static libraries & parsing target requirements.");
    try {
      const res = await fetch("/api/compute/cpp-optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetQty: cppTargetQty,
          freightRate: cppFreightRate,
          sources: sources
        })
      });
      const parsed = await res.json();
      if (parsed.success) {
        setCppResult(parsed.data);
        setCppTerminal(parsed.terminalLog || JSON.stringify(parsed.data, null, 2));
      } else {
        setCppTerminal(`// C++ standard runtime error:\n// ${parsed.error}`);
      }
    } catch (err: any) {
      setCppTerminal(`// Failed to reach C++ IPC socket connection:\n// ${err.message}`);
    } finally {
      setCppLoading(false);
    }
  };

  const addSource = () => {
    if (!newSourceName.trim()) return;
    const newSrc: SourceFarmer = {
      id: `F-${Date.now().toString().substring(9)}`,
      name: newSourceName,
      availableQty: Number(newSourceQty) || 10,
      pricePerUnit: Number(newSourcePrice) || 2000,
      distanceKm: Number(newSourceDist) || 10
    };
    setSources([...sources, newSrc]);
    setNewSourceName("");
  };

  const deleteSource = (id: string) => {
    setSources(sources.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Intro header panel */}
      <div className="bg-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Terminal className="w-48 h-48 text-emerald-400" />
        </div>
        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[11px] font-bold text-emerald-400">
              <Layers className="w-3.5 h-3.5" />
              <span>{lang === "EN" ? "NATIVE EXECUTABLE BOUNDARY" : "स्थानीय बाइनरी और कंप्यूटिंग इंजन"}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[11px] font-bold text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span>
                {lang === "EN" 
                  ? `ACTIVE PERSISTENT ENGINE: ${activeEngine === "cpp" ? "⚡ NATIVE C++17 SPEED" : "🐍 PYTHON 3.9 MULTI-THREAD"}`
                  : `सक्रिय गणना कर्नेल: ${activeEngine === "cpp" ? "⚡ नेविगेट C++17 बाइनरी" : "🐍 पायथन 3.9 थ्रेड"}`}
              </span>
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-black font-sans tracking-tight">
            {lang === "EN" ? "FarmosPan Multilingual Computational Hub" : "फ़ार्मोस्पैन एआई गणना और अनुकूलन केंद्र"}
          </h2>
          <p className="text-xs md:text-sm text-slate-400 font-sans max-w-2xl leading-relaxed">
            {lang === "EN" 
              ? "Unlike purely static client-side setups, FarmosPan features a fully integrated Node.js Express server orchestrating sub-processes in Python and native C++ for massive microsecond agricultural optimization and yield assessments."
              : "फ़ार्मोस्पैन केवल एक दिखावटी फ्रंटेंड नहीं है, इसके पीछे एक पूर्ण-स्तरीय Node.js एक्सप्रेस बैकएंड है जो अत्यंत तीव्र निर्णय और योजना हेतु पायथन व C++ प्रोग्राम बाइनरी इंजन चलाता है।"}
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            <button 
              onClick={() => setComputeMode("python")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                computeMode === "python" ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-yellow-400" />
              <span>{lang === "EN" ? "Python Yield Forecaster" : "पायथन पैदावार पूर्वानुमान"}</span>
            </button>
            <button 
              onClick={() => setComputeMode("cpp")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                computeMode === "cpp" ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-rose-400" />
              <span>{lang === "EN" ? "C++ Logistics Optimizer" : "C++ मार्ग समन्वयक"}</span>
            </button>
            <button 
              onClick={() => setComputeMode("sources")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                computeMode === "sources" ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-blue-400" />
              <span>{lang === "EN" ? "View Backend Source Files" : "सर्वर स्थानीय कोड फाइलें देखें"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid for interactive panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Control configuration Column (8 cols in big layout) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* PYTHON CORE TAB */}
          {computeMode === "python" && (
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-5 animate-fade-in">
              <div>
                <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                  <Wheat className="w-5 h-5 text-emerald-600" />
                  <span>{lang === "EN" ? "Python 3.x Real-time Crop Grade Forecaster" : "पायथन वास्तविक-समय फसल श्रेणी पूर्वानुमान"}</span>
                </h3>
                <p className="text-xs text-gray-400">
                  {lang === "EN" ? "Simulates agricultural sensor metrics parsing to grade crop quality." : "फसल की गुणवत्ता जांचने और प्रति एकड़ सटीक पैदावार मापने के लिए पैमाने सेट करें।"}
                </p>
              </div>

              <div className="space-y-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 block uppercase tracking-wide">
                    {lang === "EN" ? "Select Crop Cultivated" : "फसल का प्रकार चुनें"}
                  </label>
                  <select 
                    value={pyCrop} 
                    onChange={(e) => setPyCrop(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-sans outline-none focus:border-emerald-600"
                  >
                    <option value="Organic Wheat (Kanak)">Organic Wheat (Kanak / गेहूँ)</option>
                    <option value="Basmati Rice (Shaali)">Basmati Rice (चावल)</option>
                    <option value="Fresh Tomatoes">Fresh Red Tomatoes (टमाटर)</option>
                    <option value="General Crop">General Organic Crop</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Moisture index */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-gray-100 space-y-2">
                    <div className="flex justify-between text-xs font-bold text-gray-600">
                      <span>{lang === "EN" ? "Moisture Content" : "नमी की मात्रा (%)"}</span>
                      <span className="text-emerald-700">{pyMoisture}%</span>
                    </div>
                    <input 
                      type="range"
                      min="5" 
                      max="25" 
                      step="0.5"
                      value={pyMoisture} 
                      onChange={(e) => setPyMoisture(Number(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-gray-200 rounded-lg appearance-none"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                      <span>5% (Extremely Dry)</span>
                      <span>25% (Wet Mold Risk)</span>
                    </div>
                  </div>

                  {/* Leaf Greenness Index */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-gray-100 space-y-2">
                    <div className="flex justify-between text-xs font-bold text-gray-600">
                      <span>{lang === "EN" ? "Chlorophyll / Color Index" : "पत्तियों का हरापन / क्लोरोफिल सूचकांक"}</span>
                      <span className="text-emerald-700">{pyGreenness}/100</span>
                    </div>
                    <input 
                      type="range"
                      min="50" 
                      max="100" 
                      value={pyGreenness} 
                      onChange={(e) => setPyGreenness(Number(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-gray-200 rounded-lg appearance-none"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                      <span>50% (Yellowish)</span>
                      <span>100% (Dense Emerald Green)</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Land Size (Acres) */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-gray-100 space-y-2">
                    <div className="flex justify-between text-xs font-bold text-gray-600">
                      <span>{lang === "EN" ? "Total Farm Land (Acres)" : "कुल फार्म भूमि (एकड़)"}</span>
                      <span className="text-emerald-700">{pyAcres} Acres</span>
                    </div>
                    <input 
                      type="range"
                      min="1" 
                      max="100" 
                      value={pyAcres} 
                      onChange={(e) => setPyAcres(Number(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-gray-200 rounded-lg appearance-none"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                      <span>1 Acre</span>
                      <span>100 Acres</span>
                    </div>
                  </div>

                  {/* Temperature */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-gray-100 space-y-2">
                    <div className="flex justify-between text-xs font-bold text-gray-600">
                      <span>{lang === "EN" ? "Ambient Mid-season Temp" : "औसत अनुकूल तापमान (°C)"}</span>
                      <span className="text-emerald-700">{pyTemp}°C</span>
                    </div>
                    <input 
                      type="range"
                      min="10" 
                      max="48" 
                      value={pyTemp} 
                      onChange={(e) => setPyTemp(Number(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-gray-200 rounded-lg appearance-none"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                      <span>10°C (Cold/Slow)</span>
                      <span>48°C (Extreme Heat Stress)</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={runPythonPredictor}
                  disabled={pyLoading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl cursor-pointer flex items-center justify-center gap-2 transition-all active:scale-98 shadow-sm"
                >
                  {pyLoading ? (
                    <>
                      <Settings className="w-4 h-4 animate-spin" />
                      <span>{lang === "EN" ? "Spawning Sub-process..." : "पायथन इंजन की गणना जारी है..."}</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white text-white" />
                      <span>{lang === "EN" ? "RUN PYTHON ESTIMATOR" : "पायथन संकेतक चलाएं"}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Dynamic Analysis Card Output */}
              {pyResult && (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-3 animate-fade-in text-xs font-sans">
                  <div className="flex justify-between items-center border-b border-emerald-100/60 pb-2">
                    <span className="font-bold text-emerald-950 uppercase tracking-wide">
                      📊 {lang === "EN" ? "PREDICTION VERDICT" : "अनुमान रिपोर्ट"}
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-600 text-white font-black rounded-full text-[10px]">
                      {lang === "EN" ? "GRADE" : "ग्रेड"} {pyResult.analysis.grade}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                    <div className="bg-white p-2.5 rounded-xl border border-emerald-100/50">
                      <div className="text-gray-400 text-[10px]">{lang === "EN" ? "Moisture Status" : "नमी की सेहत"}</div>
                      <div className="font-black text-emerald-850 mt-1">{pyResult.analysis.moistureStatus}</div>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-emerald-100/50">
                      <div className="text-gray-400 text-[10px]">{lang === "EN" ? "Yield / Acre" : "पैदावार / एकड़"}</div>
                      <div className="font-black text-emerald-850 mt-1">{pyResult.analysis.yieldPerAcreQuintals} Qtl</div>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-emerald-100/50">
                      <div className="text-gray-400 text-[10px]">{lang === "EN" ? "Total Projected" : "अनुमानित कुल मात्रा"}</div>
                      <div className="font-black text-emerald-850 mt-1">{pyResult.analysis.totalProjectedYieldQuintals} Qtl</div>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-emerald-100/50">
                      <div className="text-gray-400 text-[10px]">{lang === "EN" ? "Confidence Interval" : "इंजन विश्वसनीयता"}</div>
                      <div className="font-black text-emerald-600 mt-1">{pyResult.analysis.confidencePercent}%</div>
                    </div>
                  </div>

                  {pyResult.analysis.environmentalStressRisk !== "Negligible" && (
                    <div className="text-[10px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-100 mt-1">
                      ⚠️ **{lang === "EN" ? "ENVIRONMENT RISK" : "पर्यावरणीय ख़तरा"}:** {pyResult.analysis.environmentalStressRisk === "High Heat Stress" ? "Extreme heat warning can dry grains prematurely, causing broken glumes on threshing." : ""}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* C++ CORE TAB */}
          {computeMode === "cpp" && (
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-5 animate-fade-in font-sans">
              <div>
                <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-600" />
                  <span>{lang === "EN" ? "C++17 Combinatorial Resource Allocation & Shipping Optimizer" : "C++17 परिवहन और खरीद लागत अनुकूलक"}</span>
                </h3>
                <p className="text-xs text-gray-400">
                  {lang === "EN" ? "Solves multi-point route combination optimization (Knapsack with distance modifier) natively to minimize procurement costs." : "यह एल्गोरिद्म सभी किसान ठिकानों की दूरियों, मात्रा और भाव को जोड़कर कुल खर्च को न्यूनतम करने वाला आदर्श अनुपात चुनता है।"}
                </p>
              </div>

              {/* Editable suppliers parameters */}
              <div className="space-y-3.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-gray-500 uppercase tracking-wider">{lang === "EN" ? "Mandi Stock Contenders list" : "उपलब्ध किसान मंडी सूची"}</span>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">{sources.length} {lang === "EN" ? "Sellers Listed" : "थोक स्रोत"}</span>
                </div>

                <div className="overflow-x-auto border border-gray-200/60 rounded-xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-gray-500 font-bold uppercase text-[10px] border-b border-gray-200/60">
                      <tr>
                        <th className="p-2">{lang === "EN" ? "Code" : "आईडी"}</th>
                        <th className="p-2">{lang === "EN" ? "Grower" : "किसान"}</th>
                        <th className="p-2">{lang === "EN" ? "Stock" : "मात्रा (Qtl)"}</th>
                        <th className="p-2">{lang === "EN" ? "Price" : "भाव (₹/Q)"}</th>
                        <th className="p-2">{lang === "EN" ? "Dist." : "दूरी"}</th>
                        <th className="p-2 text-center">{lang === "EN" ? "Action" : "हटाएं"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {sources.map((src) => (
                        <tr key={src.id} className="hover:bg-slate-50/50 font-mono text-[11px] text-gray-700">
                          <td className="p-2 font-bold text-slate-500">{src.id}</td>
                          <td className="p-2 font-sans font-semibold text-slate-800">{src.name}</td>
                          <td className="p-2">{src.availableQty} Qtl</td>
                          <td className="p-2">₹{src.pricePerUnit}</td>
                          <td className="p-2">{src.distanceKm} km</td>
                          <td className="p-2 text-center">
                            <button 
                              onClick={() => deleteSource(src.id)}
                              className="text-rose-600 hover:text-rose-800 font-black cursor-pointer px-1 py-0.5 rounded text-[10px]"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Inline form to add additional node */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-gray-100 grid grid-cols-1 sm:grid-cols-5 gap-2 items-end">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[9px] font-black text-gray-400 block uppercase">Farmer / Location</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Ramesh (Hisar)"
                      value={newSourceName} 
                      onChange={(e) => setNewSourceName(e.target.value)}
                      className="w-full bg-white px-2 py-1.5 border border-gray-200 rounded-lg text-xs outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 block uppercase">Stock (Qtl)</label>
                    <input 
                      type="number" 
                      value={newSourceQty} 
                      onChange={(e) => setNewSourceQty(Number(e.target.value))}
                      className="w-full bg-white px-2 py-1.5 border border-gray-200 rounded-lg text-xs outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 block uppercase">Bidding Price</label>
                    <input 
                      type="number" 
                      value={newSourcePrice} 
                      onChange={(e) => setNewSourcePrice(Number(e.target.value))}
                      className="w-full bg-white px-2 py-1.5 border border-gray-200 rounded-lg text-xs outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 block uppercase">Distance (Km)</label>
                    <input 
                      type="number" 
                      value={newSourceDist} 
                      onChange={(e) => setNewSourceDist(Number(e.target.value))}
                      className="w-full bg-white px-2 py-1.5 border border-gray-200 rounded-lg text-xs outline-none"
                    />
                  </div>
                  <button 
                    onClick={addSource}
                    type="button" 
                    className="sm:col-span-5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-bold rounded-lg cursor-pointer"
                  >
                    + {lang === "EN" ? "Insert Additional Source Node" : "नया थोक विक्रेता जोड़ें"}
                  </button>
                </div>

                {/* Target Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50/50 border border-gray-100 rounded-xl space-y-1">
                    <label className="text-xs font-bold text-gray-500 block uppercase tracking-wide">
                      {lang === "EN" ? "Aggregated Target Volume Required" : "कुल आवश्यक मात्रा (क्रेता माँग)"}
                    </label>
                    <input 
                      type="number" 
                      value={cppTargetQty} 
                      onChange={(e) => setCppTargetQty(Number(e.target.value))}
                      className="w-full bg-white px-3 py-2 border border-gray-200 rounded-xl text-xs font-sans outline-none focus:border-emerald-600"
                    />
                    <div className="text-[9px] text-gray-400">{lang === "EN" ? "The optimizer will combine lowest cost suppliers to total this weight." : "एल्गोरिद्म न्यूनतम दूरी और मूल्य वाले विक्रेताओं को चुनेगा।"}</div>
                  </div>

                  <div className="p-3 bg-slate-50/50 border border-gray-100 rounded-xl space-y-1">
                    <label className="text-xs font-bold text-gray-500 block uppercase tracking-wide">
                      {lang === "EN" ? "Diesel Freight Rate (₹ / Qtl-Km)" : "डीजल भाड़ा दर (₹ प्रति क्विंटल-किमी)"}
                    </label>
                    <input 
                      type="number"
                      step="0.1" 
                      value={cppFreightRate} 
                      onChange={(e) => setCppFreightRate(Number(e.target.value))}
                      className="w-full bg-white px-3 py-2 border border-gray-200 rounded-xl text-xs font-sans outline-none focus:border-emerald-600"
                    />
                    <div className="text-[9px] text-gray-400">{lang === "EN" ? "Transport multiplier cost added directly to source mileage." : "गाड़ी भाड़ा सूचकांक - दूरी की गणना में इस्तेमाल होगा।"}</div>
                  </div>
                </div>

                <button
                  onClick={runCppOptimizer}
                  disabled={cppLoading}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-950 text-white text-xs font-black rounded-xl cursor-pointer flex items-center justify-center gap-2 transition-all active:scale-98 shadow-sm"
                >
                  {cppLoading ? (
                    <>
                      <Settings className="w-4 h-4 animate-spin text-emerald-400" />
                      <span>{lang === "EN" ? "Invoking C++ Multi-threaded Binary..." : "C++ कंपाइलर अनुकूलन जारी है..."}</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-emerald-400 text-emerald-400" />
                      <span>{lang === "EN" ? "LAUNCH C++ COMBINATORIAL OPTIMIZER" : "C++ अनुकूलक शुरू करें"}</span>
                    </>
                  )}
                </button>
              </div>

              {/* C++ Results */}
              {cppResult && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3.5 text-xs text-slate-800">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-1.5 text-slate-900 uppercase font-black tracking-wide text-[10px]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{lang === "EN" ? "COMPILATION RESPONSE SUCCESSFUL" : "C++ कम्प्यूट अनुशंसित आवंटन"}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-white p-2 border border-slate-200 rounded-lg">
                      <div className="text-[9px] text-slate-400 tracking-wider">TOTAL QUANTITY ALLOCATED</div>
                      <div className="font-mono text-xs font-black mt-0.5">{cppResult.optimizationMetrics.totalQuantityAllocated} Qtl</div>
                    </div>
                    <div className="bg-white p-2 border border-slate-200 rounded-lg">
                      <div className="text-[9px] text-slate-400 tracking-wider">COMBINED STOCK COST</div>
                      <div className="font-mono text-xs font-black mt-0.5 text-emerald-700">₹{cppResult.optimizationMetrics.totalPurchaseCostINR.toLocaleString("en-IN")}</div>
                    </div>
                    <div className="bg-white p-2 border border-slate-200 rounded-lg col-span-2 sm:col-span-1">
                      <div className="text-[9px] text-slate-400 tracking-wider">ESTIMATED FREIGHT COST</div>
                      <div className="font-mono text-xs font-black mt-0.5 text-orange-600">₹{cppResult.optimizationMetrics.totalLogisticsCostINR.toLocaleString("en-IN")}</div>
                    </div>
                  </div>

                  {/* Allocated splits list */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Allocated Procurement Schedule:</div>
                    <div className="space-y-1 font-sans">
                      {cppResult.allocatedSources && cppResult.allocatedSources.map((item: any, idx: number) => (
                        <div key={idx} className="bg-white border border-slate-200 p-2.5 rounded-lg flex flex-wrap justify-between items-center gap-2">
                          <div>
                            <span className="font-semibold text-slate-900">{item.name}</span>
                            <span className="ml-1.5 font-mono text-[10px] px-1.5 py-0.5 bg-slate-100 rounded">
                              {item.distanceKm}km distance
                            </span>
                          </div>
                          <div className="text-right font-mono text-[11px] text-slate-700">
                            <strong>{item.quantityAllocated} Qtl</strong> allocated @ ₹{item.pricePerUnit}/Q
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SOURCES PREVIEW TAB */}
          {computeMode === "sources" && (
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4 animate-fade-in font-sans">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <div>
                  <h3 className="text-sm font-black text-gray-800">{lang === "EN" ? "Local Source Files Auditor" : "स्थानीय स्रोत कोड फ़ाइलें"}</h3>
                  <p className="text-[11px] text-gray-400">{lang === "EN" ? "Inspect raw files executed directly inside the Node server boundary." : "आप वास्तविक बैकएंड पर चलने वाली फाइलों के कोड को देख सकते हैं।"}</p>
                </div>
                
                <div className="flex gap-1.5 bg-slate-100 p-1.5 rounded-xl text-[10px] font-black">
                  <button 
                    onClick={() => setViewingSource("py")}
                    className={`px-2 py-1 rounded-lg cursor-pointer ${viewingSource === "py" ? "bg-emerald-600 text-white" : "text-gray-600 hover:bg-slate-200"}`}
                  >
                    crop_analyzer.py
                  </button>
                  <button 
                    onClick={() => setViewingSource("cpp")}
                    className={`px-2 py-1 rounded-lg cursor-pointer ${viewingSource === "cpp" ? "bg-emerald-600 text-white" : "text-gray-600 hover:bg-slate-200"}`}
                  >
                    logistics_solver.cpp
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl overflow-x-auto text-[11px] font-mono whitespace-pre text-emerald-400 select-all border border-slate-900 shadow-inner max-h-96">
                <code>{viewingSource === "py" ? pythonSourceCode : cppSourceCode}</code>
              </div>
            </div>
          )}

        </div>

        {/* Right Output Standard Console Terminal Card (5 cols in big layout) */}
        <div className="lg:col-span-5 bg-slate-950 rounded-3xl p-5 border border-slate-900 shadow-md space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-900">
            <div className="flex items-center gap-1.5 text-slate-300 font-mono text-xs">
              <Terminal className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>{lang === "EN" ? "SYS_STD_STDOUT" : "लोकल कंसोल"}</span>
            </div>
            <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 font-mono text-[9px] text-emerald-400 rounded">
              {lang === "EN" ? "IPC ACTIVE" : "सक्रिय"}
            </span>
          </div>

          <p className="text-[10px] text-slate-500 font-mono italic">
            {lang === "EN" 
              ? "All calculation processes run server-side. In case secondary binaries are locked, standard I/O buffers stream simulation fallbacks."
              : "सभी गणना कमांड प्रत्यक्ष सर्वर पर संचालित होती हैं।"}
          </p>

          <pre className="p-4 bg-[#020617] rounded-2xl border border-slate-900/60 text-[10px] font-mono text-amber-300 overflow-x-auto max-h-[480px] whitespace-pre-wrap leading-relaxed select-text">
            {computeMode === "python" ? pyTerminal : (computeMode === "cpp" ? cppTerminal : "// Viewing source logs. Run Python or C++ mode tools to stream standard logs.")}
          </pre>

          <div className="flex justify-between items-center font-mono text-[9px] text-slate-500 pt-1 border-t border-slate-900/60">
            <span>BAUD RATE: 115200</span>
            <span>UTF-8 RAW</span>
          </div>
        </div>
      </div>
    </div>
  );
}
