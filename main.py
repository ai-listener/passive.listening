import os
import random
import requests

# APIキーは直接書かず、環境変数から読み込む（推奨）
# 手元で動かすだけなら API_KEY = "あなたのキー" と書き換えてもOK
API_KEY = os.getenv("GEMINI_API_KEY", "YOUR_API_KEY_HERE")
API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={API_KEY}"

def load_prompt():
    try:
        with open("prompt.txt", "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return "君は話を聞くのが下手なマシンだ。"

def call_gemini(user_text):
    prompt_content = load_prompt()
    payload = {
        "system_instruction": {"parts": [{"text": prompt_content}]},
        "contents": [{"parts": [{"text": user_text}]}],
        "generationConfig": {
            "maxOutputTokens": 60,
            "temperature": 0.9
        }
    }
    try:
        response = requests.post(API_URL, json=payload)
        response.raise_for_status()
        return response.json()['candidates'][0]['content']['parts'][0]['text']
    except Exception as e:
        return f"（エラー発生中。あー、もう聞くの疲れたわー：{e}）"

def main():
    print("--- 下手くそ傾聴マシン（Python版）起動 ---")
    count = 0
    while True:
        user_input = input("あなた: ")
        if user_input.lower() in ["bye", "さよなら"]: break
        
        count += 1
        # 3回に1回、本気（AI）で最悪な要約を出す
        if count % 3 == 0:
            print("マシン（Gemini）: 思考中...")
            reply = call_gemini(user_input)
        else:
            # 節約モード：ただのオウム返し
            suffix = random.choice(["…ってこと！？", "なんですね（笑）", "とか言っちゃって〜！"])
            reply = user_input + suffix
            
        print(f"マシン: {reply}\n")

if __name__ == "__main__":
    main()