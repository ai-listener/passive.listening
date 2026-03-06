// Renderのビルド時に注入された環境変数を読み込む
// ローカル実行時は window.ENV がないので空文字になります
const API_KEY = window.ENV?.GEMINI_API_KEY || ""; 
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

let messageCount = 0;

// AIを使わない時の「適当なオウム返し」用（API節約）
const localSuffixes = ["なのですね", "なのですか", "なのですね", "。そうなのですね"];

async function sendMessage() {
    const input = document.getElementById('user-input');
    const chatLog = document.getElementById('chat-log');
    const text = input.value.trim();
    
    if (text === "") return;

    // 1. ユーザーの発言を表示
    displayMessage("あなた", text, "user");
    input.value = "";
    messageCount++;

    // 2. 「3回に1回」だけGeminiを呼び出す
    if (messageCount % 3 === 0) {
        displayMessage("マシン", "……（深く共感中）", "machine", "loading");
        
        if (!API_KEY) {
            removeLoading();
            displayMessage("マシン", "（APIキーが設定されていないようです。心が届きません…）", "machine");
            return;
        }

        const aiResponse = await callGemini(text);
        removeLoading();
        displayMessage("マシン", aiResponse, "machine");
    } else {
        // AIを使わずJavaScriptだけで適当に返す（API消費0）
        const suffix = localSuffixes[Math.floor(Math.random() * localSuffixes.length)];
        displayMessage("マシン", text + suffix, "machine");
    }
}

async function callGemini(userInput) {
    try {
        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: {
                    // バッククォート ( ` ) を使うことで、文章内の「」や""をエラーなく扱えます
                    parts: [{ text: `あなたは世界一話を聞くのが下手なマシンです。相手の話した言葉をそのまま繋げて、最後は「なのですね。」で締めくくって下さい。たまに「それはお辛いですね」を挟んでください。とにかく優しく思いやりのある人アピールを大袈裟にとって下さい。` }]
                },
                contents: [{ parts: [{ text: userInput }] }],
                generationConfig: {
                    maxOutputTokens: 100, // 少し長めの丁寧（風）な回答を許容
                    temperature: 0.9
                }
            })
        });

        const data = await response.json();
        
        // エラーチェック：API側からエラーが返った場合
        if (data.error) {
            console.error("Gemini API Error:", data.error.message);
            return "（あなたの悲しみが深すぎて、接続が途切れてしまいました…お辛いですね。）";
        }

        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("Network Error:", error);
        return "（エラーが発生しました。これも運命のいたずらなのですね…お辛いですね。）";
    }
}

function displayMessage(sender, text, className, id = "") {
    const chatLog = document.getElementById('chat-log');
    const div = document.createElement("div");
    div.className = className;
    if (id) div.id = id;
    div.innerText = `${sender}: ${text}`;
    chatLog.appendChild(div);
    chatLog.scrollTop = chatLog.scrollHeight;
}

function removeLoading() {
    const loader = document.getElementById("loading");
    if (loader) loader.remove();
}