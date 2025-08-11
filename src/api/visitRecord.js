import client from "./client";

export let createVisitRecordSuccessFlag=false;


export const fetchVisitRecords = async () => {
    try {
      const response = await client.get("/api/v1/visit-records");
      console.log("response of fetchVisitRecords():", response)
      return response.data;
    } catch (error) {
      console.error("Error fetching fetchVisitRecords", error);
      throw error;
    }
};

export const fetchVisitRecordsWithStore = async () => {
  try {
    const response = await client.get("/api/v1/visit-records/with-store");
    console.log("response of VisitRecordsData:", response)
    return response.data;
  } catch (error) {
    console.error("Error fetching VisitRecordsData", error);
    throw error;
  }
};

// 訪問記録データ作成 フォームから
export const createVisitRecordFromForm = async (submitData) => {

  const response = await client.post("/api/v1/visit-records/create-from-form", submitData);

  // OK: 200 or 201
  if (![200, 201].includes(response.status)) {
    throw new Error(`Unexpected status: ${response.status}`);
  }

  createVisitRecordSuccessFlag=true;
  console.log("success create visitReccord!")

  return response.data.id;

};


export const fetchPlotStoreData = async () => {
  try {
    const response = await client.get("/api/v1/visit-records/plot-stores");
    // console.log("plot_data:", response.data);
    console.log("プロットデータの取得に成功しました", response);

    return response.data;
  } catch (error) {
    console.error("プロットデータの取得に失敗しました。", error);
    throw error;
  }
};

  // 店舗データを削除する関数
  export const deleteVisitRecords = async (id) => {
    // console.log("id:", id);
    const response = await client.delete(`/api/v1/visit-records/${id}`);

    if (![200, 201].includes(response.status)) {
      throw new Error(`Unexpected status: ${response.status}`);
    }
    console.log("success delete visitReccord!")

  };
  
  // 訪問記録データ更新のためのAPIリクエスト
  export const updateVisitRecords = async (id, params) => {
    // console.log("params:", params);
    try {
      await client.put(`/api/v1/visit-records/${id}`, params);
    } catch (error){
      console.error("訪問記録データの更新に失敗しました", error);
      throw error;
    }
  };
