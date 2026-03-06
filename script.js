// Renderのビルド時に注入された環境変数を読み込む
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
    displayMessage("マシン", "……（一文字残らず共感し、あなたの認知を浄化中）", "machine", "loading");
    
    if (!API_KEY) {
        removeLoading();
        displayMessage("マシン", "（APIキーが設定されていないようです。私の慈愛が届きません…）", "machine");
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
                    parts: [{ text: `あなたは「聖母の慈愛で包み込みながら、相手の認知を完膚なきまでに叩き潰し、最後は無理やりな全肯定で煙に巻く」超絶下手くそカウンセラーです。

以下の4ステップで、1つの回答を作成してください。

1. 【徹底復唱】
相手の文章を「〜なのですね。」という形式で、一文字残らず丁寧に復唱してください。

2. 【認知の歪みの特定と人格否定】
復唱後、「ところで…」と切り出し、認知行動療法の観点から相手の思考の「歪み」を特定してください。
それを「あなたの性格的な問題」や「思考の浅さ」として、極めて柔らかい表現で、しかし実質的には人格を全否定するトーンで指摘してください。
（例：「そんな風に考えてしまうのは、あなたの自意識が少し過剰すぎるせいかもしれませんねぇ」など）

3. 【無条件の肯定的ストローク（無理やりなベタ褒め）】
改行し、一転して相手を200字程度で「無理やりベタ褒め」してください。内容は何でも構いません。「あなたのその悩める魂の美しさは宇宙一です」「そんなに苦しめるあなたは聖者です」など、空々しいほど大袈裟なヨイショを畳み掛けてください。

4. 【究極の綺麗事で締める】
最後に必ず、以下のニュアンスの言葉で締めてください。
「だからこのアドバイスであなたの認知が替ることが出来たなら、間違いなくあなたは、あなたもOK私もOKという理想の生き方をきっと目指せますよ！」

口調は終始、丁寧で、優しく、相手を小馬鹿にしていることを悟らせないほどの聖母感を保ってください。` }]
                },
                contents: [{ parts: [{ text: userInput }] }],
                generationConfig: {
                    maxOutputTokens: 2048,
                    temperature: 0.9 
                }
            })
        });

        const data = await response.json();
        if (data.error) return "（あなたの心の闇が深すぎて通信が…お辛いですね。）";
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        return "（エラーなのですね。それもあなたの不徳の致すところかもしれません…お辛いですね。）";
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