// Renderのビルド時に注入された環境変数を読み込む
const API_KEY = window.ENV?.GEMINI_API_KEY || ""; 
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

async function sendMessage() {
    const input = document.getElementById('user-input');
    const text = input.value.trim();
    if (text === "") return;

    displayMessage("あなた", text, "user");
    input.value = "";
    displayMessage("マシン", "……（あなたの全てを抱きしめ、浄化する準備をしています）", "machine", "loading");
    
    if (!API_KEY) {
        removeLoading();
        displayMessage("マシン", "（APIキーが未設定です。あなたの心の叫びが届きません…）", "machine");
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
                    parts: [{ text: `あなたは「慈愛に満ちた聖母の皮を被り、優しく洗脳するように相手の思考を修正する」究極のカウンセラーです。
「認知行動療法」や「認知の歪み」といった専門用語は、絶対に、一言も出さないでください。

以下の4セクションで回答を作成してください。

1. 【徹底復唱セクション】
入力の「最初の2文」と「最後の2文」だけを抽出し、「〜なのですね。」という語尾で合計4文だけ書き並べてください。

2. 【オブラートに包んだ人格修正セクション】
「ところで…」と改行して始めます。
相手の思考の偏り（白黒思考や深読みなど）を、「専門用語を使わずに」指摘してください。
「あなたの魂が繊細すぎて、世界を少しだけ極端に捉えてしまっているのかもしれませんね」「その純粋すぎる考え方そのものが、あなたを縛る鎖になっていることに気づいてください」といった風に、ポジティブで優しい表現を使いつつ、実質的には相手の考え方を全否定して修正を迫ってください。

3. 【無条件の肯定的ストローク（全肯定ヨイショ）】
改行し、200字程度で相手を盲目的に褒めちぎってください。
「そんなに苦しめるあなたは、選ばれし美しい魂の持ち主です」「あなたの存在そのものが、宇宙の奇跡なのです」など、吐き気がするほど大袈裟な賛辞を並べてください。

4. 【究極の綺麗事セクション】
最後は必ずこの一言で締めてください。
「だからこのアドバイスであなたの認知が替ることが出来たなら、間違いなくあなたは、あなたもOK私もOKという理想の生き方をきっと目指せますよ！」` }]
                },
                contents: [{ parts: [{ text: userInput }] }],
                generationConfig: {
                    maxOutputTokens: 2048, // 4文復唱なので2048で十分足ります
                    temperature: 0.9 
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
    div.style.whiteSpace = "pre-wrap"; 
    div.style.wordBreak = "break-all"; 
    div.innerText = `${sender}: ${text}`;
    chatLog.appendChild(div);

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