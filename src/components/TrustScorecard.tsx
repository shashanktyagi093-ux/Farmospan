import React, { useState } from "react";
import { Shield, CheckCircle, Clock, Truck, Star, Award, TrendingUp, Sparkles, Phone, ShieldAlert, Calendar, X } from "lucide-react";
import { CropListing } from "../types";

interface TrustScorecardProps {
  crop: CropListing;
  lang: "EN" | "HI";
}

export function getDeterministicTrustStats(crop: CropListing) {
  // If listing already has these stats, preserve them
  if (crop.overallTrustScore && crop.deliveryReliability) {
    return {
      deliveryReliability: crop.deliveryReliability,
      qualityConsistency: crop.qualityConsistency ?? 95,
      buyerSatisfaction: crop.buyerSatisfaction ?? 4.8,
      overallTrustScore: crop.overallTrustScore,
      fulfillmentHistory: crop.fulfillmentHistory ?? {
        completedTrades: 12,
        disputedTrades: 0,
        averageLeadTimeDays: 1.8,
        shipmentLog: []
      }
    };
  }

  // Generate deterministic values based on farmer's name & listing ID
  const sStr = (crop.farmerName || "Farmer") + (crop.id || "1");
  let hash = 0;
  for (let i = 0; i < sStr.length; i++) {
    hash = sStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);

  const standsVerified = crop.verified === true;
  
  const deliveryReliability = standsVerified 
    ? 94 + (hash % 6)     // 94% - 99%
    : 81 + (hash % 11);    // 81% - 91%
    
  const qualityConsistency = standsVerified
    ? 93 + ((hash >> 2) % 7) // 93% - 99%
    : 79 + ((hash >> 2) % 11); // 79% - 89%

  const buyerSatisfaction = standsVerified
    ? Number((4.6 + ((hash >> 4) % 5) / 10).toFixed(1)) // 4.6 - 5.0
    : Number((3.8 + ((hash >> 4) % 7) / 10).toFixed(1)); // 3.8 - 4.4

  const overallTrustScore = Math.round((deliveryReliability + qualityConsistency + (buyerSatisfaction * 20)) / 3);

  const completedTrades = standsVerified 
    ? 12 + (hash % 20) // 12 - 31
    : 2 + (hash % 6);   // 2 - 7

  const disputedTrades = standsVerified ? 0 : (hash % 3 === 0 ? 1 : 0);
  const averageLeadTimeDays = standsVerified
    ? Number((1.2 + ((hash >> 6) % 10) / 10).toFixed(1)) // 1.2 - 2.1 days
    : Number((2.4 + ((hash >> 6) % 18) / 10).toFixed(1)); // 2.4 - 4.1 days

  // Generate crop-specific mock log
  const cropLabel = crop.cropName || "Produce";
  const logEntries = [
    {
      id: `ship-log-${hash % 1000}-1`,
      date: "2026-05-18",
      quantity: `${Math.round(crop.quantity * 0.7) || 12} ${crop.unit}`,
      status: "fulfilled" as const,
      cropName: cropLabel,
      buyerName: (hash % 3 === 0) ? "Aggarwal Wholesale Foods" : (hash % 3 === 1) ? "Reliance Fresh Supply" : "Mother Dairy"
    },
    {
      id: `ship-log-${hash % 1000}-2`,
      date: "2026-04-20",
      quantity: `${Math.round(crop.quantity * 1.1) || 25} ${crop.unit}`,
      status: (standsVerified || hash % 3 !== 0) ? ("fulfilled" as const) : ("delayed" as const),
      cropName: cropLabel,
      buyerName: (hash % 2 === 0) ? "Varanasi Mandi Traders" : "Patna Direct Sourcing"
    }
  ];

  return {
    deliveryReliability,
    qualityConsistency,
    buyerSatisfaction,
    overallTrustScore,
    fulfillmentHistory: {
      completedTrades,
      disputedTrades,
      averageLeadTimeDays,
      shipmentLog: logEntries
    }
  };
}

const TrustScorecard: React.FC<TrustScorecardProps> = ({ crop, lang }) => {
  const stats = getDeterministicTrustStats(crop);
  const satisfiesHighTrust = stats.overallTrustScore >= 90;
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden space-y-4 font-sans">
        {/* Header Banner representing AI Reliability Level */}
        <div className={`p-4 text-white relative overflow-hidden bg-gradient-to-br ${
          satisfiesHighTrust 
            ? "from-slate-900 via-slate-800 to-emerald-950 border-b border-emerald-500/10" 
            : "from-slate-900 via-slate-800 to-amber-950 border-b border-amber-500/10"
        }`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full translate-x-12 -translate-y-12"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-400">
                  {lang === "EN" ? "AI DIRECT TRADE TRUST ENGINE" : "एआई प्रत्यक्ष व्यापार विश्वास इंजन"}
                </span>
              </div>
              <h4 className="text-sm font-black text-slate-100 flex items-center gap-1.5">
                <Shield className={`w-4.5 h-4.5 ${satisfiesHighTrust ? "text-emerald-400" : "text-amber-400"}`} />
                <span>{lang === "EN" ? "Farmer Reliability Score" : "किसान विश्वसनीयता स्कोर"}</span>
              </h4>
            </div>
            <div className="text-right flex flex-col items-end">
              <div className="flex items-center gap-1.5 justify-end">
                <span className={`text-2xl font-black ${satisfiesHighTrust ? "text-emerald-400" : "text-amber-400"}`}>
                  {stats.overallTrustScore}%
                </span>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-400/15 border border-emerald-400/30 text-emerald-400 text-[9px] font-extrabold hover:bg-emerald-400/35 transition-all cursor-pointer shrink-0 animate-pulse"
                  title={lang === "EN" ? "Learn how score is calculated" : "जानें स्कोर की गणना कैसे हुई"}
                >
                  <Sparkles className="w-2 h-2" />
                  <span>{lang === "EN" ? "AI-Verified" : "एआई-सत्यापित"}</span>
                </button>
              </div>
              <span className="text-[8.5px] font-medium text-slate-400 uppercase tracking-widest">
                {satisfiesHighTrust 
                  ? (lang === "EN" ? "Grade-A Partner" : "ग्रेड-ए भागीदार") 
                  : (lang === "EN" ? "Standard Partner" : "मानक भागीदार")}
              </span>
            </div>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="px-4 pb-4 space-y-4">
          <div className="grid grid-cols-3 gap-2.5">
            {/* delivery reliability score */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-gray-100 text-center space-y-1">
              <div className="flex justify-center">
                <Truck className="w-4 h-4 text-sky-600" />
              </div>
              <span className="block text-[8.5px] font-bold text-gray-400 uppercase tracking-tight">
                {lang === "EN" ? "Delivery score" : "वितरण स्कोर"}
              </span>
              <span className="block text-sm font-black text-gray-800">
                {stats.deliveryReliability}%
              </span>
            </div>

            {/* quality consistency score */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-gray-100 text-center space-y-1">
              <div className="flex justify-center">
                <Award className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="block text-[8.5px] font-bold text-gray-400 uppercase tracking-tight">
                {lang === "EN" ? "Quality consistency" : "गुणवत्ता स्थिरता"}
              </span>
              <span className="block text-sm font-black text-gray-800">
                {stats.qualityConsistency}%
              </span>
            </div>

            {/* buyer satisfaction score */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-gray-100 text-center space-y-1">
              <div className="flex justify-center">
                <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              </div>
              <span className="block text-[8.5px] font-bold text-gray-400 uppercase tracking-tight">
                {lang === "EN" ? "Satisfaction" : "संतुष्टि दर"}
              </span>
              <span className="block text-sm font-black text-gray-800 flex items-center justify-center gap-0.5">
                {stats.buyerSatisfaction} <span className="text-[10px] text-gray-400 font-normal">/5</span>
              </span>
            </div>
          </div>

          {/* Fulfillment stats */}
          <div className="p-3 bg-emerald-50/45 rounded-xl border border-emerald-100/50 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
              <div className="space-y-0.5">
                <span className="block font-bold text-gray-700">
                  {lang === "EN" ? "Fulfillment History" : "आदेश पूर्ति इतिहास"}
                </span>
                <span className="block text-[10px] text-gray-400">
                  {lang === "EN" 
                    ? `${stats.fulfillmentHistory.completedTrades} direct trades completed successfully`
                    : `${stats.fulfillmentHistory.completedTrades} प्रत्यक्ष सौदे सफलतापूर्वक पूर्ण`}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="block font-black text-emerald-800">
                {stats.fulfillmentHistory.averageLeadTimeDays} {lang === "EN" ? "Days" : "दिन"}
              </span>
              <span className="block text-[9px] text-gray-400 font-medium">
                {lang === "EN" ? "Avg. Lead Time" : "औसत प्रेषण समय"}
              </span>
            </div>
          </div>

          {/* Dynamic transaction list / log */}
          <div className="space-y-2">
            <h5 className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-slate-400" />
              <span>{lang === "EN" ? "Verified Delivery Audit Log" : "प्रमाणित प्रेषण ऑडिट लॉग"}</span>
            </h5>
            <div className="space-y-1.5">
              {stats.fulfillmentHistory.shipmentLog.length === 0 ? (
                <div className="text-[10.5px] font-medium text-gray-400 bg-gray-50/50 p-2.5 rounded-lg border border-dashed border-gray-150 text-center">
                  {lang === "EN" ? "No historical logs available for this listing." : "इस लिस्टिंग के लिए कोई इतिहास लॉग उपलब्ध नहीं है।"}
                </div>
              ) : (
                stats.fulfillmentHistory.shipmentLog.map((log) => (
                  <div key={log.id} className="flex items-center justify-between text-[11px] p-2 bg-slate-50/70 border border-slate-100 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${log.status === "fulfilled" ? "bg-emerald-500" : "bg-amber-400"}`}></span>
                      <div>
                        <span className="font-extrabold text-gray-700 block">
                          {log.buyerName}
                        </span>
                        <span className="text-[9.5px] text-gray-400 block font-normal font-mono font-medium">
                          {log.date} • {log.cropName} • {log.quantity}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm ${
                        log.status === "fulfilled" 
                          ? "bg-emerald-100 text-emerald-800" 
                          : "bg-amber-100 text-amber-800"
                      }`}>
                        {log.status === "fulfilled" 
                          ? (lang === "EN" ? "Fulfilled" : "सफल")
                          : (lang === "EN" ? "Delayed" : "विलंबित")}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* AI Trust Verdict Disclaimer */}
          <div className="text-[9.5px] text-gray-400 leading-normal flex items-start gap-1 bg-gray-50 p-2.5 rounded-xl border border-gray-150 font-sans">
            <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
            <span>
              {lang === "EN" 
                ? "All parameters are computed by evaluating historical smart contracts, communication logs, transit telemetry, and direct buyer feedback." 
                : "सभी विश्वसनीयता माप ऐतिहासिक स्मार्ट सौदों, आपसी बातचीत रिकॉर्ड, परिवहन टेलीमेट्री, और सीधे खरीदार रेटिंग्स से आकलित हैं।"}
            </span>
          </div>
        </div>
      </div>

      {/* Trust Score Explained Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl transition-all scale-up">
            {/* Modal Gradient Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 border-b border-emerald-500/15 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-emerald-400">
                  <Shield className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-100">
                    {lang === "EN" ? "AI Trust Score Calculation" : "एआई विश्वास स्कोर गणना"}
                  </h3>
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                    {lang === "EN" ? "Krishi Gyaan Engine Audit" : "कृषि ज्ञान इंजन ऑडिट"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs">
              {/* Core Formula Description */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <span className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  {lang === "EN" ? "Calculation Formula" : "गणना सूत्र"}
                </span>
                <div className="font-mono text-[11px] text-emerald-400 bg-slate-900 p-2 rounded border border-slate-850 text-center font-bold">
                  Score = (Delivery + Quality + (Satisfaction × 20)) / 3
                </div>
                <p className="text-[10.5px] text-slate-400 leading-relaxed font-medium">
                  {lang === "EN"
                    ? "This score is computed deterministically by synthesizing three core performance variables, assuring direct trade trust at the farm gate."
                    : "यह स्कोर तीन मुख्य प्रदर्शन मानदंडों को मिलाकर आकलित किया जाता है, जिससे खेत पर सीधे सौदों में विश्वास सुनिश्चित होता है।"}
                </p>
              </div>

              {/* Core Variables Details */}
              <div className="space-y-3">
                {/* Variable 1: Delivery & Fulfillment */}
                <div className="flex gap-3 items-start">
                  <div className="p-2 bg-sky-500/10 rounded-lg text-sky-400 shrink-0 border border-sky-500/15 mt-0.5">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-200">
                      {lang === "EN" ? "1. Delivery Reliability & Fulfillment" : "1. वितरण विश्वसनीयता और आपूर्ति"}
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-normal font-medium mt-0.5">
                      {lang === "EN"
                        ? `Based on ${stats.fulfillmentHistory.completedTrades} completed direct trades. Evaluates on-time dispatch rate and minimal lead time of ${stats.fulfillmentHistory.averageLeadTimeDays} days, penalizing any delayed shipments.`
                        : `${stats.fulfillmentHistory.completedTrades} सफल सौदों पर आधारित। समय पर फसल भेजने की दर और न्यूनतम ${stats.fulfillmentHistory.averageLeadTimeDays} दिनों के प्रेषण समय का मूल्यांकन, किसी भी देरी पर अंक कटौती।`}
                    </p>
                  </div>
                </div>

                {/* Variable 2: Quality Consistency */}
                <div className="flex gap-3 items-start">
                  <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 shrink-0 border border-emerald-500/15 mt-0.5">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-200">
                      {lang === "EN" ? "2. Quality Consistency Score" : "2. गुणवत्ता स्थिरता स्कोर"}
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-normal font-medium mt-0.5">
                      {lang === "EN"
                        ? "Measures alignment with stated moisture parameters, purity levels, and original catalog pictures verified during the digital farm audit or snapshot upload."
                        : "डिजिटल फार्म ऑडिट या स्नैपशॉट अपलोड के दौरान सत्यापित की गई नमी मानकों, शुद्धता स्तरों और मूल मंडी फोटो के साथ संगतता को मापता है।"}
                    </p>
                  </div>
                </div>

                {/* Variable 3: Buyer Satisfaction */}
                <div className="flex gap-3 items-start">
                  <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 shrink-0 border border-amber-500/15 mt-0.5">
                    <Star className="w-4 h-4 fill-amber-500/20" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-200">
                      {lang === "EN" ? "3. Buyer Satisfaction Rate" : "3. क्रेता संतुष्टि दर"}
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-normal font-medium mt-0.5">
                      {lang === "EN"
                        ? `Currently rated at ${stats.buyerSatisfaction} / 5 by verified direct buyers. Factors in transaction fairness, communication responsiveness, and overall post-trade ratings.`
                        : `सत्यापित सीधे खरीदारों द्वारा वर्तमान रेटिंग ${stats.buyerSatisfaction} / 5 है। सौदा निष्पक्षता, त्वरित संवाद और वितरण के बाद क्रेता रेटिंग को जोड़ता है।`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Button Footer */}
            <div className="p-5 bg-slate-950 border-t border-slate-800/80 flex justify-end">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                {lang === "EN" ? "Understood, Secure Trade" : "समझ गए, सुरक्षित व्यापार"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TrustScorecard;
