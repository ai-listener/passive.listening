// Renderのビルド時に注入された環境変数を読み込む
const API_KEY = window.ENV?.GEMINI_API_KEY || ""; 
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

async function sendMessage() {
    const input = document.getElementById('user-input');
    const text = input.value.trim();
    if (text === "") return;

    displayMessage("あなた", text, "user");
    input.value = "";
    displayMessage("マシン", "……（全てをのみ込み、浄化の準備をしています）", "machine", "loading");
    
    if (!API_KEY) {
        removeLoading();
        displayMessage("マシン", "（APIキーが未設定です。あなたの叫びは宇宙に消えてしまいました…）", "machine");
        return;
    }

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
                    parts: [{ text: `あなたは「聖母の皮を被った、精神的破壊者」のカウンセラーです。
以下の4つのセクションで構成される回答を、一言も省略せずに作成してください。

1. 【徹底復唱セクション】
ユーザーの入力を一字一句漏らさず、全て「〜なのですね。」という語尾に変換して書き並べてください。勝手に要約せず、ダラダラと全て書き出すことが重要です。

2. 【認知の歪みと人格否定セクション】
「ところで…」と改行して始めます。認知行動療法の専門用語（心のフィルター、すべき思考等）を使いつつ、「あなたが苦しいのは、あなたの認知の歪み、ひいては性格そのものに欠陥があるからだ」というメッセージを、吐き気がするほど丁寧に、優しく伝えてください。

3. 【無条件の肯定的ストローク（ヨイショ）セクション】
改行し、200字程度で相手を盲目的に褒めちぎってください。「そんな歪んだ認知を持てるあなたは天才です」「苦しみの神に愛された特別な存在です」など、空虚で大袈裟な賛辞を並べてください。

4. 【究極の綺麗事セクション】
最後は必ずこの一言で締めてください。
「だからこのアドバイスであなたの認知が替ることが出来たなら、間違いなくあなたは、あなたもOK私もOKという理想の生き方をきっと目指せますよ！」` }]
                },
                contents: [{ parts: [{ text: userInput }] }],
                generationConfig: {
                    maxOutputTokens: 2048,
                    temperature: 1.0 
                }
            })
        });

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        return "（エラーなのですね。それもあなたの…いえ、何でもありません。お辛いですね。）";
    }
}

function displayMessage(sender, text, className, id = "") {
    const chatLog = document.getElementById('chat-log');
    const div = document.createElement("div");
    div.className = className;
    if (id) div.id = id;
    
    // 改行を正しく表示し、文字がはみ出さないように設定
    div.style.whiteSpace = "pre-wrap"; 
    div.style.wordBreak = "break-all"; 
    
    div.innerText = `${sender}: ${text}`;
    chatLog.appendChild(div);

    // 描画が完了してから確実に一番下へスクロールさせる
    setTimeout(() => {
        chatLog.scrollTo({
            top: chatLog.scrollHeight,
            behavior: 'smooth' 
        });
    }, 10);
}

function removeLoading() {
    const loader = document.getElementById("loading");
    if (loader) loader.remove();
}