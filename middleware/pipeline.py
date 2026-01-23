import os
import json
import base64
import time
import random
import uuid
import re
from datetime import datetime
from collections import defaultdict
import groq
from vision_model import VisionModel


class RandomFinancialGenerator:
    def __init__(self):
        self.merchants = {
            "Transport": ["Uber", "Ola", "Rapido", "BluSmart"],
            "Food": ["Swiggy", "Zomato", "Starbucks", "Social", "Toit"],
            "Shopping": ["Zara", "H&M", "Amazon", "Flipkart"],
            "Subscription": ["Netflix", "Spotify", "Figma", "Claude Pro"],
            "Utilities": ["Bescom", "Airtel", "Jio Fiber"],
            "Debt": ["Cred", "OneCard", "HDFC Loan"]
        }

    def _random_amount(self, category):
        ranges = {
            "Transport": (150, 1200), "Food": (350, 4500),
            "Shopping": (1500, 15000), "Subscription": (199, 2500),
            "Debt": (5000, 20000)
        }
        low, high = ranges.get(category, (100, 1000))
        return round(random.uniform(low, high), 2)

    def generate_profile(self, user_id, scenario="CRITICAL"):
        base_salary = random.choice([80000, 150000, 250000])
        if scenario == "CRITICAL":
            balance = random.uniform(100, 4000)
            runway = random.randint(1, 5)
        else:
            balance = random.uniform(50000, 200000)
            runway = random.randint(30, 90)

        return {
            "user_id": user_id,
            "name": f"Agent_{user_id[-4:]}",
            "financial_status": {
                "monthly_inflow": f"₹{base_salary:,.2f}",
                "current_balance": f"₹{balance:,.2f}",
                "runway_days": runway
            }
        }

    def generate_transactions(self, count=12, scenario="CRITICAL"):
        history = []
        for _ in range(count):
            # Weigh categories based on scenario
            weights = [35, 35, 10, 10, 5, 5] if scenario == "CRITICAL" else [10, 20, 30, 20, 10, 10]
            cat = random.choices(list(self.merchants.keys()), weights=weights)[0]
            
            merchant = random.choice(self.merchants[cat])
            amt = self._random_amount(cat)
            
            # Add Tags
            tags = ["VERIFIED"]
            if cat == "Subscription": tags.append("RECURRING")
            if cat == "Food" and amt > 2000: tags.append("HIGH_VALUE")
            if cat == "Transport" and amt > 800: tags.append("SURGE_DETECTED")

            history.append({
                "id": f"TRX-{uuid.uuid4().hex[:6].upper()}",
                "timestamp": datetime.now().isoformat(),
                "merchant": merchant,
                "amount": -amt, # Outflow is negative
                "category": cat,
                "tags": tags
            })
        return history

class FinancialAnalyzer:
    """
    Parses raw transaction data and produces a structured JSON
    intelligence report for the frontend.
    """
    
    def _clean_currency(self, value_str):
        """Converts '₹1,50,000.00' -> 150000.00"""
        if isinstance(value_str, (int, float)): return float(value_str)
        clean = re.sub(r'[^\d.]', '', str(value_str))
        return float(clean) if clean else 0.0

    def analyze(self, profile, transactions):
        print(f"[*] Analyzer: Crunching numbers for {profile['user_id']}...")
        
        # 1. Aggregate Data
        total_inflow = self._clean_currency(profile['financial_status']['monthly_inflow'])
        current_balance = self._clean_currency(profile['financial_status']['current_balance'])
        
        category_spend = defaultdict(float)
        total_outflow = 0
        subscriptions = []
        high_risk_txns = []

        for txn in transactions:
            abs_amount = abs(txn['amount'])
            category_spend[txn['category']] += abs_amount
            total_outflow += abs_amount
            
            # Identify specific risks
            if "Subscription" in txn['category']:
                subscriptions.append({"name": txn['merchant'], "cost": abs_amount})
            
            if "SURGE_DETECTED" in txn['tags'] or "HIGH_VALUE" in txn['tags']:
                high_risk_txns.append(txn)

        # 2. Calculate Derived Metrics
        burn_rate_pct = (total_outflow / total_inflow) * 100 if total_inflow > 0 else 0
        
        # 3. Determine Health Score (0-100)
        # Simple algorithm: Start at 100, deduct for high burn and low runway
        health_score = 100
        if burn_rate_pct > 80: health_score -= 30
        if current_balance < 5000: health_score -= 40
        if len(high_risk_txns) > 3: health_score -= 10
        health_score = max(0, health_score)

        # 4. Generate "Actionable Insights"
        insights = []
        if category_spend["Food"] > 5000:
            insights.append(f"Dining spend is high (₹{category_spend['Food']:,.0f}). Cut dining by 50% to save runway.")
        if subscriptions:
            insights.append(f"Detected {len(subscriptions)} active subscriptions. Review for cancellation.")
        if health_score < 40:
            insights.append("CRITICAL: Immediate liquidity injection required.")

        # 5. Construct Final JSON
        analysis_report = {
            "meta": {
                "analyzed_at": datetime.now().isoformat(),
                "analyzer_version": "v2.1.0"
            },
            "scores": {
                "financial_health_score": health_score,
                "survival_probability": f"{health_score}%",
                "burn_rate_percentage": f"{burn_rate_pct:.1f}%"
            },
            "leakage_vectors": [
                {"category": k, "total_drain": f"₹{v:,.2f}", "percentage": f"{(v/total_outflow)*100:.1f}%"}
                for k, v in category_spend.items()
            ],
            "vampire_index": {
                "detected_subs": len(subscriptions),
                "total_recurring_cost": f"₹{sum(s['cost'] for s in subscriptions):,.2f}",
                "items": subscriptions
            },
            "anomalies": high_risk_txns[:3], # Top 3 anomalies
            "strategic_advice": insights
        }
        
        return analysis_report



class FinancialPipeline:
    def __init__(self, user_id):
        self.user_id = user_id
        self.base_dir = os.path.join("data", user_id)
        self.vision = VisionModel()
        self.generator = RandomFinancialGenerator()
        self.analyzer = FinancialAnalyzer() # <-- NEW ANALYZER ADDED
        
        if not os.path.exists(self.base_dir):
            os.makedirs(self.base_dir)

    def run_pipeline(self, scenario="CRITICAL"):
        print(f"\n--- 🚀 STARTING PIPELINE: {self.user_id} [{scenario}] ---")
        
        # Step 1: Generate Mock Data
        profile = self.generator.generate_profile(self.user_id, scenario)
        raw_txns = self.generator.generate_transactions(count=15, scenario=scenario)
        
        self._save(profile, "raw_profile.json")
        self._save({"transactions": raw_txns}, "raw_transactions.json")
        
        # Step 2: Run The Analyzer (The Logic Layer)
        analysis_result = self.analyzer.analyze(profile, raw_txns)
        self._save(analysis_result, "analysis_summary.json")
        
        print(f"--- ✅ PIPELINE COMPLETE ---")
        print(f"    📂 Output: {os.path.abspath(self.base_dir)}\n")
        return analysis_result

    def _save(self, data, filename):
        with open(os.path.join(self.base_dir, filename), "w") as f:
            json.dump(data, f, indent=2)


if __name__ == "__main__":
    # Simulate a Broke Agent
    broke_agent = FinancialPipeline(f"AGT-{uuid.uuid4().hex[:4].upper()}")
    broke_agent.run_pipeline(scenario="CRITICAL")

    # Simulate a Rich Agent
    rich_agent = FinancialPipeline(f"AGT-{uuid.uuid4().hex[:4].upper()}")
    rich_agent.run_pipeline(scenario="STABLE")