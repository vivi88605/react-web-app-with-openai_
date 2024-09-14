import openai from "@/services/openai";
//設定資料庫
import db from "@/services/db";

const collectionName = "image-ai"

//開API
export async function GET() {
    const docList = await db.collection(collectionName).orderBy("createdAt", "desc").get();
    const cardList = [];
    docList.forEach(doc => {
        const card = doc.data()
        cardList.push(card);
    })
    return Response.json(cardList);
}

export async function POST(req) {
    const body = await req.json();
    console.log("body:", body);
    // TODO: 透過dall-e-3模型讓AI產生圖片
    // 文件連結: https://platform.openai.com/docs/guides/images/usage
    const prompt = body.userInput; // 設定prompt

    //官方提供代碼
    const response = await openai.images.generate({
        model: "dall-e-3",
        prompt, // prompt=prompt,
        n: 1, //產生圖片的數量
        size: "1024x1024", //尺寸不能隨意變更
    });
    const imageURL = response.data[0].url; //注意官方文件沒有const要加上 //注意image_url為python用法

    const card = {
        imageURL,
        prompt, // prompt=prompt,
        createdAt: new Date().getTime()
    }
    //把card存到資料庫
    db.collection(collectionName).add(card)

    return Response.json(card); // 印出資料
}