"use client";
//useEffect: 指定的代碼只有資料變動時才會觸發
import { useState, useEffect } from "react";
import axios from "axios";
import { faEarthAmericas } from "@fortawesome/free-solid-svg-icons";//fontAwesome圖示
import CurrentFileIndicator from "@/components/CurrentFileIndicator";
import PageHeader from "@/components/PageHeader";
import GeneratorButton from "@/components/GenerateButton";
import VocabGenResultCard from "@/components/VocabGenResultCard";
import VocabGenResultPlaceholder from "@/components/VocabGenResultPlaceholder";

export default function Home() {
  const [userInput, setUserInput] = useState("");//使用者輸入的內容
  const [language, setLanguage] = useState("English");//指定的語言
  // 所有的單字生成結果清單
  const [vocabList, setVocabList] = useState([]);
  // 是否在等待回應
  const [isWaiting, setIsWaiting] = useState(false);

  // useEffect(資料變動時要執行的函式,[要綁定的資料]) // 綁定的資料被變更時useEffect中的代碼才會被執行 // 綁定的資料為空值的話useEffect中的代碼只會在第一次開專案時執行
  useEffect(() => {
    console.log("useEffect被觸發")
    axios
      .get("/api/vocab-ai")
      .then(res => {
        //觸發重新渲染
        console.log("後端回應的資料", res.data)
        setVocabList(res.data)
      })
      .catch(err => {
        console.log("err:", err)
        alert("發生錯誤，請稍後再嘗試")
      })
  }, [])
  function submitHandler(e) {
    e.preventDefault();
    console.log("User Input: ", userInput);
    console.log("Language: ", language);
    const body = { userInput, language };//通常將傳入後端的資料命名為body
    console.log("body:", body);
    // 開始載入畫面
    setIsWaiting(true);
    // TODO: 將body POST到 /api/vocab-ai { userInput: "", language: "" }
    axios.post("/api/vocab-ai", body)
      .then(res => {
        console.log("後端回應的資料: ", res.data)
        //將最新生成的結果放在清單最前面並保留過去的生成結果
        setVocabList([res.data, ...vocabList]);
        // 結束載入畫面
        setIsWaiting(false)
      })
      .catch(err => {
        console.log(`錯誤訊息: ${err}`)
        // 結束載入畫面
        setIsWaiting(false)
        alert("發生錯誤，請稍後再嘗試")
      })
  }

  return (
    <>
      <CurrentFileIndicator filePath="/app/page.js" />
      <PageHeader title="AI Vocabulary Generator" icon={faEarthAmericas} />
      <section>
        <div className="container mx-auto">
          <form onSubmit={submitHandler}>{/* 表單 */}
            <div className="flex">
              <div className="w-3/5 px-2">
                <input // 輸入框
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  type="text"
                  className="border-2 focus:border-pink-500 w-full block p-3 rounded-lg"
                  placeholder="Enter a word or phrase"
                  required
                />
              </div>
              <div className="w-1/5 px-2">
                <select
                  className="border-2 w-full block p-3 rounded-lg"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  required
                >
                  <option value="English">English</option>
                  <option value="Japanese">Japanese</option>
                  <option value="Korean">Korean</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Italian">Italian</option>
                </select>
              </div>
              <div className="w-1/5 px-2">
                <GeneratorButton />{/* 可至GenerateButton.js查看其中內容 */}
              </div>
            </div>
          </form>
        </div>
      </section>
      <section>
        <div className="container mx-auto">
          {/* 等待後端回應時要顯示的載入畫面 */}
          {isWaiting ? <VocabGenResultPlaceholder /> : null}
          {/* TODO: 顯示AI輸出結果 */}
          {vocabList.map(result => (
            <VocabGenResultCard result={result} key={result.createdAt} />
          ))}
          {/* TODO: 一張單字生成卡的範例，串接正式API後移除 */}
          <VocabGenResultCard //可至VocabGenResultCard.js中查看內容
            // 用寫死的資料先做出預設的格式
            result={{
              title: "水果",//使用者輸入的內容
              payload: {
                wordList: ["Apple", "Banana", "Cherry", "Date", "Elderberry"],//指定語言的單字陣列
                zhWordList: ["蘋果", "香蕉", "櫻桃", "棗子", "接骨木"],//每個單字的中文
              },
              language: "English",
              createdAt: new Date().getTime(),
            }}
          />
        </div>
      </section>
    </>
  );
}
