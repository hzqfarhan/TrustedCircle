import os
import json
import urllib.request


def get_number(data, key, default=0):
    try:
        return float(data.get(key, default) or 0)
    except Exception:
        return default


def predict_anomaly(payload):
    monthly_allowance = max(get_number(payload, "monthlyAllowance", 1), 1)

    food = get_number(payload, "food")
    transport = get_number(payload, "transport")
    school_items = get_number(payload, "schoolItems")
    shopping = get_number(payload, "shopping")
    entertainment = get_number(payload, "entertainment")
    savings = get_number(payload, "savings")
    extra_requests = get_number(payload, "extraAllowanceRequests")
    overspending_count = get_number(payload, "overspendingCount")
    school_holiday_days = get_number(payload, "schoolHolidayDays")

    food_limit = monthly_allowance * 0.45
    transport_limit = monthly_allowance * 0.20
    education_limit = monthly_allowance * 0.15
    shopping_limit = monthly_allowance * 0.20
    entertainment_limit = monthly_allowance * 0.15
    savings_target = monthly_allowance * 0.10

    food_ratio = food / food_limit if food_limit > 0 else 0
    transport_ratio = transport / transport_limit if transport_limit > 0 else 0
    education_ratio = school_items / education_limit if education_limit > 0 else 0
    shopping_ratio = shopping / shopping_limit if shopping_limit > 0 else 0
    entertainment_ratio = entertainment / entertainment_limit if entertainment_limit > 0 else 0
    savings_progress = savings / savings_target if savings_target > 0 else 0

    discretionary_ratio = (shopping + entertainment) / monthly_allowance
    savings_ratio = savings / monthly_allowance

    anomaly_flags = []

    if discretionary_ratio > 0.60:
        anomaly_flags.append("Discretionary spending is unusually high")

    if savings_ratio < 0.02:
        anomaly_flags.append("Savings are extremely low")

    if extra_requests >= 3:
        anomaly_flags.append("Frequent extra allowance requests detected")

    if overspending_count >= 3:
        anomaly_flags.append("Repeated overspending detected")

    is_anomaly = len(anomaly_flags) > 0
    anomaly_score = -0.2 if is_anomaly else 0.1
    ml_used = False

    try:
        import pandas as pd
        import pickle
        with open("kmeans_household_model.pkl", "rb") as f:
            kmeans = pickle.load(f)
        with open("allowance_anomaly_model.pkl", "rb") as f:
            anomaly_model = pickle.load(f)
        with open("feature_scaler.pkl", "rb") as f:
            scaler = pickle.load(f)

        cluster_df = pd.DataFrame([{
            "monthlyAllowance": monthly_allowance,
            "food_ratio": food_ratio,
            "transport_ratio": transport_ratio,
            "education_ratio": education_ratio,
            "shopping_ratio": shopping_ratio,
            "entertainment_ratio": entertainment_ratio,
            "savings_progress": savings_progress
        }])

        cluster_scaled = scaler.transform(cluster_df)
        household_cluster = kmeans.predict(cluster_scaled)[0]

        anomaly_df = pd.DataFrame([{
            "monthlyAllowance": monthly_allowance,
            "food_ratio": food_ratio,
            "transport_ratio": transport_ratio,
            "education_ratio": education_ratio,
            "shopping_ratio": shopping_ratio,
            "entertainment_ratio": entertainment_ratio,
            "savings_progress": savings_progress,
            "extraAllowanceRequests": extra_requests,
            "schoolHolidayDays": school_holiday_days,
            "household_cluster": household_cluster
        }])

        is_anomaly_ml = anomaly_model.predict(anomaly_df)[0] == -1
        anomaly_score_ml = anomaly_model.decision_function(anomaly_df)[0]

        if is_anomaly_ml:
            is_anomaly = True
            anomaly_flags.append("IsolationForest ML model detected unusual pattern")
            
        anomaly_score = float(anomaly_score_ml)
        ml_used = True

    except Exception as e:
        print(f"ML enhancement skipped. Using fallback rules. Error: {e}")

    return {
        "isAnomaly": is_anomaly,
        "anomalyScore": anomaly_score,
        "modelFlags": anomaly_flags,
        "mlUsed": ml_used
    }


def calculate_smart_allowance(payload, anomaly_result):
    monthly_allowance = max(get_number(payload, "monthlyAllowance", 1), 1)

    food = get_number(payload, "food")
    transport = get_number(payload, "transport")
    school_items = get_number(payload, "schoolItems")
    shopping = get_number(payload, "shopping")
    entertainment = get_number(payload, "entertainment")
    savings = get_number(payload, "savings")
    overspending_count = get_number(payload, "overspendingCount")
    extra_requests = get_number(payload, "extraAllowanceRequests")
    school_holiday_days = get_number(payload, "schoolHolidayDays")
    spent_all_allowance = bool(payload.get("spentAllAllowance", False))

    discretionary = shopping + entertainment
    savings_ratio = savings / monthly_allowance
    discretionary_ratio = discretionary / monthly_allowance

    score = 100

    if spent_all_allowance:
        score -= 15

    if savings_ratio < 0.10:
        score -= 10

    if discretionary_ratio > 0.30:
        score -= 15

    score -= overspending_count * 8
    score -= extra_requests * 5

    if anomaly_result["isAnomaly"]:
        score -= 10

    responsibility_score = max(0, min(100, int(score)))

    if responsibility_score >= 80:
        risk_level = "Low"
    elif responsibility_score >= 60:
        risk_level = "Medium"
    else:
        risk_level = "High"

    flags = []

    if spent_all_allowance:
        flags.append("Child spent the full allowance")

    if savings_ratio < 0.10:
        flags.append("Savings are below the recommended 10% target")

    if discretionary_ratio > 0.30:
        flags.append("Shopping and entertainment spending are high")

    if overspending_count >= 2:
        flags.append("Multiple overspending events detected")

    if extra_requests >= 2:
        flags.append("Frequent extra allowance requests detected")

    if anomaly_result["isAnomaly"]:
        flags.append("Unusual spending pattern detected")

    for flag in anomaly_result.get("modelFlags", []):
        if flag not in flags:
            flags.append(flag)

    if not flags:
        flags.append("No major anomaly detected")

    basic_needs = food + transport + school_items
    school_adjustment = min(school_holiday_days * 2, 20)
    savings_goal = monthly_allowance * 0.10
    flexible_buffer = monthly_allowance * 0.15

    recommended = basic_needs + school_adjustment + savings_goal + flexible_buffer

    # Anti-abuse rule:
    # Do not increase allowance when risky behavior is detected.
    if responsibility_score < 70 or spent_all_allowance:
        recommended = min(recommended, monthly_allowance)

    recommended_allowance = int(round(recommended / 10) * 10)

    predicted_spending = {
        "food": round(food * 1.03),
        "transport": round(transport * 1.02),
        "schoolItems": round(school_items),
        "shopping": round(shopping * 0.80 if responsibility_score < 70 else shopping * 0.95),
        "entertainment": round(entertainment * 0.80 if responsibility_score < 70 else entertainment * 0.95),
        "savings": round(max(savings, savings_goal))
    }

    return {
        "recommendedAllowance": recommended_allowance,
        "responsibilityScore": responsibility_score,
        "riskLevel": risk_level,
        "predictedSpending": predicted_spending,
        "anomalyDetection": {
            "hasAnomaly": anomaly_result["isAnomaly"],
            "anomalyScore": anomaly_result["anomalyScore"],
            "flags": flags
        }
    }


def call_qwen(ai_result):
    api_key = os.environ.get("DASHSCOPE_API_KEY")

    if not api_key:
        return {
            "parentExplanation": "Qwen explanation skipped, API key not configured",
            "childAdvice": "Save more, spend wisely, avoid extra requests",
            "financialGoal": "Increase savings, reduce unnecessary spending",
            "recommendedParentAction": "Review spending habits, set clear limits"
        }

    prompt = f"""
You are a financial literacy assistant for a parent-child eWallet system.

Generate SHORT, concise, and actionable advice.

Style rules:
- Use bullet-style phrases separated by commas
- Keep each field VERY short, max 8 to 12 words
- No full paragraphs
- No explanations, only key points

Tone:
- Parent: slightly serious, informative
- Child: friendly, encouraging, simple

Behavior rules:
- Do not shame the child
- Do not encourage more spending
- Encourage saving and responsible habits
- Focus only on key issues

Input:
Recommended allowance: RM{ai_result["recommendedAllowance"]}
Responsibility score: {ai_result["responsibilityScore"]}
Risk level: {ai_result["riskLevel"]}
Anomaly flags: {ai_result["anomalyDetection"]["flags"]}

Return JSON:
{{
  "parentExplanation": "...",
  "childAdvice": "...",
  "financialGoal": "...",
  "recommendedParentAction": "..."
}}
"""

    body = {
        "model": "qwen-turbo",
        "messages": [
            {
                "role": "system",
                "content": "Return valid JSON only."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": 0.1
    }

    request = urllib.request.Request(
        "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions",
        data=json.dumps(body).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(request, timeout=10) as response:
            response_json = json.loads(response.read().decode("utf-8"))
            content = response_json["choices"][0]["message"]["content"]

            try:
                return json.loads(content)
            except Exception:
                return {
                    "parentExplanation": content,
                    "childAdvice": "Save more, spend wisely, avoid extra requests",
                    "financialGoal": "Increase savings, reduce unnecessary spending",
                    "recommendedParentAction": "Review spending habits, set clear limits"
                }

    except Exception as e:
        return {
            "parentExplanation": "Qwen explanation unavailable, scoring completed",
            "childAdvice": "Save more, spend wisely, avoid extra requests",
            "financialGoal": "Increase savings, reduce unnecessary spending",
            "recommendedParentAction": "Review spending habits, set clear limits",
            "qwenError": str(e)
        }


def build_response(payload):
    anomaly_result = predict_anomaly(payload)
    ai_result = calculate_smart_allowance(payload, anomaly_result)
    ai_result["insights"] = call_qwen(ai_result)
    ai_result["modelInfo"] = {
        "anomalyModel": "IsolationForest model" if anomaly_result.get("mlUsed") else "Lightweight rule-based anomaly detection",
        "explanationModel": "Alibaba Model Studio Qwen",
        "mode": "Alibaba Function Compute"
    }
    return ai_result


def handler(event, context):
    try:
        # Decode event
        if isinstance(event, bytes):
            event = event.decode("utf-8")

        # Function Compute may pass event as JSON string
        if isinstance(event, str):
            try:
                event_json = json.loads(event)
            except Exception:
                event_json = {}
        else:
            event_json = event or {}

        # Handle HTTP body from trigger
        body = event_json.get("body", event_json)

        if isinstance(body, str):
            try:
                payload = json.loads(body)
            except Exception:
                payload = {}
        elif isinstance(body, dict):
            payload = body
        else:
            payload = {}

        result = build_response(payload)

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            },
            "body": json.dumps(result, ensure_ascii=False)
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({
                "error": str(e),
                "message": "Failed to process smart allowance AI request"
            })
        }

        return [error_body.encode("utf-8")]