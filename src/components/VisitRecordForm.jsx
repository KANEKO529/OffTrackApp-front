import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { createVisitRecord } from "../api/visitRecord";
import { TextField, Button, Container, Typography, Paper, Box, Autocomplete } from "@mui/material";
import { getLocation } from "../utils/getLocation";
import { fetchStoresNearby, createNewStore } from "../api/store"; // 近くの店舗検索と新規店舗登録API
import { LocationContext } from "../context/LocationContext"; // LocationContextをインポート

const VisitRecordForm = () => {
  const location = useContext(LocationContext); // 現在地を取得

  const [formData, setFormData] = useState({
    date: "",
    storeName: "",
    latitude: "",
    longitude: "",
    memo: "",
  });

  const [nearbyStores, setNearbyStores] = useState([]); // 近くの店舗データ
  const [isCustomStore, setIsCustomStore] = useState(false); // 手入力モードかどうかの状態

  // ★ `useEffect` で `LocationContext` から現在地を取得
  useEffect(() => {
    const today = new Date().toISOString();
    setFormData((prev) => ({
      ...prev,
      date: today,
      latitude: location.lat || "", // 現在地が取得できていればセット
      longitude: location.lng || "",
    }));
    console.log("今日の日付：", today);
    console.log("現在地（Context経由）:", location.lat, location.lng);
  }, [location]); // ← `location` の変更を監視

  // ★ 近くの店舗を取得
  useEffect(() => {
    if (location.lat && location.lng) {
      fetchStoresNearby(location.lat, location.lng).then((stores) => {
        console.log("近くの店舗リスト:", stores);
        setNearbyStores(stores);
      });
    }
  }, [location]);


// 店舗の選択 or 手入力の処理
const handleStoreChange = (event, newValue) => {
  console.log("newValue:", newValue);
  if (!newValue) return;

  setFormData((prev) => ({ ...prev, storeName: newValue })); // 先に `storeName` を更新

  const storeData = nearbyStores.find((store) => store.store_name === newValue);

  if (storeData) {
    // 既存の店舗を選択した場合
    setIsCustomStore(false);
    setFormData((prev) => ({
      ...prev,
      storeName: storeData.store_name,
      latitude: storeData.latitude,
      longitude: storeData.longitude,
    }));
  } else {
    // 新規入力の店舗
    setIsCustomStore(true);
    // setFormData({
    //   ...formData,
    //   storeName: newValue,
    //   latitude: formData.latitude, // 既に取得済みの現在地を利用
    //   longitude: formData.longitude,
    // });
    getLocation((latitude, longitude) => {
      setFormData((prev) => ({
        ...prev,
        storeName: newValue,
        latitude: latitude, // 位置情報を自動で取得
        longitude: longitude,
      }));
    });
  }
};


  // 入力値の変更を処理
  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  // フォーム送信処理
  const handleSubmit = async (event) => {
    event.preventDefault();

    // 選択した `storeName` の店舗がDBにない場合、新規追加
    const storeExists = nearbyStores.some((store) => store.store_name === formData.storeName);

    if (!storeExists) {
      console.log("新規店舗をデータベースに追加:", formData.storeName);
      await createNewStore({
        store_name: formData.storeName,
        latitude: formData.latitude,
        longitude: formData.longitude,
      });
    }

    // 訪問記録を登録
    try {
      await createVisitRecord(formData);
      alert("訪問記録を保存しました！");
      setFormData({ date: "", storeName: "", latitude: "", longitude: "", memo: "" });
    } catch (error) {
      console.error("エラー:", error);
      alert("エラーが発生しました");
    }
  };

  return (
    <>
    <p>{location.lat},{location.lng}</p>
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: 3, marginTop: 5 }}>
        <Typography variant="h4" gutterBottom>
          訪問記録フォーム
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

          {/* 店名（選択 or 手入力） */}
          <Autocomplete
            freeSolo
            options={nearbyStores.map((store) => store.store_name)} // 既存の店舗をリスト表示
            value={formData.storeName}
            onChange={handleStoreChange}
            onInputChange={(event, newInputValue) => {
              setFormData((prev) => ({ ...prev, storeName: newInputValue }));
            }}
            renderInput={(params) => (
              <TextField {...params} label="店名を選択または入力" required />
            )}
          />

{/* 手入力モードの場合、入力欄を表示 */}
{isCustomStore && (
            <>
              <TextField
                label="緯度"
                name="latitude"
                type="number"
                value={formData.latitude}
                onChange={handleChange}
                required
              />
              <TextField
                label="経度"
                name="longitude"
                type="number"
                value={formData.longitude}
                onChange={handleChange}
                required
              />
            </>
          )}
{/* 
          <TextField
            label="緯度"
            name="latitude"
            type="number"
            value={formData.latitude}
            onChange={handleChange}
            required
          />
          <TextField
            label="経度"
            name="longitude"
            type="number"
            value={formData.longitude}
            onChange={handleChange}
            required
          /> */}

{/* ここで取得しなくても、レンダリング時に位置情報を取得しておきたい */}
          {/* <Button variant="outlined" onClick={() => getLocation(setFormData, formData)}>
            現在地を取得
          </Button> */}

          <TextField
            label="メモ"
            name="memo"
            multiline
            rows={3}
            value={formData.memo}
            onChange={handleChange}
          />
          <Button type="submit" variant="contained" color="primary">
            記録を保存
          </Button>
        </Box>

        <Box sx={{ marginTop: 2 }}>
          <Link to="/dashboard" style={{ textDecoration: "none" }}>
            <Button variant="outlined" color="secondary">
              ダッシュボードへ戻る
            </Button>
          </Link>
        </Box>
      </Paper>
    </Container>
    </>
    
  );
};

export default VisitRecordForm;
