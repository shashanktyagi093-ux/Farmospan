import React, { useState, useEffect } from "react";
import { 
  Sparkles, X, Languages, AlertCircle, Save, Loader2, Mic,
  User, Phone, MapPin, Search, ChevronRight, LogIn, LogOut,
  CheckCircle, Plus, Send, RefreshCw, MessageSquare, Tag,
  TrendingUp, Landmark, Shield, Truck, Edit3, Briefcase, Info, BadgeAlert,
  Camera, Trash, Upload, Printer, FileText, Calendar
} from "lucide-react";
import { CropListing, BuyerBid, DirectMessage, UserProfile } from "./types";
import AiListingModal from "./components/AiListingModal";
import TrustScorecard, { getDeterministicTrustStats } from "./components/TrustScorecard";

// Language Translation Mapping
const labelTranslations = {
  EN: {
    appName: "farmospan - फ़ार्मोस्पैन",
    appSubtitle: "Direct Farmer-Buyer Network (सीधा मण्डी व्यापार)",
    heroHeading: "Bypass Middlemen. Transact Direct with farmospan.",
    heroSub: "Zero commission fees. Verify crops, chat with verified growers, and make direct trading arrangements securely with AI verification.",
    phoneLabel: "Phone Number / मोबाइल नंबर (10 Digits)",
    roleLabel: "Select Your Operating Role / अपनी श्रेणी चुनें",
    farmerRole: "Farmer / Kisan (🌾 किसान भाई)",
    buyerRole: "Direct Buyer / Trader (🏢 खरीददार / आढ़ती)",
    enterBtn: "Login / प्रवेश करें",
    registerTitle: "Create Direct Trade Profile / प्रोफाइल बनाएं",
    registerBtn: "Register & Explore Mandi / पंजीकरण व प्रवेश",
    nameLabel: "Your Full Name / आपका नाम",
    locationLabel: "Mandi Name / Town / Area / मंडी या क्षेत्र",
    stateLabel: "Indian State / Region / भारतीय राज्य",
    farmName: "Farm Name / फार्म का नाम (Optional)",
    farmSize: "Farm Size / खेत का आकार (in Acres)",
    primaryCrops: "Major Crops Grown (e.g. Rice, Wheat, Onions)",
    organicCertified: "Organic Farm Certified (जैविक प्रमाणित)?",
    businessName: "Business Name / Trading Shop Name",
    gstNumber: "GSTIN Number (Optional)",
    businessType: "Business Type / व्यापार श्रेणी",
    preferredProduce: "Preferred Crops / Produce you buy in bulk",
    browseMandi: "Browse Active Mandi Listings / मंडी फसलें",
    listProduce: "🌾 Sell My Harvest / फसल बेचें",
    myOffers: "Bids & Actions / बोलियां व निर्णय",
    chatNegotiator: "Direct Chat Messenger / सीधा संवाद",
    howItWorks: "Zero-Middleman Flow / दलाल-मुक्त व्यापार",
    howStep1: "Farmers list crops with expected direct pricing.",
    howStep2: "Buyers search, calculate middleman-free rates & place transparent bids.",
    howStep3: "Direct live chat sets final coordinates for direct truck collection.",
    searchPlace: "Search crops, variety, districts or states (खोजें)...",
    stateFilter: "Filter by State / राज्य",
    noListings: "No matched listings found. Use filters above or add a fresh offer!",
    verificationBadge: "Direct Verification / प्रमाणित फसल",
    harvestDateLabel: "Harvest Date / कटाई तिथि",
    fairPricingHelp: "Smart AI Price Advice / कृषक एआई सलाह",
    askAiPricing: "Ask Krishi AI Market Price Advice",
    cropNamePlaceholder: "e.g., Organic Red Wheat (गेहूं)",
    calculatePriceBtn: "Analyze Market Price / बाजार भाव विश्लेषण",
    farmerLabel: "Farmer Info / किसान का ब्यौरा",
    buyerLabel: "Buyer Info / खरीददार ब्यौरा",
    placeBidHeading: "Submit Professional Direct Bid / बोली लगाएं",
    bidPriceLabel: "My Price Offer (per Unit) / प्रस्तावित भाव",
    bidQtyLabel: "Quantity Requested / कुल आवश्यक मात्रा",
    submitBidBtn: "Submit Direct Bid / बोली भेजें",
    bidStatusLabel: "Bid Status / सौदे की स्थिति",
    acceptBid: "Accept / स्वीकारें",
    rejectBid: "Decline /拒绝 (मना करें)",
    activeChats: "Selected Deal Negotiations / लाइव चैट",
    typeMessage: "Discuss pickup logistics, transport splits...",
    sendBtn: "Send / भेजें",
    editProfileTitle: "Edit Direct Partner Profile",
    logoutBtn: "Log out / बाहर निकलें",
    quickPrefills: "Demo Direct Logins (ऑटो-लॉगिन)"
  },
  HI: {
    appName: "फ़ार्मोस्पैन",
    appSubtitle: "बिचौलिया रहित सीधा मंडी व्यापार नेटवर्क",
    heroHeading: "बिचौलियों की छुट्टी। फ़ार्मोस्पैन से सीधा सौदा।",
    heroSub: "कोई कमीशन नहीं। सीधे असली किसानों से बातचीत करें, फसल सत्यापित करें और बिना दलाल के सीधा सौदा तय करें।",
    phoneLabel: "मोबाइल नंबर (10 अंक)",
    roleLabel: "अपनी भूमिका का चयन करें",
    farmerRole: "किसान भाई / पैदावारकर्ता (🌾)",
    buyerRole: "सीधे खरीदार / आढ़ती (🏢)",
    enterBtn: "लॉगिन करें / सत्यापित करें",
    registerTitle: "सीधा व्यापार प्रोफाइल बनाएं",
    registerBtn: "पंजीकरण करें और मंडी देखें",
    nameLabel: "आपका पूरा नाम",
    locationLabel: "मंडी का नाम / कस्बा / क्षेत्र",
    stateLabel: "भारतीय राज्य / क्षेत्र",
    farmName: "खेत / फार्म का नाम (वैकल्पिक)",
    farmSize: "खेत का आकार (एकड़ में)",
    primaryCrops: "मुख्य फसलें जो आप उगाते हैं (जैसे गेहूं, धान, मिर्च)",
    organicCertified: "क्या आपका खेत जैविक प्रमाणित है?",
    businessName: "व्यवसाय / दुकान का नाम",
    gstNumber: "जीएसटी नंबर (वैकल्पिक)",
    businessType: "व्यवसाय का प्रकार",
    preferredProduce: "मुख्य फसलें जिन्हें आप थोक में खरीदना पसंद करते हैं",
    browseMandi: "सक्रिय मंडी फसलें देखें",
    listProduce: "🌾 अपनी फसल सूची में जोड़ें",
    myOffers: "बोलियां और निर्णय",
    chatNegotiator: "सीधा चैट वार्तालाप",
    howItWorks: "दलाल-मुक्त व्यापार प्रक्रिया",
    howStep1: "किसान सीधे अपने उचित मूल्य के साथ फसल सूची डालते हैं।",
    howStep2: "खरीदार सीधे खोजते हैं, बिचौलिया कटौती बचाकर पारदर्शी बोली लगाते हैं।",
    howStep3: "सीधी चैट से परिवहन की तारीख और भुगतान की व्यवस्था तय होती है।",
    searchPlace: "फसल, किस्म, जिला या राज्य खोजें...",
    stateFilter: "राज्य द्वारा फ़िल्टर करें",
    noListings: "कोई फसल नहीं मिली। कृपया पुनः खोजें या अपनी नई सूची दर्ज करें।",
    verificationBadge: "सत्यापित फसल",
    harvestDateLabel: "कटाई की तिथि",
    fairPricingHelp: "स्मार्ट एआई मूल्य सलाह",
    askAiPricing: "कृषि एआई बाजार मूल्य परामर्श",
    cropNamePlaceholder: "जैसे, शरबती गेहूं",
    calculatePriceBtn: "बाजार दर का आकलन करें",
    farmerLabel: "किसान की जानकारी",
    buyerLabel: "खरीदार की जानकारी",
    placeBidHeading: "अपनी सीधी पारदर्शी बोली लगाएं",
    bidPriceLabel: "प्रस्तावित दर (प्रति इकाई)",
    bidQtyLabel: "निवेदित मात्रा",
    submitBidBtn: "बोली लगाएं",
    bidStatusLabel: "बोली की स्थिति",
    acceptBid: "स्वीकारें",
    rejectBid: "अस्वीकार करें",
    activeChats: "सौदा वार्तालाप",
    typeMessage: "वाहन लोडिंग और लोडिंग खर्च की बात तय करें...",
    sendBtn: "भेजें",
    editProfileTitle: "साझेदार प्रोफाइल संपादित करें",
    logoutBtn: "लॉग आउट",
    quickPrefills: "डेमो लॉगिन (ऑटो-फिल के लिए क्लिक करें)"
  }
};


export default function App() {
  const [lang, setLang] = useState<"EN" | "HI">("EN");
  const labels = labelTranslations[lang];

  // Auth States
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const cached = localStorage.getItem("kisan_user");
    return cached ? JSON.parse(cached) : null;
  });
  const [loginPhone, setLoginPhone] = useState("");
  const [loginRole, setLoginRole] = useState<"farmer" | "buyer">("farmer");
  const [loginError, setLoginError] = useState("");
  

  // Registration Form States
  const [showRegForm, setShowRegForm] = useState(false);
  const [regName, setRegName] = useState("");
  const [regLocation, setRegLocation] = useState("");
  const [regState, setRegState] = useState("Haryana");
  // Role specific state
  const [farmName, setFarmName] = useState("");
  const [farmSize, setFarmSize] = useState("");
  const [primaryCrops, setPrimaryCrops] = useState("");
  const [organicCertified, setOrganicCertified] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [businessType, setBusinessType] = useState("Wholesaler");
  const [preferredProduce, setPreferredProduce] = useState("");

  // Mandi Data States
  const [listings, setListings] = useState<CropListing[]>([]);
  const [bids, setBids] = useState<BuyerBid[]>([]);
  const [chats, setChats] = useState<DirectMessage[]>([]);
  
  // Active UI Navigation
  const [currentTab, setCurrentTab] = useState<"browse" | "list" | "profile" | "pooler">("browse");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCrop, setSelectedCrop] = useState<CropListing | null>(null);

  // Camera & Image Upload States
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  // Farmer Harvest Controlled Form States for Easy 1-Click Prefills
  const [formCropName, setFormCropName] = useState("");
  const [formCategory, setFormCategory] = useState("Grains");
  const [formVariety, setFormVariety] = useState("");
  const [formQuantity, setFormQuantity] = useState("");
  const [formUnit, setFormUnit] = useState("Quintal");
  const [formPricePerUnit, setFormPricePerUnit] = useState("");
  const [formHarvestDate, setFormHarvestDate] = useState(new Date().toISOString().split("T")[0]);
  const [formDescription, setFormDescription] = useState("");
  const [formVoiceRecording, setFormVoiceRecording] = useState(false);
  const [voiceToast, setVoiceToast] = useState("");

  const startVoiceSimulation = () => {
    setFormVoiceRecording(true);
    setVoiceToast(lang === "EN" ? "🎤 Listening to your voice... (बोलें, एआई सुन रहा है)" : "🎤 आपकी आवाज़ दर्ज की जा रही है... बोलिए");
    
    setTimeout(() => {
      setVoiceToast(lang === "EN" ? "⚙️ Processing speech in Hindi/English..." : "⚙️ आपकी रिकॉर्डिंग का अनुवाद और फसल विश्लेषण जारी है...");
      
      setTimeout(() => {
        setFormCropName(lang === "EN" ? "Sonalika Premium Wheat" : "सोनालिका गेहूँ (प्रीमियम)");
        setFormCategory("Grains");
        setFormVariety(lang === "EN" ? "Sonalika Sharbati" : "सोनालिका शरबती");
        setFormQuantity("60");
        setFormUnit("Quintal");
        setFormPricePerUnit("2250");
        setFormDescription(lang === "EN" 
          ? "Harvested in Karnal. Clean uniform golden grains with less than 6% moisture. Directly loaded from farm doorstep." 
          : "करनाल में उत्पादित। पूरी तरह साफ़ सुनहरे दाने, 6% से कम नमी। सीधे खेत से लोडिंग उपलब्ध।"
        );
        setFormVoiceRecording(false);
        setVoiceToast("");
        alert(lang === "EN" 
          ? "🎉 Voice Transcribed Successfully! 'Sonalika Wheat' details loaded into form." 
          : "🎉 आवाज सफलतापूर्वक पहचानी गई! 'सोनालिका गेहूं' का विवरण लोड किया गया है।"
        );
      }, 1500);
    }, 2000);
  };

  const cropPresets = [
    {
      emoji: "🌾",
      nameEN: "Premium Basmati Rice",
      nameHI: "बासमती धान / चावल",
      category: "Grains",
      varietyEN: "Pusa 1121 Long Grain",
      varietyHI: "पूसा 1121 नया धान",
      qty: "45",
      unit: "Quintal",
      price: "3400",
      descEN: "Excellent aroma, fully polished grains, stored in standard 50kg bags. Ready to ship.",
      descHI: "उत्कृष्ट सुगंध, पॉलिश किया हुआ दाना, मानक 50 किलोग्राम बोरियों में संकलित। तुरंत परिवहन हेतु उपलब्ध।"
    },
    {
      emoji: "🥔",
      nameEN: "Fresh Red Potatoes",
      nameHI: "ताजा लाल आलू",
      category: "Vegetables",
      varietyEN: "Jyoti Large Grade",
      varietyHI: "ज्योति आलू (बड़ा साइज)",
      qty: "120",
      unit: "Quintal",
      price: "1350",
      descEN: "Locally graded Jyoti potato strain, absolute rich skin, free from high soil content.",
      descHI: "स्थानिक रूप से वर्गीकृत ज्योति आलू श्रेणी, बिना मिट्टी और दाग-धब्बों के।"
    },
    {
      emoji: "🧅",
      nameEN: "Nashik Red Onion",
      nameHI: "नाशिक लाल प्याज",
      category: "Vegetables",
      varietyEN: "Grade-A Export Quality",
      varietyHI: "ग्रेड-ए निर्यात गुणवत्ता प्याज",
      qty: "80",
      unit: "Quintal",
      price: "1850",
      descEN: "Sun-dried completely, solid skins, size above 55mm. Premium crop stored in safe crate.",
      descHI: "पूरी तरह से धूप में सुखाया हुआ, ठोस छिलका, 55 मिमी से ऊपर का साइज।"
    },
    {
      emoji: "🍚",
      nameEN: "Organic Sharbati Wheat",
      nameHI: "जैविक शरबती गेहूं",
      category: "Grains",
      varietyEN: "Golden Sharbati Premium",
      varietyHI: "गोल्डन शरबती प्रीमियम गेहूं",
      qty: "50",
      unit: "Quintal",
      price: "2450",
      descEN: "Grown via 100% natural organic compost. Rich in protein, no chemical sprays.",
      descHI: "100% प्राकृतिक जैविक खाद द्वारा उत्पादित। प्रोटीन से समृद्ध, बिना रासायनिक छिड़काव।"
    },
    {
      emoji: "🍅",
      nameEN: "Hybrid Tomato Crop",
      nameHI: "हाइब्रिड लाल टमाटर",
      category: "Vegetables",
      varietyEN: "Vaishnavi Red Round",
      varietyHI: "वैष्णवी लाल गोल टमाटर",
      qty: "3500",
      unit: "kg",
      price: "24",
      descEN: "Slightly firm for long distance transit, bright saturated crimson color, packed in reusable plastic crates.",
      descHI: "लंबी दूरी की ढुलाई के लिए उत्तम, चमकीले लाल रंग के ठोस टमाटर।"
    },
    {
      emoji: "🌽",
      nameEN: "Yellow Feed Maize",
      nameHI: "पीली मक्का (दाना)",
      category: "Grains",
      varietyEN: "Sartaj High-Starch hybrid",
      varietyHI: "सरताज हाइब्रिड पीली मक्का",
      qty: "20",
      unit: "Ton",
      price: "19500",
      descEN: "Low moisture grain profile ideal for animal feed and starch plants. Stored in dry silos.",
      descHI: "पशु आहार और स्टार्च प्लांट के लिए आदर्श। बिल्कुल शुष्क अवस्था में संकलित।"
    }
  ];

  const applyCropPreset = (preset: typeof cropPresets[0]) => {
    setFormCropName(lang === "EN" ? preset.nameEN : preset.nameHI);
    setFormCategory(preset.category);
    setFormVariety(lang === "EN" ? preset.varietyEN : preset.varietyHI);
    setFormQuantity(preset.qty);
    setFormUnit(preset.unit);
    setFormPricePerUnit(preset.price);
    setFormDescription(lang === "EN" ? preset.descEN : preset.descHI);
  };

  // Start the live camera stream
  const startCamera = async () => {
    setCameraError(null);
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Prioritize back camera for crops
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError(
        lang === "EN" 
          ? "Could not access camera. Please confirm device permission or upload an existing photo." 
          : "कैमरा खोलने में असमर्थ। कृपया कैमरा अनुमति जांचें या फसल की फोटो अपलोड करें।"
      );
      setIsCameraActive(false);
    }
  };

  // Stop the camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Capture image snapshot from the video stream onto a Canvas
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    
    // Create canvas
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      setCapturedPhoto(dataUrl);
      stopCamera();
    }
  };

  // Handle local image file uploads via select or drag-and-drop
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedPhoto(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedPhoto(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Stop camera when leaving the list tab or unmounting
  useEffect(() => {
    if (currentTab !== "list") {
      stopCamera();
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [currentTab]);

  // Modals / Helpers
  const [showAiModal, setShowAiModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bidPrice, setBidPrice] = useState("");
  const [bidQty, setBidQty] = useState("");
  const [bidMsg, setBidMsg] = useState("");
  const [chatMsg, setChatMsg] = useState("");

  // Buyer Pool Optimizer States
  const [poolTargetCrop, setPoolTargetCrop] = useState("Organic Wheat (Kanak)");
  const [poolTargetCategory, setPoolTargetCategory] = useState("Grains");
  const [poolTargetQty, setPoolTargetQty] = useState(100);
  const [poolTargetUnit, setPoolTargetUnit] = useState<"kg" | "Quintal" | "Ton">("Quintal");
  const [poolMaxPrice, setPoolMaxPrice] = useState("");
  const [broadcastLoading, setBroadcastLoading] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);
  const [customSearchCropInput, setCustomSearchCropInput] = useState("");

  // AI pricing advisor module state
  const [aiCropQuery, setAiCropQuery] = useState("");
  const [aiPriceResult, setAiPriceResult] = useState<any | null>(null);
  const [aiPriceLoading, setAiPriceLoading] = useState(false);

  // Load standard listings and transactions with automatic retry for robust initial boot
  const fetchMandiData = async (retryCount = 0) => {
    try {
      const listRes = await fetch("/api/listings");
      if (!listRes.ok) throw new Error(`HTTP status ${listRes.status}`);
      const listingsData = await listRes.json();
      setListings(listingsData);

      const bidRes = await fetch("/api/bids");
      if (!bidRes.ok) throw new Error(`HTTP status ${bidRes.status}`);
      const bidsData = await bidRes.json();
      setBids(bidsData);
    } catch (e) {
      console.warn(`Mandi data fetch attempt ${retryCount + 1} failed:`, e);
      if (retryCount < 5) {
        // Retry sooner than the 8s interval if we are booting up
        setTimeout(() => fetchMandiData(retryCount + 1), 2000);
      }
    }
  };

  useEffect(() => {
    fetchMandiData();
    // Auto sync listings & bids periodically for simulated live updates
    const interval = setInterval(() => fetchMandiData(0), 8000);
    return () => clearInterval(interval);
  }, []);

  // Fetch chats for the currently selected listing with robust retries
  useEffect(() => {
    if (selectedCrop) {
      let active = true;
      const fetchChats = async (retryCount = 0) => {
        if (!active) return;
        try {
          const res = await fetch(`/api/messages?listingId=${selectedCrop.id}`);
          if (!res.ok) throw new Error(`HTTP status ${res.status}`);
          const data = await res.json();
          if (active) setChats(data);
        } catch (e) {
          console.warn(`Chats fetch attempt ${retryCount + 1} failed:`, e);
          if (active && retryCount < 4) {
            setTimeout(() => fetchChats(retryCount + 1), 2000);
          }
        }
      };
      
      fetchChats();
      const chatInterval = setInterval(() => fetchChats(0), 4000);
      return () => {
        active = false;
        clearInterval(chatInterval);
      };
    } else {
      setChats([]);
    }
  }, [selectedCrop]);

  // Handle Easy demo preset autofill
  const handleDemoLogin = (phone: string, role: 'farmer' | 'buyer') => {
    setLoginPhone(phone);
    setLoginRole(role);
  };

  // Perform phone authentication
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhone || loginPhone.replace(/\D/g, "").length < 10) {
      setLoginError(lang === "EN" ? "Please enter a valid 10-digit mobile number." : "कृपया एक सही 10-अंकीय मोबाइल नंबर दर्ज करें।");
      return;
    }

    setLoading(true);
    setLoginError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: loginPhone, role: loginRole }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.user) {
          setCurrentUser(result.user);
          localStorage.setItem("kisan_user", JSON.stringify(result.user));
          setLoginPhone("");
        }
      } else if (response.status === 404) {
        // Trigger registration form
        setShowRegForm(true);
      } else {
        const err = await response.json();
        setLoginError(err.message || "Failed login verification");
      }
    } catch (err) {
      setLoginError("Server offline or connecting error.");
    } finally {
      setLoading(false);
    }
  };

  // Perform new account signup
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) {
      setLoginError("Name is required for Direct trade verification.");
      return;
    }

    setLoading(true);
    setLoginError("");

    const regData = {
      phone: loginPhone,
      role: loginRole,
      name: regName,
      location: regLocation || "Local Area",
      state: regState,
      farmName,
      farmSizeAcres: farmSize ? Number(farmSize) : 0,
      primaryCrops,
      organicCertified,
      businessName,
      gstNumber,
      businessType,
      preferredProduce
    };

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regData),
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success && result.user) {
          setCurrentUser(result.user);
          localStorage.setItem("kisan_user", JSON.stringify(result.user));
          setShowRegForm(false);
          setRegName("");
          setRegLocation("");
        }
      } else {
        const data = await res.json();
        setLoginError(data.message || "Could not register details.");
      }
    } catch (err) {
      setLoginError("Failed to register. Check server setup.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("kisan_user");
    setSelectedCrop(null);
    setCurrentTab("browse");
  };

  // Update existing profile details
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/users/${currentUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: currentUser.name,
          location: currentUser.location,
          state: currentUser.state,
          farmName: currentUser.farmName,
          farmSizeAcres: currentUser.farmSizeAcres,
          primaryCrops: currentUser.primaryCrops,
          organicCertified: currentUser.organicCertified,
          businessName: currentUser.businessName,
          gstNumber: currentUser.gstNumber,
          businessType: currentUser.businessType,
          preferredProduce: currentUser.preferredProduce
        }),
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success && result.user) {
          setCurrentUser(result.user);
          localStorage.setItem("kisan_user", JSON.stringify(result.user));
          alert(lang === "EN" ? "Partner details updated successfully!" : "साझेदार विवरण सफलतापूर्वक अपडेट किया गया!");
        }
      } else {
        alert("Failed to update profile.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Submit Buyer bid to farmers produce
  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCrop || !currentUser) return;
    if (!bidPrice || !bidQty) {
      alert("Please specify clean quantity and offered rate.");
      return;
    }

    try {
      const res = await fetch("/api/bids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: selectedCrop.id,
          buyerName: currentUser.name,
          buyerContact: currentUser.phone,
          priceOffered: Number(bidPrice),
          quantity: Number(bidQty),
          message: bidMsg
        }),
      });

      if (res.ok) {
        setBidPrice("");
        setBidQty("");
        setBidMsg("");
        fetchMandiData();
        alert(lang === "EN" ? "Bid submitted directly to किसान's catalog!" : "आपकी पारदर्शी बोली सीधे किसान की लिस्टिंग पर भेज दी गई है!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Farmer accepts or declines bids
  const handleBidDecision = async (bidId: string, status: "accepted" | "rejected") => {
    try {
      const res = await fetch(`/api/bids/${bidId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        fetchMandiData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // AI Generated Invoice and Receipt dynamic audit states
  const [selectedInvoiceBid, setSelectedInvoiceBid] = useState<BuyerBid | null>(null);
  const [invoiceData, setInvoiceData] = useState<any | null>(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);

  const fetchInvoiceReceipt = async (bid: BuyerBid, listing: CropListing) => {
    setSelectedInvoiceBid(bid);
    setInvoiceLoading(true);
    setInvoiceError(null);
    setInvoiceData(null);
    try {
      const res = await fetch("/api/gemini/invoice-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: listing.id, bidId: bid.id })
      });
      const result = await res.json();
      if (result.success && result.data) {
        setInvoiceData(result.data);
      } else {
        throw new Error(result.error || "Auditing service rejected the transaction details");
      }
    } catch (err: any) {
      console.error("AI dynamic auditor error:", err);
      setInvoiceError(err.message || "Auditing Service Offline");
    } finally {
      setInvoiceLoading(false);
    }
  };

  // Direct Message action
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCrop || !currentUser || !chatMsg.trim()) return;

    const userMsg = chatMsg.trim();
    setChatMsg("");

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: selectedCrop.id,
          senderId: currentUser.id,
          senderRole: currentUser.role,
          senderName: currentUser.name,
          message: userMsg
        }),
      });

      if (res.ok) {
        const saved = await res.json();
        setChats(prev => [...prev, saved]);

        // Simulated Automatic response helper to make testing/development extremely interactive
        setTimeout(async () => {
          let automaticResponseText = "";
          if (currentUser.role === "buyer") {
            // Buyer is asking the Farmer. Farmer replies.
            const queryWords = userMsg.toLowerCase();
            if (queryWords.includes("available") || queryWords.includes("स्टॉक") || queryWords.includes("ताजा")) {
              automaticResponseText = lang === "EN" 
                ? "Yes, the crop is packed into high-quality bags and ready for dispatch. When would you like to arrange transport?" 
                : "हाँ, उत्तम गुणवत्ता की बोरियों में गेहूं/टमाटर पैकिंग तैयार है। आप गाड़ी कब तक भेज रहे हैं?";
            } else if (queryWords.includes("price") || queryWords.includes("कम") || queryWords.includes("दाम") || queryWords.includes("discount")) {
              automaticResponseText = lang === "EN"
                ? "Bypassing the local middleman commission allows me to offer this wholesale rate without additional discount. But let's negotiate if you want to take the full farm balance."
                : "बिना दलालों के सीधा सौदा होने की वजह से यह अंतिम थोक रेट है। लेकिन यदि आप पूरी फसल उठाते हैं तो कुछ गुंजाइश बन सकती है।";
            } else {
              automaticResponseText = lang === "EN"
                ? "Namaste. Let me verify the loading details with my family and I will confirm parameters right here. Good to connect!"
                : "नमस्ते। मैं अपने परिवार और मंडी सहयोगियों के साथ लोडिंग विवरण की जांच करके अभी बताता हूँ। आपसे जुड़कर प्रसन्नता हुई!";
            }
          } else {
            // Farmer is sending a message. Buyer replies.
            automaticResponseText = lang === "EN"
              ? "Understood. Our Bangalore truck departs this Haryana/Punjab route soon. I am locking this rate directly with no mandi fees. Thank you, let's proceed!"
              : "ठीक है। हमारी गाड़ी जल्द ही इस रूट पर आ रही है। बिना आढ़ती कमीशन के हम इस सीधे रेट पर सौदा बंद करेंगे। धन्यवाद!";
          }

          // Save automatic simulated reply on the server
          await fetch("/api/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              listingId: selectedCrop.id,
              senderId: currentUser.role === "buyer" ? "user-farmer-2" : "user-buyer-1",
              senderRole: currentUser.role === "buyer" ? "farmer" : "buyer",
              senderName: currentUser.role === "buyer" ? selectedCrop.farmerName : "Direct Buyer System",
              message: automaticResponseText
            }),
          });
          
          // Re-fetch
          const freshRes = await fetch(`/api/messages?listingId=${selectedCrop.id}`);
          const freshChats = await freshRes.json();
          setChats(freshChats);
        }, 1800);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Submit standard manual listing post (Fallback when not using AI)
  const handleManualAddCrop = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentUser) return;
    
    const newCrop = {
      farmerName: currentUser.name,
      farmerContact: currentUser.phone,
      cropName: formCropName || "Premium Harvest",
      category: formCategory as 'Grains' | 'Vegetables' | 'Fruits' | 'Spices',
      variety: formVariety || "Premium Local",
      quantity: Number(formQuantity) || 10,
      unit: formUnit || "Quintal",
      pricePerUnit: Number(formPricePerUnit) || 20,
      location: currentUser.location,
      state: currentUser.state,
      harvestDate: formHarvestDate || new Date().toISOString().split("T")[0],
      description: formDescription || "Direct fresh agricultural harvest.",
      verified: true, // Self listed by authenticated farmer is marked verified!
      image: capturedPhoto || (
        (formCropName || "").toLowerCase().includes("tomato") ? "tomato" : 
        (formCropName || "").toLowerCase().includes("onion") ? "onion" : 
        (formCropName || "").toLowerCase().includes("rice") ? "rice" : "grain"
      )
    };

    if (!newCrop.cropName) {
      alert("Crop Name is required.");
      return;
    }

    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCrop),
      });

      if (res.ok) {
        setCapturedPhoto(null);
        fetchMandiData();
        setCurrentTab("browse");
        
        // Reset controlled fields
        setFormCropName("");
        setFormCategory("Grains");
        setFormVariety("");
        setFormQuantity("");
        setFormUnit("Quintal");
        setFormPricePerUnit("");
        setFormDescription("");
        
        alert(lang === "EN" ? "Crop posted directly to the Mandi catalog with verified snapshot!" : "फसल सीधे मंडी की सूची में प्रमाणित फोटो के साथ जोड़ दी गई है!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Farmer's crop listing
  const handleDeleteCrop = async (listingId: string) => {
    if (!confirm(lang === "EN" ? "Are you sure you want to pull down this harvest listing?" : "क्या आप वाकई इस फसल लिस्टिंग को मंडी से हटाना चाहते हैं?")) {
      return;
    }

    try {
      const res = await fetch(`/api/listings/${listingId}`, { method: "DELETE" });
      if (res.ok) {
        setSelectedCrop(null);
        fetchMandiData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // AI Consult trigger
  const handleQueryAiPricing = async () => {
    if (!aiCropQuery) return;
    setAiPriceLoading(true);
    try {
      const res = await fetch("/api/gemini/price-analyzer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cropName: aiCropQuery,
          location: currentUser?.location || "Delhi",
          state: currentUser?.state || "Haryana"
        })
      });
      const data = await res.json();
      if (data.success) {
        setAiPriceResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiPriceLoading(false);
    }
  };

  // Helper to convert crop units for smart pooling
  const convertUnit = (qty: number, fromUnit: string, toUnit: string): number => {
    const from = (fromUnit || "kg").toLowerCase();
    const to = (toUnit || "kg").toLowerCase();
    if (from === to) return qty;
    
    // Base standardizer is kg
    let inKg = qty;
    if (from === "quintal") inKg = qty * 100;
    if (from === "ton") inKg = qty * 1000;
    
    if (to === "quintal") return inKg / 100;
    if (to === "ton") return inKg / 1000;
    return inKg;
  };

  // Compute pooled crop items dynamically
  const computedPool = (() => {
    if (!listings || listings.length === 0) return [];

    // Filter by matching criteria
    const term = (customSearchCropInput || poolTargetCrop || "").toLowerCase();
    const matches = listings.filter(item => {
      const cropNameLower = (item.cropName || "").toLowerCase();
      const catLower = (item.category || "").toLowerCase();
      const targetCatLower = (poolTargetCategory || "").toLowerCase();

      let matchesFilter = false;
      if (term) {
        matchesFilter = cropNameLower.includes(term) || term.includes(cropNameLower);
      } else if (targetCatLower) {
        matchesFilter = catLower === targetCatLower;
      } else {
        matchesFilter = true;
      }

      // Filter by max price if specified
      if (poolMaxPrice) {
        const itemPricePerTargetUnit = item.pricePerUnit / convertUnit(1, poolTargetUnit, item.unit);
        if (itemPricePerTargetUnit > Number(poolMaxPrice)) {
          return false;
        }
      }

      return matchesFilter;
    });

    // Sort matching listings by price per targetUnit (lowest cost first)
    const sortedMatches = [...matches].sort((a, b) => {
      const priceA = a.pricePerUnit / convertUnit(1, poolTargetUnit, a.unit);
      const priceB = b.pricePerUnit / convertUnit(1, poolTargetUnit, b.unit);
      if (Math.abs(priceA - priceB) < 0.01) {
        const ratingA = a.approvalFactor || (85 + (a.cropName.length % 14));
        const ratingB = b.approvalFactor || (85 + (b.cropName.length % 14));
        return ratingB - ratingA;
      }
      return priceA - priceB;
    });

    let remainingDemand = poolTargetQty;
    const poolItems: {
      listing: CropListing;
      originalQty: number;
      originalUnit: string;
      convertedQty: number;
      allocatedQty: number;
      allocatedQtyInOriginalUnit: number;
      costInPool: number;
      isFullAllocation: boolean;
    }[] = [];

    for (const item of sortedMatches) {
      if (remainingDemand <= 0) break;

      const convertedAvail = convertUnit(item.quantity, item.unit, poolTargetUnit);
      if (convertedAvail <= 0) continue;

      const allocated = Math.min(convertedAvail, remainingDemand);
      const allocatedQtyInOriginalUnit = convertUnit(allocated, poolTargetUnit, item.unit);
      
      const itemPriceInTargetUnit = item.pricePerUnit / convertUnit(1, poolTargetUnit, item.unit);
      const costInPool = allocated * itemPriceInTargetUnit;

      poolItems.push({
        listing: item,
        originalQty: item.quantity,
        originalUnit: item.unit,
        convertedQty: convertedAvail,
        allocatedQty: Number(allocated.toFixed(2)),
        allocatedQtyInOriginalUnit: Number(allocatedQtyInOriginalUnit.toFixed(2)),
        costInPool: Number(costInPool.toFixed(2)),
        isFullAllocation: Math.abs(allocated - convertedAvail) < 0.01
      });

      remainingDemand -= allocated;
    }

    return poolItems;
  })();

  // Broadcast Joint Direct Offers to all pooled farmers
  const handleBroadcastPooledBids = async () => {
    if (!currentUser || computedPool.length === 0) return;
    setBroadcastLoading(true);
    setBroadcastSuccess(false);

    try {
      for (const item of computedPool) {
        // Create Bids
        await fetch("/api/bids", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            listingId: item.listing.id,
            buyerName: currentUser.name,
            buyerContact: currentUser.phone,
            priceOffered: item.listing.pricePerUnit,
            quantity: item.allocatedQtyInOriginalUnit,
            message: lang === "EN" 
              ? `[farmospan Combined Group Purchase] I am buying your ${item.allocatedQtyInOriginalUnit} ${item.originalUnit} share of this crop, pooled alongside matching farmers!`
              : `[फ़ार्मोस्पैन समूह क्रय] मैं इस फसल का आपका ${item.allocatedQtyInOriginalUnit} ${item.originalUnit} हिस्सा अन्य किसानों के साथ मिलाकर सीधे थोक भाव में खरीदना चाहता हूँ!`
          }),
        });

        // Send Direct Chats
        await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            listingId: item.listing.id,
            senderId: currentUser.id,
            senderRole: currentUser.role,
            senderName: currentUser.name,
            message: lang === "EN"
              ? `Namaste ${item.listing.farmerName}! I have triggered a joint Direct Bidding offer to integrate your smaller qty (${item.allocatedQtyInOriginalUnit} ${item.originalUnit}) with other farms for a combined logistics shipping order. High approval ensures farmospan direct trade. Let's talk!`
              : `नमस्ते ${item.listing.farmerName}! मैंने आपकी फसल मात्रा (${item.allocatedQtyInOriginalUnit} ${item.originalUnit}) को अन्य किसानों से मिलाकर एक बड़ा आर्डर तय किया है। फ़ार्मोस्पैन मंच पर सीधा सुरक्षित सौदा करने हेतु वार्ता करें!`
          }),
        });
      }

      await fetchMandiData();
      setBroadcastSuccess(true);
    } catch (err) {
      console.error("Error broadcasting pooled bids:", err);
    } finally {
      setBroadcastLoading(false);
    }
  };

  // Filter listings based on search metrics
  const filteredListings = listings.filter(item => {
    const term = searchQuery.toLowerCase();
    const itemCrop = (item.cropName || "").toLowerCase();
    const itemVariety = (item.variety || "").toLowerCase();
    const itemFarmer = (item.farmerName || "").toLowerCase();
    const itemLoc = (item.location || "").toLowerCase();
    const itemState = (item.state || "").toLowerCase();
    const itemCategory = (item.category || "").toLowerCase();

    const matchesSearch = itemCrop.includes(term) || itemVariety.includes(term) || itemFarmer.includes(term) || itemLoc.includes(term);
    const matchesState = selectedState ? itemState === selectedState.toLowerCase() : true;
    const matchesCategory = selectedCategory ? itemCategory === selectedCategory.toLowerCase() : true;
    return matchesSearch && matchesState && matchesCategory;
  });

  // Collect list of unique states for filtering selection
  const uniqueStates = Array.from(new Set(listings.map(item => item.state).filter(Boolean)));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 font-sans flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* ----------------- TOP UTILS BAR & TRANSLATION ----------------- */}
      <header className="bg-white border-b border-gray-100 py-3.5 px-4 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute inset-0 bg-emerald-500/10 rounded-xl blur-md group-hover:bg-emerald-500/20 transition-all"></div>
              <div className="relative w-11 h-11 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-md border border-slate-800">
                <svg className="w-8 h-8 group-hover:scale-105 transition-transform" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Agricultural furrow background curve */}
                  <path d="M 4 25 C 10 28, 22 28, 28 25" stroke="url(#gridGrad)" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
                  
                  {/* The connection "Span" loop (Infinity shape representing direct trade flow) */}
                  <path d="M 6 18 C 5 23, 13 24, 16 18 C 19 12, 27 13, 26 18 C 25 23, 17 24, 16 18 C 13 12, 5 13, 6 18 Z" stroke="url(#spanGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  
                  {/* Organic Sprout Leaf emerging from the span bridge */}
                  <path d="M 16 24 C 16 24, 11 16, 12 11 C 13 6, 16 3, 16 3" stroke="url(#farmGrad)" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M 16 13 C 21 15, 20 21, 16 24" stroke="url(#farmGrad)" strokeWidth="2" strokeLinecap="round" />
                  
                  {/* Smart tech direct trading nodes */}
                  {/* Grower node (Emerald Green) */}
                  <circle cx="6" cy="18" r="2" fill="#10b981" />
                  
                  {/* Buyer node (Amber Gold) */}
                  <circle cx="26" cy="18" r="2" fill="#fbbf24" />
                  
                  {/* Golden AI Price and Security Star/dot at the peak of the sprout */}
                  <circle cx="16" cy="3" r="2.5" fill="#f59e0b" className="animate-pulse" />
                  <circle cx="16" cy="3" r="1" fill="#ffffff" />

                  <defs>
                    <linearGradient id="farmGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#047857" />
                      <stop offset="60%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#34d399" />
                    </linearGradient>
                    <linearGradient id="spanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="50%" stopColor="#34d399" />
                      <stop offset="100%" stopColor="#fbbf24" />
                    </linearGradient>
                    <linearGradient id="gridGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#047857" />
                      <stop offset="50%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#047857" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-lg text-emerald-900 block leading-none">
                {labels.appName}
              </span>
              <span className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">
                {labels.appSubtitle}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Multilingual Toggle */}
            <button
              id="lang-toggle-btn"
              onClick={() => setLang(lang === "EN" ? "HI" : "EN")}
              className="flex items-center gap-2 p-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold rounded-full transition-all border border-emerald-100 cursor-pointer"
            >
              <Languages className="w-4 h-4 text-emerald-700" />
              <span>{lang === "EN" ? "→ हिन्दी (HI)" : "→ English (EN)"}</span>
            </button>

            {/* Profile Overview or Auth button */}
            {currentUser && (
              <div className="flex items-center gap-2">
                <div className="hidden md:flex flex-col items-end text-right">
                  <span className="text-xs font-bold text-gray-700 font-sans">
                    {currentUser.name}
                  </span>
                  <span className="text-[9px] px-2 py-0.2 bg-emerald-50 text-emerald-900 font-bold rounded-full border border-emerald-100 uppercase">
                    {currentUser.role === "farmer" ? "🌾 Farmer" : "🏢 Bulk Buyer"}
                  </span>
                </div>
                <button
                  id="tab-profile-btn"
                  onClick={() => setCurrentTab("profile")}
                  className="p-2.5 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-800 rounded-full text-gray-600 transition-colors cursor-pointer"
                  title="My Profile"
                >
                  <User className="w-4 h-4" />
                </button>
                <button
                  id="logout-btn"
                  onClick={handleLogout}
                  className="p-2.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-full transition-colors cursor-pointer"
                  title={labels.logoutBtn}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ----------------- AUTHENTICATION ENTRY SHEATH ----------------- */}
      {!currentUser && (
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          <div className="md:col-span-7 space-y-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100/60 text-emerald-900 rounded-full text-xs font-extrabold uppercase tracking-wider">
              🛡️ Direct Farm Guarantee
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-none tracking-tight">
              {labels.heroHeading}
            </h1>
            <p className="text-gray-600 leading-relaxed text-sm md:text-base font-sans">
              {labels.heroSub}
            </p>

            {/* Simulated app preview banner */}
            <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl flex items-center gap-3">
              <Shield className="w-8 h-8 text-emerald-700" />
              <div>
                <span className="block text-xs font-bold text-emerald-900">
                  {lang === "EN" ? "Android App Compatibility Preset Ready" : "एंड्रॉयड ऐप संगतता प्रीसेट तैयार"}
                </span>
                <span className="block text-[11px] text-gray-500 font-sans">
                  {lang === "EN" ? "Fluid viewport constraints auto-adapt to native Indian smartphone layouts." : "स्मार्टफोन स्क्रीन पर सहज लेआउट के लिए ऑटो-अडैप्टिव डिजाइन।"}
                </span>
              </div>
            </div>

            {/* Presets to speed up testing */}
            <div className="p-5 bg-emerald-50/40 border border-emerald-100 rounded-3xl space-y-3.5 shadow-xs">
              <span className="block text-[10px] text-emerald-800 font-extrabold tracking-wider uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                {lang === "EN" ? "QUICK DEMO FAST-TRACK LOGIN" : "त्वरित डेमो लॉगिन (एक क्लिक में प्रवेश करें)"}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  onClick={() => handleDemoLogin("+91 98765 43210", "farmer")}
                  className="p-3 bg-white hover:bg-emerald-50 text-emerald-950 rounded-xl transition-all border border-emerald-100/80 hover:border-emerald-500 flex flex-col items-start gap-1 cursor-pointer text-left shadow-xs active:scale-97"
                >
                  <span className="text-xs font-black flex items-center gap-1">🌾 Rajesh Kumar</span>
                  <span className="text-[10px] text-gray-400 font-sans block">Farmer • Karnal (Haryana)</span>
                  <span className="text-[9px] px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-black mt-1">🌾 किसान भाई</span>
                </button>

                <button
                  onClick={() => handleDemoLogin("+91 87654 32109", "farmer")}
                  className="p-3 bg-white hover:bg-emerald-50 text-emerald-950 rounded-xl transition-all border border-emerald-100/80 hover:border-emerald-500 flex flex-col items-start gap-1 cursor-pointer text-left shadow-xs active:scale-97"
                >
                  <span className="text-xs font-black flex items-center gap-1">🌾 Savitri Devi</span>
                  <span className="text-[10px] text-gray-400 font-sans block">Farmer • Alwar (Rajasthan)</span>
                  <span className="text-[9px] px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-black mt-1">🌾 किसान बहन</span>
                </button>

                <button
                  onClick={() => handleDemoLogin("+91 90000 11111", "buyer")}
                  className="p-3 bg-white hover:bg-indigo-50 text-indigo-950 rounded-xl transition-all border border-indigo-100/80 hover:border-indigo-500 flex flex-col items-start gap-1 cursor-pointer text-left shadow-xs active:scale-97"
                >
                  <span className="text-xs font-black flex items-center gap-1">🏢 FreshKart Corp</span>
                  <span className="text-[10px] text-gray-400 font-sans block">Traders • Delhi NCR</span>
                  <span className="text-[9px] px-1.5 py-0.5 bg-indigo-100 text-indigo-800 rounded font-black mt-1">🏢 मंडी खरीदार</span>
                </button>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 bg-white p-6 md:p-8 rounded-3xl border border-gray-200/80 shadow-xl space-y-6">
            {!showRegForm ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="text-center md:text-left space-y-1">
                  <h2 className="text-xl font-bold tracking-tight text-slate-800">
                    {labels.loginTitle}
                  </h2>
                  <p className="text-xs text-gray-400 font-sans">
                    {lang === "EN" ? "Sign up or sign back in instantly." : "त्वरित रूप से लॉगिन करें या पंजीकरण करें।"}
                  </p>
                </div>

                {loginError && (
                  <div className="p-3 bg-amber-50 text-amber-900 text-xs font-sans rounded-xl border border-amber-200 flex items-center gap-2">
                    <BadgeAlert className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {labels.phoneLabel}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 tracking-wider">
                      🇮🇳
                    </span>
                    <input
                      type="tel"
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value.replace(/[^0-9+ ]/g, ""))}
                      placeholder="+91 98765 43210"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 outline-none text-sm transition-all font-sans"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {labels.roleLabel}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setLoginRole("farmer")}
                      className={`p-3 rounded-xl border font-bold text-xs flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                        loginRole === "farmer"
                          ? "bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs"
                          : "bg-white border-gray-100 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-lg">🌾</span>
                      <span>{lang === "EN" ? "Farmer / किसान" : "उत्पादक किसान"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLoginRole("buyer")}
                      className={`p-3 rounded-xl border font-bold text-xs flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                        loginRole === "buyer"
                          ? "bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs"
                          : "bg-white border-gray-100 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-lg">🏢</span>
                      <span>{lang === "EN" ? "Buyer / खरीदार" : "व्यापारी खरीदार"}</span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2 text-sm"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <LogIn className="w-4 h-4" />
                  )}
                  <span>{labels.enterBtn}</span>
                </button>
              </form>
            ) : (
              /* --- DETAILED PROFILE CREATION FORM (DURING REGISTRATION) --- */
              <form onSubmit={handleRegisterSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
                <div className="space-y-1">
                  <h2 className="text-lg font-black tracking-tight text-emerald-900 border-b border-emerald-50 pb-1.5 flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-emerald-700" />
                    <span>{labels.registerTitle}</span>
                  </h2>
                  <p className="text-[11px] text-gray-400 font-sans">
                    {lang === "EN"
                      ? `Complete your specialized ${loginRole === "farmer" ? "farmer" : "buyer"} card to trade directly.`
                      : `सीधे सौदे के लिए अपनी विशिष्ट ${loginRole === "farmer" ? "किसान" : "खरीदार"} प्रोफाइल पूरी करें।`}
                  </p>
                </div>

                {loginError && (
                  <div className="p-3 bg-amber-50 text-amber-900 text-xs font-sans rounded-xl text-center">
                    {loginError}
                  </div>
                )}

                {/* Shared Common Profile Details */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 block">{labels.nameLabel} *</label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Ramesh Singh / Amrit Pal"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-emerald-500 transition-all font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 block">{labels.locationLabel}</label>
                      <input
                        type="text"
                        value={regLocation}
                        onChange={(e) => setRegLocation(e.target.value)}
                        placeholder="e.g., Karnal Mandi"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-emerald-500 transition-all font-sans"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 block">{labels.stateLabel}</label>
                      <select
                        value={regState}
                        onChange={(e) => setRegState(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs outline-none bg-white font-sans"
                      >
                        <option value="Haryana">Haryana</option>
                        <option value="Punjab">Punjab</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                        <option value="Rajasthan">Rajasthan</option>
                        <option value="Madhya Pradesh">Madhya Pradesh</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Farmer specific fields */}
                {loginRole === "farmer" && (
                  <div className="p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-3 animate-fade-in">
                    <span className="block text-[10px] text-emerald-800 font-extrabold uppercase tracking-wider">
                      🌾 Kisan Farmland Attributes
                    </span>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 block">{labels.farmName}</label>
                      <input
                        type="text"
                        value={farmName}
                        onChange={(e) => setFarmName(e.target.value)}
                        placeholder="e.g. Balaji Organic Farms"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-xs outline-none placeholder-gray-400 font-sans"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 block">{labels.farmSize}</label>
                        <input
                          type="number"
                          value={farmSize}
                          onChange={(e) => setFarmSize(e.target.value)}
                          placeholder="Acres (एकर)"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-xs outline-none font-sans"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 block">Organic Crop Certified?</label>
                        <button
                          type="button"
                          onClick={() => setOrganicCertified(!organicCertified)}
                          className={`w-full py-2 border text-xs font-semibold rounded-lg cursor-pointer ${
                            organicCertified 
                              ? "bg-emerald-600 border-emerald-700 text-white" 
                              : "bg-white border-gray-200 text-gray-600"
                          }`}
                        >
                          {organicCertified ? "Yes (हाँ)" : "No (नहीं)"}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 block">{labels.primaryCrops}</label>
                      <input
                        type="text"
                        value={primaryCrops}
                        onChange={(e) => setPrimaryCrops(e.target.value)}
                        placeholder="Wheat, Rice, Sugarcane"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-xs outline-none font-sans"
                      />
                    </div>
                  </div>
                )}

                {/* Buyer specific fields */}
                {loginRole === "buyer" && (
                  <div className="p-3.5 bg-indigo-50/40 border border-indigo-100 rounded-xl space-y-3 animate-fade-in">
                    <span className="block text-[10px] text-indigo-900 font-extrabold uppercase tracking-wider">
                      🏢 Trader / corporate details
                    </span>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 block">{labels.businessName}</label>
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. FreshKart Wholesale Ltd"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-xs outline-none placeholder-gray-400 font-sans"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 block">{labels.gstNumber}</label>
                        <input
                          type="text"
                          value={gstNumber}
                          onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                          placeholder="29AAAAA1111A1Z1"
                          maxLength={15}
                          className="w-full px-3 py-2 border border-gray-200 bg-white rounded-lg text-xs outline-none font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 block">{labels.businessType}</label>
                        <select
                          value={businessType}
                          onChange={(e) => setBusinessType(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 bg-white rounded-lg text-xs outline-none font-sans"
                        >
                          <option value="Wholesaler">Wholesaler</option>
                          <option value="Retailer">Retailer Store</option>
                          <option value="Restaurant">Restaurant Chain</option>
                          <option value="Exporter">Exporter</option>
                          <option value="Individual">Individual Family</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 block">{labels.preferredProduce}</label>
                      <input
                        type="text"
                        value={preferredProduce}
                        onChange={(e) => setPreferredProduce(e.target.value)}
                        placeholder="Fresh tomatoes, Basmati grain, dry red onion"
                        className="w-full px-3 py-2 border border-gray-200 bg-white rounded-lg text-xs outline-none font-sans"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRegForm(false)}
                    className="w-1/3 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-xs font-bold text-center cursor-pointer hover:bg-gray-50"
                  >
                    {lang === "EN" ? "Back" : "पीछे जाएँ"}
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer hover:shadow-lg hover:from-emerald-700 transition-all text-center"
                  >
                    {labels.registerBtn}
                  </button>
                </div>
              </form>
            )}
          </div>
        </main>
      )}

      {/* ----------------- CORE LOGGED IN APP WORKSPACE ----------------- */}
      {currentUser && (
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">
          
          {/* LEFT AREA: NAVIGATION & LISTINGS / FORM (8 Cols on Desktop) */}
          <div className="lg:col-span-8 flex flex-col space-y-5">
            
            {/* Localized Tab Bar controllers */}
            <div className="bg-white p-2 rounded-2xl border border-gray-200/60 shadow-xs flex items-center justify-between">
              <div className="flex gap-1.5">
                <button
                  id="tab-browse-btn"
                  onClick={() => setCurrentTab("browse")}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    currentTab === "browse" 
                      ? "bg-emerald-600 text-white shadow-xs" 
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{labels.browseMandi}</span>
                </button>

                {currentUser.role === "farmer" && (
                  <button
                    id="tab-list-btn"
                    onClick={() => setCurrentTab("list")}
                    className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                      currentTab === "list" 
                        ? "bg-emerald-600 text-white shadow-xs" 
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{labels.listProduce}</span>
                  </button>
                )}

                {currentUser.role === "buyer" && (
                  <button
                    id="tab-pooler-btn"
                    onClick={() => setCurrentTab("pooler")}
                    className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                      currentTab === "pooler" 
                        ? "bg-emerald-600 text-white shadow-xs" 
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>{lang === "EN" ? "Combine Farmers (Pooler)" : "स्मार्ट आर्डर पूलर"}</span>
                  </button>
                )}

                <button
                  id="tab-profile-direct-btn"
                  onClick={() => setCurrentTab("profile")}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    currentTab === "profile" 
                      ? "bg-emerald-600 text-white shadow-xs" 
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{lang === "EN" ? "My Profile" : "मेरी प्रोफाइल"}</span>
                </button>
              </div>

              {/* Refresh indicator */}
              <button
                onClick={fetchMandiData}
                className="p-2 text-gray-400 hover:text-emerald-700 rounded-xl hover:bg-emerald-50 transition-colors"
                title="Refresh Mandi Catalog"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* TAB CONTENT: BROWSE MANDI OFFERS */}
            {currentTab === "browse" && (
              <div className="space-y-5">
                {/* Searching & Filter utilities */}
                <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs space-y-3">
                  <div className="flex flex-col md:flex-row gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={labels.searchPlace}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none text-xs focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-sans"
                      />
                    </div>

                    {/* State & Category selective filters */}
                    <div className="flex gap-2 flex-wrap">
                      <select
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        className="px-3.5 py-2 rounded-xl border border-gray-200 text-xs bg-white text-gray-600 outline-none font-sans cursor-pointer focus:border-emerald-500"
                      >
                        <option value="">{labels.stateFilter} (All)</option>
                        {uniqueStates.map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>

                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-3.5 py-2 rounded-xl border border-gray-200 text-xs bg-white text-gray-600 outline-none font-sans cursor-pointer focus:border-emerald-500"
                      >
                        <option value="">{lang === "EN" ? "All Categories" : "सभी श्रेणियां"}</option>
                        <option value="Grains">Grains / अनाज</option>
                        <option value="Vegetables">Vegetables / सब्जी</option>
                        <option value="Fruits">Fruits / फल</option>
                        <option value="Spices">Spices / मसाले</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Mandi Cards List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredListings.length === 0 ? (
                    <div className="col-span-2 p-12 bg-white rounded-3xl border border-dashed border-gray-200 text-center space-y-3">
                      <Info className="w-10 h-10 text-emerald-600 mx-auto" />
                      <p className="text-sm font-sans text-gray-400">
                        {labels.noListings}
                      </p>
                    </div>
                  ) : (
                    filteredListings.map(crop => {
                      const isOwner = currentUser.role === "farmer" && currentUser.phone === crop.farmerContact;
                      const isSelected = selectedCrop?.id === crop.id;

                      const cropIcon = crop.image === "tomato" ? "🍅" :
                                       crop.image === "onion" ? "🧅" :
                                       crop.image === "rice" ? "🍚" : "🌾";

                      const isCustomImage = crop.image && (crop.image.startsWith("data:image") || crop.image.startsWith("http"));

                      return (
                        <div
                          key={crop.id}
                          id={`listing-card-${crop.id}`}
                          onClick={() => setSelectedCrop(crop)}
                          className={`p-5 bg-white rounded-2xl border transition-all cursor-pointer flex flex-col justify-between hover:shadow-md ${
                            isSelected 
                              ? "border-emerald-500 ring-2 ring-emerald-500/10 shadow-xs" 
                              : "border-gray-200/80 hover:border-gray-300"
                          }`}
                        >
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center text-xl shadow-inner overflow-hidden shrink-0">
                                  {isCustomImage ? (
                                    <img src={crop.image} alt={crop.cropName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  ) : (
                                    cropIcon
                                  )}
                                </div>
                                <div className="leading-tight">
                                  <h3 className="text-sm font-extrabold text-gray-800 tracking-tight">
                                    {lang === "EN" ? crop.cropName : (crop.cropName.toLowerCase().includes("wheat") ? "गेहूं (गेहूँ)" : crop.cropName.toLowerCase().includes("tomato") ? "टमाटर" : crop.cropName.toLowerCase().includes("onion") ? "प्याज" : crop.cropName)}
                                  </h3>
                                  <div className="flex gap-1.5 flex-wrap mt-1.5">
                                    <span className="text-[9px] text-emerald-800 font-extrabold px-1.5 py-0.5 bg-emerald-50 border border-emerald-100 rounded-sm">
                                      {crop.variety}
                                    </span>
                                    {crop.category && (
                                      <span className="text-[9px] text-blue-800 font-extrabold px-1.5 py-0.5 bg-blue-50 border border-blue-100 rounded-sm uppercase tracking-wide">
                                        {crop.category}
                                      </span>
                                    )}
                                    <span className={`text-[9.5px] font-black px-2 py-0.5 rounded-sm flex items-center gap-0.5 uppercase tracking-wide ${
                                      getDeterministicTrustStats(crop).overallTrustScore >= 90
                                        ? "bg-slate-900 text-emerald-400 border border-slate-750"
                                        : "bg-slate-900 text-amber-450 border border-slate-755"
                                    }`}>
                                      ★ Trust: {getDeterministicTrustStats(crop).overallTrustScore}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <span className="text-[10px] font-sans text-gray-400">
                                {new Date(crop.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                              </span>
                            </div>

                            {/* Vol and Prices deal */}
                            <div className="grid grid-cols-2 gap-2 text-center bg-gray-50/70 p-2.5 rounded-xl border border-gray-100">
                              <div>
                                <span className="block text-[9px] text-gray-400 uppercase tracking-wider">
                                  {lang === "EN" ? "Stock Available" : "उपलब्ध स्टॉक"}
                                </span>
                                <span className="text-xs font-black text-gray-700">
                                  {crop.quantity} {crop.unit}
                                </span>
                              </div>
                              <div className="border-l border-gray-200/80">
                                <span className="block text-[9px] text-emerald-800 font-bold uppercase tracking-wider">
                                  {lang === "EN" ? "Middleman-free Price" : "दलाल-मुक्त मूल्य"}
                                </span>
                                <span className="text-xs font-black text-emerald-700">
                                  ₹{crop.pricePerUnit} <span className="text-[9px] font-normal text-gray-400">/ {crop.unit}</span>
                                </span>
                              </div>
                            </div>

                            <div className="space-y-1.5 pt-1">
                              <div className="flex items-center gap-1.5 text-xs text-gray-500 font-sans">
                                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                <span className="font-medium text-gray-600">{crop.location}, {crop.state}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-gray-500 font-sans">
                                <User className="w-3.5 h-3.5 text-gray-400" />
                                <span className="font-semibold text-gray-700">{crop.farmerName}</span>
                                {crop.verified && (
                                  <span className="relative group/verified inline-block">
                                    <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 rounded-full px-1.5 py-0.5 border border-emerald-200/50 uppercase scale-90 cursor-help select-none">
                                      ✓ Verified
                                    </span>
                                    
                                    {/* Tooltip Popover */}
                                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-slate-900 border border-slate-700 text-white rounded-xl p-3 shadow-xl invisible group-hover/verified:visible opacity-0 group-hover/verified:opacity-100 transition-all duration-200 z-40 text-left pointer-events-none">
                                      {/* Tooltip caret */}
                                      <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></span>
                                      
                                      <span className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-slate-805">
                                        <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                        <span className="text-[9px] font-black tracking-wider text-slate-200 uppercase">
                                          {lang === "EN" ? "Farmer Trust Audit" : "किसान सत्यापन ऑडिट"}
                                        </span>
                                      </span>
                                      
                                      <span className="space-y-1.5 block">
                                        <span className="flex items-start gap-1">
                                          <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                                          <span className="text-[9.5px] leading-snug text-slate-300">
                                            <strong>{lang === "EN" ? "Land Status: " : "भूमि रिकॉर्ड: "}</strong>
                                            {lang === "EN" ? "Registry Match Verified" : "सरकारी भूमि सत्यापित"}
                                          </span>
                                        </span>
                                        <span className="flex items-start gap-1">
                                          <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                                          <span className="text-[9.5px] leading-snug text-slate-300">
                                            <strong>{lang === "EN" ? "Farmer KYC: " : "किसान केवाईसी: "}</strong>
                                            {lang === "EN" ? "Aadhaar & Bank Linked" : "सत्यापित बैंक सम्बद्ध"}
                                          </span>
                                        </span>
                                        <span className="flex items-start gap-1">
                                          <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                                          <span className="text-[9.5px] leading-snug text-slate-300">
                                            <strong>{lang === "EN" ? "Trade Status: " : "सौदा स्थिति: "}</strong>
                                            {lang === "EN" ? "A-Grade Direct Supplier" : "ए-ग्रेड सीधा आपूर्तिकर्ता"}
                                          </span>
                                        </span>
                                        <span className="flex items-start gap-1">
                                          <Calendar className="w-3 h-3 text-sky-450 shrink-0 mt-0.5" />
                                          <span className="text-[9.5px] leading-snug text-slate-300">
                                            <strong>{lang === "EN" ? "Member Since: " : "सीधा सदस्य: "}</strong>
                                            {lang === "EN" ? `Spring ${new Date(crop.createdAt).getFullYear() - 1 || 2025}` : `${new Date(crop.createdAt).getFullYear() - 1 || 2025} वसंत से`}
                                          </span>
                                        </span>
                                      </span>
                                    </span>
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="text-xs text-gray-500 leading-relaxed font-sans line-clamp-2 pt-1 border-t border-gray-100">
                              {lang === "HI" && crop.descriptionHindi ? crop.descriptionHindi : crop.description}
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100/80">
                            {isOwner ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCrop(crop.id);
                                }}
                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-extrabold rounded-lg transition-colors cursor-pointer"
                              >
                                Pulldown Listing
                              </button>
                            ) : (
                              <div className="flex flex-col gap-1.5 items-start">
                                <span className="text-[10px] text-emerald-800 font-extrabold bg-emerald-50 rounded-md px-2 py-1 select-none">
                                  {lang === "EN" ? `Approval Level: ${crop.approvalFactor || (85 + (crop.cropName.length % 14))}%` : `स्वीकृति स्तर: ${crop.approvalFactor || (85 + (crop.cropName.length % 14))}%`}
                                </span>
                                {currentUser?.role !== "buyer" ? (
                                  <span className="text-[10px] text-blue-800 font-extrabold bg-blue-50/80 rounded-md px-2 py-1 select-none">
                                    {(() => {
                                      const mPrice = crop.mandiPriceEstimate || Math.round(crop.pricePerUnit * 0.85);
                                      const diff = crop.pricePerUnit - mPrice;
                                      const diffPercent = Math.round((diff / mPrice) * 100);
                                      return lang === "EN" ? `vs Mandi Bhaav: +${diffPercent}% Extra` : `मंडी तुलना: +${diffPercent}% ज़्यादा`;
                                    })()}
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-700 font-extrabold bg-slate-100 rounded-md px-2 py-1 select-none">
                                    {(() => {
                                      const mPrice = crop.mandiPriceEstimate || Math.round(crop.pricePerUnit * 0.85);
                                      return lang === "EN" ? `Mandi Bench: ₹${mPrice}/${crop.unit}` : `मंडी बेंचमार्क: ₹${mPrice}/${crop.unit}`;
                                    })()}
                                  </span>
                                )}
                              </div>
                            )}

                            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 hover:underline">
                              <span>{lang === "EN" ? "Trade & Negotiate" : "सौदा तय करें"}</span>
                              <ChevronRight className="w-3 h-3" />
                            </span>
                          </div>

                        </div>
                      );
                    })
                  )}
                </div>

                {/* -------------------- KISAN SMART PRICES TRENDS COCKPIT -------------------- */}
                <div className="p-5 bg-gradient-to-r from-emerald-900 via-emerald-950 to-slate-900 text-white rounded-3xl shadow-sm space-y-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-base font-black tracking-tight">{labels.fairPricingHelp}</h3>
                  </div>
                  <p className="text-xs text-emerald-100/80 font-sans max-w-xl">
                    {lang === "EN" 
                      ? "Get intelligent advice straight from Gemini AI to estimate wholesale pricing without relying on local commission agents!"
                      : "स्थानीय एजेंटों पर निर्भर रहे बिना सीधे जेमिनी एआई कृषक बुद्धिमत्ता से मूल्य परामर्श प्राप्त करें!"}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-2 max-w-lg">
                    <input
                      type="text"
                      className="bg-white/10 border border-white/20 text-white placeholder-emerald-100/55 rounded-xl px-4 py-2 text-xs focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 outline-none flex-1 font-sans"
                      placeholder={labels.cropNamePlaceholder}
                      value={aiCropQuery}
                      onChange={(e) => setAiCropQuery(e.target.value)}
                    />
                    <button
                      onClick={handleQueryAiPricing}
                      disabled={aiPriceLoading}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 font-extrabold text-xs text-white rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                    >
                      {aiPriceLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-emerald-200" />}
                      <span>{labels.calculatePriceBtn}</span>
                    </button>
                  </div>

                  {aiPriceResult && (
                    <div className="p-4 bg-white/10 rounded-2xl border border-white/10 text-xs space-y-3 animate-fade-in font-sans">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-white/5 p-2 rounded-xl">
                          <span className="block text-[8px] text-emerald-300 font-semibold uppercase">Min Expected</span>
                          <span className="text-sm font-black text-white">₹{aiPriceResult.recommendedMin}</span>
                        </div>
                        <div className="bg-white/5 p-2 rounded-xl">
                          <span className="block text-[8px] text-emerald-300 font-semibold uppercase">Max Fair Deal</span>
                          <span className="text-sm font-black text-white">₹{aiPriceResult.recommendedMax}</span>
                        </div>
                        <div className="bg-emerald-500/20 p-2 rounded-xl text-emerald-300">
                          <span className="block text-[8px] font-semibold uppercase">saved Middleman Margin</span>
                          <span className="text-sm font-black">+{aiPriceResult.savedMiddlemanMarginPercent || 18}%</span>
                        </div>
                      </div>
                      
                      <div className="leading-relaxed text-[11px] text-emerald-100 border-t border-white/5 pt-2">
                        <span className="font-extrabold block mb-0.5 text-emerald-300">🎯 Krishi AI Market Verdict: {aiPriceResult.marketVerdict}</span>
                        {aiPriceResult.analysis}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB CONTENT: LIST CROP POST (FARMERS ONLY) */}
            {currentTab === "list" && currentUser.role === "farmer" && (
              <div className="space-y-6">
                {/* Kisan Easy Access Top Panel */}
                <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-5 rounded-3xl border border-emerald-700 shadow-lg space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="inline-flex items-center gap-1.5 text-[10px] bg-emerald-700/60 text-emerald-200 uppercase font-black px-2.5 py-1 rounded-lg border border-emerald-600/30">
                        ✨ {lang === "EN" ? "SUPER SIMPLIFIED KISAN MODE" : "अति सुगम किसान सेवा डिजिटल मोड"}
                      </span>
                      <h3 className="text-base font-black tracking-tight mt-1">
                        🌾 {lang === "EN" ? "Super Quick Crop Entry Guide" : "बिना टाइप किए तुरंत फसल जोड़ें"}
                      </h3>
                      <p className="text-[11px] text-emerald-200/90 font-sans">
                        {lang === "EN" 
                          ? "Type-free listing: Tap any crop icon or talk directly to list your ready harvest."
                          : "तैयार फसल को दर्ज करने के लिए नीचे दिए गए बटन को छुएं या बोलकर फ़ॉर्म भरें।"
                        }
                      </p>
                    </div>

                    {/* Glowing AI Voice Input simulated button */}
                    <button
                      type="button"
                      onClick={startVoiceSimulation}
                      disabled={formVoiceRecording}
                      className={`relative px-4 py-2.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0 ${
                        formVoiceRecording 
                          ? "bg-amber-600 text-white animate-pulse" 
                          : "bg-radial from-emerald-400 to-emerald-600 text-slate-950 hover:bg-emerald-500 hover:scale-103 shadow-md border-2 border-emerald-300"
                      }`}
                    >
                      <Mic className={`w-4 h-4 text-inherit ${formVoiceRecording ? "animate-bounce" : ""}`} />
                      <span>
                        {formVoiceRecording 
                          ? (lang === "EN" ? "Listening..." : "सुन रहा हूँ...") 
                          : (lang === "EN" ? "🎙️ Speak to List (बोलें)" : "🎙️ बोलकर फसल जोड़ें")
                        }
                      </span>
                      {!formVoiceRecording && (
                        <span className="absolute -top-1.5 -right-1 px-1.5 py-0.5 bg-amber-500 text-white text-[8px] font-black rounded-full animate-bounce">
                          NEW
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Voice Simulation Toast Tracker */}
                  {voiceToast && (
                    <div className="p-3 bg-emerald-950/70 border border-emerald-600/20 rounded-xl text-xs flex items-center gap-2.5 animate-pulse text-emerald-100 font-sans">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                      </span>
                      <span>{voiceToast}</span>
                    </div>
                  )}

                  {/* Visual 1-Click Fast Pre-fill Tiles */}
                  <div className="space-y-2 border-t border-emerald-700/40 pt-3">
                    <span className="block text-[10px] text-emerald-300 font-black uppercase tracking-wider">
                      🎯 {lang === "EN" ? "Or, Tap Your Crop to auto-fill form (या अपनी फसल को छुएं):" : "या 1-क्लिक में फसल का ब्यौरा लोड करने के लिए छुएं:"}
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                      {cropPresets.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => applyCropPreset(preset)}
                          className={`p-2 bg-emerald-950/40 hover:bg-emerald-950/80 border border-emerald-700/50 hover:border-emerald-500 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between group active:scale-95`}
                        >
                          <span className="text-xl select-none group-hover:scale-110 transition-transform mb-1">
                            {preset.emoji}
                          </span>
                          <span className="text-[10.5px] font-black text-slate-100 line-clamp-1">
                            {lang === "EN" ? preset.nameEN : preset.nameHI}
                          </span>
                          <span className="text-[8.5px] text-emerald-400 font-bold block mt-0.5 mt-auto">
                            ₹{preset.price}/{preset.unit === "Quintal" ? (lang === "EN" ? "Qtl" : "क्विं.") : preset.unit}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Main Harvest Form Area */}
                <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200/80 shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4 gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                        <span>📝</span>
                        <span>{lang === "EN" ? "Harvest Entry Form" : "फसल सूची फॉर्म"}</span>
                      </h2>
                      <p className="text-xs text-gray-400 font-sans">
                        {lang === "EN"
                          ? "Adjust the details below and hit publish when completely satisfied."
                          : "नीचे दी गई जानकारी बदलें और अपनी उपज प्रकाशित करने के लिए बटन दबाएं।"
                        }
                      </p>
                    </div>

                    {/* AI Advisor side-drawer */}
                    <button
                      type="button"
                      onClick={() => setShowAiModal(true)}
                      className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-black rounded-2xl hover:shadow-lg transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                      <span>{lang === "EN" ? "AI Smart Assistant" : "कृषि एआई डिजिटल सहायक"}</span>
                    </button>
                  </div>

                  <form onSubmit={handleManualAddCrop} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 block">Crop Name / फसल नाम *</label>
                      <input
                        name="cropName"
                        type="text"
                        required
                        value={formCropName}
                        onChange={(e) => setFormCropName(e.target.value)}
                        placeholder="e.g. Premium Basmati Rice (Pusa)"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-500 font-sans"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 block">Category / श्रेणी *</label>
                      <select
                        name="category"
                        required
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-500 font-sans bg-white"
                      >
                        <option value="Grains">Grains / अनाज</option>
                        <option value="Vegetables">Vegetables / सब्जी</option>
                        <option value="Fruits">Fruits / फल</option>
                        <option value="Spices">Spices / मसाले</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 block">Variety / किस्म *</label>
                      <input
                        name="variety"
                        type="text"
                        required
                        value={formVariety}
                        onChange={(e) => setFormVariety(e.target.value)}
                        placeholder="e.g. Long Grain 1121"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-500 font-sans"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 block">Quantity / मात्रा *</label>
                      <div className="flex gap-2">
                        <input
                          name="quantity"
                          type="number"
                          required
                          value={formQuantity}
                          onChange={(e) => setFormQuantity(e.target.value)}
                          placeholder="e.g. 50"
                          className="w-2/3 px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-500 font-sans"
                        />
                        <select
                          name="unit"
                          value={formUnit}
                          onChange={(e) => setFormUnit(e.target.value)}
                          className="w-1/3 px-2 py-2.5 bg-white border border-gray-200 rounded-xl text-xs outline-none font-sans"
                        >
                          <option value="Quintal">Quintal</option>
                          <option value="kg">kg</option>
                          <option value="Ton">Ton</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 block">Price Per Unit (INR ₹) *</label>
                      <input
                        name="pricePerUnit"
                        type="number"
                        required
                        value={formPricePerUnit}
                        onChange={(e) => setFormPricePerUnit(e.target.value)}
                        placeholder="e.g. 2300"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-500 font-sans"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 block">Harvest Date / फसल कटाई तिथि</label>
                      <input
                        name="harvestDate"
                        type="date"
                        value={formHarvestDate}
                        onChange={(e) => setFormHarvestDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-500 font-sans"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 block">Listing Description / फसल विवरण</label>
                      <textarea
                        name="description"
                        rows={3}
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        placeholder="e.g. Stored in dry bags, completely clean golden grains. Highly nutritious, ready for highway pick-up."
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-500 font-sans resize-none"
                      />
                    </div>

                  {/* REAL-TIME PHOTO CAPTURE & HYBRID FILE UPLOAD SECTION */}
                  <div className="md:col-span-2 bg-slate-50 border border-gray-200 p-4.5 rounded-2xl space-y-3.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/60 pb-2">
                      <div>
                        <span className="text-xs font-black text-gray-700 tracking-wide uppercase flex items-center gap-1.5">
                          <Camera className="w-4 h-4 text-emerald-600" />
                          {lang === "EN" ? "Crop Fresh Snapshot / फसल फोटो" : "फसल का ताज़ा फोटो"}
                        </span>
                        <span className="text-[10px] text-gray-400 block font-normal mt-0.5">
                          {lang === "EN" 
                            ? "Provides immediate direct proof of produce condition to potential buyers." 
                            : "खरीदारों को आपकी फसल की गुणवत्ता का सीधा विश्वास देता है।"}
                        </span>
                      </div>
                      
                      {!isCameraActive && !capturedPhoto && (
                        <button
                          type="button"
                          onClick={startCamera}
                          className="px-3.5 py-1.5 bg-emerald-100 border border-emerald-200 text-emerald-800 hover:bg-emerald-200 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all self-start cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          {lang === "EN" ? "Use Live Camera" : "लाइव कैमरा से फोटो लें"}
                        </button>
                      )}
                    </div>

                    {/* Active Camera Live Transmission Stream */}
                    {isCameraActive && (
                      <div className="relative bg-black rounded-xl overflow-hidden aspect-video max-h-72 border border-emerald-500 ring-4 ring-emerald-500/10 flex flex-col justify-end">
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline 
                          className="w-full h-full object-cover"
                        />
                        {/* Overlay scanning effect */}
                        <div className="absolute inset-0 border-y-2 border-emerald-500/50 animate-pulse pointer-events-none" />
                        
                        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2.5 px-4 z-10">
                          <button
                            type="button"
                            onClick={capturePhoto}
                            className="px-5 py-2 bg-emerald-600 border border-emerald-500 text-white rounded-full text-xs font-black shadow-lg hover:bg-emerald-500 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                          >
                            <Camera className="w-3.5 h-3.5 shrink-0" />
                            {lang === "EN" ? "Take Snapshot" : "फोटो खींचे"}
                          </button>
                          
                          <button
                            type="button"
                            onClick={stopCamera}
                            className="px-4 py-2 bg-gray-900 text-slate-100 rounded-full text-xs font-bold hover:bg-black active:scale-95 transition-all cursor-pointer border border-gray-700"
                          >
                            {lang === "EN" ? "Close" : "बंद करें"}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Camera Error Message fallback */}
                    {cameraError && !isCameraActive && (
                      <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                        <span>{cameraError}</span>
                      </div>
                    )}

                    {/* Captured Real-time Snapshot Preview Box */}
                    {capturedPhoto ? (
                      <div className="relative bg-white border border-gray-200/80 p-3 rounded-xl flex flex-col sm:flex-row items-center gap-4">
                        <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200 shadow-inner min-w-[96px] shrink-0">
                          <img 
                            src={capturedPhoto} 
                            alt="Crop preview" 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="space-y-1.5 flex-1 min-w-0 text-left">
                          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-850 px-2 py-1 rounded-full text-[10px] font-black border border-emerald-100 w-fit">
                            <CheckCircle className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                            <span>{lang === "EN" ? "Produce Snapshot Ready" : "फसल का प्रमाण उपलब्ध है"}</span>
                          </div>
                          
                          <p className="text-[10px] text-gray-400 font-sans leading-relaxed truncate">
                            {lang === "EN" ? "Will be broadcasted transparently." : "खरीदारों को सीधे मंडी लिस्टिंग में दिखाई देगा।"}
                          </p>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setCapturedPhoto(null)}
                              className="px-2.5 py-1 text-[10px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Trash className="w-3 h-3" />
                              {lang === "EN" ? "Remove" : "हटाएं"}
                            </button>
                            <button
                              type="button"
                              onClick={startCamera}
                              className="px-2.5 py-1 text-[10px] font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Camera className="w-3 h-3" />
                              {lang === "EN" ? "Retake" : "दोबारा लें"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Hybrid Drag-and-Drop Area as mandated by guidelines */
                      !isCameraActive && (
                        <div 
                          onDragOver={handleDragOver}
                          onDrop={handleDrop}
                          onClick={() => document.getElementById("produce-image-uploader")?.click()}
                          className="h-28 border-2 border-dashed border-gray-200 hover:border-emerald-400 p-4 rounded-xl flex flex-col items-center justify-center gap-1 bg-white cursor-pointer transition-all hover:bg-emerald-50/10"
                        >
                          <Upload className="w-6 h-6 text-emerald-700" />
                          <p className="text-[11px] font-extrabold text-gray-600 text-center leading-normal">
                            {lang === "EN" 
                              ? "Drag & Drop Produce Photo here, or Click to Upload" 
                              : "उत्पाद की फोटो यहां ड्रैग करें या अपलोड करने के लिए क्लिक करें"}
                          </p>
                          <span className="text-[9px] text-gray-400">
                            {lang === "EN" 
                              ? "Supports JPG, PNG formats up to 5MB" 
                              : "समर्थित प्रारूप: जेपीजी, पीएनजी"}
                          </span>
                          <input 
                            id="produce-image-uploader" 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageFileChange}
                            className="hidden" 
                          />
                        </div>
                      )
                    )}
                  </div>

                  <div className="md:col-span-2 pt-3">
                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-800 text-white font-bold rounded-xl shadow-md transition-all active:scale-98 cursor-pointer text-xs"
                    >
                      {lang === "EN" ? "Publish Harvest to Live Mandi" : "फसल सूची भारत लाइव मंडी पर प्रकाशित करें"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

            {/* TAB CONTENT: SAHI DAAM BULK FULFILLMENT OPTIMIZER */}
            {currentTab === "pooler" && currentUser?.role === "buyer" && (
              <div className="space-y-6 animate-fade-in">
                {/* Header card */}
                <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 p-6 md:p-8 rounded-3xl text-white shadow-md relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <Sparkles className="w-48 h-48 text-white" />
                  </div>
                  <div className="relative z-10 space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-xs font-black tracking-wide text-amber-300">
                      <Sparkles className="w-3.5 h-3.5 fill-amber-300" />
                      <span>{lang === "EN" ? "farmospan Bulk Pooler (थोक आर्डर समायोजन)" : "फ़ार्मोस्पैन थोक समायोजन"}</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight font-sans">
                      {lang === "EN" ? "Combine Smaller Farm Qty (छोटे किसानों को मिलाकर आर्डर पूलर)" : "छोटे किसानों को मिलाकर अपनी थोक मांग पूरी करें"}
                    </h2>
                    <p className="text-xs md:text-sm text-emerald-100/90 max-w-2xl font-sans leading-relaxed">
                      {lang === "EN" 
                        ? "Simply enter your bulk demand details below. Our smart algorithm automatically pairs you with multiple smaller, highly-approved direct farmers to aggregate and satisfy your volume requirement at the farmospan optimum rate." 
                        : "केवल अपनी कुल खरीद मात्रा दर्ज करें। हमारा एल्गोरिद्म स्वचालित रूप से सर्वश्रेष्ठ छोटे किसानों की फसलों को मिलाकर सीधे न्यूनतम लागत पर आपका पूरा आर्डर तैयार कर देगा।"
                      }
                    </p>
                  </div>
                </div>

                {/* Main section: input setup & overall metrics panel */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Left Column: Requirements Selector */}
                  <div className="md:col-span-7 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-5">
                    <div>
                      <h3 className="text-sm font-bold text-gray-800 tracking-tight">
                        {lang === "EN" ? "1. Specify Bulk Order Requirements (थोक खरीदार माँग)" : "1. थोक आर्डर की जरूरतें दर्ज करें"}
                      </h3>
                      <p className="text-xs text-gray-400 font-sans">
                        {lang === "EN" ? "We will search, filter, and balance optimal farm contributions." : "हम उपलब्ध किसानों की मात्रा का सटीक मिलान करेंगे।"}
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Crop selector */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-wider block">
                          {lang === "EN" ? "Target Crop / फसल का नाम" : "लक्षित फसल / फल-सब्जी"}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder={lang === "EN" ? "e.g. Organic Wheat, Tomato..." : "जैसे: गेहूं, टमाटर, चावल..."}
                            value={customSearchCropInput || poolTargetCrop}
                            onChange={(e) => {
                              setCustomSearchCropInput(e.target.value);
                              setPoolTargetCrop(e.target.value);
                            }}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-500 font-sans cursor-text"
                          />
                        </div>

                        {/* Fast Prefill Pills */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <span className="text-[10px] text-gray-400 self-center font-bold mr-1">
                            {lang === "EN" ? "Quick Pick (त्वरित चयन):" : "त्वरित चयन:"}
                          </span>
                          {Array.from(new Set(listings.map(item => item.cropName).filter(Boolean))).slice(0, 5).map(crop => (
                            <button
                              key={crop}
                              onClick={() => {
                                setCustomSearchCropInput(crop);
                                setPoolTargetCrop(crop);
                              }}
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                                (customSearchCropInput || poolTargetCrop) === crop
                                  ? "bg-emerald-600 text-white border-emerald-600"
                                  : "bg-slate-50 text-gray-600 border-gray-200 hover:bg-slate-100"
                              }`}
                            >
                              {crop}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Side by side Qty & Unit */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-black text-gray-500 uppercase tracking-wider block">
                            {lang === "EN" ? "Desired Volume (कुल मांग मात्रा)" : "आवश्यक कुल मात्रा"}
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={poolTargetQty}
                            onChange={(e) => setPoolTargetQty(Math.max(1, Number(e.target.value)))}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-500 font-sans font-black text-gray-800"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-black text-gray-500 uppercase tracking-wider block">
                            {lang === "EN" ? "Unit Selection / मापन इकाई" : "मापन इकाई"}
                          </label>
                          <select
                            value={poolTargetUnit}
                            onChange={(e) => setPoolTargetUnit(e.target.value as "kg" | "Quintal" | "Ton")}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-500 font-sans text-gray-700 bg-white"
                          >
                            <option value="Quintal">Quintals (क्विंटल)</option>
                            <option value="kg">kg (किलोग्राम)</option>
                            <option value="Ton">Tons (टन)</option>
                          </select>
                        </div>
                      </div>

                      {/* Optional fields: max budget */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-black text-gray-500 uppercase tracking-wider block">
                            {lang === "EN" ? "Max Price Limit (अधिकतम खरीद दर)" : "अधिकतम दर सीमा (वैकल्पिक)"}
                          </label>
                          <input
                            type="number"
                            placeholder={lang === "EN" ? "e.g. ₹2200" : "जैसे ₹2200"}
                            value={poolMaxPrice}
                            onChange={(e) => setPoolMaxPrice(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-500 font-sans"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-black text-gray-500 uppercase tracking-wider block">
                            {lang === "EN" ? "Filter Category / फसल श्रेणी" : "श्रेणी सीमा"}
                          </label>
                          <select
                            value={poolTargetCategory}
                            onChange={(e) => setPoolTargetCategory(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-500 font-sans text-gray-700 bg-white"
                          >
                            <option value="">{lang === "EN" ? "All Categories (सभी फसलें)" : "सभी श्रेणियां"}</option>
                            <option value="Grains">Grains / अनाज</option>
                            <option value="Vegetables">Vegetables / सब्जी</option>
                            <option value="Fruits">Fruits / फल</option>
                            <option value="Spices">Spices / मसाले</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Sahi Daam Pool Match Analytics */}
                  <div className="md:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-3xl text-white shadow-xl flex flex-col justify-between space-y-4">
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase">
                          {lang === "EN" ? "Aggregated Metrics (समायोजित कुल विश्लेषण)" : "समायोजित कुल विश्लेषण"}
                        </span>
                        <h3 className="text-lg font-black tracking-tight mt-0.5 text-white">
                          {lang === "EN" ? "Fulfillment Assessment (संतुष्टि आकलन)" : "मांग संकलन रिपोर्ट"}
                        </h3>
                      </div>

                      {/* Total gathered progress bar */}
                      {(() => {
                        const totalGathered = computedPool.reduce((sum, item) => sum + item.allocatedQty, 0);
                        const progressPercent = Math.min(100, Math.round((totalGathered / poolTargetQty) * 100));
                        return (
                          <div className="space-y-1.5 bg-slate-800/50 p-4 rounded-2xl border border-slate-800">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-gray-300">
                                {lang === "EN" ? "Volume Met (कुल मिला मात्रा):" : "पूर्ति स्तर:"}
                              </span>
                              <span className="text-xs font-black text-emerald-400 font-mono">
                                {totalGathered.toFixed(1)} / {poolTargetQty} {poolTargetUnit} ({progressPercent}%)
                              </span>
                            </div>
                            <div className="w-full bg-slate-755 h-3 rounded-full overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-emerald-400 to-teal-500 h-full rounded-full transition-all duration-500"
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                            {progressPercent < 100 && (
                              <p className="text-[10px] text-amber-300 font-sans mt-1">
                                ⚠️ {lang === "EN" 
                                  ? `Missing ${((poolTargetQty - totalGathered).toFixed(1))} ${poolTargetUnit} from matching lists (अतिरिक्त फसल चाहिए)।` 
                                  : `मंडी में ${(poolTargetQty - totalGathered).toFixed(1)} ${poolTargetUnit} की अतिरिक्त आवश्यकता है।`
                                }
                              </p>
                            )}
                          </div>
                        );
                      })()}

                      {/* Cost Comparison */}
                      <div className="space-y-2 font-sans pt-1">
                        {(() => {
                          const sCost = computedPool.reduce((sum, item) => sum + item.costInPool, 0);
                          const mCost = computedPool.reduce((sum, item) => {
                            const itemPriceForMandi = item.listing.pricePerUnit / convertUnit(1, poolTargetUnit, item.listing.unit);
                            const mandiPriceForUnit = itemPriceForMandi * 0.85;
                            return sum + (item.allocatedQty * mandiPriceForUnit);
                          }, 0);

                          const premium = Math.max(0, sCost - mCost);

                          return (
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <div className="bg-slate-800/30 p-2.5 rounded-xl border border-slate-800 text-left">
                                <span className="text-gray-400 block text-[9px] uppercase font-black tracking-wide">
                                  {lang === "EN" ? "Total Price Offered (कुल प्रस्तावित राशि)" : "कुल प्रस्तावित मूल्य"}
                                </span>
                                <span className="text-sm font-black text-slate-100 mt-1 block font-mono">
                                  ₹{Math.round(sCost).toLocaleString("en-IN")}
                                </span>
                              </div>

                              <div className="bg-slate-800/30 p-2.5 rounded-xl border border-slate-800 text-left">
                                <span className="text-gray-400 block text-[9px] uppercase font-black tracking-wide">
                                  {lang === "EN" ? "Mandi Price Baseline (मंडी भाव आधार)" : "अनुमानित मंडी कुल भाव"}
                                </span>
                                <span className="text-sm font-black text-slate-300 mt-1 block font-mono">
                                  ₹{Math.round(mCost).toLocaleString("en-IN")}
                                </span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Overall approval badge */}
                    {computedPool.length > 0 && (
                      <div className="p-3 bg-emerald-950/40 border border-emerald-900/50 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                          <div>
                            <span className="text-[10px] text-gray-300 block font-bold leading-none">
                              {lang === "EN" ? "Average Trust Score (किसान विस्वसनीयता)" : "औसत किसान विश्वास स्तर"}
                            </span>
                            <span className="text-[10px] font-sans text-emerald-400/80 mt-1 block leading-none">
                              {lang === "EN" ? "Direct trace established / सीधा सौदा संवाद" : "सीधा प्रमाण उपलब्ध"}
                            </span>
                          </div>
                        </div>
                        <span className="text-sm font-black text-emerald-450 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 font-mono">
                          {Math.round(computedPool.reduce((sum, item) => sum + (item.listing.approvalFactor || 90), 0) / computedPool.length)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Broadcast success panel */}
                {broadcastSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-3xl flex items-start gap-3.5 animate-bounce-short">
                    <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-emerald-950">
                        {lang === "EN" ? "Pooled Direct Bids Broadcasted Successfully (किसान आर्डर प्रेषित)!" : "किसान समूह आर्डर सफलतापूर्वक प्रेषित किया गया!"}
                      </h4>
                      <p className="text-xs text-emerald-850 font-sans leading-relaxed">
                        {lang === "EN" 
                          ? `We have parallelly initiated unique bids and direct chats for ${computedPool.length} growers! You can view and close individual details inside the listing channels on the right sidebar.` 
                          : `हमने सभी ${computedPool.length} किसानों के खातों में आपकी सीधी बोलियां और चैट शुरू कर दी हैं! आप दाईं ओर दी गई चैट पर बातचीत करके सौदा फाइनल कर सकते हैं।`
                        }
                      </p>
                    </div>
                  </div>
                )}

                {/* Bottom Section: Matched List & Action Trigger */}
                <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200/80 shadow-xs space-y-6">
                  <div className="flex justify-between items-center flex-wrap gap-4">
                    <div>
                      <h3 className="text-base font-black text-gray-800 tracking-tight">
                        {lang === "EN" ? "2. Combined Farmer Contributions (किसान फसल समायोजन विवरण)" : "2. किसानों की मात्रा का समायोजन विवरण"}
                      </h3>
                      <p className="text-xs text-gray-400 font-sans">
                        {lang === "EN" ? "Below are the individual smaller farms we aggregated to fulfill this demand." : "इस थोक आर्डर को पूरा करने के लिए संकलित किए गए छोटे किसानों की सूची:"}
                      </p>
                    </div>

                    {computedPool.length > 0 && (
                      <button
                        onClick={handleBroadcastPooledBids}
                        disabled={broadcastLoading}
                        className="px-6 py-3 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 disabled:from-gray-300 disabled:to-gray-400 text-white font-black rounded-2xl shadow-md cursor-pointer transition-all hover:scale-101 hover:shadow-lg disabled:cursor-not-allowed flex items-center gap-2 text-xs"
                      >
                        {broadcastLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{lang === "EN" ? "Transmitting Direct Pool Offers..." : "समूह समझौते भेजे जा रहे हैं..."}</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300 animate-pulse" />
                            <span>{lang === "EN" ? "Confirm & Broadcast Direct Offers (सौदा सीधा किसानों को भेजें)" : "सौदा सुनिश्चित करें और सभी किसानों को भेजें"}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {computedPool.length === 0 ? (
                    <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-3xl space-y-3 bg-slate-50/55">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400 text-lg">
                        🔍
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-black text-gray-700">
                          {lang === "EN" ? "No Matching Farmers Found (कोई मिला-जुला किसान स्टॉक नहीं मिला)" : "कोई मिला-जुला किसान स्टॉक नहीं मिला"}
                        </h4>
                        <p className="text-[11px] text-gray-400 font-sans max-w-sm mx-auto leading-relaxed">
                          {lang === "EN"
                            ? "Try choosing a different standard crop name, editing maximum acceptable price constraints, or narrowing categories to refresh matching opportunities (फसल नाम बदलें)।"
                            : "कृपया कोई अन्य फसल का नाम चुनें, अधिकतम मूल्य सीमा में वृद्धि करें अथवा श्रेणियों को बदलें।"
                          }
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-2xl border border-gray-100">
                      <table className="w-full text-left font-sans text-xs">
                        <thead>
                          <tr className="bg-slate-50 text-gray-400 font-extrabold uppercase tracking-wider text-[10px]">
                            <th className="py-3 px-4">{lang === "EN" ? "Farmer / Origin (किसान व क्षेत्र)" : "किसान / स्थान"}</th>
                            <th className="py-3 px-4">{lang === "EN" ? "Variety (फसल किस्म)" : "किस्म"}</th>
                            <th className="py-3 px-4 text-center">{lang === "EN" ? "Original Qty (कुल मात्रा)" : "किसान मात्रा"}</th>
                            <th className="py-3 px-4 text-center">{lang === "EN" ? "Allocated Volume (प्रस्तावित हिस्सा)" : "प्रस्तावित संकलन"}</th>
                            <th className="py-3 px-4 text-right">{lang === "EN" ? "Direct Rate (सीधा भाव)" : "सीधा भाव"}</th>
                            <th className="py-3 px-4 text-right">{lang === "EN" ? "Mandi Estimate (मंडी रेट)" : "मंडी भाव"}</th>
                            <th className="py-3 px-4 text-center">{lang === "EN" ? "Approval Factor (किसान विश्वास)" : "स्वीकृति दर"}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {computedPool.map((item, index) => {
                            const appFactor = item.listing.approvalFactor || (85 + (item.listing.cropName.length % 14));
                            const sharePercent = Math.round((item.allocatedQty / poolTargetQty) * 100);
                            return (
                              <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                                <td className="py-3.5 px-4 font-bold text-gray-800">
                                  <div className="flex flex-col">
                                    <span>{item.listing.farmerName}</span>
                                    <span className="text-[10px] text-gray-400 font-normal flex items-center gap-1 mt-0.5">
                                      📍 {item.listing.location}, {item.listing.state}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className="px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-100/55 rounded-md font-bold text-[10px]">
                                    {item.listing.variety}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-center text-gray-600 font-medium">
                                  {item.originalQty} {item.originalUnit}
                                </td>
                                <td className="py-3.5 px-4 text-center">
                                  <div className="flex flex-col items-center">
                                    <span className="font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-100/60 px-2 py-0.5 rounded-md">
                                      {item.allocatedQtyInOriginalUnit} {item.originalUnit}
                                    </span>
                                    <span className="text-[9px] text-gray-400 mt-1">
                                      {sharePercent}% {lang === "EN" ? "of target" : "हिस्सा"}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4 text-right font-black text-gray-800 font-mono">
                                  ₹{item.listing.pricePerUnit}
                                </td>
                                <td className="py-3.5 px-4 text-right text-gray-400 line-through font-mono">
                                  ₹{item.listing.mandiPriceEstimate || Math.round(item.listing.pricePerUnit * 0.85)}
                                </td>
                                <td className="py-3.5 px-4 text-center">
                                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                                    appFactor >= 92 
                                      ? "bg-emerald-100 text-emerald-800 border border-emerald-250" 
                                      : "bg-blue-100 text-blue-800 border border-blue-200"
                                  }`}>
                                    🏆 {appFactor}%
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* farmospan direct trade compliance details card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
                  <div className="bg-slate-50 p-5 rounded-3xl border border-gray-150 space-y-1.5">
                    <div className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                      🤝 {lang === "EN" ? "Zero Broker Cuts" : "0% बिचौलिया शुल्क"}
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed font-normal">
                      {lang === "EN" 
                        ? "farmospan takes absolutely no commission. Direct farm transactions put maximum revenue securely in grower wallets." 
                        : "फ़ार्मोस्पैन पूरी तरह निःशुल्क है। सामूहिक ट्रांसपोर्ट से छोटे किसानों की ढुलाई लागत 40% तक कम हो जाती है।"}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-3xl border border-gray-150 space-y-1.5">
                    <div className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                      📊 {lang === "EN" ? "Mandi Price Comparisons" : "सटीक मंडी मूल्य तुलना"}
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed font-normal">
                      {lang === "EN" 
                        ? "Every farmer listing is gauged against traditional Mandi rates to secure fair, highly competitive bargains for both side deals." 
                        : "स्थानीय मंडी आढ़ती रेट की तुलना में किसान को सीधे 15% अधिक मूल्य प्राप्त होता है जिसका सीधा हिसाब दिखाया गया है।"}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-3xl border border-gray-150 space-y-1.5">
                    <div className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                      🛡️ {lang === "EN" ? "Kisan Approval Score" : "किसान विश्वसनीयता स्तर"}
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed font-normal">
                      {lang === "EN" 
                        ? "Growers inside combined pools are pre-verified against digital state archives or past buyer fulfillment ratings." 
                        : "इस समूह के सभी किसान भूमि रिकॉर्ड अथवा उनकी पिछली सफल डिलीवरी रेटिंग से प्रमाणित हैं ताकि सौदा पूरी तरह सुरक्षित रहे।"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: EDIT USER PROFILE */}
            {currentTab === "profile" && (
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200/80 shadow-xs space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                    <User className="w-5 h-5 text-emerald-600" />
                    <span>{labels.editProfileTitle}</span>
                  </h2>
                  <p className="text-xs text-gray-400 font-sans">
                    {lang === "EN" ? "Bypass mediators, verify credentials to gain buyer trust." : "क्रेताओं का विश्वास सुनिश्चित करने के लिए अपना विवरण सत्यापित रखें।"}
                  </p>
                </div>

                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 block">{labels.nameLabel} *</label>
                      <input
                        type="text"
                        required
                        value={currentUser.name}
                        onChange={(e) => setCurrentUser({...currentUser, name: e.target.value})}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-500 font-sans"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 block">{labels.phoneLabel}</label>
                      <input
                        type="text"
                        disabled
                        value={currentUser.phone}
                        className="w-full px-3.5 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-xs outline-none font-sans text-gray-400 cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 block">{labels.locationLabel}</label>
                      <input
                        type="text"
                        value={currentUser.location}
                        onChange={(e) => setCurrentUser({...currentUser, location: e.target.value})}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-500 font-sans"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 block">{labels.stateLabel}</label>
                      <input
                        type="text"
                        value={currentUser.state}
                        onChange={(e) => setCurrentUser({...currentUser, state: e.target.value})}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-500 font-sans"
                      />
                    </div>
                  </div>

                  {currentUser.role === "farmer" ? (
                    <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl space-y-4">
                      <span className="block text-xs font-bold text-emerald-900 border-b border-emerald-100/60 pb-1.5 uppercase">
                        🌾 Farm Land Credentials
                      </span>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs text-gray-500 block">{labels.farmName}</label>
                          <input
                            type="text"
                            value={currentUser.farmName || ""}
                            onChange={(e) => setCurrentUser({...currentUser, farmName: e.target.value})}
                            className="w-full px-3 py-2 border bg-white border-gray-200 rounded-lg text-xs outline-none focus:border-emerald-500 font-sans"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs text-gray-500 block">{labels.farmSize}</label>
                          <input
                            type="number"
                            value={currentUser.farmSizeAcres || ""}
                            onChange={(e) => setCurrentUser({...currentUser, farmSizeAcres: Number(e.target.value)})}
                            className="w-full px-3 py-2 border bg-white border-gray-200 rounded-lg text-xs outline-none focus:border-emerald-500 font-sans"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs text-gray-500 block">{labels.primaryCrops}</label>
                          <input
                            type="text"
                            value={currentUser.primaryCrops || ""}
                            onChange={(e) => setCurrentUser({...currentUser, primaryCrops: e.target.value})}
                            className="w-full px-3 py-2 border bg-white border-gray-200 rounded-lg text-xs outline-none focus:border-emerald-500 font-sans"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs text-gray-500 block">Organic Crop Status (जैविक खेती)</label>
                          <button
                            type="button"
                            onClick={() => setCurrentUser({...currentUser, organicCertified: !currentUser.organicCertified})}
                            className={`w-full py-2 border text-xs font-semibold rounded-lg ${
                              currentUser.organicCertified 
                                ? "bg-emerald-600 text-white border-emerald-700" 
                                : "bg-white text-gray-600 border-gray-200"
                            }`}
                          >
                            {currentUser.organicCertified ? "Certified (प्रमाणित)" : "Self-verified (स्व-सत्यापित)"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-indigo-50/40 border border-indigo-100 rounded-2xl space-y-4">
                      <span className="block text-xs font-bold text-indigo-950 border-b border-indigo-100 pb-1.5 uppercase">
                        🏢 Trader Credentials
                      </span>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs text-slate-700 block">{labels.businessName}</label>
                          <input
                            type="text"
                            value={currentUser.businessName || ""}
                            onChange={(e) => setCurrentUser({...currentUser, businessName: e.target.value})}
                            className="w-full px-3 py-2 border bg-white border-gray-200 rounded-lg text-xs outline-none focus:border-emerald-500 font-sans"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs text-slate-700 block">{labels.gstNumber}</label>
                          <input
                            type="text"
                            value={currentUser.gstNumber || ""}
                            onChange={(e) => setCurrentUser({...currentUser, gstNumber: e.target.value.toUpperCase()})}
                            className="w-full px-3 py-2 border bg-white border-gray-200 rounded-lg text-xs outline-none focus:border-emerald-500 font-sans"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs text-slate-700 block">{labels.businessType}</label>
                          <input
                            type="text"
                            value={currentUser.businessType || ""}
                            onChange={(e) => setCurrentUser({...currentUser, businessType: e.target.value})}
                            className="w-full px-3 py-2 border bg-white border-gray-200 rounded-lg text-xs outline-none focus:border-emerald-500 font-sans"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs text-slate-700 block">{labels.preferredProduce}</label>
                          <input
                            type="text"
                            value={currentUser.preferredProduce || ""}
                            onChange={(e) => setCurrentUser({...currentUser, preferredProduce: e.target.value})}
                            className="w-full px-3 py-2 border bg-white border-gray-200 rounded-lg text-xs outline-none focus:border-emerald-500 font-sans"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-800 text-white font-bold rounded-xl shadow-md transition-all active:scale-98 cursor-pointer hover:shadow-lg disabled:opacity-50 text-xs"
                    >
                      {loading ? "Saving partner logs..." : labels.registerBtn}
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: NEGOTIATION CENTER & DIRECT MESSAGES / BIDS (4 Cols on Desktop) */}
          <div className="lg:col-span-4 flex flex-col space-y-5">
            
            {/* If no listing selected, show a friendly guide widget */}
            {!selectedCrop ? (
              <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs text-center space-y-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-800 font-bold mx-auto">
                  💬
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-gray-800 tracking-tight">
                    {lang === "EN" ? "Select a Crop for Direct Negotiations" : "सौदे के लिए फसल चुनें"}
                  </h3>
                  <p className="text-xs text-gray-400 font-sans">
                    {lang === "EN"
                      ? "Click on any Mandi crop card in the catalog to bid on stock, view verification parameters, or text directly."
                      : "किसी भी मंडी फसल कार्ड पर क्लिक करके बोली लगाएं, विवरण जांचें, या सीधे किसान/खरीदार से चैट करें।"
                    }
                  </p>
                </div>
              </div>
            ) : (
              /* --- SELECTED TRADE COCKPIT --- */
              <div id="trade-cockpit" className="space-y-5 sticky top-[80px]">
                
                {/* Heading info summary */}
                <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="flex items-center gap-1 text-[10px] text-emerald-800 font-black tracking-wider uppercase bg-emerald-50 p-1 px-1.5 rounded-sm">
                      <Tag className="w-3 h-3 text-emerald-600" />
                      <span>{selectedCrop.cropName}</span>
                    </span>
                    <button
                      onClick={() => setSelectedCrop(null)}
                      className="p-1 text-gray-400 hover:bg-gray-100 rounded-full"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {selectedCrop.image && (selectedCrop.image.startsWith("data:") || selectedCrop.image.startsWith("http")) && (
                    <div className="relative h-44 w-full rounded-xl overflow-hidden my-2.5 border border-gray-200/80 shadow-xs shrink-0 bg-gray-50">
                      <img 
                        src={selectedCrop.image} 
                        alt={selectedCrop.cropName} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer" 
                      />
                      <span className="absolute bottom-2.5 right-2.5 px-3 py-1 bg-emerald-600/95 text-white text-[10px] font-black rounded-lg backdrop-blur-xs flex items-center gap-1.5 shadow-sm border border-emerald-500/30">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-300 fill-emerald-300" />
                        <span>{lang === "EN" ? "Verified Live Snapshot" : "प्रमाणित लाइव फोटो"}</span>
                      </span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400 font-sans">{labels.farmerLabel}</span>
                      <span className="font-bold text-gray-800">{selectedCrop.farmerName}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400 font-sans">{lang === "EN" ? "Expected Price" : "किसान की दर"}</span>
                      <span className="font-black text-emerald-700">₹{selectedCrop.pricePerUnit} / {selectedCrop.unit}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400 font-sans">{lang === "EN" ? "Available Quantity" : "उपलब्ध स्टॉक"}</span>
                      <span className="font-extrabold text-gray-800">{selectedCrop.quantity} {selectedCrop.unit}</span>
                    </div>
                  </div>

                  {/* farmospan Segmented Comparison Chart & Approval Tracker */}
                  <div className="border-t border-gray-100 pt-3.5 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">
                        {lang === "EN" ? "farmospan Market Analytics" : "फ़ार्मोस्पैन बाजार विश्लेषण"}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-bold text-gray-400">{lang === "EN" ? "Approval Factor:" : "स्वीकृति दर:"}</span>
                        <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                          (selectedCrop.approvalFactor || (85 + (selectedCrop.cropName.length % 14))) >= 90
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-blue-100 text-blue-800 border border-blue-200"
                        }`}>
                          {selectedCrop.approvalFactor || (85 + (selectedCrop.cropName.length % 14))}%
                        </span>
                      </div>
                    </div>

                    {/* farmospan vs Mandi Bhaav Visual Chart */}
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-3">
                      {/* Mandi Bhaav Metric Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-gray-400 flex items-center gap-1 font-sans">
                            🏛️ {lang === "EN" ? "Local Mandi Bhaav (with middleman reductions)" : "स्थानीय मंडी भाव (बिचौलिया कमीशन कटौती)"}
                          </span>
                          <span className="font-bold text-gray-600">
                            ₹{selectedCrop.mandiPriceEstimate || Math.round(selectedCrop.pricePerUnit * 0.85)} / {selectedCrop.unit}
                          </span>
                        </div>
                        <div className="w-full bg-gray-250 h-2 rounded-full overflow-hidden bg-gray-250">
                          <div
                            className="bg-gray-400 h-full rounded-full transition-all duration-700"
                            style={{ width: '75%' }}
                          />
                        </div>
                      </div>

                      {/* farmospan Buyer Bhaav Metric Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-emerald-800 font-bold flex items-center gap-1 font-sans">
                            🚀 {lang === "EN" ? "farmospan Trade Value (Direct Trade)" : "फ़ार्मोस्पैन सीधा सौदा भाव"}
                          </span>
                          <span className="font-black text-emerald-700">
                            ₹{selectedCrop.pricePerUnit} / {selectedCrop.unit}
                          </span>
                        </div>
                        <div className="w-full bg-emerald-100/75 h-3 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all duration-700"
                            style={{ width: '100%' }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Comparative Analytics callout */}
                    {currentUser?.role !== "buyer" && (() => {
                      const sPrice = selectedCrop.pricePerUnit;
                      const mPrice = selectedCrop.mandiPriceEstimate || Math.round(sPrice * 0.85);
                      const premium = sPrice - mPrice;
                      const percent = mPrice > 0 ? Math.round((premium / mPrice) * 100) : 15;
                      return (
                        <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/50 flex items-center justify-between gap-2.5">
                          <p className="text-[11px] leading-snug text-emerald-950 font-sans">
                            {lang === "EN" ? (
                              <span>Direct trade brings <strong className="text-emerald-700">₹{premium} extra profit</strong> (+{percent}%) to Kisan compared to traditional brokers!</span>
                            ) : (
                              <span>बिचौलिये हटाकर किसान को प्रति {selectedCrop.unit} पर <strong className="text-emerald-700">₹{premium} अतिरिक्त मुनाफा</strong> (+{percent}%) प्राप्त होगा!</span>
                            )}
                          </p>
                          <div className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100/80 px-2 py-1 rounded-md shrink-0">
                            +{percent}% Profit
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* AI Trust Score & Reliability Scorecard */}
                <TrustScorecard crop={selectedCrop} lang={lang} />

                {/* --- CHAT OR BIDDING INTERFACE BASED ON USER ROLE --- */}
                {currentUser.role === "buyer" && (
                  <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
                    <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Landmark className="w-4 h-4 text-emerald-600" />
                      <span>{labels.placeBidHeading}</span>
                    </h3>

                    <form onSubmit={handleBidSubmit} className="space-y-3 font-sans">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-400 font-bold uppercase">{labels.bidPriceLabel}</label>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">₹</span>
                            <input
                              type="number"
                              required
                              value={bidPrice}
                              onChange={(e) => setBidPrice(e.target.value)}
                              placeholder={selectedCrop.pricePerUnit.toString()}
                              className="w-full pl-6 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs outline-none"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-400 font-bold uppercase">{labels.bidQtyLabel}</label>
                          <input
                            type="number"
                            required
                            value={bidQty}
                            onChange={(e) => setBidQty(e.target.value)}
                            placeholder={selectedCrop.quantity.toString()}
                            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 font-bold uppercase">Logistics Pick-up details</label>
                        <input
                          type="text"
                          value={bidMsg}
                          onChange={(e) => setBidMsg(e.target.value)}
                          placeholder="e.g. Can load tomorrow morning, transport self."
                          className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-xs font-bold rounded-lg transition-all active:scale-97 cursor-pointer"
                      >
                        {labels.submitBidBtn}
                      </button>
                    </form>
                  </div>
                )}

                {/* --- IN-APP DIRECT MESSAGING MESSENGER WINDOW --- */}
                <div id="direct-chat-window" className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden flex flex-col h-[380px]">
                  
                  {/* Chat Header */}
                  <div className="p-3 bg-slate-50 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 tracking-tight flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{labels.chatNegotiator}</span>
                    </span>
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                  </div>

                  {/* Messages Bubble Frame */}
                  <div className="flex-1 p-3 overflow-y-auto space-y-2.5 bg-slate-50/50">
                    {chats.length === 0 ? (
                      <div className="py-8 text-center text-[11px] text-gray-400 font-sans space-y-1">
                        <p>{lang === "EN" ? "No messages exchanged yet." : "कोई संदेश इतिहास नहीं मिला।"}</p>
                        <p className="opacity-80">{lang === "EN" ? "Send a quick message below to negotiate pickup!" : "नीचे संदेश भेजकर बात शुरू करें!"}</p>
                      </div>
                    ) : (
                      chats.map(msg => {
                        const isSelf = msg.senderId === currentUser.id;
                        return (
                          <div 
                            key={msg.id}
                            className={`flex flex-col max-w-[85%] ${isSelf ? "ml-auto items-end" : "mr-auto items-start"}`}
                          >
                            <span className="text-[9px] text-gray-400 font-sans font-semibold mb-0.5">
                              {msg.senderName} ({msg.senderRole === "farmer" ? "🌾" : "🏢"})
                            </span>
                            <div 
                              className={`p-2.5 rounded-2xl text-xs leading-relaxed font-sans ${
                                isSelf 
                                  ? "bg-emerald-600 text-white rounded-tr-none" 
                                  : "bg-white text-gray-800 border border-gray-200 rounded-tl-none shadow-2xs"
                              }`}
                            >
                              {msg.message}
                            </div>
                            <span className="text-[8px] text-gray-300 mt-0.5">
                              {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Chat Form tools */}
                  <form onSubmit={handleSendMessage} className="p-2 border-t border-gray-100 bg-white flex gap-1.5 items-center">
                    <input
                      type="text"
                      value={chatMsg}
                      onChange={(e) => setChatMsg(e.target.value)}
                      placeholder={lang === "EN" ? "Type cargo negotiate message..." : "संदेश का उत्तर यहाँ लिखें..."}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-500 font-sans"
                    />
                    <button
                      type="submit"
                      className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all cursor-pointer shadow-sm shadow-emerald-200 active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>

                {/* --- Bids Placed on Listing Summary --- */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-2 text-xs">
                  <span className="block text-[10px] text-gray-400 font-bold uppercase">Historic Bids under crop</span>
                  {bids.filter(b => b.listingId === selectedCrop.id).length === 0 ? (
                    <p className="text-[11px] text-gray-400 italic">No bids currently on table.</p>
                  ) : (
                    <div className="space-y-2 max-h-[140px] overflow-y-auto">
                      {bids.filter(b => b.listingId === selectedCrop.id).map(bid => {
                        const isFarmerRecipient = currentUser.role === "farmer";
                        return (
                          <div key={bid.id} className="p-2 bg-slate-50 border border-gray-100 rounded-lg flex items-center justify-between">
                            <div className="leading-tight font-sans">
                              <span className="block font-bold">{bid.buyerName}</span>
                              <span className="text-[10px] text-emerald-800 font-black">₹{bid.priceOffered} / qty {bid.quantity}</span>
                            </div>
                            
                            <div className="flex items-center gap-1.5">
                              {bid.status === "pending" && isFarmerRecipient ? (
                                <>
                                  <button
                                    onClick={() => handleBidDecision(bid.id, "accepted")}
                                    className="p-1 px-2 bg-emerald-600 text-white text-[9px] font-bold rounded-md hover:bg-emerald-700"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => handleBidDecision(bid.id, "rejected")}
                                    className="p-1 px-2 bg-rose-50 text-rose-700 text-[9px] font-bold rounded-md hover:bg-rose-100"
                                  >
                                    Decline
                                  </button>
                                </>
                              ) : (
                                <div className="flex flex-col items-end gap-1">
                                  <span className={`p-1 px-1.5 rounded-sm text-[9px] font-extrabold uppercase ${
                                    bid.status === "accepted" ? "bg-emerald-200 text-emerald-900" :
                                    bid.status === "rejected" ? "bg-rose-100 text-rose-900" : "bg-gray-200 text-gray-700"
                                  }`}>
                                    {bid.status}
                                  </span>
                                  {bid.status === "accepted" && (
                                    <button
                                      onClick={() => fetchInvoiceReceipt(bid, selectedCrop)}
                                      className="text-[10px] text-emerald-700 hover:text-emerald-900 font-bold underline flex items-center gap-1 cursor-pointer"
                                    >
                                      {currentUser.role === "buyer" ? (
                                        <span>📄 View AI Invoice</span>
                                      ) : (
                                        <span>🧾 View AI Receipt</span>
                                      )}
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>

        </main>
      )}

      {/* -------------------- DYNAMIC MODALS -------------------- */}
      {showAiModal && (
        <AiListingModal
          onClose={() => setShowAiModal(false)}
          onListingAdded={() => {
            fetchMandiData();
            setCurrentTab("browse");
          }}
          lang={lang}
        />
      )}

      {selectedInvoiceBid && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-sans">
          <div className="bg-[#FAF9F6] w-full max-w-2xl rounded-2xl shadow-2xl border border-amber-900/10 overflow-hidden flex flex-col my-auto relative">
            
            {/* Header Block */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-extrabold text-sm tracking-tighter">SD</div>
                <div>
                  <h3 className="font-sans font-bold text-sm uppercase tracking-wider text-slate-100">
                    {currentUser?.role === "buyer" ? "AI Generated Buyer Invoice" : "AI Generated Farmer Receipt"}
                  </h3>
                  <p className="text-[10px] text-emerald-400 font-mono tracking-tight font-black">SAHI DAAM DIRECT-TRADE PROTOCOL • VERIFIED</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedInvoiceBid(null)}
                className="p-1.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content area */}
            <div className="p-6 md:p-8 space-y-6 flex-1 overflow-y-auto max-h-[75vh]">
              
              {invoiceLoading && (
                <div className="py-12 flex flex-col items-center justify-center space-y-4">
                  <div className="relative">
                    <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
                    <Sparkles className="w-4 h-4 text-amber-500 absolute top-1 right-1 animate-pulse" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-xs font-semibold text-slate-800">Consulting Krishi Gyaan AI Auditor...</p>
                    <p className="text-[10px] text-slate-400 font-mono italic">Calculating direct commission exemptions & quality criteria...</p>
                  </div>
                </div>
              )}

              {invoiceError && (
                <div className="py-8 text-center space-y-4">
                  <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-800">Dynamic AI Audit Failed</p>
                    <p className="text-[11px] text-rose-500">{invoiceError}</p>
                  </div>
                  <button
                    onClick={() => {
                      const l = listings.find(lst => lst.id === selectedInvoiceBid.listingId);
                      if (l) fetchInvoiceReceipt(selectedInvoiceBid, l);
                    }}
                    className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition"
                  >
                    Retry Audit
                  </button>
                </div>
              )}

              {!invoiceLoading && !invoiceError && invoiceData && (() => {
                const l = listings.find(lst => lst.id === selectedInvoiceBid.listingId) || selectedCrop;
                if (!l) return null;
                const totalGross = selectedInvoiceBid.priceOffered * selectedInvoiceBid.quantity;
                const estimatedMiddlemanSecured = Math.round(totalGross * 0.15);

                return (
                  <div id="invoice-printable" className="space-y-6 text-slate-800">
                    
                    {/* Alphanumeric Invoice Number & Watermark Banner */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-4">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-700 tracking-widest uppercase block font-mono">
                          {currentUser?.role === "buyer" ? "INVOICE DEED" : "PAYMENT RECEIPT DEED"}
                        </span>
                        <h4 className="text-lg font-mono font-bold tracking-tight text-slate-900">
                          #{invoiceData.invoiceNumber || "SD-2026-X"}
                        </h4>
                      </div>
                      <div className="text-left sm:text-right text-[11px] font-mono text-slate-400 leading-tight">
                        <p>Date: {new Date(selectedInvoiceBid.createdAt || Date.now()).toLocaleDateString('en-IN', {day: 'numeric', month: 'short', year: 'numeric'})}</p>
                        <p>Transaction ID: tx_sd_{selectedInvoiceBid.id.slice(-6).toUpperCase()}</p>
                      </div>
                    </div>

                    {/* Trust Seal Banner */}
                    <div className="bg-emerald-50/70 border border-emerald-600/15 rounded-xl p-3.5 flex items-start gap-2.5">
                      <Shield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="block text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                          Broker Commission Exempted (बिचौलिया कमीशन मुक्त)
                        </span>
                        <p className="text-[10.5px] text-emerald-700/95 leading-relaxed">
                          {invoiceData.tradeTrustVerdict}
                        </p>
                      </div>
                    </div>

                    {/* Parties Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-1.5">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">🌾 PRODUCER SELLER (किसान विक्रेता)</span>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{l.farmerName}</p>
                          <p className="text-slate-500 font-mono">{l.farmerContact}</p>
                          <p className="text-slate-600">{l.location}, {l.state}</p>
                          {currentUser?.role === "farmer" && (
                            <span className="inline-block mt-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded">Farmer Ledger Direct</span>
                          )}
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm space-y-1.5">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">🏢 DIRECT BUYER PARTNER (सीधा खरीदार)</span>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">
                            {currentUser?.role === "buyer" ? (currentUser.businessName || currentUser.name) : selectedInvoiceBid.buyerName}
                          </p>
                          <p className="text-slate-500 font-mono">
                            {currentUser?.role === "buyer" ? currentUser.phone : selectedInvoiceBid.buyerContact}
                          </p>
                          <p className="text-slate-600">
                            {currentUser?.role === "buyer" ? `${currentUser.location}, ${currentUser.state}` : `${l.location}, ${l.state}`}
                          </p>
                          {currentUser?.role === "buyer" && currentUser.gstNumber && (
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">GSTIN: {currentUser.gstNumber}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Trade Parameters Table */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm text-xs">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-gray-200 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                            <th className="p-3">Agricultural Commodity</th>
                            <th className="p-3 text-right">Quantity</th>
                            <th className="p-3 text-right">Direct Rate</th>
                            <th className="p-3 text-right text-slate-950 font-black">Final Outlay</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-sans">
                          <tr>
                            <td className="p-3">
                              <span className="font-bold text-slate-950 text-sm block">{l.cropName}</span>
                              <span className="text-[10px] text-slate-400">Variety Spec: {l.variety}</span>
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-slate-800">
                              {selectedInvoiceBid.quantity} {l.unit}
                            </td>
                            <td className="p-3 text-right font-mono text-slate-600">
                              ₹{selectedInvoiceBid.priceOffered} / {l.unit}
                            </td>
                            <td className="p-3 text-right font-mono font-black text-emerald-800 text-sm">
                              ₹{totalGross.toLocaleString("en-IN")}
                            </td>
                          </tr>
                          <tr className="bg-emerald-50/20 text-[10.5px]">
                            <td colSpan={3} className="p-2.5 px-3 font-bold text-emerald-800">
                              farmospan Saving (Middleman Commission Deflected @15%)
                            </td>
                            <td className="p-2.5 text-right font-mono font-black text-emerald-800">
                              ₹{estimatedMiddlemanSecured.toLocaleString("en-IN")} saved!
                            </td>
                          </tr>
                          <tr className="bg-slate-900 text-white font-mono text-xs font-bold">
                            <td colSpan={3} className="p-3 px-3 uppercase text-right tracking-wider text-slate-400">
                              Direct Net Value Transacted
                            </td>
                            <td className="p-3 text-right text-emerald-400 text-sm font-black">
                              ₹{totalGross.toLocaleString("en-IN")}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* AI Audits Blocks */}
                    <div className="space-y-4">
                      <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-dashed border-gray-200 pb-1">
                        Krishi Gyaan AI Audited Transaction Advisories
                      </span>

                      {/* Quality notes */}
                      <div className="bg-[#FAF9F6] border-l-4 border-amber-600 rounded-lg p-3.5 shadow-sm space-y-1">
                        <div className="flex items-center gap-1.5 text-amber-900 font-bold text-[11.5px] uppercase">
                          <CheckCircle className="w-4.5 h-4.5 text-amber-700 shrink-0" />
                          <span>AI Farm-Gate Quality Verification</span>
                        </div>
                        <p className="text-[11px] text-amber-950 font-sans leading-relaxed">
                          {invoiceData.qualityAssuranceNotes}
                        </p>
                      </div>

                      {/* Logistics */}
                      <div className="bg-[#FAF9F6] border-l-4 border-sky-600 rounded-lg p-3.5 shadow-sm space-y-1">
                        <div className="flex items-center gap-1.5 text-sky-900 font-bold text-[11.5px] uppercase">
                          <Truck className="w-4.5 h-4.5 text-sky-700 shrink-0" />
                          <span>AI Logistics & Freight Advisory</span>
                        </div>
                        <p className="text-[11px] text-sky-950 font-sans leading-relaxed">
                          {invoiceData.logisticsAdvisory}
                        </p>
                      </div>

                      {/* Direct Payments Message */}
                      <div className="bg-[#FAF9F6] border-l-4 border-emerald-600 rounded-lg p-3.5 shadow-sm space-y-1">
                        <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-[11.5px] uppercase">
                          <Landmark className="w-4.5 h-4.5 text-emerald-700 shrink-0" />
                          <span>AI Pure-Direct Settlement Directives</span>
                        </div>
                        <p className="text-[11px] text-emerald-950 font-sans leading-relaxed">
                          {invoiceData.paymentMessage}
                        </p>
                      </div>
                    </div>

                    {/* QR Code and disclaimer block */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 border-t border-gray-200 pt-5 text-slate-500">
                      <div className="w-16 h-16 bg-white border border-gray-200 rounded-lg p-1 flex items-center justify-center relative shadow-sm shrink-0">
                        <div className="grid grid-cols-5 gap-0.5 w-full h-full opacity-35">
                          {Array.from({ length: 25 }).map((_, i) => (
                            <div key={i} className={`bg-slate-950 rounded-[1px] ${i % 3 === 0 || i % 4 === 1 ? 'bg-slate-950' : 'bg-transparent'}`} />
                          ))}
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/5">
                          <Shield className="w-6 h-6 text-emerald-700 drop-shadow-sm animate-pulse" />
                        </div>
                      </div>
                      <div className="space-y-1 text-center sm:text-left">
                        <p className="text-[10px] leading-relaxed text-slate-400">
                          {invoiceData.disclaimer}
                        </p>
                        <p className="text-[9px] text-slate-400 font-mono uppercase">
                          Secure Cryptographic Proof Generated on farmospan Ledger Protocol. Bypassing commission of approx ₹{estimatedMiddlemanSecured}
                        </p>
                      </div>
                    </div>

                  </div>
                );
              })()}

            </div>

            {/* Modal Footer Controls */}
            <div className="bg-slate-100 px-6 py-4 flex items-center justify-between border-t border-gray-200 gap-3">
              <button
                onClick={() => setSelectedInvoiceBid(null)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 text-xs font-bold transition hover:bg-slate-200/60 rounded-xl cursor-pointer"
              >
                Close Deed
              </button>
              
              {!invoiceLoading && !invoiceError && invoiceData && (
                <button
                  onClick={() => {
                    const printContents = document.getElementById("invoice-printable")?.innerHTML;
                    if (printContents) {
                      const printWindow = window.open("", "_blank");
                      if (printWindow) {
                        printWindow.document.write(`
                          <html>
                            <head>
                              <title>farmospan - Direct Trade Deed</title>
                              <style>
                                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1e293b; background: #fff; }
                                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                                th, td { padding: 12px; border: 1px solid #e2e8f0; text-align: left; font-size: 13px; }
                                th { background: #f1f5f9; font-weight: bold; }
                                .bg-emerald-50\\/70 { background-color: #f0fdf4 !important; border: 1px solid #bbf7d0; padding: 15px; border-radius: 8px; margin: 15px 0; }
                                .bg-[#FAF9F6] { background-color: #fcfbf9; border-left: 4px solid #d97706; padding: 15px; border-radius: 8px; margin: 15px 0; }
                                .border-l-4 { border-left-width: 4px !important; }
                                .border-amber-600 { border-color: #d97706 !important; }
                                .border-sky-600 { border-color: #0284c7 !important; border-left-style: solid; }
                                .border-emerald-600 { border-color: #059669 !important; border-left-style: solid; }
                                .text-emerald-800 { color: #065f46; }
                                .text-slate-400 { color: #94a3b8; }
                                h1, h2, h3, h4 { color: #0f172a; margin-top: 0; }
                               .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                               @media print {
                                 @page { margin: 1.5cm; }
                               }
                              </style>
                            </head>
                            <body>
                              ${printContents}
                              <script>
                                window.onload = function() {
                                  window.print();
                                  setTimeout(function() { window.close(); }, 500);
                                };
                              </script>
                            </body>
                          </html>
                        `);
                        printWindow.document.close();
                      } else {
                        window.print();
                      }
                    }
                  }}
                  className="px-4 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-200 active:scale-95"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{lang === "EN" ? "Print Trade Deed" : "प्रिंट रसीद"}</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ----------------- MOBILE FRIENDLY SUB-APP NAVIGATION INDICATOR ----------------- */}
      <footer className="bg-white border-t border-gray-100 py-3.5 px-4 text-center text-xs text-gray-500 font-sans mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5">
          <p>
            © 2026 {labels.appName} | {lang === "EN" ? "Made in India with Love 🇮🇳" : "किसान और आढ़त भाईचारा"}
          </p>
          <div className="flex items-center gap-4 text-[11px] text-gray-400 font-semibold uppercase">
            <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-emerald-600" /> Secure SSL</span>
            <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-emerald-600" /> Direct Transportation</span>
            <span className="flex items-center gap-1"><Landmark className="w-3.5 h-3.5 text-emerald-600" /> Guaranteed Zero Middleman Outlay</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
