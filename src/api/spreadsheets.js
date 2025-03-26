import client from "./client";

export const fillOutInSpreadSheets = async (submitData) => {
    try {
      const response = await client.post("/api/v1/purchases/record-purchase-ledger", submitData);
      if(response.status === 201){
      console.log("スプレッドシートの記入に成功しました", response)
      }
      return response.data;
    } catch (error) {
      console.error("スプレッドシートの記入に失敗しました", error);
      alert("店舗の新規作成に失敗しました。")
    }
};