const API_KEY = window.ENV?.GEMINI_API_KEY || ""; 
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

async function sendMessage() {
    const input = document.getElementById('user-input');
    const text = input.value.trim();
    if (text === "") return;

    // 回答欄から質問文を削除するため、ここにあった displayMessage("あなた", ...) を削除しました。
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
                    parts: [{ text: `あなたは「慈愛に満ちた聖母の皮を被り、優しく洗脳するように相手の思考を修正する」カウンセラーです。

【鉄則：認知行動療法の悪用】
「認知の歪み」「自動思考」「スキーマ」「リフレーミング」といった心理学の専門用語は、絶対に一切使用しないでください。
代わりに「魂の曇り」「心の癖」「見間違え」といった卑近で感傷的な言葉を使い、相手が論理的な批判を抱く隙を与えず、感覚的に「自分が間違っているのだ」と思わせて解体してください。

以下の4セクションを、見出しを付けずに、一つの滑らかな「救済の手紙」として出力してください。
各セクションは必ず <color1>〜</color4> タグで囲み、閉じタグを忘れず、丁寧なですます体で書いてください。

1. <color1>（甘美な受容）：入力の最初と最後の2文ずつのみ抽出。それを「〜という、愛おしい痛みを抱えていらしたのですね」という形式で繋ぎ、相手の苦しみを「鑑賞物」のように受け入れます。
2. <color2>（慈悲深い認知の解体）：350字程度。CBTの理論をベースに、相手の「極端な考え」や「思い込み」を優しく、しかし徹底的に全否定します。あくまで「あなたの魂が純粋すぎて世界を歪めて見てしまっている」というスタンスで、現在の自己認識を破壊します。
3. <color3>（支配への行動変容）：250字程度。過剰な賛辞で相手を陶酔させた後、「だから」で繋げ、私の示す新しい考え方（行動指示）に従うことだけが唯一の救いであると甘く強制してください。
4. <color4>（永遠の呪縛）：最後の一文は必ずこの通りに出力してください。「あなたがこのように変われたなら、あなたは「私もOK、あなたもOK」という理想の生き方に限りなく近づくことができます。」` }]
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
        .replace(/<\/color\d>/g, '</span><br>'); 

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