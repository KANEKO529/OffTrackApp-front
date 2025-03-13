import client from "./client";

export const fetchUsers = async () => {
    try {
      const response = await client.get("/api/v1/users");
      console.log("ユーザデータの取得に成功しました", response)
      // console.log("response of fetchStores:", response.status)

      return response.data;
    } catch (error) {
      console.error("ユーザデータの取得に失敗しました", error);


      if (error.response) {
        console.error("🚨 エラーステータス:", error.response.status);
        console.error("🚨 エラーメッセージ:", error.response.data);
      } else if (error.request) {
        console.error("🚨 リクエストは送信されたがレスポンスがありません:", error.request);
      } else {
        console.error("🚨 エラーの詳細:", error.message);
      }

      throw error;
    }
};