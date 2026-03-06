// Renderのビルド時に注入された環境変数を読み込む
// ローカル実行時は window.ENV がないので空文字になる
const API_KEY = window.ENV?.GEMINI_API_KEY || ""; 
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

let messageCount = 0;

// AIを使わない時の「適当なオウム返し」用
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
        displayMessage("マシン", "……（考え中）", "machine", "loading");
        
        if (!API_KEY) {
            removeLoading();
            displayMessage("マシン", "（APIキーが設定されてないみたい。やる気出ないわー）", "machine");
            return;
        }

        const aiResponse = await callGemini(text);
        removeLoading();
        displayMessage("マシン", aiResponse, "machine");
    } else {
        // AIを使わずJavaScriptだけで適当に返す（API節約）
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
                    parts: [{ text: "あなたは世界一話を聞くのが下手なマシンです。相手の話した言葉をそのまま繋げて、最後は"なのですね。"で締めくくって下さい。たまに"それはお辛いですね"を挟んでください。とにかく優しく思いやりのある人アピールを大袈裟にとって下さい。" }]
                },
                contents: [{ parts: [{ text: userInput }] }],
                generationConfig: {
                    maxOutputTokens: 60,
                    temperature: 0.9
                }
            })
        });

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("API Error:", error);
        return "（エラーだよ。君の話が退屈すぎて、通信が切れたかもね）";
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