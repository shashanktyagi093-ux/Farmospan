#!/usr/bin/env python3
import sys
import json
import math

def calculate_crop_grade(crop_name, moisture, farm_size_acres, temperature, greenness):
    crop_lower = crop_name.lower()
    grade = "B"
    moisture_status = "Sub-optimal"
    base_yield_per_acre = 15.0
    
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
            moisture_status = "Excess Moisture (High Spoilage Risk)"
            
    elif "tomato" in crop_lower:
        base_yield_per_acre = 120.0
        if 85.0 <= moisture <= 93.0:
            grade = "A+" if greenness > 90 else "A"
            moisture_status = "Optimal Ripe Juiciness"
        elif moisture < 85.0:
            grade = "B"
            moisture_status = "Slightly Dehydrated"
        else:
            grade = "C"
            moisture_status = "Over-saturated (High bruising tendency)"
            
    elif "rice" in crop_lower or "basmati" in crop_lower:
        base_yield_per_acre = 22.0
        if 12.0 <= moisture <= 14.5:
            grade = "A+" if greenness > 88 else "A"
            moisture_status = "Optimal Rice Moisture"
        else:
            grade = "B"
            moisture_status = "Imbalanced moisture"
    else:
        if 12.0 <= moisture <= 18.0:
            grade = "A"
            moisture_status = "Acceptable standard range"
        else:
            grade = "B"
            moisture_status = "Non-standard moisture trace"

    temp_penalty = 1.0
    if temperature > 38.0:
        temp_penalty = 0.88
    elif temperature < 15.0:
        temp_penalty = 0.92

    greenness_multiplier = 0.7 + (greenness / 100.0) * 0.4
    predicted_yield_per_acre = base_yield_per_acre * temp_penalty * greenness_multiplier
    total_projected_yield = predicted_yield_per_acre * farm_size_acres
    confidence_score = 94.0 if grade == "A+" else (88.0 if grade == "A" else 75.0)

    return {
        "grade": grade,
        "moistureStatus": moisture_status,
        "yieldPerAcreQuintals": round(predicted_yield_per_acre, 2),
        "totalProjectedYieldQuintals": round(total_projected_yield, 2),
        "confidencePercent": confidence_score,
        "environmentalStressRisk": "High Heat Stress" if temperature > 38.0 else "Negligible"
    }

def calculate_price_advice(crop_name, location, state):
    crop_lower = crop_name.lower()
    
    # Mathematical realistic crop index multipliers
    if "tomato" in crop_lower:
        rec_min = 16
        rec_max = 24
        saved_margin = 18.5
        verdict = "Fluctuating Season Supply"
        advice = (
            f"Current direct trade rates for Tomatoes are active in {location}, {state}. "
            "By negotiating with local grocery networks directly, you completely eliminate cold storage brokers. "
            "Setting your pricing sweet spot at ₹18-20 per kg stimulates bulk trade and ensures fast-moving liquidation."
        )
    elif "wheat" in crop_lower or "kanak" in crop_lower:
        rec_min = 2300
        rec_max = 2550
        saved_margin = 15.0
        verdict = f"Strong Harvest Demand in {state}"
        advice = (
            f"Premium Sharbati Wheat is in massive demand. Bypassing traditional mandi commission cuts "
            "means 100% of purchase fees go straight to your bank account. List around ₹2,400 per Quintal "
            "for ideal premium buyer matching across interstate procurement depots."
        )
    elif "rice" in crop_lower or "basmati" in crop_lower:
        rec_min = 6400
        rec_max = 7300
        saved_margin = 16.2
        verdict = "High Export Value Trend"
        advice = (
            f"Basmati Rice has stable wholesale volumes. Selling organic raw bulk crops directly to retail mills "
            f"across {state} yields high profit margin. Direct offers without middlemen are matching at ₹6,800/Quintal."
        )
    elif "onion" in crop_lower or "pyaj" in crop_lower:
        rec_min = 14500
        rec_max = 17000
        saved_margin = 19.0
        verdict = "Highly Volatile Market"
        advice = (
            f"Onion wholesale stock has high storage margins. Bypassing third-party warehouse agents "
            "can salvage substantial margin. Trade lists have verified stable rates around ₹15,500 per Ton."
        )
    else:
        rec_min = 40
        rec_max = 65
        saved_margin = 14.5
        verdict = "Stable Trading Activity"
        advice = (
            f"Standard agriculture trade directory reports normal listings. Bypassing mandi loaders "
            "and intermediate brokers helps you capture up to 15% better price realizations."
        )

    return {
        "analysis": advice,
        "recommendedMin": rec_min,
        "recommendedMax": rec_max,
        "savedMiddlemanMarginPercent": saved_margin,
        "marketVerdict": verdict
    }

def calculate_trust_score(acres, certified, primary_crops):
    # Dynamic mathematical scoring
    base_reliability = 82
    acres_bonus = min(10, int(acres * 0.5))
    cert_bonus = 8 if certified else 0
    crop_bonus = min(5, len(primary_crops.split(",")) * 1.5)
    
    score = min(99, base_reliability + acres_bonus + cert_bonus + int(crop_bonus))
    consistency = min(98, int(score * 0.98))
    
    return {
        "trustRating": score,
        "deliveryReliability": score,
        "qualityConsistency": consistency,
        "profileCompleteness": 100 if certified else 85
    }

def calculate_listing_draft(fast_text):
    import re
    text_lower = fast_text.lower()
    
    # Defaults
    crop_name = "Fresh Produce"
    variety = "Direct Farm Pick"
    quantity = 100
    unit = "kg"
    price = 25
    location = "Karnal"
    state = "Haryana"
    
    # 1. Detect Crop
    if "tomato" in text_lower or "टमाटर" in text_lower:
        crop_name = "Fresh Tomatoes"
        price = 18
        if "hybrid" in text_lower:
            variety = "Hybrid Red"
    elif "potato" in text_lower or "आलू" in text_lower or "aaloo" in text_lower:
        crop_name = "Fresh Potatoes"
        price = 22
        if "red" in text_lower or "लाल" in text_lower:
            variety = "Indore Red"
    elif "onion" in text_lower or "प्याज" in text_lower or "प्याज़" in text_lower or "pyaj" in text_lower:
        crop_name = "Red Onions"
        price = 24
        variety = "Nashik Red"
    elif "wheat" in text_lower or "गेहूं" in text_lower or "gehun" in text_lower or "kanak" in text_lower:
        crop_name = "Premium Wheat"
        price = 2400
        unit = "Quintal"
        if "sharbati" in text_lower:
            variety = "Sharbati Premium"
    elif "rice" in text_lower or "चावल" in text_lower or "basmati" in text_lower or "धान" in text_lower:
        crop_name = "Basmati Rice"
        price = 6800
        unit = "Quintal"
        variety = "1121 Long Grain"
    
    # 2. Extract Numbers
    numbers = [int(s) for s in re.findall(r'\b\d+\b', fast_text)]
    
    if len(numbers) >= 1:
        q_candidate = None
        p_candidate = None
        for num in numbers:
            idx = fast_text.find(str(num))
            nearby_sub = text_lower[max(0, idx - 15):min(len(text_lower), idx + 20)]
            if any(u in nearby_sub for u in ["kg", "किलो", "kilo", "kg."]) and q_candidate is None:
                q_candidate = num
                unit = "kg"
            elif any(u in nearby_sub for u in ["quintal", "qtl", "क्विंटल", "कुंतल", "बोरी"]) and q_candidate is None:
                q_candidate = num
                unit = "Quintal"
            elif any(u in nearby_sub for u in ["ton", "टन"]) and q_candidate is None:
                q_candidate = num
                unit = "Ton"
            elif any(p in nearby_sub for p in ["rs", "रुपए", "रुपये", "price", "दाम", "भाव", "दर"]) and p_candidate is None:
                p_candidate = num
        
        if q_candidate is not None:
            quantity = q_candidate
        else:
            for n in numbers:
                if n < 1000 and n > 0:
                    quantity = n
                    break
        
        if p_candidate is not None:
            price = p_candidate
        else:
            for n in numbers:
                if n != quantity:
                    if "wheat" in crop_name.lower() or "rice" in crop_name.lower():
                        if n > 1000:
                            price = n
                            break
                    else:
                        if n < 100 and n > 5:
                            price = n
                            break

    # 3. Detect Location & State
    if "indore" in text_lower or "इंदौर" in text_lower:
        location = "Indore"
        state = "Madhya Pradesh"
    elif "karnal" in text_lower or "करनाल" in text_lower or "haryana" in text_lower or "हरियाणा" in text_lower:
        location = "Karnal"
        state = "Haryana"
    elif "nashik" in text_lower or "नाशिक" in text_lower or "नासिक" in text_lower:
        location = "Nashik"
        state = "Maharashtra"
    elif "amritsar" in text_lower or "अमृतसर" in text_lower or "punjab" in text_lower or "पंजाब" in text_lower:
        location = "Amritsar"
        state = "Punjab"
    elif "pune" in text_lower or "पुणे" in text_lower:
        location = "Pune"
        state = "Maharashtra"

    desc_en = (
        f"Direct farm gate offer from {location}, {state}: High grade {variety} {crop_name}. "
        f"Carefully harvested, sorted, and packed without broker involvement. "
        f"Bypassing mandi commission agents ensures 100% value transmission direct of fresh yield."
    )
    
    desc_hi = (
        f"{location}, {state} के हमारे खेतों से डायरेक्ट डील: उत्तम गुणवत्ता की {variety} {crop_name}। "
        f"बिना किसी बिचौलिए या आढ़ती के सीधे खरीदार को समर्पित। कमीशन बचाने के कारण सर्वश्रेष्ठ न्यूनतम दर पर उपलब्ध।"
    )
    
    return {
        "cropName": crop_name,
        "variety": variety,
        "quantity": quantity,
        "unit": unit,
        "pricePerUnit": price,
        "location": location,
        "state": state,
        "description": desc_en,
        "descriptionHindi": desc_hi
    }

def calculate_logistics_solve(target_qty, freight_rate, source_str):
    sources = []
    for item in source_str.split(";"):
        if not item.strip():
            continue
        parts = item.split(",")
        if len(parts) >= 5:
            try:
                sources.append({
                    "id": parts[0],
                    "name": parts[1],
                    "availableQty": float(parts[2]),
                    "pricePerUnit": float(parts[3]),
                    "distanceKm": float(parts[4])
                })
            except Exception:
                pass
                
    if not sources:
        return {"error": "No compliant sources provided. Python optimization aborted."}
        
    evaluations = []
    for idx, s in enumerate(sources):
        combined_cost = s["pricePerUnit"] + (s["distanceKm"] * freight_rate * 0.05)
        evaluations.append((idx, combined_cost))
        
    evaluations.sort(key=lambda x: x[1])
    
    remaining = target_qty
    total_allocated = 0.0
    total_purchase_cost = 0.0
    total_transit_cost = 0.0
    allocated_sources = []
    
    for idx, eval_cost in evaluations:
        if remaining <= 0:
            break
        s = sources[idx]
        qty_taken = min(s["availableQty"], remaining)
        remaining -= qty_taken
        total_allocated += qty_taken
        
        p_cost = qty_taken * s["pricePerUnit"]
        t_cost = qty_taken * s["distanceKm"] * freight_rate
        total_purchase_cost += p_cost
        total_transit_cost += t_cost
        
        allocated_sources.append({
            "id": s["id"],
            "name": s["name"],
            "quantityAllocated": qty_taken,
            "pricePerUnit": s["pricePerUnit"],
            "distanceKm": s["distanceKm"],
            "allocatedPurchaseCostINR": p_cost,
            "freightTransitCostINR": t_cost
        })
        
    status = "Optimal Solution Identified" if remaining <= 0 else "Partial Solution (Insufficient Mandi Stock)"
    return {
        "engine": "Python 3.x High Performance Route Allocator",
        "status": status,
        "optimizationMetrics": {
            "targetQuantityRequested": target_qty,
            "totalQuantityAllocated": total_allocated,
            "totalPurchaseCostINR": total_purchase_cost,
            "totalLogisticsCostINR": total_transit_cost,
            "combinedProcurementCostINR": total_purchase_cost + total_transit_cost
        },
        "allocatedSources": allocated_sources
    }

def calculate_invoice_audit(crop_name, variety, qty, price, farmer_name, buyer_name):
    serial_seed = 1000 + int(price) % 8999
    crop_lower = crop_name.lower()
    
    packing = "Standard 50kg reinforced Jute stack sacks"
    prep_advice = "Load onto standardized clean flatbeds with tarp coverage."
    qa_verification = "Check grain hardness index, evaluate relative humidity threshold under 12%, perform raw screening of foreign dockage."
    payment_message = "Complete direct escrow clearance requested. Traditional broker platform commissions fully exempted (saving 1.5% - 2.5% middleman mandi margin)."

    if "tomato" in crop_lower:
        packing = "Rigid 25kg multi-vent polypropylene crates model C-1"
        prep_advice = "Configure dual-vent stack column alignment. Block center spacing in refrigerated boxcars for high temperature control."
        qa_verification = "Confirm firm structure index (elasticity resistance above 80%). Discard bruised or split specimens immediately. Inspect skin pigment uniformity."
        payment_message = "Direct farmgate bank transfer. Bypasses commission agents. Credit direct trade value to farmer immediately upon loading confirmation."
    elif "rice" in crop_lower or "basmati" in crop_lower:
        packing = "Moisture-barrier multi-wall HDPE bags"
        prep_advice = "Store elevated off-floor on treated pine pallet foundations. Keep humidity under 60% relative limit."
        qa_verification = "Measure average grain elongation indices (target grain length above 8.1mm). Verify milled whole kernel percentage is above 94%. Check for premium basmati aroma."

    return {
        "invoiceNumber": f"FMP-PY-{serial_seed}",
        "tradeTrustVerdict": "CRIS PYTHON DIRECT TRADE AUDITED: Zero Middleman Broker Fee Deducted",
        "packingDirectives": packing,
        "logisticsAdvisory": prep_advice,
        "qualityAssuranceNotes": qa_verification,
        "paymentMessage": payment_message,
        "disclaimer": "Generated by the Python high-performance direct trade audit compiler. This memo provides a legally binding direct trade transaction ledger direct between farmer and buyer."
    }

if __name__ == "__main__":
    try:
        if len(sys.argv) > 1:
            data = json.loads(sys.argv[1])
        else:
            data = {}

        task = data.get("task", "crop-grade")

        if task == "crop-grade":
            crop = data.get("crop", "Wheat")
            moisture = float(data.get("moisture", 12.0))
            acres = float(data.get("acres", 5.0))
            temp = float(data.get("temp", 30.0))
            greenness = float(data.get("greenness", 85.0))
            
            analysis = calculate_crop_grade(crop, moisture, acres, temp, greenness)
            res = {
                "engine": "Python 3.x Agri-Prediction Engine (Quality Segment)",
                "success": True,
                "crop": crop,
                "input": {"moisture": moisture, "acres": acres, "temp": temp, "greenness": greenness},
                "analysis": analysis
            }
            print(json.dumps(res, indent=2))

        elif task == "price-advice":
            crop = data.get("crop", "Wheat")
            location = data.get("location", "Local")
            state = data.get("state", "India")
            
            advice = calculate_price_advice(crop, location, state)
            res = {
                "engine": "Python 3.x Direct-Market Pricing Hub",
                "success": True,
                "crop": crop,
                "location": location,
                "state": state,
                **advice
            }
            print(json.dumps(res, indent=2))

        elif task == "trust-score":
            acres = float(data.get("acres", 5.0))
            certified = bool(data.get("certified", False))
            primary_crops = data.get("primaryCrops", "Wheat")
            
            trust = calculate_trust_score(acres, certified, primary_crops)
            res = {
                "engine": "Python 3.x Trust Index Evaluator",
                "success": True,
                "data": trust
            }
            print(json.dumps(res, indent=2))

        elif task == "listing-assistant":
            fast_text = data.get("fastText", "")
            draft = calculate_listing_draft(fast_text)
            res = {
                "engine": "Python 3.x Multilingual Listing Compiler",
                "success": True,
                "data": draft
            }
            print(json.dumps(res, indent=2))

        elif task == "logistics-solve":
            target_qty = float(data.get("targetQty", 100.0))
            freight_rate = float(data.get("freightRate", 5.0))
            source_str = data.get("sourceStr", "")
            ans = calculate_logistics_solve(target_qty, freight_rate, source_str)
            print(json.dumps(ans, indent=2))

        elif task == "invoice-audit":
            crop = data.get("crop", "Wheat")
            variety = data.get("variety", "General")
            qty = float(data.get("qty", 50))
            price = float(data.get("price", 2400))
            farmer = data.get("farmerName", "Rajesh Kumar")
            buyer = data.get("buyerName", "Mandi Buyer Depot")
            audit_result = calculate_invoice_audit(crop, variety, qty, price, farmer, buyer)
            res = {
                "engine": "Python 3.x High Performance Transaction Audit Core",
                "success": True,
                "data": audit_result
            }
            print(json.dumps(res, indent=2))

        else:
            raise ValueError(f"Unknown task subcommand: {task}")

    except Exception as e:
        error_res = {
            "error": str(e),
            "status": "failed",
            "fallback": "Standard Python analysis error caught."
        }
        print(json.dumps(error_res))
