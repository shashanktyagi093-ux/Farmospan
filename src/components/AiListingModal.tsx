import React, { useState } from "react";
import { Sparkles, X, Languages, AlertCircle, Save, Loader2, Mic } from "lucide-react";
import { CropListing } from "../types";

interface AiListingModalProps {
  onClose: () => void;
  onListingAdded: (listing: CropListing) => void;
  lang: "EN" | "HI";
}

export default function AiListingModal({ onClose, onListingAdded, lang }: AiListingModalProps) {
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiDraft, setAiDraft] = useState<any | null>(null);

  // Suggested helpers for farmers
  const speechPrompts = [
    lang === "EN" 
      ? "I have 500 kg of fresh red potatoes harvested yesterday in Indore. Expecting 22 Rs per kg."
      : "मेरे पास इंदौर में कल खोदे गए 500 किलो ताजे आलू हैं। 22 रुपये प्रति किलो की उम्मीद है।",
    lang === "EN"
      ? "15 Quintals of premium Sharbati wheat near Karnal Haryana, harvest date May 20, price 2350."
      : "करनाल हरियाणा के पास 15 क्विंटल प्रीमियम शरबती गेहूं, कटाई की तारीख 20 मई, कीमत 2350।"
  ];

  const handleGenerate = async (textToUse?: string) => {
    const rawText = textToUse || inputText;
    if (!rawText.trim()) {
      setError(lang === "EN" ? "Please say or write something first!" : "कृपया पहले कुछ कहें या लिखें!");
      return;
    }

    setLoading(true);
    setError("");
    setAiDraft(null);

    try {
      const response = await fetch("/api/gemini/listing-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fastText: rawText }),
      });

      if (!response.ok) {
        throw new Error("Failed to process with AI");
      }

      const result = await response.json();
      if (result.success && result.data) {
        setAiDraft(result.data);
      } else {
        throw new Error(result.error || "Could not understand listing draft");
      }
    } catch (err: any) {
      setError(lang === "EN" ? "AI helper is taking a break. Please edit manually." : "एआई सहायक अस्थायी रूप से बंद है। कृपया मुख्य फॉर्म से प्रयास करें।");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveListing = async () => {
    if (!aiDraft) return;

    setLoading(true);
    try {
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmerName: "Rajesh Sharma (Self)",
          farmerContact: "+91 94140 12345",
          cropName: aiDraft.cropName,
          variety: aiDraft.variety,
          quantity: aiDraft.quantity,
          unit: aiDraft.unit,
          pricePerUnit: aiDraft.pricePerUnit,
          location: aiDraft.location,
          state: aiDraft.state,
          harvestDate: new Date().toISOString().split("T")[0],
          description: aiDraft.description,
          descriptionHindi: aiDraft.descriptionHindi,
          verified: false,
          image: aiDraft.cropName.toLowerCase().includes("tomato") ? "tomato" : 
                 aiDraft.cropName.toLowerCase().includes("onion") ? "onion" : 
                 aiDraft.cropName.toLowerCase().includes("rice") ? "rice" : "grain"
        }),
      });

      if (!response.ok) throw new Error("Failed to save Crop");
      const savedListing = await response.json();
      onListingAdded(savedListing);
      onClose();
    } catch (err: any) {
      setError(lang === "EN" ? "Could not post listing" : "सूची पोस्ट नहीं की जा सकी");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="ai-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div id="ai-modal-card" className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                {lang === "EN" ? "AI Listing Magic Assistant" : "एआई लिस्टिंग मैजिक सहायक"}
              </h2>
              <p className="text-xs text-emerald-100 font-sans mt-0.5">
                {lang === "EN" ? "Speak or write in any language to draft listings instantly" : "अपनी भाषा में बोलें या लिखें और तुरंत लिस्टिंग बनाएं"}
              </p>
            </div>
          </div>
          <button 
            id="close-ai-modal" 
            onClick={onClose} 
            className="p-1 px-2.5 rounded-full hover:bg-white/20 text-white transition-colors text-sm font-bold/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Input Box */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {lang === "EN" ? "What do you want to sell today?" : "आज आप क्या बेचना चाहते हैं?"}
            </label>
            <div className="relative">
              <textarea
                id="ai-listing-input"
                className="w-full h-32 px-4 py-3 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none text-gray-800 placeholder-gray-400 font-sans transition-all text-sm resize-none"
                placeholder={lang === "EN" ? "Type or copy farm details here..." : "यहाँ अपने खेत की उपज की जानकारी लिखें..."}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <button 
                id="ai-quick-voice"
                onClick={() => setInputText(speechPrompts[0])}
                className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full hover:bg-emerald-100 text-xs font-medium border border-emerald-200 active:scale-95 transition-all"
                title="Simulate speech voice input"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>{lang === "EN" ? "Demo Speech" : "डेमो आवाज़"}</span>
              </button>
            </div>
          </div>

          {/* Quick Suggestions */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-gray-500 tracking-wide uppercase">
              {lang === "EN" ? "Click to use demo inputs:" : "डेमो इनपुट का प्रयोग करें:"}
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {speechPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputText(prompt);
                    handleGenerate(prompt);
                  }}
                  className="p-3 text-left bg-gray-50 hover:bg-emerald-50/50 hover:border-emerald-200 border border-gray-200/80 rounded-xl transition-all cursor-pointer text-xs text-gray-600 hover:text-emerald-900 flex flex-col justify-between"
                >
                  <p className="line-clamp-2 leading-relaxed italic">"{prompt}"</p>
                  <span className="text-[10px] text-emerald-600 font-semibold mt-1 self-end hover:underline">
                    {lang === "EN" ? "Draft with AI →" : "एआई से ड्राफ्ट बनाएं →"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* AI Output Result */}
          {aiDraft && (
            <div id="ai-draft-preview" className="p-5 bg-emerald-50/70 border border-emerald-100 rounded-2xl space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
                  <Languages className="w-4 h-4 text-emerald-600" />
                  <span>{lang === "EN" ? "AI Extracted Fields" : "एआई द्वारा निकाले गए विवरण"}</span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded-full text-[10px] uppercase tracking-wide font-black">
                  {lang === "EN" ? "Zero Middleman Price Plan" : "दलाल मुक्त मूल्य"}
                </span>
              </div>

              {/* Grid of details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white/90 p-2.5 rounded-xl border border-emerald-100/60 shadow-xs">
                  <span className="block text-[10px] text-gray-400 font-medium uppercase font-sans">
                    {lang === "EN" ? "Crop Name" : "फसल का नाम"}
                  </span>
                  <span className="text-sm font-bold text-gray-800">{aiDraft.cropName}</span>
                </div>
                <div className="bg-white/90 p-2.5 rounded-xl border border-emerald-100/60 shadow-xs">
                  <span className="block text-[10px] text-gray-400 font-medium uppercase font-sans">
                    {lang === "EN" ? "Variety" : "किस्म"}
                  </span>
                  <span className="text-sm font-semibold text-emerald-800 truncate block">{aiDraft.variety}</span>
                </div>
                <div className="bg-white/90 p-2.5 rounded-xl border border-emerald-100/60 shadow-xs">
                  <span className="block text-[10px] text-gray-400 font-medium uppercase font-sans">
                    {lang === "EN" ? "Available Stock" : "कुल मात्रा"}
                  </span>
                  <span className="text-sm font-bold text-gray-800">
                    {aiDraft.quantity} {aiDraft.unit}
                  </span>
                </div>
                <div className="bg-white/90 p-2.5 rounded-xl border border-emerald-100/60 shadow-xs text-emerald-900">
                  <span className="block text-[10px] text-emerald-700/60 font-semibold uppercase font-sans">
                    {lang === "EN" ? "Fair Price Deal" : "उचित दाम"}
                  </span>
                  <span className="text-sm font-black text-emerald-700">
                    ₹{aiDraft.pricePerUnit} <span className="text-[10px] font-normal">/ {aiDraft.unit}</span>
                  </span>
                </div>
              </div>

              {/* Geographic Guesses */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-white/40 p-3 rounded-xl">
                <div>
                  <span className="text-gray-400 uppercase tracking-wider block text-[9px]">
                    {lang === "EN" ? "Mandi Location" : "मंडी स्थान"}
                  </span>
                  <span className="font-semibold text-gray-700">{aiDraft.location || "Not Found"}</span>
                </div>
                <div>
                  <span className="text-gray-400 uppercase tracking-wider block text-[9px]">
                    {lang === "EN" ? "State" : "राज्य"}
                  </span>
                  <span className="font-semibold text-gray-700">{aiDraft.state || "India"}</span>
                </div>
              </div>

              {/* Trans-lingual descriptions */}
              <div className="space-y-3 pt-2">
                <div className="bg-white/80 p-3 rounded-xl border border-emerald-100/30">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 mb-1">
                    <span>🇬🇧 English Desk Description</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed font-sans">{aiDraft.description}</p>
                </div>
                {aiDraft.descriptionHindi && (
                  <div className="bg-white/80 p-3 rounded-xl border border-emerald-100/30">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700/60 mb-1">
                      <span>🇮🇳 हिंदी वर्णन (Devanagari)</span>
                    </div>
                    <p className="text-xs text-emerald-900 leading-relaxed font-sans">{aiDraft.descriptionHindi}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <button
            id="ai-modal-cancel"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 transition-colors text-sm font-semibold cursor-pointer"
          >
            {lang === "EN" ? "Cancel" : "रद्द करें"}
          </button>

          {!aiDraft ? (
            <button
              id="ai-modal-generate"
              disabled={loading}
              onClick={() => handleGenerate()}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 transition-all flex items-center gap-2 shadow-md cursor-pointer text-sm"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>{lang === "EN" ? "Draft Listing with AI" : "एआई से ड्राफ्ट बनाएं"}</span>
            </button>
          ) : (
            <button
              id="ai-modal-save"
              disabled={loading}
              onClick={handleSaveListing}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 transition-all flex items-center gap-2 shadow-emerald-200/50 shadow-md cursor-pointer text-sm"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{lang === "EN" ? "Publish Fresh Listing" : "अभी लाइव मंडी में डालें"}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
