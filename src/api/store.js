import client from "./client";
import { toast } from "react-toastify"; 

export let createNewStoreSuccessFlag=false;

export const fetchAllStores = async () => {
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

export const fetchStoresByQuery = async (query) => {
  // console.log("query:", query);
  try {
    const response = await client.get(`/api/v1/stores/search?query=${query}`);

    // const data = await response.json(); // 🔥 `response.data` ではなく `.json()`
    // console.log("クエリによる店舗データの取得に成功しました:", response);
    return response.data;
  } catch (error) {
    console.error("クエリによる店舗データの取得に失敗しました:", error);
    return []; // 🔥 エラー時は `undefined` ではなく `[]` を返す
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
        storeName: store.storeName, // storeName → store_name に統一
        latitude: store.latitude,
        longitude: store.longitude,
        distance: store.distance
      }));
    } catch (error) {
      console.error("店舗データの取得エラー:", error);
      return [];
    }
  };

// 新規店舗をデータベースに追加する
export const createNewStore = async (storeData) => {

  const response = await client.post("/api/v1/stores", { store: storeData });

  if (![200, 201].includes(response.status)) {
    throw new Error(`Unexpected status: ${response.status}`);
  }
    
  console.log("success create new store!")
  createNewStoreSuccessFlag = true; // 成功フラグを立てる

  return response.data.id;
};

  // 店舗データを削除する関数
export const deleteStore = async (id) => {

    const response = await client.delete(`/api/v1/stores/${id}`);

    if (![200, 201].includes(response.status)) {
      throw new Error(`Unexpected status: ${response.status}`);
    }

    console.log("success delete store!")
  };
  
  // 店舗データ更新のためのAPIリクエスト
  // export const updateStore = async (id, params) => {
  //   // console.log("params:", params);
  //   try {
  //     const responce = await client.put(`/api/v1/stores/${id}`, params);
  //     if(responce.status === 200){
  //       // console.log("正常に店舗DBに格納されました。:" + storeData.store_name );
  //       toast.success("店舗データを更新しました");
  //     }
  //   } catch (error) {
  //     console.error("Error deleting store", error);
  //     toast.error("店舗情報の更新に失敗しました。")
  //     throw error;
  //   }
  // };
export const updateStore = async (id, params) => {
  const response = await client.put(`/api/v1/stores/${id}`, params);
  if (response.status !== 200) {
    throw new Error("Update failed");
  }
};