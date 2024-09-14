import openai from "@/services/openai"; //此專案開了三個api都要使用openai，所以在一個檔案中統一設定
import db from "@/services/db";//引用db
import axios from "axios";

//有用await時就要用async
export async function GET() {
    // 取得集合內的所有文件 // db.collection(填入資料庫名稱)
    // 按照創建的時間順序排序(新->舊) //.orderBy("越舊的排在越前面","反轉") //desc代表反轉
    const docList = await db.collection("vocab-ai").orderBy("createdAt", "desc").get();
    // 準備要回應給前端的資料
    const vocabList = []
    // firebase儲存的資料為firebase自訂的格式，跟本來存取的格式不同 // 可先用THUNDER CLIENT測試
    docList.forEach(doc => {
        // doc.data()當初存入的物件
        const result = doc.data()
        // 將result存入vocabList
        vocabList.push(result)
    })
    // 將vocabList回應給前端
    return Response.json(vocabList)
}

export async function POST(req) {
    const body = await req.json();
    const { userInput, language } = body;
    // TODO: 透過gpt-4o-mini模型讓AI回傳相關單字
    // 文件連結：https://platform.openai.com/docs/guides/text-generation/chat-completions-api?lang=node.js
    // JSON Mode: https://platform.openai.com/docs/guides/text-generation/json-mode?lang=node.js
    // 在prompt中提供json格式的範例
    const systemPrompt = `請作為一個單字聯想AI根據所提供的單字聯想5個相關單字並提供對應的繁體中文意思，例如:
    單字:水果
    語言:英文
    回應JSON範例:
    {
        wordList:[Apple, Banana, ...]
        zhWordList:[蘋果, 香蕉, ...]
    }
    `;
    const propmpt = `
        單字:${userInput}
        語言:${language}
    `;

    const openAIReqBody = {
        messages: [
            { "role": "system", "content": systemPrompt },
            { "role": "user", "content": propmpt }
        ],
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },//openAI官方文件提供語法開啟JSON mode

    };
    const completion = await openai.chat.completions.create(openAIReqBody);
    // JSON.parse("{}")=>{}: 將長得像物件的字串轉換成真正的物件
    const payload = JSON.parse(completion.choices[0].message.content);
    /*
    openAI每次回應的格式不會統一
    需要參照預設格式
    payload: {
        wordList: ["Apple", "Banana", "Cherry", "Date", "Elderberry"],//指定語言的單字陣列
        zhWordList: ["蘋果", "香蕉", "櫻桃", "棗子", "接骨木"],//每個單字的中文
    }
    使用openAI的JSON MODE
    */
    //定義result方便後續儲存資料
    const result = {
        title: userInput,
        payload,//payload:payload,
        language,
        createdAt: new Date().getTime()
    }
    const firestoreRes = await db.collection("vocab-ai").add(result)

    return Response.json(result)
    // return Response.json({ message: "Success" });
}