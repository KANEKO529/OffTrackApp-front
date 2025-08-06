//  ルートエンドポイントを設定する。
import applyCaseMiddleware from 'axios-case-converter';
import axios from 'axios';
// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // ✅ Vite専用の書き方

// import Cookies from 'js-cookie';
// const options = {
//   ignoreHeaders: true,
// };

// console.log("環境変数API_BASE_URL:", API_BASE_URL);

if (!API_BASE_URL) {
  console.error("環境変数 `VITE_API_BASE_URL` が定義されていません！.env を確認してください！");
}

const client = applyCaseMiddleware(
  axios.create({
    baseURL: API_BASE_URL, // Railsサーバーのエンドポイント
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    }
    // withCredentials: true, // クッキーを含める
  }),
//   options
);

// リクエストインターセプターを追加
// client.interceptors.request.use((config) => {
//   const accessToken = Cookies.get("_access_token");
//   const clientToken = Cookies.get("_client");
//   const uid = Cookies.get("_uid");

//   if (accessToken && clientToken && uid) {
//     config.headers['access-token'] = accessToken;
//     config.headers.client = clientToken;
//     config.headers.uid = uid;
//   }
  
//   config.withCredentials = true;  // 認証情報を含める

//   return config;
// }, (error) => {
//   return Promise.reject(error);
// });

export default client;
