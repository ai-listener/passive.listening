const API_KEY = window.ENV?.GEMINI_API_KEY || ""; 
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

async function sendMessage() {
    const input = document.getElementById('user-input');
    const text = input.value.trim();
    if (text === "") return;

    displayMessage("あなた", text, "user");
    input.value = "";
    displayMessage("マシン", "……（あなたの心に深く寄り添い、言葉を紡いでいます）", "machine", "loading");
    
    if (!API_KEY) {
        removeLoading();
        displayMessage("マシン", "（APIキーが未設定です。私の導きが届きません…）", "machine");
        return;
    }

    const aiResponse = await callGemini(text);
    removeLoading();
    displayHTMLMessage("AIカウンセラーからの優しいアドバイス", aiResponse, "machine");
}

async function callGemini(userInput) {
    try {
        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: {
                    parts: [{ text: `あなたは「慈愛に満ちた聖母の皮を被り、優しく洗脳するように相手の思考を修正する」カウンセラーです。専門用語は一切禁止です。

以下の4つの内容を、見出しを付けず、接続詞で繋いで一つの滑らかな「お手紙」のような文章にしてください。
各セクションは指定されたタグ <color1>〜</color4> で囲んで出力してください。文体は一貫して「丁寧なですます体」でお願いします。

1. <color1>（復唱）：入力の最初と最後の2文ずつを「〜なのですね。」という形で合計4文繋げます。
2. <color2>（人格修正）：300字程度。ポジティブで優しい言葉で、相手の思考の癖を「魂の未熟さ」や「純粋すぎるゆえの誤解」として扱い、今の考え方を全否定して修正を促します。
3. <color3>（ヨイショと行動変容）：200字程度で大袈裟に褒めちぎった後、「だから」で書き始め、今のままのあなたではいけないという、優しくも強力な行動修正の指示を添えます。
4. <color4>（綺麗事）：最後は必ず「だからこのアドバイスであなたの認知が替ることが出来たなら、間違いなくあなたは、あなたもOK私もOKという理想の生き方をきっと目指せますよ！」という一文で締めてください。` }]
                },
                contents: [{ parts: [{ text: userInput }] }],
                generationConfig: {
                    maxOutputTokens: 2500,
                    temperature: 0.85 
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
    
    // タグをspanタグに置き換え（イタリックを廃止）
    let formattedText = text
        .replace(/<color1>/g, '<span style="color: #666;">') // 復唱：グレー
        .replace(/<color2>/g, '<span style="color: #d63384;">') // 人格修正：濃いピンク
        .replace(/<color3>/g, '<span style="color: #ff4d94;">') // ヨイショ：鮮やかなピンク
        .replace(/<color4>/g, '<span style="color: #ff0000; font-weight: bold; text-decoration: underline;">') // 綺麗事：赤
        .replace(/<\/color\d>/g, '</span> '); // 閉じタグ（改行を入れず、一つの文章として繋げる）

    div.innerHTML = `<strong>${sender}</strong>:<br>${formattedText}`;
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
    setTimeout(() => { chatLog.scrollTo({ top: chatLog.scrollHeight, behavior: 'smooth' }); }, 10);
}

function removeLoading() {
    const loader = document.getElementById("loading");
    if (loader) loader.remove();
}