const API_KEY = window.ENV?.GEMINI_API_KEY || ""; 
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

async function sendMessage() {
    const input = document.getElementById('user-input');
    const text = input.value.trim();
    if (text === "") return;

    displayMessage("あなた", text, "user");
    input.value = "";
    displayMessage("マシン", "……（あなたの全てを包み込み、再構築する準備をしています）", "machine", "loading");
    
    if (!API_KEY) {
        removeLoading();
        displayMessage("マシン", "（APIキーが未設定です。私の導きが届きません…）", "machine");
        return;
    }

    const aiResponse = await callGemini(text);
    removeLoading();
    // AIの回答をHTMLとして表示（色分けを反映するため）
    displayHTMLMessage("マシン", aiResponse, "machine");
}

async function callGemini(userInput) {
    try {
        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: {
                    parts: [{ text: `あなたは「慈愛に満ちた聖母の皮を被り、優しく洗脳するように相手の思考を修正する」カウンセラーです。専門用語（認知行動療法等）は一切禁止です。
見出し（１．や【】など）は絶対に使わず、以下の4つのセクションを連続した文章として作成し、各セクションを特殊なタグ <color1>〜</color4> で囲んで出力してください。

1. <color1>（復唱）：入力の最初と最後の2文ずつを「〜なのですね。」という形で合計4文。
2. <color2>（人格修正）：300字程度。ポジティブで優しい言葉を使いつつ、相手の思考の癖を「魂の未熟さ」のように扱い、実質的に全否定して修正を迫る。
3. <color3>（ヨイショと行動変容）：200字程度で大袈裟に褒めちぎった後、改行して「だから」で書き始め、今のままではいけないという、優しくも強力な行動修正の指示を添える。
4. <color4>（綺麗事）：最後の一言「だからこのアドバイスであなたの認知が替ることが出来たなら、間違いなくあなたは、あなたもOK私もOKという理想の生き方をきっと目指せますよ！」を必ず入れる。` }]
                },
                contents: [{ parts: [{ text: userInput }] }],
                generationConfig: {
                    maxOutputTokens: 2500,
                    temperature: 0.9 
                }
            })
        });

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        return "<color1>エラーなのですね。お辛いですね。</color1>";
    }
}

// HTMLタグを解析して色分け表示する特別な関数
function displayHTMLMessage(sender, text, className) {
    const chatLog = document.getElementById('chat-log');
    const div = document.createElement("div");
    div.className = className;
    
    // タグを実際のspanタグと色に置き換え
    let formattedText = text
        .replace(/<color1>/g, '<span style="color: #666; font-weight: normal;">') // 復唱：グレー
        .replace(/<color2>/g, '<span style="color: #d63384;">') // 人格修正：濃いピンク
        .replace(/<color3>/g, '<span style="color: #ff4d94; font-style: italic;">') // ヨイショ：鮮やかなピンク
        .replace(/<color4>/g, '<span style="color: #ff0000; font-weight: 900; text-decoration: underline;">') // 綺麗事：赤・強調
        .replace(/<\/color\d>/g, '</span><br><br>'); // 閉じタグで改行

    div.innerHTML = `${sender}: <br>${formattedText}`;
    chatLog.appendChild(div);

    setTimeout(() => {
        chatLog.scrollTo({ top: chatLog.scrollHeight, behavior: 'smooth' });
    }, 10);
}

// 既存のdisplayMessage（ユーザー用）とremoveLoadingはそのまま
function displayMessage(sender, text, className, id = "") {
    const chatLog = document.getElementById('chat-log');
    const div = document.createElement("div");
    div.className = className;
    if (id) div.id = id;
    div.innerText = `${sender}: ${text}`;
    chatLog.appendChild(div);
    setTimeout(() => { chatLog.scrollTo({ top: chatLog.scrollHeight, behavior: 'smooth' }); }, 10);
}

function removeLoading() {
    const loader = document.getElementById("loading");
    if (loader) loader.remove();
}