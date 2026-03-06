// ... (前後のコードは絶対に変えないでくださいとのことですので、callGeminiの中身だけ書き換えます)

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
ユーザーの入力した長文のうち、「最初の2文」と「最後の2文」だけを抽出してください。それらを全て「〜なのですね。」という語尾に変換して、合計4文だけ書き並べてください。それ以外の部分は一切復唱しないでください。

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

// ... (displayMessageなどの関数はそのまま保持してください)