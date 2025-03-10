import client from "./client";

export const fetchStores = async () => {
    try {
      const response = await client.get("/api/v1/stores");
      console.log("店舗データの取得に成功しました", response)
      // console.log("response of fetchStores:", response.status)

      return response.data;
    } catch (error) {
      console.error("店舗データの取得に失敗しました", error);


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

// 現在地の近くの店舗を取得する
export const fetchStoresNearby = async (latitude, longitude) => {

    const formattedLatitude = typeof latitude === "object" ? latitude.latitude : latitude;
    const formattedLongitude = typeof longitude === "object" ? longitude.longitude : longitude;

    // console.error("formattedLatitude:", formattedLatitude);
    // console.error("formattedLongitude:", formattedLongitude);

    try {
      const response = await client.get(`api/v1/stores/nearby?latitude=${formattedLatitude}&longitude=${formattedLongitude}`);
      return response.data.map((store) => ({
        store_name: store.storeName, // storeName → store_name に統一
        latitude: store.latitude,
        longitude: store.longitude,
      }));
    } catch (error) {
      console.error("店舗データの取得エラー:", error);
      return [];
    }
  };

// 新規店舗をデータベースに追加する
export const createNewStore = async (storeData) => {
    console.log(storeData);

    try {
      const response = await client.post("/api/v1/stores", { store: storeData });
      if(response.status === 201){
        console.log("正常に店舗DBに格納されました。:" + storeData.store_name );
      }
    } catch (error) {
      console.error("店舗の新規作成エラー:", error);
      alert("店舗の新規作成に失敗しました。")

    }
  };

  // 店舗データを削除する関数
export const deleteStore = async (id) => {
    // console.log("id:", id);
    try {
      await client.delete(`/api/v1/stores/${id}`);
    } catch (error) {
      console.error("Error deleting store", error);
      alert("店舗情報の削除に失敗しました。")
      throw error;
    }
  };
  
  // 店舗データ更新のためのAPIリクエスト
  export const updateStore = async (id, params) => {
    // console.log("params:", params);
    try {
      await client.put(`/api/v1/stores/${id}`, params);
    } catch (error) {
      console.error("Error deleting store", error);
      alert("店舗情報の更新に失敗しました。")
      throw error;
    }
  };
  