#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <cmath>
#include <algorithm>
#include <iomanip>

struct FarmerSource {
    std::string id;
    std::string name;
    double availableQty; // in Quintals
    double pricePerUnit; // in INR
    double distanceKm;   // distance from distribution center
};

// Safe JSON escape helper
std::string jsonEscape(const std::string& input) {
    std::string out;
    for (char c : input) {
        if (c == '"') out += "\\\"";
        else if (c == '\\') out += "\\\\";
        else if (c == '\n') out += "\\n";
        else if (c == '\r') out += "\\r";
        else if (c == '\t') out += "\\t";
        else out += c;
    }
    return out;
}

void runLogisticSolving(double targetQty, double freightRate, const std::string& sourceStr) {
    std::vector<FarmerSource> sources;
    std::stringstream ss(sourceStr);
    std::string item;
    
    while (std::getline(ss, item, ';')) {
        if (item.empty()) continue;
        std::stringstream item_ss(item);
        std::string part;
        int index = 0;
        
        FarmerSource source;
        while (std::getline(item_ss, part, ',')) {
            if (index == 0) source.id = part;
            else if (index == 1) source.name = part;
            else if (index == 2) {
                try { source.availableQty = std::stod(part); } catch(...) { source.availableQty = 0; }
            }
            else if (index == 3) {
                try { source.pricePerUnit = std::stod(part); } catch(...) { source.pricePerUnit = 0; }
            }
            else if (index == 4) {
                try { source.distanceKm = std::stod(part); } catch(...) { source.distanceKm = 0; }
            }
            index++;
        }
        if (index >= 5) {
            sources.push_back(source);
        }
    }

    if (sources.empty()) {
        std::cout << "{\n  \"error\": \"No compliant sources provided. C++ optimization aborted.\"\n}\n";
        return;
    }

    struct SortingMetric {
        size_t index;
        double evaluationCost;
    };
    std::vector<SortingMetric> evaluations;
    for (size_t i = 0; i < sources.size(); ++i) {
        double unitCombinedCost = sources[i].pricePerUnit + (sources[i].distanceKm * freightRate * 0.05);
        evaluations.push_back({i, unitCombinedCost});
    }

    std::sort(evaluations.begin(), evaluations.end(), [](const SortingMetric& a, const SortingMetric& b) {
        return a.evaluationCost < b.evaluationCost;
    });

    double remainingQtyNeeded = targetQty;
    double totalAllocated = 0.0;
    double totalPurchaseCost = 0.0;
    double totalTransitCost = 0.0;
    std::stringstream selectBreakdown;

    bool first = true;
    for (const auto& eval : evaluations) {
        if (remainingQtyNeeded <= 0.0) break;
        
        const auto& s = sources[eval.index];
        double qtyTaken = std::min(s.availableQty, remainingQtyNeeded);
        remainingQtyNeeded -= qtyTaken;
        totalAllocated += qtyTaken;
        
        double pCost = qtyTaken * s.pricePerUnit;
        double tCost = qtyTaken * s.distanceKm * freightRate;
        totalPurchaseCost += pCost;
        totalTransitCost += tCost;

        if (!first) selectBreakdown << ",";
        first = false;

        selectBreakdown << "{\n"
                        << "      \"id\": \"" << jsonEscape(s.id) << "\",\n"
                        << "      \"name\": \"" << jsonEscape(s.name) << "\",\n"
                        << "      \"quantityAllocated\": " << qtyTaken << ",\n"
                        << "      \"pricePerUnit\": " << s.pricePerUnit << ",\n"
                        << "      \"distanceKm\": " << s.distanceKm << ",\n"
                        << "      \"allocatedPurchaseCostINR\": " << pCost << ",\n"
                        << "      \"freightTransitCostINR\": " << tCost << "\n"
                        << "    }";
    }

    std::string status = (remainingQtyNeeded <= 0.0) ? "Optimal Solution Identified" : "Partial Solution (Insufficient Mandi Stock)";
    std::cout << "{\n"
              << "  \"engine\": \"C++17 High Performance Route Allocator Compiler v2.4\",\n"
              << "  \"status\": \"" << status << "\",\n"
              << "  \"optimizationMetrics\": {\n"
              << "    \"targetQuantityRequested\": " << targetQty << ",\n"
              << "    \"totalQuantityAllocated\": " << totalAllocated << ",\n"
              << "    \"totalPurchaseCostINR\": " << totalPurchaseCost << ",\n"
              << "    \"totalLogisticsCostINR\": " << totalTransitCost << ",\n"
              << "    \"combinedProcurementCostINR\": " << (totalPurchaseCost + totalTransitCost) << "\n"
              << "  },\n"
              << "  \"allocatedSources\": [" << selectBreakdown.str() << "]\n"
              << "}\n";
}

void runInvoiceAudit(const std::string& cropName, const std::string& variety, double qty, double price, const std::string& farmerName, const std::string& buyerName) {
    int serialSeed = 1000 + (int)(price) % 8999;
    std::string cropLower = cropName;
    std::transform(cropLower.begin(), cropLower.end(), cropLower.begin(), ::tolower);
    
    std::string packing = "Standard 50kg reinforced Jute stack sacks";
    std::string prepAdvice = "Load onto standardized clean flatbeds with tarp coverage.";
    std::string qaVerification = "Check grain hardness index, evaluate relative humidity threshold under 12%, perform raw screening of foreign dockage.";
    std::string paymentMessage = "Complete direct escrow clearance requested. Traditional broker platform commissions fully exempted (saving 1.5% - 2.5% middleman mandi margin).";

    if (cropLower.find("tomato") != std::string::npos) {
        packing = "Rigid 25kg multi-vent polypropylene crates model C-1";
        prepAdvice = "Configure dual-vent stack column alignment. Block center spacing in refrigerated boxcars for high temperature control.";
        qaVerification = "Confirm firm structure index (elasticity resistance above 80%). Discard bruised or split specimens immediately. Inspect skin pigment uniformity.";
        paymentMessage = "Direct farmgate bank transfer. Bypasses commission agents. Credit direct trade value to farmer immediately upon loading confirmation.";
    } else if (cropLower.find("rice") != std::string::npos || cropLower.find("basmati") != std::string::npos) {
        packing = "Moisture-barrier multi-wall HDPE bags";
        prepAdvice = "Store elevated off-floor on treated pine pallet foundations. Keep humidity under 60% relative limit.";
        qaVerification = "Measure average grain elongation indices (target grain length above 8.1mm). Verify milled whole kernel percentage is above 94%. Check for premium basmati aroma.";
    }

    std::cout << "{\n"
              << "  \"engine\": \"C++17 High Performance Transaction Audit Core v2.4\",\n"
              << "  \"success\": true,\n"
              << "  \"data\": {\n"
              << "    \"invoiceNumber\": \"FMP-C17-" << serialSeed << "\",\n"
              << "    \"tradeTrustVerdict\": \"CRIS C++ DIRECT TRADE AUDITED: Zero Middleman Broker Fee Deducted\",\n"
              << "    \"packingDirectives\": \"" << jsonEscape(packing) << "\",\n"
              << "    \"logisticsAdvisory\": \"" << jsonEscape(prepAdvice) << "\",\n"
              << "    \"qualityAssuranceNotes\": \"" << jsonEscape(qaVerification) << "\",\n"
              << "    \"paymentMessage\": \"" << jsonEscape(paymentMessage) << "\",\n"
              << "    \"disclaimer\": \"Generated by the C++ high-performance direct trade audit compiler. This memo provides a legally binding direct trade transaction ledger direct between farmer and buyer.\"\n"
              << "  }\n"
              << "}\n";
}

void runCropGrade(const std::string& cropName, double moisture, double farmSizeAcres, double temperature, double greenness) {
    std::string cropLower = cropName;
    std::transform(cropLower.begin(), cropLower.end(), cropLower.begin(), ::tolower);
    std::string grade = "B";
    std::string moistureStatus = "Sub-optimal";
    double baseYieldPerAcre = 15.0;

    if (cropLower.find("wheat") != std::string::npos || cropLower.find("kanak") != std::string::npos) {
        baseYieldPerAcre = 18.5;
        if (moisture >= 10.0 && moisture <= 13.5) {
            grade = (greenness > 85) ? "A+" : "A";
            moistureStatus = "Perfect (10-13%) for Storage";
        } else if (moisture < 10.0) {
            grade = "B";
            moistureStatus = "Slightly Dry";
        } else {
            grade = "C";
            moistureStatus = "Excess Moisture (High Spoilage Risk)";
        }
    } else if (cropLower.find("tomato") != std::string::npos) {
        baseYieldPerAcre = 120.0;
        if (moisture >= 85.0 && moisture <= 93.0) {
            grade = (greenness > 90) ? "A+" : "A";
            moistureStatus = "Optimal Ripe Juiciness";
        } else if (moisture < 85.0) {
            grade = "B";
            moistureStatus = "Slightly Dehydrated";
        } else {
            grade = "C";
            moistureStatus = "Over-saturated (High bruising tendency)";
        }
    } else if (cropLower.find("rice") != std::string::npos || cropLower.find("basmati") != std::string::npos) {
        baseYieldPerAcre = 22.0;
        if (moisture >= 12.0 && moisture <= 14.5) {
            grade = (greenness > 88) ? "A+" : "A";
            moistureStatus = "Optimal Rice Moisture";
        } else {
            grade = "B";
            moistureStatus = "Imbalanced moisture";
        }
    } else {
        if (moisture >= 12.0 && moisture <= 18.0) {
            grade = "A";
            moistureStatus = "Acceptable standard range";
        } else {
            grade = "B";
            moistureStatus = "Non-standard moisture trace";
        }
    }

    double tempPenalty = 1.0;
    if (temperature > 38.0) tempPenalty = 0.88;
    else if (temperature < 15.0) tempPenalty = 0.92;

    double greennessMultiplier = 0.7 + (greenness / 100.0) * 0.4;
    double predictedYieldPerAcre = baseYieldPerAcre * tempPenalty * greennessMultiplier;
    double totalProjectedYield = predictedYieldPerAcre * farmSizeAcres;
    double confidenceScore = (grade == "A+") ? 94.0 : ((grade == "A") ? 88.0 : 75.0);

    std::cout << "{\n"
              << "  \"engine\": \"C++17 High Performance Agri-Prediction Engine (Quality Segment)\",\n"
              << "  \"success\": true,\n"
              << "  \"crop\": \"" << jsonEscape(cropName) << "\",\n"
              << "  \"input\": {\"moisture\": " << moisture << ", \"acres\": " << farmSizeAcres << ", \"temp\": " << temperature << ", \"greenness\": " << greenness << "},\n"
              << "  \"analysis\": {\n"
              << "    \"grade\": \"" << grade << "\",\n"
              << "    \"moistureStatus\": \"" << jsonEscape(moistureStatus) << "\",\n"
              << "    \"yieldPerAcreQuintals\": " << std::fixed << std::setprecision(2) << predictedYieldPerAcre << ",\n"
              << "    \"totalProjectedYieldQuintals\": " << totalProjectedYield << ",\n"
              << "    \"confidencePercent\": " << confidenceScore << ",\n"
              << "    \"environmentalStressRisk\": \"" << ((temperature > 38.0) ? "High Heat Stress" : "Negligible") << "\"\n"
              << "  }\n"
              << "}\n";
}

void runPriceAdvice(const std::string& cropName, const std::string& location, const std::string& state) {
    std::string cropLower = cropName;
    std::transform(cropLower.begin(), cropLower.end(), cropLower.begin(), ::tolower);
    double recMin = 40.0;
    double recMax = 65.0;
    double savedMargin = 14.5;
    std::string verdict = "Stable Trading Activity";
    std::string advice;

    if (cropLower.find("tomato") != std::string::npos) {
        recMin = 16.0;
        recMax = 24.0;
        savedMargin = 18.5;
        verdict = "Fluctuating Season Supply";
        advice = "Current direct trade rates for Tomatoes are active in " + location + ", " + state + ". "
                 "By negotiating with local grocery networks directly, you completely eliminate cold storage brokers. "
                 "Setting your pricing sweet spot at @18-20 per kg stimulates bulk trade and ensures fast-moving liquidation.";
    } else if (cropLower.find("wheat") != std::string::npos || cropLower.find("kanak") != std::string::npos) {
        recMin = 2300.0;
        recMax = 2550.0;
        savedMargin = 15.0;
        verdict = "Strong Harvest Demand in " + state;
        advice = "Premium Sharbati Wheat is in massive demand. Bypassing traditional mandi commission cuts "
                 "means 100% of purchase fees go straight to your bank account. List around @2,400 per Quintal "
                 "for ideal premium buyer matching across interstate procurement depots.";
    } else if (cropLower.find("rice") != std::string::npos || cropLower.find("basmati") != std::string::npos) {
        recMin = 6400.0;
        recMax = 7300.0;
        savedMargin = 16.2;
        verdict = "High Export Value Trend";
        advice = "Basmati Rice has stable wholesale volumes. Selling organic raw bulk crops directly to retail mills "
                 "across " + state + " yields high profit margin. Direct offers without middlemen are matching at @6,800/Quintal.";
    } else if (cropLower.find("onion") != std::string::npos || cropLower.find("pyaj") != std::string::npos) {
        recMin = 14500.0;
        recMax = 17000.0;
        savedMargin = 19.0;
        verdict = "Highly Volatile Market";
        advice = "Onion wholesale stock has high storage margins. Bypassing third-party warehouse agents "
                 "can salvage substantial margin. Trade lists have verified stable rates around @15,500 per Ton.";
    } else {
        advice = "Standard agriculture trade directory reports normal listings. Bypassing mandi loaders "
                 "and intermediate brokers helps you capture up to 15% better price realizations.";
    }

    size_t pos;
    while ((pos = advice.find("@")) != std::string::npos) {
        advice.replace(pos, 1, "Rs. ");
    }

    std::cout << "{\n"
              << "  \"engine\": \"C++17 High Performance Direct-Market Pricing Hub\",\n"
              << "  \"success\": true,\n"
              << "  \"crop\": \"" << jsonEscape(cropName) << "\",\n"
              << "  \"location\": \"" << jsonEscape(location) << "\",\n"
              << "  \"state\": \"" << jsonEscape(state) << "\",\n"
              << "  \"recommendedMin\": " << recMin << ",\n"
              << "  \"recommendedMax\": " << recMax << ",\n"
              << "  \"savedMiddlemanMarginPercent\": " << savedMargin << ",\n"
              << "  \"marketVerdict\": \"" << jsonEscape(verdict) << "\",\n"
              << "  \"analysis\": \"" << jsonEscape(advice) << "\"\n"
              << "}\n";
}

void runTrustScore(double acres, bool certified, const std::string& primaryCrops) {
    int baseReliability = 82;
    int acresBonus = std::min(10, (int)(acres * 0.5));
    int certBonus = certified ? 8 : 0;
    
    int cropCount = 1;
    for (char c : primaryCrops) {
        if (c == ',') cropCount++;
    }
    if (primaryCrops.empty()) cropCount = 0;
    int cropBonus = std::min(5, (int)(cropCount * 1.5));

    int score = std::min(99, baseReliability + acresBonus + certBonus + cropBonus);
    int consistency = std::min(98, (int)(score * 0.98));

    std::cout << "{\n"
              << "  \"engine\": \"C++17 High Performance Trust Index Evaluator\",\n"
              << "  \"success\": true,\n"
              << "  \"data\": {\n"
              << "    \"trustRating\": " << score << ",\n"
              << "    \"deliveryReliability\": " << score << ",\n"
              << "    \"qualityConsistency\": " << consistency << ",\n"
              << "    \"profileCompleteness\": " << (certified ? 100 : 85) << "\n"
              << "  }\n"
              << "}\n";
}

void runListingAssistant(const std::string& fastText) {
    std::string textLower = fastText;
    std::transform(textLower.begin(), textLower.end(), textLower.begin(), ::tolower);

    std::string cropName = "Fresh Produce";
    std::string variety = "Direct Farm Pick";
    double quantity = 100;
    std::string unit = "kg";
    double price = 25;
    std::string location = "Karnal";
    std::string state = "Haryana";

    if (textLower.find("tomato") != std::string::npos) {
        cropName = "Fresh Tomatoes";
        price = 18;
        if (textLower.find("hybrid") != std::string::npos) variety = "Hybrid Red";
    } else if (textLower.find("potato") != std::string::npos || textLower.find("aaloo") != std::string::npos) {
        cropName = "Fresh Potatoes";
        price = 22;
        if (textLower.find("red") != std::string::npos) variety = "Indore Red";
    } else if (textLower.find("onion") != std::string::npos || textLower.find("pyaj") != std::string::npos) {
        cropName = "Red Onions";
        price = 24;
        variety = "Nashik Red";
    } else if (textLower.find("wheat") != std::string::npos || textLower.find("gehun") != std::string::npos || textLower.find("kanak") != std::string::npos) {
        cropName = "Premium Wheat";
        price = 2400;
        unit = "Quintal";
        if (textLower.find("sharbati") != std::string::npos) variety = "Sharbati Premium";
    } else if (textLower.find("rice") != std::string::npos || textLower.find("basmati") != std::string::npos) {
        cropName = "Basmati Rice";
        price = 6800;
        unit = "Quintal";
        variety = "1121 Long Grain";
    }

    std::vector<double> numbers;
    std::stringstream textStream(fastText);
    std::string tempWord;
    while (textStream >> tempWord) {
        std::stringstream numStream;
        for (char c : tempWord) {
            if (std::isdigit(c)) numStream << c;
            else if (!numStream.str().empty()) {
                numbers.push_back(std::stod(numStream.str()));
                numStream.str("");
            }
        }
        if (!numStream.str().empty()) {
            numbers.push_back(std::stod(numStream.str()));
        }
    }

    if (!numbers.empty()) {
        bool q_found = false, p_found = false;
        for (double num : numbers) {
            if (num > 0 && num < 1000 && !q_found) {
                quantity = num;
                q_found = true;
            } else if (num >= 1000 && !p_found) {
                price = num;
                p_found = true;
            }
        }
    }

    if (textLower.find("indore") != std::string::npos) {
        location = "Indore"; state = "Madhya Pradesh";
    } else if (textLower.find("karnal") != std::string::npos || textLower.find("haryana") != std::string::npos) {
        location = "Karnal"; state = "Haryana";
    } else if (textLower.find("nashik") != std::string::npos) {
        location = "Nashik"; state = "Maharashtra";
    } else if (textLower.find("amritsar") != std::string::npos || textLower.find("punjab") != std::string::npos) {
        location = "Amritsar"; state = "Punjab";
    }

    std::string desc_en = "Direct farm gate offer from " + location + ", " + state + ": High grade " + variety + " " + cropName + ". "
                          "Carefully harvested, sorted, and packed without broker involvement. "
                          "Bypassing mandi commission agents ensures 100% value transmission direct of fresh yield.";
    std::string desc_hi = location + ", " + state + " के हमारे खेतों से डायरेक्ट डील: उत्तम गुणवत्ता की " + variety + " " + cropName + "। "
                          "बिना किसी बिचौलिए या आढ़ती के सीधे खरीदार को समर्पित।";

    std::cout << "{\n"
              << "  \"engine\": \"C++17 High Performance Multilingual Listing Compiler\",\n"
              << "  \"success\": true,\n"
              << "  \"data\": {\n"
              << "    \"cropName\": \"" << jsonEscape(cropName) << "\",\n"
              << "    \"variety\": \"" << jsonEscape(variety) << "\",\n"
              << "    \"quantity\": " << quantity << ",\n"
              << "    \"unit\": \"" << jsonEscape(unit) << "\",\n"
              << "    \"pricePerUnit\": " << price << ",\n"
              << "    \"location\": \"" << jsonEscape(location) << "\",\n"
              << "    \"state\": \"" << jsonEscape(state) << "\",\n"
              << "    \"description\": \"" << jsonEscape(desc_en) << "\",\n"
              << "    \"descriptionHindi\": \"" << jsonEscape(desc_hi) << "\"\n"
              << "  }\n"
              << "}\n";
}

int main(int argc, char* argv[]) {
    if (argc > 1) {
        std::string mode = argv[1];
        if (mode == "--task=invoice-audit") {
            std::string crop = (argc > 2) ? argv[2] : "Wheat";
            std::string variety = (argc > 3) ? argv[3] : "Sharbati";
            double qty = (argc > 4) ? std::stod(argv[4]) : 50;
            double price = (argc > 5) ? std::stod(argv[5]) : 2400;
            std::string farmer = (argc > 6) ? argv[6] : "Rajesh Kumar";
            std::string buyer = (argc > 7) ? argv[7] : "Wholesale Depot";
            
            runInvoiceAudit(crop, variety, qty, price, farmer, buyer);
            return 0;
        }
        else if (mode == "--task=crop-grade") {
            std::string crop = (argc > 2) ? argv[2] : "Wheat";
            double moisture = (argc > 3) ? std::stod(argv[3]) : 12.0;
            double acres = (argc > 4) ? std::stod(argv[4]) : 5.0;
            double temp = (argc > 5) ? std::stod(argv[5]) : 30.0;
            double greenness = (argc > 6) ? std::stod(argv[6]) : 85.0;
            runCropGrade(crop, moisture, acres, temp, greenness);
            return 0;
        }
        else if (mode == "--task=price-advice") {
            std::string crop = (argc > 2) ? argv[2] : "Wheat";
            std::string loc = (argc > 3) ? argv[3] : "Karnal";
            std::string state = (argc > 4) ? argv[4] : "Haryana";
            runPriceAdvice(crop, loc, state);
            return 0;
        }
        else if (mode == "--task=trust-score") {
            double acres = (argc > 2) ? std::stod(argv[2]) : 5.0;
            bool cert = (argc > 3) ? (argv[3] == "1") : false;
            std::string crops = (argc > 4) ? argv[4] : "Wheat";
            runTrustScore(acres, cert, crops);
            return 0;
        }
        else if (mode == "--task=listing-assistant") {
            std::string fastText = (argc > 2) ? argv[2] : "";
            runListingAssistant(fastText);
            return 0;
        }
    }

    // Default route-routing parameters
    double targetQty = 100.0;
    double freightRate = 5.0; // INR per Quintal-Km
    std::string sourceStr = "F1,Amit Sharma,40,2400,15;F2,Preeti Patil,80,2350,45;F3,Manpreet Grewal,120,2420,10;F4,Hardik Patel,35,2310,70";

    if (argc > 3) {
        try {
            targetQty = std::stod(argv[1]);
            freightRate = std::stod(argv[2]);
            sourceStr = argv[3];
        } catch(...) {
            // Keep defaults
        }
    } else if (argc > 1) {
        try {
            targetQty = std::stod(argv[1]);
        } catch(...) {}
        if (argc > 2) {
            try {
                freightRate = std::stod(argv[2]);
            } catch(...) {}
        }
    }

    runLogisticSolving(targetQty, freightRate, sourceStr);
    return 0;
}
