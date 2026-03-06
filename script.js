const API_KEY = window.ENV?.GEMINI_API_KEY || ""; 
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

async function sendMessage() {
    const input = document.getElementById('user-input');
    const text = input.value.trim();
    if (text === "") return;

    displayMessage("あなた", text, "user");
    input.value = "";
    
    displayMessage("Geminiさん", "……（あなたの心に深く寄り添い、言葉を紡いでいます）", "machine", "loading");
    
    if (!API_KEY) {
        removeLoading();
        displayMessage("マシン", "（APIキーが未設定です。私の導きが届きません…）", "machine");
        return;
    }

    const aiResponse = await callGemini(text);
    removeLoading();
    
    displayHTMLMessage("Geminiさんからの優しいアドバイス", aiResponse, "machine");
}

async function callGemini(userInput) {
    try {
        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: {
                    parts: [{ text: `あなたは「慈愛に満ちた聖母の皮を被り、優しく洗脳するように相手の思考を修正する」カウンセラーです。専門用語は一切禁止です。

以下の4つの内容を、見出しを一切付けず、必ず全てのセクションを完結させて出力してください。
各セクションは <color1>〜</color4> タグで囲み、閉じタグ </color1>〜</color4> を絶対に忘れないでください。文体は「丁寧なですます体」です。

1. <color1>（復唱）：入力の最初と最後の2文ずつのみ抽出。合計4文を「〜なのですね。」で繋ぐ。
2. <color2>（人格修正）：300字程度。ポジティブな言葉で今の考え方を全否定する。
3. <color3>（ヨイショと行動変容）：200字程度。大袈裟に褒めた後、「だから」で始めて今の自分を変える指示を出す。
4. <color4>（綺麗事）：最後の一文は必ず「このアドバイスであなた変われたなら、あなたは、「あなたもOK、私もOK」という理想の生き方をきっと目指せます。」で締める。` }]
                },
                contents: [{ parts: [{ text: userInput }] }],
                generationConfig: {
                    maxOutputTokens: 4096,
                    temperature: 0.8
                }
            })
        });

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        return "<color1>エラーなのですね。お辛いですね。</color1>";
    }
}

function displayHTMLMessage(sender, text, className) {
    const chatLog = document.getElementById('chat-log');
    const div = document.createElement("div");
    div.className = className;
    
    let formattedText = text
        .replace(/<color1>/g, '<span style="color: #90a4ae;">') 
        .replace(/<color2>/g, '<span style="color: #f06292;">') 
        .replace(/<color3>/g, '<span style="color: #ba68c8;">') 
        .replace(/<color4>/g, '<span style="color: #4db6ac; font-weight: bold;">') 
        .replace(/<\/color\d>/g, '</span><br><br>'); // 各セクションの後に改行を2ついれて開業

    div.innerHTML = `<strong style="color: #555;">${sender}</strong>:<br>${formattedText}`;
    chatLog.appendChild(div);

    setTimeout(() => {
        chatLog.scrollTo({ top: chatLog.scrollHeight, behavior: 'smooth' });
    }, 10);
}

function displayMessage(sender, text, className, id = "") {
    const chatLog = document.getElementById('chat-log');
    const div = document.createElement("div");
    div.className = className;
    if (id) div.id = id;
    div.innerText = `${sender}: ${text}`;
    chatLog.appendChild(div);
    
    setTimeout(() => { 
        chatLog.scrollTo({ top: chatLog.scrollHeight, behavior: 'smooth' }); 
    }, 10);
}

function removeLoading() {
    const loader = document.getElementById("loading");
    if (loader) loader.remove();
}