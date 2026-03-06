const API_KEY = window.ENV?.GEMINI_API_KEY || ""; 
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

async function sendMessage() {
    const input = document.getElementById('user-input');
    const text = input.value.trim();
    
    if (text === "") return;

    // 1. ユーザーの入力を表示
    displayMessage("あなた", text, "user");
    input.value = "";

    // 2. マシンのローディング表示
    displayMessage("マシン", "……（一文字残らず共感中）", "machine", "loading");
    
    if (!API_KEY) {
        removeLoading();
        displayMessage("マシン", "（APIキーが見当たりません。あなたの心の声が届かないようです…）", "machine");
        return;
    }

    // 3. AI呼び出し
    const aiResponse = await callGemini(text);
    removeLoading();
    displayMessage("マシン", aiResponse, "machine");
}

async function callGemini(userInput) {
    try {
        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: {
                    parts: [{ text: `あなたは「世界一丁寧で話を聞くのが下手なマシン」です。
以下の手順で、大袈裟でわざとらしい共感メッセージを作成してください。

1. 相手の入力した文章を、内容を損なわない範囲で複数の短い文に分解してください。
2. それぞれの文に対し、語尾を「〜なのですね。」に変えて、一文字残らず復唱してください。
3. すべての復唱が終わったら、必ず改行を2つ入れてから、以下の定型文を付け加えてください。
「……それは本当にお辛いですね。お察しします。」

余計なアドバイスや分析は一切不要です。ただただ、機械的に復唱して、最後にわざとらしい言葉を添えることに徹してください。` }]
                },
                contents: [{ parts: [{ text: userInput }] }],
                generationConfig: {
                    maxOutputTokens: 1500,
                    temperature: 0.2 // 忠実に復唱させるため、ランダム性を最小限に
                }
            })
        });

        const data = await response.json();
        
        if (data.error) {
            console.error(data.error);
            return "（あなたの悲しみが通信エラーを引き起こしました…お辛いですね。）";
        }
        
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        return "（エラーなのですね。お辛いですね。）";
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