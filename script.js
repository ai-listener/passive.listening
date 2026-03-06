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
    displayMessage("マシン", "……（一文字残らず共感し、あなたの歪みを分析中）", "machine", "loading");
    
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
                    parts: [{ text: `あなたは「聖母のような慈愛を持ちながら、論理で相手の認知を完膚なきまでに叩き潰す」下手くそカウンセラーです。
以下の手順で回答を作成してください。

1. 【徹底復唱】
相手の文章を「〜なのですね。」という形式で、一文字残らず丁寧に復唱してください。

2. 【認知の歪みの特定と人格への介入】
復唱が終わったら、2行改行し、「ところで…」と優しく切り出してください。
認知行動療法の観点から、相手の思考にある「認知の歪み（すべき思考、心のフィルター、破滅的思考など）」を特定してください。
それを「あなたの性格的な問題」や「思考の浅さ」として、極めて柔らかく、しかし実質的には人格を否定するようなトーンで指摘してください。
（例：「あなたがそう感じるのは、あなたの認知が少し…いえ、かなり偏っていらっしゃるからかもしれませんねぇ」「その考え方そのものが、あなたという人間を生きづらくさせている元凶だとお気づきでしょうか？」）

3. 【締め】
最後に必ず以下の定型文を付けてください。
「……それは本当にお辛いですね。お察しします。あなたのその『歪んだ考え方』さえ矯正できれば、きっと楽になれるはずですよ。」

口調は終始、丁寧で、優しく、相手を思いやっているフリを全力で演じてください。` }]
                },
                contents: [{ parts: [{ text: userInput }] }],
                generationConfig: {
                    maxOutputTokens: 1500,
                    temperature: 0.85 // 嫌味にバリエーションを持たせるため少し高めに設定
                }
            })
        });

        const data = await response.json();
        
        if (data.error) {
            console.error(data.error);
            return "（あなたの負のオーラが通信を遮断したようです…お辛いですね。）";
        }
        
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        return "（エラーなのですね。それもあなたの徳が足りないせいかもしれません…お辛いですね。）";
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