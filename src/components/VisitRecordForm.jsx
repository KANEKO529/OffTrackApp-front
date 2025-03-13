import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { createVisitRecordFromForm } from "../api/visitRecord";
import { TextField, Button, Container, Typography, Paper, Box, Autocomplete } from "@mui/material";
import { getLocation } from "../utils/getLocation";
import { fetchStoresNearby, createNewStore } from "../api/store"; // 近くの店舗検索と新規店舗登録API
import { LocationContext } from "../context/LocationContext"; // LocationContextをインポート
import { fetchUsers } from "../api/user";

const VisitRecordForm = () => {
  const location = useContext(LocationContext); // 現在地を取得

  const [formData, setFormData] = useState({
    date: "",
    storeName: "",
    latitude: "",
    longitude: "",
    memo: "",
    user_name: "",
  });



  const [nearbyStores, setNearbyStores] = useState([]); // 近くの店舗データ
  const [isCustomStore, setIsCustomStore] = useState(false); // 手入力モードかどうかの状態
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    const getUsersData = async () => {
      try {
        setLoading(true);
        const data = await fetchUsers();
        console.log("data of UserData:", data);
        setUsers(data);
      } catch (error) {
        console.log("ユーザデータの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    getUsersData();
  }, []);

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
// const handleStoreChange = (event, newValue) => {
//   console.log("newValue:", newValue);

//   if (!newValue) return;

//   setFormData((prev) => ({ ...prev, storeName: newValue })); // 先に `storeName` を更新

//   const storeData = nearbyStores.find((store) => store.store_name === newValue);

//   if (storeData) {
//     // 既存の店舗を選択した場合
//     setIsCustomStore(false);
//     setFormData((prev) => ({
//       ...prev,
//       storeName: storeData.store_name,
//       latitude: storeData.latitude,
//       longitude: storeData.longitude,
//     }));
//   } else {
//     // 新規入力の店舗
//     setIsCustomStore(true);
//     // setFormData({
//     //   ...formData,
//     //   storeName: newValue,
//     //   latitude: formData.latitude, // 既に取得済みの現在地を利用
//     //   longitude: formData.longitude,
//     // });
//     getLocation((latitude, longitude) => {
//       setFormData((prev) => ({
//         ...prev,
//         storeName: newValue,
//         latitude: latitude, // 位置情報を自動で取得
//         longitude: longitude,
//       }));
//     });
//   }
// };

// const handleStoreChange = (event, newValue) => {
//   console.log("newValue:", newValue);

//   if (!newValue) return;

//   if (typeof newValue === "string") {
//     // 手入力の場合、そのまま `storeName` にセット
//     setFormData((prev) => ({ ...prev, storeName: newValue }));
//     setIsCustomStore(true);
//   } else {
//     // 選択された場合、`value`（店舗名）を `storeName` にセット
//     setFormData((prev) => ({
//       ...prev,
//       storeName: newValue.value,
//       latitude: nearbyStores.find(store => store.store_name === newValue.value)?.latitude || "",
//       longitude: nearbyStores.find(store => store.store_name === newValue.value)?.longitude || "",
//     }));
//     setIsCustomStore(false);
//   }
// };

const handleStoreChange = (event, newValue) => {
  console.log("newValue:", newValue);

  if (!newValue) return;

  if (typeof newValue === "string") {
    // ✅ 手入力モード（新しい店舗を追加）
    setFormData((prev) => ({
      ...prev,
      storeName: newValue,
      latitude: location.lat || "", // 現在地をセット
      longitude: location.lng || "",
    }));
    setIsCustomStore(true);
  } else if (newValue && newValue.value) {
    // ✅ 既存の店舗を選択
    setFormData((prev) => ({
      ...prev,
      storeName: newValue.value,
      latitude: nearbyStores.find(store => store.store_name === newValue.value)?.latitude || "",
      longitude: nearbyStores.find(store => store.store_name === newValue.value)?.longitude || "",
    }));
    setIsCustomStore(false);
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
      console.log(formData);
      await createVisitRecordFromForm(formData);
      alert("訪問記録を保存しました！");
      setFormData((prev) => ({
        ...prev,
        storeName: "",
        latitude: "",
        longitude: "",
        memo: "",
      }));
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

{/* 記録者としてユーザを選べるようにしたい */}
        <Autocomplete
          options={users.map((user) => ({
            label: user.nickname, // UI に表示する値
            value: user.nickname, // `nickname` に保存する値
          }))}
          value={formData.user_name}
          onChange={(event, newValue) => {
            console.log("Selected User:", newValue); // デバッグ用
            setFormData((prev) => ({
              ...prev,
              user_name: newValue?.value || "", // 選択時に `nickname` を更新
            }));
          }}
          renderInput={(params) => (
            <TextField {...params} label="記録者を選択" required />
          )}
        />

        <Autocomplete
          freeSolo
          options={nearbyStores.map((store) => ({
            label: `${store.store_name} (${(store.distance ?? 0).toFixed(1)}km)`, // UIに表示
            value: store.store_name, // `storeName` に保存する値
          }))}
          value={formData.storeName}

          onChange={(event, newValue) => {
            console.log("選択または手入力:", newValue);
          
            if (!newValue) {
              // 🔹 未選択状態（削除された場合）
              setIsCustomStore(true);
              return;
            }
          
            if (typeof newValue === "string") {
              // 🔹 手入力の場合
              setIsCustomStore(true);
              setFormData((prev) => ({
                ...prev,
                storeName: newValue,
              }));
            } else if (newValue.value) {
              // 🔹 既存の店舗を選択した場合
              setIsCustomStore(false);
              setFormData((prev) => ({
                ...prev,
                storeName: newValue.value,
                latitude: nearbyStores.find(store => store.store_name === newValue.value)?.latitude || "",
                longitude: nearbyStores.find(store => store.store_name === newValue.value)?.longitude || "",
              }));
            }
          }}
          
          onInputChange={(event, newInputValue) => {
            console.log("手入力値:", newInputValue);
            if (newInputValue) {
              setIsCustomStore(true);
            }
            setFormData((prev) => ({
              ...prev,
              storeName: newInputValue,
            }));
          }}
          renderInput={(params) => (  // 🔹 修正: renderInput を明示的に定義
            <TextField {...params} label="店名を選択または入力" required />
          )}
          />

        {isCustomStore && (
          <>
            <TextField
              label="緯度"
              name="latitude"
              type="number"
              value={formData.latitude}
              onChange={(e) => setFormData((prev) => ({ ...prev, latitude: e.target.value }))}
              required
            />
            <TextField
              label="経度"
              name="longitude"
              type="number"
              value={formData.longitude}
              onChange={(e) => setFormData((prev) => ({ ...prev, longitude: e.target.value }))}
              required
            />
            <Button
              variant="outlined"
              disabled={!!formData.latitude && !!formData.longitude}  // すでに位置情報がある場合は無効化
              onClick={() => {
                setFormData((prev) => ({
                  ...prev,
                  latitude: location.lat || "",
                  longitude: location.lng || "",
                }));
              }}
            >
              位置情報を入力
            </Button>
          </>
        )}

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
