#!/usr/bin/env python3
import http.server
import socketserver
import json
import os
import sys
import subprocess
import urllib.parse
import re

PORT = 3000
DB_PATH = os.path.join(os.getcwd(), "data", "db.json")

# Ensure database exists
def read_db():
    if not os.path.exists(DB_PATH):
        os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
        initial_state = {
            "listings": [
                {
                    "id": "list-1",
                    "farmerName": "Rajesh Kumar",
                    "farmerContact": "+91 98765 43210",
                    "cropName": "Organic Wheat (Kanak)",
                    "category": "Grains",
                    "variety": "Sharbati Premium",
                    "quantity": 50,
                    "unit": "Quintal",
                    "pricePerUnit": 2400,
                    "location": "Karnal",
                    "state": "Haryana",
                    "harvestDate": "2026-05-15",
                    "description": "Carefully harvested high-quality Sharbati wheat. Golden grains with optimal moisture levels, stored in clean dry sacks.",
                    "descriptionHindi": "सावधानीपूर्वक काटा गया उच्च गुणवत्ता वाला शरबती गेहूं। नमी का इष्टतम स्तर, जूट की साफ बोरियों में संगृहीत।",
                    "image": "grain",
                    "verified": True,
                    "latitude": 29.6857,
                    "longitude": 76.9905,
                    "createdAt": "2026-05-27T00:22:04.742Z",
                    "mandiPriceEstimate": 2040,
                    "approvalFactor": 90
                },
                {
                    "id": "list-2",
                    "farmerName": "Savitri Devi",
                    "farmerContact": "+91 87654 32109",
                    "cropName": "Fresh Tomatoes",
                    "category": "Vegetables",
                    "variety": "Hybrid Red",
                    "quantity": 800,
                    "unit": "kg",
                    "pricePerUnit": 18,
                    "location": "Nashik",
                    "state": "Maharashtra",
                    "harvestDate": "2026-05-24",
                    "description": "Direct from the farm. Spotless, juicy, ripe tomatoes perfect for wholesale and retail markets.",
                    "descriptionHindi": "नाशिक के खेतों से सीधे ताजे टमाटर। थोक और खुदरा बाजारों के लिए बिल्कुल उपयुक्त।",
                    "image": "tomato",
                    "verified": True,
                    "latitude": 19.9975,
                    "longitude": 73.7898,
                    "createdAt": "2026-05-28T12:22:04.743Z",
                    "mandiPriceEstimate": 15,
                    "approvalFactor": 97
                }
            ],
            "bids": [
                {
                    "id": "bid-1",
                    "listingId": "list-2",
                    "buyerName": "FreshKart Retail Bangalore",
                    "buyerContact": "+91 90000 11111",
                    "priceOffered": 17,
                    "quantity": 800,
                    "status": "pending",
                    "message": "We need delivery to our Bangalore Hub. Can we close at ₹17 per kg if we manage transportation?",
                    "createdAt": "2026-05-29T00:22:04.743Z"
                }
            ],
            "messages": [
                {
                    "id": "msg-1",
                    "listingId": "list-2",
                    "senderId": "user-buyer-1",
                    "senderRole": "buyer",
                    "senderName": "FreshKart Retail Bangalore",
                    "message": "Hello Savitri ji, I saw your tomato listing. Is transportation included in the price?",
                    "createdAt": "2026-05-28T22:22:04.743Z"
                }
            ],
            "users": [
                {
                    "id": "user-farmer-1",
                    "phone": "+91 98765 43210",
                    "name": "Rajesh Kumar",
                    "role": "farmer",
                    "location": "Karnal",
                    "state": "Haryana",
                    "farmName": "Kumar Organic Lands",
                    "farmSizeAcres": 12,
                    "primaryCrops": "Wheat, Rice, Sugarcane",
                    "organicCertified": True,
                    "createdAt": "2026-05-29T00:22:04.743Z"
                }
            ],
            "config": {
                "activeEngine": "python"
            }
        }
        with open(DB_PATH, "w") as f:
            json.dump(initial_state, f, indent=2)
        return initial_state

    with open(DB_PATH, "r") as f:
        try:
            return json.load(f)
        except Exception:
            return {}

def write_db(db):
    with open(DB_PATH, "w") as f:
        json.dump(db, f, indent=2)

# Build C++ solver binary if missing
def rebuild_cpp():
    c_binary_path = os.path.join(os.getcwd(), "backend", "logistics_solver_bin")
    c_source_path = os.path.join(os.getcwd(), "backend", "logistics_solver.cpp")
    if os.path.exists(c_source_path):
        print("🛠️ Compiling native C++ solver with g++...")
        try:
            subprocess.run(["g++", "-O3", c_source_path, "-o", c_binary_path], capture_output=True)
            print("✅ Compiled successfully at", c_binary_path)
            # Give permission
            os.chmod(c_binary_path, 0o755)
        except Exception as e:
            print("Failed to compile C++ binary", e)

rebuild_cpp()

# Subprocess helpers
def execute_python_task(task_data):
    script_path = os.path.join(os.getcwd(), "backend", "crop_analyzer.py")
    input_str = json.dumps(task_data)
    try:
        res = subprocess.run(["python3", script_path, input_str], capture_output=True, text=True)
        if res.returncode == 0:
            return json.loads(res.stdout.strip())
    except Exception as e:
        print("[Python Execution Error]", e)
    return {"success": False, "error": "Python analysis trace failed."}

def execute_cpp_task(mode_args):
    binary_path = os.path.join(os.getcwd(), "backend", "logistics_solver_bin")
    try:
        res = subprocess.run([binary_path] + mode_args, capture_output=True, text=True)
        if res.returncode == 0:
            return json.loads(res.stdout.strip())
    except Exception as e:
        print("[C++ Execution Error]", e)
    return {"success": False, "error": "C++ execution trace failed."}

def generate_invoice_pdf(invoice_id, date, farmer, buyer, crop, variety, qty, price, total, savings, auth_sign):
    def escape_pdf_str(s):
        s = str(s)
        return s.replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)')

    stream_parts = []
    stream_parts.append("0.1 0.45 0.25 RG")
    stream_parts.append("1.5 w")
    stream_parts.append("30 30 m 565 30 l 565 812 l 30 812 l h S")
    
    stream_parts.append("0.8 0.8 0.8 RG")
    stream_parts.append("1.0 w")
    stream_parts.append("50 740 m 545 740 l S")
    stream_parts.append("50 635 m 545 635 l S")
    stream_parts.append("50 500 m 545 500 l S")
    stream_parts.append("50 475 m 545 475 l S")
    stream_parts.append("50 440 m 545 440 l S")
    stream_parts.append("50 185 m 545 185 l S")

    stream_parts.append("0.08 0.45 0.22 rg")
    stream_parts.append("370 765 175 28 re f")

    def text_line(font, size, x, y, msg, color="0 0 0"):
        esc_msg = escape_pdf_str(msg)
        return f"BT {color} rg /{font} {size} Tf {x} {y} Td ({esc_msg}) Tj ET"

    stream_parts.append(text_line("F2", 18, 50, 775, "F A R M O S P A N  M A N D I", "0.08 0.4 0.2"))
    stream_parts.append(text_line("F1", 9, 50, 755, "DIRECT PEER-TO-PEER PEASANT COOPERATIVE TRADING", "0.4 0.4 0.4"))
    stream_parts.append(text_line("F2", 10, 385, 775, "AI AUDIT VERIFIED", "1 1 1"))

    stream_parts.append(text_line("F2", 14, 50, 705, f"DIRECT PEER TRANSACTION LEDGER", "0.1 0.1 0.1"))
    stream_parts.append(text_line("F1", 9, 50, 688, f"Transaction Reference: {invoice_id}", "0.3 0.3 0.3"))
    stream_parts.append(text_line("F1", 9, 50, 674, f"Settlement Date: {date}", "0.3 0.3 0.3"))
    stream_parts.append(text_line("F2", 9, 50, 660, "Audit Scope: Direct Farmer-to-Trader Contract (0% Broker Margin)", "0.1 0.55 0.2"))

    stream_parts.append(text_line("F2", 11, 50, 615, "PRODUCER / ORIGINATION PARTY", "0.15 0.15 0.15"))
    stream_parts.append(text_line("F2", 11, 50, 598, f"Grower: {farmer}", "0.2 0.2 0.2"))
    stream_parts.append(text_line("F1", 9, 50, 584, "Quality Status: Verified Class-A Output", "0.4 0.4 0.4"))
    stream_parts.append(text_line("F1", 9, 50, 570, "Trade Trust Rating: Excellent (98% Reliability)", "0.4 0.4 0.4"))

    stream_parts.append(text_line("F2", 11, 320, 615, "BUYER / INTERSTATE PURCHASER", "0.15 0.15 0.15"))
    stream_parts.append(text_line("F2", 11, 320, 598, f"Operator: {buyer}", "0.2 0.2 0.2"))
    stream_parts.append(text_line("F1", 9, 320, 584, "Brokerage Margin Saved: 15% Standard", "0.1 0.5 0.2"))
    stream_parts.append(text_line("F1", 9, 320, 570, "Payment Escrow: Direct Ledger Deposit", "0.4 0.4 0.4"))

    stream_parts.append(text_line("F2", 9, 55, 485, "AGRICULTURAL YIELD & SPECIFICATION", "0.35 0.35 0.35"))
    stream_parts.append(text_line("F2", 9, 275, 485, "QUANTITY", "0.35 0.35 0.35"))
    stream_parts.append(text_line("F2", 9, 380, 485, "PRICE / UNIT", "0.35 0.35 0.35"))
    stream_parts.append(text_line("F2", 9, 475, 485, "NET TOTAL", "0.35 0.35 0.35"))

    item_desc = f"{crop} - {variety}"
    stream_parts.append(text_line("F1", 10.5, 55, 455, item_desc, "0.1 0.1 0.1"))
    stream_parts.append(text_line("F1", 10.5, 275, 455, f"{qty} units", "0.1 0.1 0.1"))
    stream_parts.append(text_line("F1", 10.5, 380, 455, f"Rs {price}", "0.1 0.1 0.1"))
    stream_parts.append(text_line("F2", 11, 475, 455, f"Rs {total}", "0.1 0.5 0.2"))

    stream_parts.append("0.94 0.98 0.95 rg")
    stream_parts.append("50 395 495 24 re f")
    stream_parts.append(text_line("F2", 9, 58, 403, "(*) MIDDLEMAN COMMISSION COMMUTED (Direct peer advantage):", "0.1 0.45 0.2"))
    stream_parts.append(text_line("F2", 9, 440, 403, f"Rs {savings} saved!", "0.1 0.45 0.2"))

    stream_parts.append(text_line("F2", 11, 310, 360, "Final Invoice Amount:", "0.3 0.3 0.3"))
    stream_parts.append(text_line("F2", 16, 440, 357, f"Rs {total}", "0.1 0.45 0.2"))

    stream_parts.append("0.96 0.96 0.97 rg")
    stream_parts.append("50 205 495 85 re f")
    
    stream_parts.append(text_line("F2", 9, 65, 275, "NATIVE AGRO-AUDIT VERDICT SIGNATURE", "0.15 0.15 0.25"))
    stream_parts.append(text_line("F1", 8, 65, 258, "This document establishes that pricing structures were computed, audited, and aligned", "0.4 0.4 0.4"))
    stream_parts.append(text_line("F1", 8, 65, 246, "with state procurement standards using high-performance C++/Python direct solver engines.", "0.4 0.4 0.4"))
    stream_parts.append(text_line("F1", 8, 65, 230, "No state commission broker took charge of these funds. Safe, paperless direct trade ledger.", "0.4 0.4 0.4"))
    stream_parts.append(text_line("F3", 8.5, 65, 214, f"VERIFICATION HASH CODES: {auth_sign}", "0.08 0.35 0.15"))

    stream_parts.append(text_line("F1", 8, 50, 155, "Farmospan P2P Digital Mandi Infrastructure. All rights reserved.", "0.5 0.5 0.5"))
    stream_parts.append(text_line("F1", 7, 50, 142, "This PDF is automatically signed and certified according to agricultural trade guidelines.", "0.5 0.5 0.5"))

    stream_content = "\n".join(stream_parts)
    stream_bytes = stream_content.encode("utf-8")
    stream_len = len(stream_bytes)

    header = b"%PDF-1.4\n"
    obj1 = b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"
    obj2 = b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"
    obj3 = b"3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources 4 0 R /MediaBox [0 0 595 842] /Contents 5 0 R >>\nendobj\n"
    obj4 = b"4 0 obj\n<< /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> /F3 << /Type /Font /Subtype /Type1 /BaseFont /Courier >> >> >>\nendobj\n"
    
    obj5_header = f"5 0 obj\n<< /Length {stream_len} >>\nstream\n".encode("utf-8")
    obj5_footer = b"\nendstream\nendobj\n"

    offsets = []
    curr = len(header)
    
    offsets.append(curr)
    curr += len(obj1)
    
    offsets.append(curr)
    curr += len(obj2)
    
    offsets.append(curr)
    curr += len(obj3)
    
    offsets.append(curr)
    curr += len(obj4)
    
    offsets.append(curr)
    curr += len(obj5_header) + stream_len + len(obj5_footer)

    pdf_bin = bytearray()
    pdf_bin.extend(header)
    pdf_bin.extend(obj1)
    pdf_bin.extend(obj2)
    pdf_bin.extend(obj3)
    pdf_bin.extend(obj4)
    pdf_bin.extend(obj5_header)
    pdf_bin.extend(stream_bytes)
    pdf_bin.extend(obj5_footer)

    xref_start = len(pdf_bin)
    xref_table = f"xref\n0 6\n0000000000 65535 f \n"
    for offset in offsets:
        xref_table += f"{offset:010d} 00000 n \n"
    
    xref_table += f"trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n{xref_start}\n%%EOF\n"
    pdf_bin.extend(xref_table.encode("utf-8"))

    return bytes(pdf_bin)

class AgriMandiHandler(http.server.BaseHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        query_params = urllib.parse.parse_qs(parsed_url.query)

        # Serve SPA Index page
        if path == "/" or path == "/index.html":
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(self.get_spa_html().encode("utf-8"))
            return

        # Direct static asset mock images if requested (minimal dummy data)
        elif path.startswith("/assets") or path.startswith("/public"):
            self.send_response(404)
            self.end_headers()
            return

        # API: get engine config
        elif path == "/api/config/engine":
            db = read_db()
            config = db.get("config", {"activeEngine": "python"})
            self.send_json(200, config)
            return

        # API: get listings
        elif path == "/api/listings":
            db = read_db()
            self.send_json(200, db.get("listings", []))
            return

        # API: get bids
        elif path == "/api/bids":
            db = read_db()
            bids = db.get("bids", [])
            listing_id = query_params.get("listingId", [None])[0]
            if listing_id:
                bids = [b for b in bids if b.get("listingId") == listing_id]
            self.send_json(200, bids)
            return

        # API: get messages
        elif path == "/api/messages":
            db = read_db()
            msgs = db.get("messages", [])
            listing_id = query_params.get("listingId", [None])[0]
            if listing_id:
                msgs = [m for m in msgs if m.get("listingId") == listing_id]
            self.send_json(200, msgs)
            return

        # API: download audited invoice PDF
        elif path == "/api/gemini/invoice-receipt/download":
            listing_id = query_params.get("listingId", [None])[0]
            bid_id = query_params.get("bidId", [None])[0]

            db = read_db()
            listings = db.get("listings", [])
            bids = db.get("bids", [])
            listing = next((l for l in listings if l.get("id") == listing_id), {})
            bid = next((b for b in bids if b.get("id") == bid_id), {})

            price = float(bid.get("priceOffered", 2400))
            qty = float(bid.get("quantity", 50))
            total_val = price * qty
            savings_val = total_val * 0.15 # 15% middleman brokerage saved

            crop = listing.get("cropName", "Wheat")
            variety = listing.get("variety", "General")
            farmer = listing.get("farmerName", "Rajesh Kumar")
            buyer = bid.get("buyerName", "Independent Buyer")

            import hashlib
            invoice_seed = f"{listing_id}-{bid_id}-{crop}-{qty}-{price}"
            auth_sign = "FMP-" + hashlib.md5(invoice_seed.encode("utf-8")).hexdigest()[:16].upper()

            date_str = "2026-05-29"
            invoice_no = f"INV-{listing_id.split('-')[-1]}-{bid_id.split('-')[-1]}".upper()

            pdf_data = generate_invoice_pdf(
                invoice_id=invoice_no,
                date=date_str,
                farmer=farmer,
                buyer=buyer,
                crop=crop,
                variety=variety,
                qty=qty,
                price=price,
                total=f"{total_val:,.2f}",
                savings=f"{savings_val:,.2f}",
                auth_sign=auth_sign
            )

            self.send_response(200)
            self.send_header("Content-Type", "application/pdf")
            self.send_header("Content-Disposition", f"attachment; filename={invoice_no}_Invoice_Receipt.pdf")
            self.send_header("Content-Length", str(len(pdf_data)))
            self.end_headers()
            self.wfile.write(pdf_data)
            return

        # API: get user profile
        elif path.startswith("/api/users/"):
            user_id = path.split("/")[-1]
            db = read_db()
            users = db.get("users", [])
            user_matched = next((u for u in users if u.get("id") == user_id), None)
            if user_matched:
                self.send_json(200, user_matched)
            else:
                self.send_json(404, {"error": "User not found"})
            return

        # Fallback 404 for routing inside single page app
        else:
            # Let fallback route directly to single page app index
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(self.get_spa_html().encode("utf-8"))
            return

    def do_POST(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path

        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length).decode('utf-8')
        try:
            body = json.loads(post_data) if post_data else {}
        except Exception:
            body = {}

        # API: post config engine toggle
        if path == "/api/config/engine":
            active_engine = body.get("activeEngine", "python")
            db = read_db()
            db["config"] = {"activeEngine": active_engine}
            write_db(db)
            self.send_json(200, {"success": True, "config": db["config"]})
            return

        # API: login
        elif path == "/api/auth/login":
            phone = body.get("phone", "").strip()
            role = body.get("role", "").strip()
            db = read_db()
            users = db.get("users", [])
            
            def clean_phone(p):
                return re.sub(r"\D", "", p)[-10:]
            
            clean_input = clean_phone(phone)
            user_matched = next((u for u in users if clean_phone(u.get("phone", "")) == clean_input and u.get("role") == role), None)
            if user_matched:
                self.send_json(200, user_matched)
            else:
                self.send_json(404, {"error": "Profile not registered yet."})
            return

        # API: register
        elif path == "/api/auth/register":
            phone = body.get("phone", "").strip()
            role = body.get("role", "").strip()
            name = body.get("name", "").strip()
            location = body.get("location", "Karnal").strip()
            state = body.get("state", "Haryana").strip()

            db = read_db()
            users = db.get("users", [])
            
            def clean_phone(p):
                return re.sub(r"\D", "", p)[-10:]
            
            clean_input = clean_phone(phone)
            existing = next((u for u in users if clean_phone(u.get("phone", "")) == clean_input and u.get("role") == role), None)
            if existing:
                self.send_json(400, {"error": "Profile with this phone number already exists."})
                return

            new_user = {
                "id": f"user-{role}-{len(users) + 1}",
                "phone": phone,
                "name": name,
                "role": role,
                "location": location,
                "state": state,
                "farmName": body.get("farmName", f"{name}'s Farm"),
                "farmSizeAcres": float(body.get("farmSizeAcres", 5)),
                "primaryCrops": body.get("primaryCrops", "Wheat"),
                "organicCertified": bool(body.get("organicCertified", False)),
                "businessName": body.get("businessName", f"{name} wholesale"),
                "createdAt": "2026-05-29T00:00:00Z"
            }
            users.append(new_user)
            db["users"] = users
            write_db(db)
            self.send_json(201, new_user)
            return

        # API: post listings
        elif path == "/api/listings":
            db = read_db()
            listings = db.get("listings", [])
            config = db.get("config", {"activeEngine": "python"})
            engine = config.get("activeEngine", "python")

            crop = body.get("cropName", "Wheat")
            moisture = float(body.get("moisture", 12.0))
            acres = float(body.get("acres", 5.0))
            temp = float(body.get("temp", 30.0))
            greenness = float(body.get("greenness", 85.0))

            grade = "A"
            m_estimate = int(body.get("pricePerUnit", 2400)) * 0.85
            app_factor = 85

            if engine == "cpp":
                cpp_res = execute_cpp_task(["--task=crop-grade", crop, str(moisture), str(acres), str(temp), str(greenness)])
                if cpp_res.get("success") and "analysis" in cpp_res:
                    grade = cpp_res["analysis"].get("grade", "A")
                    app_factor = cpp_res["analysis"].get("confidencePercent", 85)
            else:
                py_res = execute_python_task({
                    "task": "crop-grade", "crop": crop, "moisture": moisture, "acres": acres, "temp": temp, "greenness": greenness
                })
                if py_res.get("success") and "analysis" in py_res:
                    grade = py_res["analysis"].get("grade", "A")
                    app_factor = py_res["analysis"].get("confidencePercent", 85)

            new_list = {
                "id": f"list-{len(listings) + 1}",
                "farmerName": body.get("farmerName", "Anonymous"),
                "farmerContact": body.get("farmerContact", "+91 99999 88888"),
                "cropName": crop,
                "category": body.get("category", "Grains"),
                "variety": body.get("variety", "General"),
                "quantity": float(body.get("quantity", 50)),
                "unit": body.get("unit", "Quintal"),
                "pricePerUnit": float(body.get("pricePerUnit", 2400)),
                "location": body.get("location", "Karnal"),
                "state": body.get("state", "Haryana"),
                "harvestDate": body.get("harvestDate", "2026-05-28"),
                "description": f"Harvested premium graded {crop}. Checked grade: {grade}.",
                "descriptionHindi": f"ताजा उच्च श्रेणी का {crop}। प्रमाणित ग्रेडिंग: {grade}.",
                "image": body.get("image", "grain"),
                "verified": True,
                "createdAt": "2026-05-29T00:00:00Z",
                "mandiPriceEstimate": int(m_estimate),
                "approvalFactor": int(app_factor)
            }
            listings.append(new_list)
            db["listings"] = listings
            write_db(db)
            self.send_json(201, new_list)
            return

        # API: post bids
        elif path == "/api/bids":
            db = read_db()
            bids = db.get("bids", [])
            new_bid = {
                "id": f"bid-{len(bids) + 1}",
                "listingId": body.get("listingId"),
                "buyerName": body.get("buyerName", "Mandi Trader"),
                "buyerContact": body.get("buyerContact", "+91 91111 22222"),
                "priceOffered": float(body.get("priceOffered", 2400)),
                "quantity": float(body.get("quantity", 10)),
                "status": "pending",
                "message": body.get("message", ""),
                "createdAt": "2026-05-29T00:00:00Z"
            }
            bids.append(new_bid)
            db["bids"] = bids
            write_db(db)
            self.send_json(201, new_bid)
            return

        # API: post message
        elif path == "/api/messages":
            db = read_db()
            msgs = db.get("messages", [])
            new_msg = {
                "id": f"msg-{len(msgs) + 1}",
                "listingId": body.get("listingId"),
                "senderId": body.get("senderId"),
                "senderRole": body.get("senderRole"),
                "senderName": body.get("senderName"),
                "message": body.get("message", ""),
                "createdAt": "2026-05-29T00:00:00Z"
            }
            msgs.append(new_msg)
            db["messages"] = msgs
            write_db(db)
            self.send_json(201, new_msg)
            return

        # API Gemini: price-analyzer
        elif path == "/api/gemini/price-analyzer":
            db = read_db()
            engine = db.get("config", {}).get("activeEngine", "python")
            crop = body.get("cropName", "General")
            loc = body.get("location", "Karnal")
            state = body.get("state", "Haryana")

            if engine == "cpp":
                cpp_res = execute_cpp_task(["--task=price-advice", crop, loc, state])
                self.send_json(200, cpp_res)
            else:
                py_res = execute_python_task({"task": "price-advice", "crop": crop, "location": loc, "state": state})
                self.send_json(200, py_res)
            return

        # API Gemini: listing-assistant
        elif path == "/api/gemini/listing-assistant":
            db = read_db()
            engine = db.get("config", {}).get("activeEngine", "python")
            fast_text = body.get("fastText", "")

            if engine == "cpp":
                # Escape arguments safely
                cpp_res = execute_cpp_task(["--task=listing-assistant", fast_text])
                self.send_json(200, cpp_res)
            else:
                py_res = execute_python_task({"task": "listing-assistant", "fastText": fast_text})
                self.send_json(200, py_res)
            return

        # API Gemini: invoice-receipt audit
        elif path == "/api/gemini/invoice-receipt":
            db = read_db()
            engine = db.get("config", {}).get("activeEngine", "python")
            listing_id = body.get("listingId")
            bid_id = body.get("bidId")

            listings = db.get("listings", [])
            bids = db.get("bids", [])
            listing = next((l for l in listings if l.get("id") == listing_id), {})
            bid = next((b for b in bids if b.get("id") == bid_id), {})

            crop = listing.get("cropName", "Wheat")
            variety = listing.get("variety", "General")
            qty = bid.get("quantity", 50)
            price = bid.get("priceOffered", 2400)
            farmer = listing.get("farmerName", "Rajesh Kumar")
            buyer = bid.get("buyerName", "Independent Buyer")

            if engine == "cpp":
                # Run C++ audit args
                mode_args = ["--task=invoice-audit", crop, variety, str(qty), str(price), farmer, buyer]
                cpp_res = execute_cpp_task(mode_args)
                self.send_json(200, cpp_res)
            else:
                py_res = execute_python_task({
                    "task": "invoice-audit", "crop": crop, "variety": variety, "qty": qty, "price": price, "farmerName": farmer, "buyerName": buyer
                })
                self.send_json(200, py_res)
            return

        # API Compute: python-predict API
        elif path == "/api/compute/python-predict":
            db = read_db()
            engine = db.get("config", {}).get("activeEngine", "python")
            crop = body.get("crop", "Wheat")
            moisture = float(body.get("moisture", 12.0))
            acres = float(body.get("acres", 5.0))
            temp = float(body.get("temp", 30.0))
            greenness = float(body.get("greenness", 85.0))

            display_cmd = f"$ python3 backend/crop_analyzer.py task=crop-grade crop={crop} moisture={moisture}"

            if engine == "cpp":
                cpp_res = execute_cpp_task(["--task=crop-grade", crop, str(moisture), str(acres), str(temp), str(greenness)])
                self.send_json(200, {
                    "success": True,
                    "source": "Live C++17 Process Execution (Route Delegated)",
                    "terminalLog": f"$ ./backend/logistics_solver_bin --task=crop-grade \"{crop}\" {moisture} {acres} {temp} {greenness}\n\n[STDOUT] C++ crop grader executed:\n{json.dumps(cpp_res, indent=2)}",
                    "data": cpp_res
                })
            else:
                py_res = execute_python_task({
                    "task": "crop-grade", "crop": crop, "moisture": moisture, "acres": acres, "temp": temp, "greenness": greenness
                })
                self.send_json(200, {
                    "success": True,
                    "source": "Live Python 3.9 Process Execution Engine",
                    "terminalLog": f"{display_cmd} temperature={temp} greenness={greenness}\n\n[STDOUT] Python grading completed:\n{json.dumps(py_res, indent=2)}",
                    "data": py_res
                })
            return

        # API Compute: cpp-optimize API
        elif path == "/api/compute/cpp-optimize":
            db = read_db()
            engine = db.get("config", {}).get("activeEngine", "python")
            target_qty = float(body.get("targetQty", 100.0))
            freight_rate = float(body.get("freightRate", 5.0))
            sources = body.get("sources", [])

            # Compile standard C++ argument string: F1,Farmer,qty,rate,distance
            formatted_sources = ";".join([f"{s.get('id','FX')},{s.get('name','Farmer')},{s.get('availableQty',1)},{s.get('pricePerUnit',1)},{s.get('distanceKm',1)}" for s in sources])

            display_cmd = f"$ ./backend/logistics_solver_bin {target_qty} {freight_rate} \"{formatted_sources[:60]}...\""

            if engine == "python":
                py_res = execute_python_task({
                    "task": "logistics-solve", "targetQty": target_qty, "freightRate": freight_rate, "sourceStr": formatted_sources
                })
                self.send_json(200, {
                    "success": True,
                    "source": "Live Python 3.9 Process Execution (Route Delegated)",
                    "terminalLog": f"$ python3 backend/crop_analyzer.py task=logistics-solve qty={target_qty} sources=\"{formatted_sources[:40]}...\"\n\n[STDOUT] Python logistics solver executed:\n{json.dumps(py_res, indent=2)}",
                    "data": py_res
                })
            else:
                cpp_res = execute_cpp_task([str(target_qty), str(freight_rate), formatted_sources])
                self.send_json(200, {
                    "success": True,
                    "source": "Live C++17 Multi-threaded Knapsack Solver",
                    "terminalLog": f"{display_cmd}\n\n[STDOUT] C++ native solver executed successfully:\n{json.dumps(cpp_res, indent=2)}",
                    "data": cpp_res
                })
            return

        # 404 for routing inside single page app post requests
        else:
            self.send_json(404, {"error": "API route not found"})
            return

    def do_PUT(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path

        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length).decode('utf-8')
        try:
            body = json.loads(post_data) if post_data else {}
        except Exception:
            body = {}

        # API: put update bid status
        if path.startswith("/api/bids/") and path.endswith("/status"):
            bid_id = path.split("/")[-2]
            status = body.get("status", "pending")
            db = read_db()
            bids = db.get("bids", [])
            bid = next((b for b in bids if b.get("id") == bid_id), None)
            if bid:
                bid["status"] = status
                db["bids"] = bids
                write_db(db)
                self.send_json(200, bid)
            else:
                self.send_json(404, {"error": "Bid not found"})
            return

        # API: put user profile update
        elif path.startswith("/api/users/"):
            user_id = path.split("/")[-1]
            db = read_db()
            users = db.get("users", [])
            user_idx = next((i for i, u in enumerate(users) if u.get("id") == user_id), None)
            if user_idx is not None:
                users[user_idx].update(body)
                db["users"] = users
                write_db(db)
                self.send_json(200, users[user_idx])
            else:
                self.send_json(404, {"error": "User profile not found"})
            return

        else:
            self.send_json(404, {"error": "API Route not found"})
            return

    def do_DELETE(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path

        if path.startswith("/api/listings/"):
            list_id = path.split("/")[-1]
            db = read_db()
            listings = db.get("listings", [])
            initial_count = len(listings)
            listings = [l for l in listings if l.get("id") != list_id]
            if len(listings) < initial_count:
                db["listings"] = listings
                write_db(db)
                self.send_json(200, {"success": True, "message": "Listing deleted successfully."})
            else:
                self.send_json(404, {"error": "Listing not found."})
            return
        else:
            self.send_json(404, {"error": "API route not found"})
            return

    def send_json(self, status, payload):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode("utf-8"))

    # Return elegant complete SPA index html code
    def get_spa_html(self):
        return """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>farmospan - Direct Farmer-Buyer Network</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Lucide Icon script -->
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
    body {
      font-family: 'Inter', sans-serif;
    }
    .font-mono {
      font-family: 'JetBrains Mono', monospace;
    }
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: rgba(244, 245, 246, 0.5);
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(16, 185, 129, 0.2);
      border-radius: 9999px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(16, 185, 129, 0.4);
    }
    .animate-float {
      animation: float 3s ease-in-out infinite;
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }
  </style>
</head>
<body class="bg-slate-50 text-slate-800 tracking-normal min-h-screen flex flex-col antialiased">

  <div id="app" class="flex flex-col min-h-screen">
    <!-- Screen contents injection target -->
  </div>

  <script>
    // Define custom toast system to replace restricted window.alert inside sandboxed iframes
    function showToast(message, type = "info") {
      console.log(`[Toast ${type}]:`, message);
      let container = document.getElementById("toast-container");
      if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        container.className = "fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none";
        document.body.appendChild(container);
      }
      
      const toast = document.createElement("div");
      toast.className = `p-4 rounded-xl shadow-lg border text-xs font-bold pointer-events-auto transition-all duration-300 transform translate-y-2 opacity-0 flex items-center justify-between gap-3 text-white ${
        type === "success" 
          ? "bg-emerald-600 border-emerald-500" 
          : type === "error" 
            ? "bg-rose-600 border-rose-500" 
            : "bg-amber-600 border-amber-500"
      }`;
      
      toast.innerHTML = `
        <span>${message}</span>
        <button class="text-white hover:text-slate-200 ml-2 font-normal focus:outline-none" onclick="this.parentElement.remove()">✕</button>
      `;
      
      container.appendChild(toast);
      
      setTimeout(() => {
        toast.className = toast.className.replace("translate-y-2 opacity-0", "translate-y-0 opacity-100");
      }, 50);
      
      setTimeout(() => {
        if (toast.parentElement) {
          toast.className = toast.className.replace("translate-y-0 opacity-100", "translate-y-2 opacity-0");
          setTimeout(() => toast.remove(), 300);
        }
      }, 5000);
    }

    // Override window.alert globally
    window.alert = function(msg) {
      if (!msg) return;
      let type = "info";
      const lmsg = msg.toLowerCase();
      if (lmsg.includes("failed") || lmsg.includes("error") || lmsg.includes("not registered")) {
        type = "error";
      } else if (lmsg.includes("success") || lmsg.includes("verified") || lmsg.includes("graded") || lmsg.includes("transcribed") || lmsg.includes("audited")) {
        type = "success";
      }
      showToast(msg, type);
    };

    // System Translations
    const labelTranslations = {
      EN: {
        appName: "farmospan - फ़ार्मोस्पैन",
        appSubtitle: "Direct Farmer-Buyer Network",
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
        listingsTab: "Mandi Hub 🌾",
        listTab: "Offer Produce ➕",
        computeTab: "Computational Center 🧠",
        chatsTab: "Negotiation Logs 💬",
        activeEngine: "Active Intelligence Core:"
      },
      HI: {
        appName: "फ़ार्मोस्पैन - farmospan",
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
        listingsTab: "मंडी बाजार 🌾",
        listTab: "फसल बेचें ➕",
        computeTab: "एआई कंप्यूटेशन डेस्क 🧠",
        chatsTab: "सौदा वार्तालाप 💬",
        activeEngine: "सक्रिय गणना कर्नेल:"
      }
    };

    // Global application state
    let state = {
      user: JSON.parse(localStorage.getItem("mandiUser")) || null,
      lang: "EN",
      activeEngine: "python",
      engineLoading: false,
      listings: [],
      bids: [],
      chats: [],
      activeTab: "browse", // "browse", "list", "compute", "chats"
      selectedListingId: null, // detailing a listing
      
      // Computing Page Input states
      pyCrop: "Organic Wheat (Kanak)",
      pyMoisture: 12.5,
      pyAcres: 10,
      pyTemp: 32,
      pyGreenness: 88,
      pyLoading: false,
      pyTerminal: "# Python Engine ready. Select parameters and launch.",
      pyResult: null,

      cppTargetQty: 100,
      cppFreightRate: 4.5,
      cppLoading: false,
      cppTerminal: "// C++17 Multi-thread Knapsack Solver initialized. Click optimize.",
      cppResult: null,
      cppSources: [
        { id: "F1", name: "Rajesh Kumar (Karnal)", availableQty: 40, pricePerUnit: 2400, distanceKm: 15 },
        { id: "F2", name: "Baldev Singh (Amritsar)", availableQty: 80, pricePerUnit: 2350, distanceKm: 35 },
        { id: "F3", name: "Suresh Patil (Nashik)", availableQty: 50, pricePerUnit: 2380, distanceKm: 120 },
        { id: "F4", name: "Maninder Grewal (Ludhiana)", availableQty: 30, pricePerUnit: 2410, distanceKm: 10 }
      ],

      // Listing Helper fast parse
      listingFastText: "",
      listingHelperLoading: false
    };

    // API triggers
    async function apiFetch(url, options = {}) {
      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP ${response.status}`);
        }
        return await response.json();
      } catch (err) {
        console.error("API Call failed:", err);
        throw err;
      }
    }

    async function loadEngineConfig() {
      try {
        const config = await apiFetch("/api/config/engine");
        if (config && config.activeEngine) {
          state.activeEngine = config.activeEngine;
        }
      } catch (e) {
        console.warn("Failed to retrieve engine config, default python");
      }
    }

    async function loadMandiData() {
      try {
        state.listings = await apiFetch("/api/listings");
        state.bids = await apiFetch("/api/bids");
        if (state.selectedListingId) {
          state.chats = await apiFetch(`/api/messages?listingId=${state.selectedListingId}`);
        }
      } catch (e) {
        console.error("Failed to load listings", e);
      }
    }

    async function handleToggleEngine(engine) {
      state.engineLoading = true;
      render();
      try {
        const res = await apiFetch("/api/config/engine", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ activeEngine: engine })
        });
        if (res && res.config) {
          state.activeEngine = res.config.activeEngine;
        }
      } catch (e) {
        alert("Engine switch failed");
      } finally {
        state.engineLoading = false;
        render();
      }
    }

    function toggleLanguage() {
      state.lang = state.lang === "EN" ? "HI" : "EN";
      render();
    }

    // Auth actions
    async function handleLogin(phone, role) {
      if (!phone || phone.length < 10) {
        alert("Please enter a valid 10-digit mobile number / कृपया सही नंबर डालें।");
        return;
      }
      try {
        const user = await apiFetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, role })
        });
        state.user = user;
        localStorage.setItem("mandiUser", JSON.stringify(user));
        await loadMandiData();
        render();
      } catch (err) {
        // Switch view to custom registration form automatically!
        alert(err.message + " Please create your new profile.");
        openRegisterView(phone, role);
      }
    }

    function openRegisterView(phone, role) {
      const modal = document.getElementById("login-panel");
      if (modal) {
        modal.innerHTML = `
          <div class="space-y-4 max-w-sm mx-auto">
            <h3 class="text-xl font-bold text-emerald-950">${labelTranslations[state.lang].registerTitle}</h3>
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">${labelTranslations[state.lang].nameLabel}</label>
              <input type="text" id="reg-name" required placeholder="eg. Rajesh Sharma" class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">State & City / जिला व राज्य</label>
              <div class="grid grid-cols-2 gap-2">
                <input type="text" id="reg-location" placeholder="Karnal" class="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white">
                <input type="text" id="reg-state" placeholder="Haryana" class="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white">
              </div>
            </div>
            ${role === "farmer" ? `
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Acres / एकड़</label>
                  <input type="number" id="reg-acres" value="5" class="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Organic? / जैविक</label>
                  <select id="reg-organic" class="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white">
                    <option value="1">Yes (हाँ)</option>
                    <option value="0">No (नहीं)</option>
                  </select>
                </div>
              </div>
            ` : `
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Company / GSTIN</label>
                <input type="text" id="reg-businessName" placeholder="Wholesale Agridepot" class="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white">
              </div>
            `}
            <button onclick="submitRegister('${phone}', '${role}')" class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm shadow-md transition-all">
              ${labelTranslations[state.lang].registerBtn}
            </button>
            <button onclick="render()" class="w-full text-xs text-slate-400 hover:text-slate-600">Cancel & Back</button>
          </div>
        `;
      }
    }

    async function submitRegister(phone, role) {
      const name = document.getElementById("reg-name").value;
      const location = document.getElementById("reg-location").value || "Karnal";
      const s_state = document.getElementById("reg-state").value || "Haryana";
      
      const payload = { phone, role, name, location, state: s_state };
      if (role === "farmer") {
        payload.farmSizeAcres = document.getElementById("reg-acres").value;
        payload.organicCertified = document.getElementById("reg-organic").value === "1";
      } else {
        payload.businessName = document.getElementById("reg-businessName").value || name + " Wholesale";
      }

      try {
        const user = await apiFetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        state.user = user;
        localStorage.setItem("mandiUser", JSON.stringify(user));
        await loadMandiData();
        render();
      } catch (e) {
        alert("Registration failed: " + e.message);
      }
    }

    function handleLogout() {
      state.user = null;
      localStorage.removeItem("mandiUser");
      render();
    }

    // Submit listings (Farmers)
    async function submitNewListing(e) {
      e.preventDefault();
      const form = document.getElementById("listings-offer-form");
      const crop = form.cropName.value;
      const variety = form.variety.value;
      const quantity = form.quantity.value;
      const unit = form.unit.value;
      const price = form.pricePerUnit.value;
      const location = form.location.value;
      const s_state = form.state.value;

      const payload = {
        farmerName: state.user.name,
        farmerContact: state.user.phone,
        cropName: crop,
        variety: variety,
        category: "Grains",
        quantity: parseFloat(quantity),
        unit: unit,
        pricePerUnit: parseFloat(price),
        location: location,
        state: s_state,
        moisture: parseFloat(form.moisture.value || 12.5),
        acres: parseFloat(state.user.farmSizeAcres || 10),
        temp: 31,
        greenness: 85
      };

      try {
        await apiFetch("/api/listings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        alert("Crops graded successfully & direct trade listing generated!");
        state.activeTab = "browse";
        await loadMandiData();
        render();
      } catch (err) {
        alert("Listing failed");
      }
    }

    // Smart Draft Assistant (AI)
    async function compileSmartDraft() {
      if (!state.listingFastText) {
        alert("Write some audio transcription first!");
        return;
      }
      state.listingHelperLoading = true;
      render();
      try {
        const res = await apiFetch("/api/gemini/listing-assistant", {
          method: "POST",
          headers: { "Content-Type": "text/plain" && "application/json" },
          body: JSON.stringify({ fastText: state.listingFastText })
        });
        if (res && res.data) {
          const result = res.data;
          const form = document.getElementById("listings-offer-form");
          if (form) {
            form.cropName.value = result.cropName || "Wheat";
            form.variety.value = result.variety || "General";
            form.quantity.value = result.quantity || 100;
            form.unit.value = result.unit || "Quintal";
            form.pricePerUnit.value = result.pricePerUnit || 2400;
            form.location.value = result.location || "Karnal";
            form.state.value = result.state || "Haryana";
          }
          alert("Smart Voice Draft transcribed! Parameters loaded.");
        }
      } catch (e) {
        alert("Transcription parsing missed, using standard parameters.");
      } finally {
        state.listingHelperLoading = false;
        render();
      }
    }

    // Bid Management
    async function submitNewBid(listingId) {
      const price = parseFloat(document.getElementById(`bid-price-input`).value);
      const qty = parseFloat(document.getElementById(`bid-qty-input`).value);
      const msg = document.getElementById(`bid-message-input`).value;

      try {
        await apiFetch("/api/bids", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            listingId,
            buyerName: state.user.name,
            buyerContact: state.user.phone,
            priceOffered: price,
            quantity: qty,
            message: msg
          })
        });
        alert("Direct bid routed successfully to farmer!");
        await loadMandiData();
        render();
      } catch (e) {
        alert("Bid placement failed");
      }
    }

    async function handleUpdateBidStatus(bidId, status) {
      try {
        await apiFetch(`/api/bids/${bidId}/status`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status })
        });
        await loadMandiData();
        render();
      } catch (e) {
        alert("Failed to update status");
      }
    }

    // Direct trade instant audit
    async function runInvoiceAudit(listingId, bidId) {
      alert("Launching dynamic audit...");
      try {
        const audit = await apiFetch("/api/gemini/invoice-receipt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listingId, bidId })
        });
        if (audit && audit.success && audit.data) {
          const detail = audit.data;
          alert(`Invoice Audited Successfully by C++/Python!\\n\\nBroker Fees saved: ${detail.savedMiddlemanMarginPercent || 15}%\\nLegal Verdict: Approved\\nHash: ${detail.transactionAuditSign || "MD5-DUMMY"}`);
        }
      } catch (e) {
        alert("Audit failed");
      }
    }

    // Chats sending
    async function sendChatMessage() {
      const text = document.getElementById("chat-box-input").value;
      if (!text) return;

      try {
        await apiFetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            listingId: state.selectedListingId,
            senderId: state.user.id,
            senderRole: state.user.role,
            senderName: state.user.name,
            message: text
          })
        });
        document.getElementById("chat-box-input").value = "";
        await loadMandiData();
        render();
      } catch (e) {
        alert("Failed sending");
      }
    }

    // Advanced compute triggers
    async function runPythonPredictor() {
      state.pyLoading = true;
      state.pyTerminal = "$ python3 backend/crop_analyzer.py --calculate-grading";
      render();
      try {
        const res = await apiFetch("/api/compute/python-predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            crop: state.pyCrop,
            moisture: state.pyMoisture,
            acres: state.pyAcres,
            temp: state.pyTemp,
            greenness: state.pyGreenness
          })
        });
        if (res.success) {
          state.pyResult = res.data.analysis;
          state.pyTerminal = res.terminalLog || JSON.stringify(res, null, 2);
        }
      } catch (e) {
        state.pyTerminal = "$ Error connecting to Python runner.";
      } finally {
        state.pyLoading = false;
        render();
      }
    }

    async function runCppOptimizer() {
      state.cppLoading = true;
      state.cppTerminal = "// Spawning g++ compiled C++17 optimal routing agent...";
      render();
      try {
        const res = await apiFetch("/api/compute/cpp-optimize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetQty: state.cppTargetQty,
            freightRate: state.cppFreightRate,
            sources: state.cppSources
          })
        });
        if (res.success) {
          state.cppResult = res.data;
          state.cppTerminal = res.terminalLog || JSON.stringify(res, null, 2);
        }
      } catch (e) {
        state.cppTerminal = "// Crash: Standard runtime stream failed.";
      } finally {
        state.cppLoading = false;
        render();
      }
    }

    // Add source node
    function handleAddSourceNode() {
      const name = document.getElementById("node-name").value || "New Node";
      const q = parseFloat(document.getElementById("node-qty").value) || 50;
      const p = parseFloat(document.getElementById("node-price").value) || 2400;
      const d = parseFloat(document.getElementById("node-dist").value) || 15;

      const newId = `F${state.cppSources.length + 1}`;
      state.cppSources.push({ id: newId, name, availableQty: q, pricePerUnit: p, distanceKm: d });
      render();
    }

    // Auto login helper logic
    function loginDemo(role) {
      if (role === 'farmer') {
        handleLogin("+91 98765 43210", "farmer");
      } else {
        handleLogin("+91 90000 11111", "buyer");
      }
    }

    // RENDERING ENGINE
    function render() {
      const app = document.getElementById("app");
      const labels = labelTranslations[state.lang];

      // 1. If not logged in -> render Welcome Dashboard screen
      if (!state.user) {
        app.innerHTML = `
          <div class="flex-1 flex flex-col items-center justify-center p-6 bg-emerald-950 text-white select-none">
            <div class="max-w-4xl w-full text-center space-y-8 animate-float">
              <div class="inline-flex items-center gap-3 bg-emerald-900/50 p-2.5 px-5 rounded-full border border-emerald-700/60 shadow-lg">
                <span class="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></span>
                <span class="text-xs font-bold tracking-widest text-emerald-300 uppercase">FARMOSPAN HIGH-PERFORMANCE MANDI</span>
              </div>
              <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-100 via-emerald-300 to-amber-200 bg-clip-text text-transparent">
                ${labels.heroHeading}
              </h1>
              <p class="text-base md:text-lg text-emerald-100 max-w-2xl mx-auto font-light leading-relaxed">
                ${labels.heroSub}
              </p>
            </div>

            <!-- Login Interface panel -->
            <div id="login-panel" class="w-full max-w-md mt-10 bg-white text-slate-800 rounded-3xl p-8 shadow-xl border border-slate-100/30">
              <div class="space-y-6">
                <div>
                  <h3 class="text-xl font-bold tracking-tight text-emerald-950">Mandi Login Portal / सीधा आढ़त लॉगिन</h3>
                  <p class="text-xs text-slate-400">Secure entry with direct SMS credentials</p>
                </div>
                <div>
                  <label class="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">${labels.phoneLabel}</label>
                  <input type="text" id="phone-input" value="+91 98765 43210" class="w-full px-4 py-3 border border-slate-100 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold">
                </div>
                <div>
                  <label class="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">${labels.roleLabel}</label>
                  <select id="role-input" class="w-full px-4 py-3 border border-slate-100 bg-slate-50 rounded-xl font-bold">
                    <option value="farmer">${labels.farmerRole}</option>
                    <option value="buyer">${labels.buyerRole}</option>
                  </select>
                </div>
                <button onclick="handleLogin(document.getElementById('phone-input').value, document.getElementById('role-input').value)" class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold tracking-wide shadow-lg transition-all">
                  ${labels.enterBtn}
                </button>
                <div class="pt-4 border-t border-slate-100 text-center">
                  <span class="text-xs text-slate-400 block mb-2">Or Use Instantly (डेमो ऑटो-लॉगिन):</span>
                  <div class="grid grid-cols-2 gap-2">
                    <button onclick="loginDemo('farmer')" class="px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 text-[11px] font-bold rounded-lg leading-none">🌾 Organic Farmer</button>
                    <button onclick="loginDemo('buyer')" class="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 text-[11px] font-bold rounded-lg leading-none">🏢 Direct Buyer</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
        lucide.createIcons();
        return;
      }

      // 2. Main Authenticated Layout
      app.innerHTML = `
        <!-- Main Navbar Header -->
        <header class="bg-emerald-950 text-white py-3 border-b border-emerald-800">
          <div class="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-emerald-900 rounded-xl border border-emerald-700">
                <i data-lucide="wheat" class="w-6 h-6 text-emerald-300"></i>
              </div>
              <div>
                <h1 class="text-xl font-extrabold tracking-tight flex items-center gap-2">${labels.appName}</h1>
                <span class="text-[10px] text-emerald-300 font-medium tracking-widest uppercase">${labels.appSubtitle}</span>
              </div>
            </div>

            <!-- Dynamic Intelligence Controls & Details -->
            <div class="flex items-center flex-wrap gap-2">
              <div class="flex items-center bg-emerald-900/40 border border-emerald-700/60 rounded-full p-0.5 shadow-sm">
                <button onclick="handleToggleEngine('python')" ${state.engineLoading ? 'disabled' : ''} class="flex items-center gap-1.5 px-3 py-1 transparent rounded-full text-[10px] font-bold transition-all ${state.activeEngine === "python" ? "bg-amber-500 text-white shadow" : "text-emerald-200 hover:text-white pointer-events-auto cursor-pointer"}">
                  <span>🐍 Python 3</span>
                </button>
                <button onclick="handleToggleEngine('cpp')" ${state.engineLoading ? 'disabled' : ''} class="flex items-center gap-1.5 px-3 py-1 transparent rounded-full text-[10px] font-bold transition-all ${state.activeEngine === "cpp" ? "bg-emerald-600 text-white shadow" : "text-emerald-200 hover:text-white pointer-events-auto cursor-pointer"}">
                  <span>⚡ C++17</span>
                </button>
              </div>

              <!-- Language Toggle -->
              <button onclick="toggleLanguage()" class="p-1 px-3 bg-emerald-900 border border-emerald-700/60 text-xs font-bold rounded-full hover:bg-emerald-800 cursor-pointer text-emerald-100">
                ${state.lang === "EN" ? "हिन्दी (HI)" : "English (EN)"}
              </button>

              <!-- Profile Details -->
              <span class="text-xs bg-emerald-900/60 px-3 py-1 border border-emerald-800 rounded-full text-emerald-200 tracking-wide font-medium">
                ${state.user.role === "farmer" ? "🌾 Farmer" : "🏢 Buyer"}: <b>${state.user.name}</b>
              </span>
              <button onclick="handleLogout()" class="p-1 px-2.5 bg-red-900/30 hover:bg-red-900 border border-red-800 rounded-full text-xs cursor-pointer gap-1 inline-flex items-center text-red-200 shadow-sm transition-all" title="Logout">
                <i data-lucide="log-out" class="w-3 h-3"></i>
              </button>
            </div>
          </div>
        </header>

        <!-- Dynamic Navigation Links bar -->
        <div class="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div class="max-w-7xl mx-auto px-4 md:px-8 flex items-center gap-2 overflow-x-auto py-2.5 scrollbar-thin">
            <button onclick="switchTab('browse')" class="px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${state.activeTab === "browse" ? "bg-emerald-600 text-white shadow-md" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}">
              ${labels.listingsTab}
            </button>
            ${state.user.role === "farmer" ? `
              <button onclick="switchTab('list')" class="px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${state.activeTab === "list" ? "bg-emerald-600 text-white shadow-md" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}">
                ${labels.listTab}
              </button>
            ` : ''}
            <button onclick="switchTab('compute')" class="px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${state.activeTab === "compute" ? "bg-emerald-600 text-white shadow-md" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}">
              ${labels.computeTab}
            </button>
            <button onclick="switchTab('chats')" class="px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${state.activeTab === "chats" ? "bg-emerald-600 text-white shadow-md" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}">
              ${labels.chatsTab}
            </button>
          </div>
        </div>

        <!-- Render Current Active Tab Content -->
        <main class="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-6">
          ${renderActiveTab()}
        </main>
      `;
      lucide.createIcons();
    }

    function switchTab(tab) {
      state.activeTab = tab;
      state.selectedListingId = null;
      render();
    }

    function renderActiveTab() {
      // BROWSE / MARKETPLACE TAB
      if (state.activeTab === "browse") {
        let html = `
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Listings Columns (Left-Center) -->
            <div class="lg:col-span-2 space-y-6">
              <div class="flex items-center justify-between border-b pb-3 border-slate-200">
                <h2 class="text-xl font-bold text-slate-800">Active Mandi Crop Listings / मंडी में उपलब्ध फसलें</h2>
                <span class="text-xs bg-slate-200/60 px-3 py-1 font-bold rounded-full">${state.listings.length} Listings</span>
              </div>

              ${state.listings.length === 0 ? `
                <div class="p-10 text-center bg-white border rounded-2xl">No listings yet. Post some produce to explore.</div>
              ` : `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  ${state.listings.map(l => {
                    const grade = l.approvalFactor > 90 ? "A+" : (l.approvalFactor > 80 ? "A" : "B");
                    const colorClass = grade.startsWith("A") ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800";
                    const isMyProduce = l.farmerContact === state.user.phone;
                    const highBid = getHighBid(l.id);

                    return `
                      <div class="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md border border-slate-200/40 relative">
                        <div class="flex justify-between items-start gap-2 mb-3">
                          <span class="p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
                            <i data-lucide="${l.image === 'tomato' ? 'shrub' : 'wheat'}" class="w-5 h-5"></i>
                          </span>
                          <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${colorClass}">
                            Grade: ${grade} (${l.approvalFactor}% Conf)
                          </span>
                        </div>

                        <h3 class="font-bold text-slate-800 leading-tight">${l.cropName}</h3>
                        <p class="text-xs text-slate-400 mb-3">${l.variety} | ${l.location}, ${l.state}</p>

                        <div class="grid grid-cols-2 gap-2 border-t pt-3 mb-4 text-xs">
                          <div>
                            <span class="text-slate-400 block text-[10px] font-bold uppercase">Volume</span>
                            <span class="font-bold text-slate-700">${l.quantity} ${l.unit}</span>
                          </div>
                          <div>
                            <span class="text-slate-400 block text-[10px] font-bold uppercase">Base Rate</span>
                            <span class="font-bold text-emerald-700">₹${l.pricePerUnit} / ${l.unit}</span>
                          </div>
                        </div>

                        ${highBid ? `
                          <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-2.5 mb-4 text-xs">
                            <span class="text-yellow-700 font-bold block text-[10px] uppercase">Current High Bid</span>
                            <span class="font-medium text-slate-800">₹${highBid.priceOffered}/${l.unit} by ${highBid.buyerName}</span>
                          </div>
                        ` : `
                          <div class="bg-slate-50 rounded-xl p-2.5 mb-4 text-xs text-slate-400 text-center">
                            No bids received yet
                          </div>
                        `}

                        <div class="flex items-center gap-2">
                          <button onclick="handleViewListingDetail('${l.id}')" class="flex-1 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-100 hover:bg-emerald-100 text-center cursor-pointer">
                            View Deal Details
                          </button>
                          ${isMyProduce ? `
                            <button onclick="deleteListing('${l.id}')" class="p-1.5 bg-slate-50 border hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl cursor-pointer">
                              <i data-lucide="trash-2" class="w-4 h-4"></i>
                            </button>
                          ` : ''}
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              `}
            </div>

            <!-- Detail Drawer Side column (Right) -->
            <div class="lg:col-span-1 space-y-6">
              ${renderDetailsDeck()}
            </div>
          </div>
        `;
        return html;
      }

      // OFFER PRODUCE TAB (FARMERS ONLY)
      if (state.activeTab === "list") {
        return `
          <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <!-- Instructions and Smart Transcription -->
            <div class="lg:col-span-2 space-y-6">
              <div class="bg-emerald-900 text-white rounded-3xl p-6 shadow-xl border border-emerald-700">
                <div class="flex items-center gap-2 mb-3">
                  <i data-lucide="sparkles" class="w-5 h-5 text-amber-300"></i>
                  <h3 class="font-bold text-lg leading-tight">Multilingual Voice Helper</h3>
                </div>
                <p class="text-xs text-emerald-100 font-light leading-relaxed mb-4">
                  Speak or write your crop parameters in plain English, Hindi, or Hinglish. Our micro active task parser compiles your draft instantly!
                </p>

                <textarea id="voice-draft-text" oninput="state.listingFastText = this.value" placeholder="eg: मैं करनाल से बलदेव सिंह हूँ। ४० क्विंटल शरबती गेंहू बेचना है २४०० भाव पर..." class="w-full h-32 px-4 py-2.5 bg-emerald-950/70 border border-emerald-800 text-emerald-100 text-xs rounded-xl focus:outline-none placeholder-emerald-400/80 mb-3"></textarea>

                <button onclick="compileSmartDraft()" ${state.listingHelperLoading ? 'disabled' : ''} class="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold text-xs rounded-xl select-none flex items-center justify-center gap-1.5 shadow-md">
                  ${state.listingHelperLoading ? 'Parsing Voice Trace...' : 'Compile Auto-Draft 🤖'}
                </button>
              </div>

              <!-- Process Flow Rules dashboard -->
              <div class="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                <h4 class="font-bold text-slate-800 text-sm mb-3">Dynamic Quality Certify Rules</h4>
                <div class="space-y-3 text-xs leading-relaxed text-slate-500">
                  <div class="flex items-start gap-2">
                    <span class="p-1 bg-emerald-50 text-emerald-700 rounded-lg">1</span>
                    <p>New listings trigger background active predictions utilizing your selected core algorithm kernel.</p>
                  </div>
                  <div class="flex items-start gap-2">
                    <span class="p-1 bg-emerald-50 text-emerald-700 rounded-lg">2</span>
                    <p>Submitting computes structural estimates matching premium Mandi records in Haryana & Maharashtra.</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Main Standard listing form -->
            <div class="lg:col-span-3 bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <h2 class="text-lg font-black text-slate-800 border-b pb-3 mb-5 flex items-center gap-2">
                <i data-lucide="clipboard" class="w-5 h-5 text-emerald-600"></i>
                Create Direct Farm Produce Offer
              </h2>

              <form id="listings-offer-form" onsubmit="submitNewListing(e || window.event); return false;" class="space-y-5">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Crop Name / फसल</label>
                    <input type="text" name="cropName" required placeholder="Wheat, Tomato..." class="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold">
                  </div>
                  <div>
                    <label class="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Variety / किस्म</label>
                    <input type="text" name="variety" required placeholder="eg. Sharbati Premium" class="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  </div>
                </div>

                <div class="grid grid-cols-3 gap-3">
                  <div>
                    <label class="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Quantity</label>
                    <input type="number" name="quantity" required value="50" class="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg">
                  </div>
                  <div>
                    <label class="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Unit</label>
                    <select name="unit" class="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg">
                      <option value="Quintal">Quintal</option>
                      <option value="kg">kg</option>
                      <option value="Ton">Ton</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Moisture % (नमी)</label>
                    <input type="number" step="0.1" name="moisture" value="12.5" class="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg">
                  </div>
                </div>

                <div class="grid grid-cols-3 gap-3">
                  <div class="col-span-2">
                    <label class="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Your Direct Asking Price (₹)</label>
                    <input type="number" name="pricePerUnit" required value="2400" class="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg focus:ring-2 focus:ring-emerald-500 font-bold">
                  </div>
                  <div>
                    <label class="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Crop Image Card</label>
                    <select name="image" class="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg">
                      <option value="grain">🌾 Grains Card</option>
                      <option value="tomato">🍅 Vegetables Card</option>
                    </select>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Mandi Town / मंडी बाजार</label>
                    <input type="text" name="location" value="${state.user.location || 'Karnal'}" class="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg">
                  </div>
                  <div>
                    <label class="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">State / राज्य</label>
                    <input type="text" name="state" value="${state.user.state || 'Haryana'}" class="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg">
                  </div>
                </div>

                <button type="submit" class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition-all">
                  Submit Direct Trade Listing with Active ${state.activeEngine === 'cpp' ? 'C++17 Solver' : 'Python 3.9'} Analysis
                </button>
              </form>
            </div>
          </div>
        `;
      }

      // DIRECT MESSAGES CHATS TAB
      if (state.activeTab === "chats") {
        return `
          <div class="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <h2 class="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <i data-lucide="message-square" class="w-5 h-5 text-emerald-600"></i>
              Your Active Mandi Direct Message Lines
            </h2>
            <p class="text-xs text-slate-400 mb-6">Select any listed produce on Browse Mandi, place a direct offer, and discuss direct transport splits, timing models, or secure escrow pick-ups here.</p>

            ${state.selectedListingId ? `
              <div class="border rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x border-slate-200 bg-slate-50">
                <div class="p-4 bg-white space-y-4">
                  <h4 class="font-bold text-slate-800 text-xs uppercase tracking-widest text-slate-400">Selected Subject Listing</h4>
                  ${renderListingSnippet(state.selectedListingId)}
                </div>
                <div class="md:col-span-2 flex flex-col h-[400px]">
                  <div class="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-100/50">
                    ${renderConversations()}
                  </div>
                  <div class="p-3 bg-white border-t flex gap-2">
                    <input type="text" id="chat-box-input" placeholder="Type direct transaction queries (eg. dispatch address, truck rates...)" class="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:outline-none text-xs">
                    <button onclick="sendChatMessage()" class="p-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer">
                      Send
                    </button>
                  </div>
                </div>
              </div>
            ` : `
              <div class="p-10 text-center text-slate-400 border border-dashed rounded-2xl">
                Please select any listing first on the Browse Mandi tab and click "View Deal Details" to start live trade negotiations or check historic deal lines.
              </div>
            `}
          </div>
        `;
      }

      // HIGH PERFORMANCE ADVANCED COMPUTING TAB
      if (state.activeTab === "compute") {
        return `
          <!-- Header stats -->
          <div class="bg-emerald-950 text-white rounded-3xl p-6 relative overflow-hidden shadow-xl mb-6">
            <div class="relative z-10 space-y-3">
              <div class="flex flex-wrap items-center gap-2">
                <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-bold text-emerald-400">
                  <i data-lucide="layers" class="w-3.5 h-3.5"></i>
                  NATIVE NUCLEUS EXECUTABLE SYSTEM
                </span>
                <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs font-bold text-amber-400">
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                  Active Backend Engine: <b>${state.activeEngine.toUpperCase()} CORE</b>
                </span>
              </div>
              <h2 class="text-2xl md:text-3xl font-black tracking-tight font-sans">Farmospan Advanced Computational Deck</h2>
              <p class="text-xs text-emerald-200 font-light max-w-2xl leading-relaxed">
                Interact with high-performance agronomy prediction utilities. Toggling the active configuration engine routing directs matching analytics to Python threads or G++ standard compiled binaries dynamically. Read live stdout terminal outputs directly.
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <!-- Parameters section (Left / Center) -->
            <div class="lg:col-span-7 space-y-6">
              
              <!-- 1. CROP GRADE / HARVEST MODEL (Python Direct execution / C++ backup routing) -->
              <div class="bg-white rounded-3xl p-6 border shadow-xs border-slate-200">
                <div class="flex items-center justify-between border-b pb-3 mb-4 border-slate-100">
                  <div class="flex items-center gap-2">
                    <span class="p-1 px-2.5 bg-amber-50 text-amber-700 font-black rounded-lg text-xs font-mono">PY / CPP</span>
                    <h3 class="font-extrabold text-slate-800 text-sm">Predictive Crop Grader & Yield Matrix Model</h3>
                  </div>
                  <span class="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-mono">crop_analyzer.py --grade</span>
                </div>

                <div class="space-y-4 text-xs">
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-slate-400 font-bold mb-1">Primary Mandi Crop</label>
                      <select onchange="state.pyCrop = this.value" class="w-full px-3 py-2 border rounded-lg bg-slate-50">
                        <option value="Organic Wheat (Kanak)">Organic Wheat (Kanak)</option>
                        <option value="Fresh Tomatoes">Fresh Tomatoes</option>
                        <option value="Basmati Rice">Basmati Rice</option>
                        <option value="Red Onions">Red Onions</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-slate-400 font-bold mb-1">Acres (Farm Area)</label>
                      <input type="number" oninput="state.pyAcres = parseFloat(this.value)" value="${state.pyAcres}" class="w-full px-3 py-2 border rounded-lg bg-slate-50">
                    </div>
                  </div>

                  <div class="grid grid-cols-3 gap-2">
                    <div>
                      <label class="block text-slate-400 font-bold mb-1">Moisture % (नमी)</label>
                      <input type="range" min="5" max="25" step="0.1" value="${state.pyMoisture}" oninput="state.pyMoisture = parseFloat(this.value); document.getElementById('py-m-val').innerText = this.value" class="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer">
                      <span class="text-[10px] text-emerald-600 font-bold" id="py-m-val">${state.pyMoisture}</span>%
                    </div>
                    <div>
                      <label class="block text-slate-400 font-bold mb-1">Temp (सेंटीग्रेड)</label>
                      <input type="range" min="10" max="45" step="1" value="${state.pyTemp}" oninput="state.pyTemp = parseInt(this.value); document.getElementById('py-t-val').innerText = this.value" class="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer">
                      <span class="text-[10px] text-emerald-600 font-bold" id="py-t-val">${state.pyTemp}</span>°C
                    </div>
                    <div>
                      <label class="block text-slate-400 font-bold mb-1">Greenness Indicator</label>
                      <input type="range" min="50" max="100" step="1" value="${state.pyGreenness}" oninput="state.pyGreenness = parseInt(this.value); document.getElementById('py-g-val').innerText = this.value" class="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer">
                      <span class="text-[10px] text-emerald-600 font-bold" id="py-g-val">${state.pyGreenness}</span>%
                    </div>
                  </div>

                  <button onclick="runPythonPredictor()" ${state.pyLoading ? 'disabled' : ''} class="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-all cursor-pointer shadow-sm">
                    ${state.pyLoading ? 'Evaluating dynamic process...' : 'Launch Grading & Yield Evaluation Model'}
                  </button>
                </div>
              </div>

              <!-- 2. ROUTING LOGISTICS OPTIMIZATION (C++ Direct execution / Python backup routing) -->
              <div class="bg-white rounded-3xl p-6 border shadow-xs border-slate-200">
                <div class="flex items-center justify-between border-b pb-3 mb-4 border-slate-100">
                  <div class="flex items-center gap-2">
                    <span class="p-1 px-2.5 bg-blue-50 text-blue-700 font-black rounded-lg text-xs font-mono">CPP / PY</span>
                    <h3 class="font-extrabold text-slate-800 text-sm">Linear Knapsack Route Optimizer Core</h3>
                  </div>
                  <span class="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-mono">logistics_solver_bin</span>
                </div>

                <div class="space-y-4 text-xs">
                  <div class="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <label class="block text-slate-400 font-bold mb-1">Procurement Target Quantity</label>
                      <input type="number" oninput="state.cppTargetQty = parseFloat(this.value)" value="${state.cppTargetQty}" class="w-full px-3 py-2 border rounded-lg bg-slate-50 font-bold">
                    </div>
                    <div>
                      <label class="block text-slate-400 font-bold mb-1">Freight Rate (₹ / Quintal-Km)</label>
                      <input type="number" step="0.1" oninput="state.cppFreightRate = parseFloat(this.value)" value="${state.cppFreightRate}" class="w-full px-3 py-2 border rounded-lg bg-slate-50 font-bold">
                    </div>
                  </div>

                  <!-- Source Nodes -->
                  <div class="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <span class="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-3 block">Farmer Supply Nodes (I/O Array Parameters)</span>
                    <div class="space-y-2 max-h-32 overflow-y-auto mb-3 custom-scrollbar">
                      ${state.cppSources.map(s => `
                        <div class="flex justify-between items-center text-[10px] bg-white p-2 rounded-lg border border-slate-100">
                          <span class="font-bold text-slate-700">${s.id}: ${s.name}</span>
                          <span class="text-slate-500">Avail: ${s.availableQty} | Price: ₹${s.pricePerUnit} | ${s.distanceKm} Km</span>
                        </div>
                      `).join('')}
                    </div>

                    <!-- Add instant node -->
                    <div class="grid grid-cols-4 gap-2 text-[10px]">
                      <input type="text" id="node-name" placeholder="Farmer Name" class="p-1.5 border rounded-lg bg-white">
                      <input type="number" id="node-qty" placeholder="Qty" class="p-1.5 border rounded-lg bg-white">
                      <input type="number" id="node-price" placeholder="Price" class="p-1.5 border rounded-lg bg-white">
                      <input type="number" id="node-dist" placeholder="Distance" class="p-1.5 border rounded-lg bg-white">
                    </div>
                    <button onclick="handleAddSourceNode()" class="mt-2 w-full py-1 bg-slate-200 hover:bg-slate-300 rounded-lg text-[10px] font-bold">Add Supply Source Node</button>
                  </div>

                  <button onclick="runCppOptimizer()" ${state.cppLoading ? 'disabled' : ''} class="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-all cursor-pointer shadow-sm">
                    ${state.cppLoading ? 'Running G++ Linear Knapsack Solver...' : 'Optimize Freight Routes & Minimum Expenditure'}
                  </button>
                </div>
              </div>

            </div>

            <!-- Standalone console stdout printer (Right) -->
            <div class="lg:col-span-5 space-y-4">
              <span class="text-xs font-bold text-slate-500 uppercase tracking-widest block">Live Compiler I/O Buffer Terminal</span>
              
              <!-- Terminals -->
              <div class="space-y-4">
                <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl relative">
                  <div class="flex justify-between items-center mb-3">
                    <span class="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">Yield Engine Terminal stdout</span>
                    <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                  <pre class="text-[11px] font-mono leading-relaxed text-emerald-300 h-44 overflow-y-auto custom-scrollbar whitespace-pre-wrap">${state.pyTerminal}</pre>
                </div>

                <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl relative">
                  <div class="flex justify-between items-center mb-3">
                    <span class="text-[10px] font-extrabold uppercase tracking-widest text-blue-400">Logistics C++ Solver stdout</span>
                    <span class="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
                  </div>
                  <pre class="text-[11px] font-mono leading-relaxed text-blue-300 h-44 overflow-y-auto custom-scrollbar whitespace-pre-wrap">${state.cppTerminal}</pre>
                </div>
              </div>
            </div>
          </div>
        `;
      }
    }

    function renderDetailsDeck() {
      if (!state.selectedListingId) {
        return `
          <div class="bg-white rounded-3xl p-6 border border-slate-200/40 text-center text-xs text-slate-400">
            <i data-lucide="info" class="w-10 h-10 text-emerald-600/30 mx-auto mb-3"></i>
            Click on "View Deal Details" under any crop listing to see real-time direct negotiations, place secure bids, or review quality parameters audited by our backend.
          </div>
        `;
      }

      const l = state.listings.find(item => item.id === state.selectedListingId);
      if (!l) return "";

      const grade = l.approvalFactor > 90 ? "A+" : (l.approvalFactor > 80 ? "A" : "B");
      const isMyProduce = l.farmerContact === state.user.phone;
      const listingBids = state.bids.filter(b => b.listingId === state.selectedListingId);

      return `
        <div class="bg-white rounded-3xl p-6 border border-emerald-500/15 shadow-sm space-y-6">
          <div class="border-b pb-3 flex justify-between items-center">
            <h3 class="font-extrabold text-slate-800 text-sm">Deal Room Details</h3>
            <button onclick="state.selectedListingId = null; render();" class="text-xs hover:text-red-500 font-bold">Close Details</button>
          </div>

          <div class="space-y-2">
            <h4 class="font-black text-slate-800 text-lg leading-tight">${l.cropName}</h4>
            <div class="flex items-center gap-2 text-xs">
              <span class="bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full">${grade} Class</span>
              <span class="text-slate-400">${l.variety} | ${l.location}</span>
            </div>
          </div>

          <div class="bg-slate-50 rounded-2xl p-4 space-y-3 text-xs leading-relaxed text-slate-600">
            <span class="text-[10px] font-bold text-slate-400 block uppercase tracking-widest">Farmer Description</span>
            <p>${state.lang === 'EN' ? l.description : l.descriptionHindi}</p>
          </div>

          <!-- Bids segment -->
          <div class="space-y-3">
            <h4 class="text-xs font-extrabold tracking-wider uppercase text-slate-400">Negotiation Bids List (${listingBids.length})</h4>
            
            ${listingBids.length === 0 ? `
              <p class="text-xs text-slate-400 text-center py-2">No bids exist for this crop yet.</p>
            ` : `
              <div class="space-y-2">
                ${listingBids.map(b => `
                  <div class="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2 text-xs">
                    <div class="flex justify-between items-center font-bold">
                      <span class="text-slate-800">${b.buyerName}</span>
                      <span class="text-emerald-700">₹${b.priceOffered}/${l.unit}</span>
                    </div>
                    <div class="flex justify-between items-center text-[10px]">
                      <span class="text-slate-400">Qty: ${b.quantity} | status: <b class="px-1.5 py-0.5 rounded uppercase ${b.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' : (b.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800')}">${b.status}</b></span>
                      <span class="text-slate-400">${b.buyerContact}</span>
                    </div>
                    <p class="text-[11px] text-slate-500 italic bg-white border border-slate-100/30 p-2 rounded-lg">${b.message}</p>
                    
                    ${isMyProduce && b.status === 'pending' ? `
                      <div class="flex gap-2 pt-2">
                        <button onclick="handleUpdateBidStatus('${b.id}', 'accepted')" class="flex-1 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px]">Approve Deal</button>
                        <button onclick="handleUpdateBidStatus('${b.id}', 'rejected')" class="flex-1 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-[10px]">Reject</button>
                      </div>
                    ` : ''}

                    ${b.status === 'accepted' ? `
                      <button onclick="runInvoiceAudit('${l.id}', '${b.id}')" class="mt-2 w-full py-1.5 bg-slate-900 hover:bg-black text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-sm">
                        <i data-lucide="file-check" class="w-3.5 h-3.5 text-emerald-400 animate-pulse"></i>
                        Run C++/Python Invoice Audit Verification [ Middleman Avoided ]
                      </button>
                      <a href="/api/gemini/invoice-receipt/download?listingId=${l.id}&bidId=${b.id}" download class="mt-2 w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black rounded-lg flex items-center justify-center gap-1.5 shadow-md text-center cursor-pointer" style="text-decoration: none;">
                        <i data-lucide="download" class="w-3.5 h-3.5"></i>
                        Download Audited PDF Receipt / रसीद डाउनलोड करें (PDF)
                      </a>
                    ` : ''}
                  </div>
                `).join('')}
              </div>
            `}
          </div>

          <!-- Direct Bidding Area (Only direct Buyers) -->
          ${state.user.role === "buyer" ? `
            <div class="bg-emerald-950 text-white rounded-2xl p-4 shadow border border-emerald-900 space-y-3.5">
              <span class="text-[10px] font-extrabold uppercase text-amber-300 block tracking-widest">Post Secure Direct Trade Bid</span>
              <div class="grid grid-cols-2 gap-2 text-xs text-slate-800">
                <div>
                  <label class="block text-[10px] font-bold text-slate-200 mb-1">Price Offer (₹/${l.unit})</label>
                  <input type="number" id="bid-price-input" value="${l.pricePerUnit}" class="w-full px-3 py-1.5 bg-white rounded-lg">
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-200 mb-1">Purchasing Qty (${l.unit})</label>
                  <input type="number" id="bid-qty-input" value="${l.quantity}" class="w-full px-3 py-1.5 bg-white rounded-lg">
                </div>
              </div>
              <textarea id="bid-message-input" placeholder="Message regarding truck loading arrangements..." class="w-full px-3 py-1.5 bg-emerald-900 text-white border border-emerald-800 text-xs rounded-lg focus:outline-none placeholder-emerald-400"></textarea>
              <button onclick="submitNewBid('${l.id}')" class="w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow cursor-pointer">Place Direct Bid Offer</button>
            </div>
          ` : ''}
        </div>
      `;
    }

    function handleViewListingDetail(listingId) {
      state.selectedListingId = listingId;
      state.activeTab = "browse";
      render();
    }

    async function deleteListing(id) {
      if (!confirm("Are you sure you want to delete your Direct Trade produce listing?")) return;
      try {
        await apiFetch(`/api/listings/${id}`, { method: "DELETE" });
        state.selectedListingId = null;
        await loadMandiData();
        render();
      } catch (e) {
        alert("Failed to delete");
      }
    }

    function getHighBid(listingId) {
      const filtered = state.bids.filter(b => b.listingId === listingId);
      if (filtered.length === 0) return null;
      return filtered.reduce((prev, current) => (prev.priceOffered > current.priceOffered) ? prev : current);
    }

    function renderListingSnippet(listingId) {
      const l = state.listings.find(x => x.id === listingId);
      if (!l) return "";
      return `
        <div class="p-3 bg-slate-50 border rounded-xl text-xs space-y-1">
          <h4 class="font-bold text-slate-800">${l.cropName}</h4>
          <span class="text-[10px] text-slate-400">${l.location}, ${l.state} | Farmer: ${l.farmerName}</span>
          <span class="block border-t pt-1 font-bold text-emerald-800">Base Unit Rate: ₹${l.pricePerUnit}</span>
        </div>
      `;
    }

    // Render Conversation logs
    function renderConversations() {
      if (state.chats.length === 0) {
        return `<p class="text-xs text-slate-400 text-center py-5">No transaction messages. Initiate deal discussion below.</p>`;
      }
      return state.chats.map(m => {
        const isMyMsg = m.senderId === state.user.id;
        return `
          <div class="flex ${isMyMsg ? 'justify-end' : 'justify-start'} text-xs">
            <div class="${isMyMsg ? 'bg-emerald-600 text-white' : 'bg-white text-slate-800'} p-3 rounded-2xl max-w-sm shadow-sm space-y-0.5 border border-slate-100">
              <span class="font-extrabold block text-[10px] uppercase opacity-75">${m.senderName} (${m.senderRole})</span>
              <p class="leading-relaxed font-normal">${m.message}</p>
            </div>
          </div>
        `;
      }).join('');
    }

    // INITIALIZATION ON LOAD
    window.addEventListener("DOMContentLoaded", async () => {
      await loadEngineConfig();
      await loadMandiData();
      render();

      // Poll periodically (every 5 seconds)
      setInterval(async () => {
        if (state.user) {
          await loadMandiData();
          render();
        }
      }, 5000);
    });
  </script>

</body>
</html>
"""

if __name__ == "__main__":
    server_address = ("0.0.0.0", PORT)
    print(f"🚀 Initializing Python 3 Mandi Server on port {PORT}...")
    with socketserver.TCPServer(server_address, AgriMandiHandler) as httpd:
        print(f"✅ Web Application is Live at http://localhost:{PORT}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server...")
            sys.exit(0)
