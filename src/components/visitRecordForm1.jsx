import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { createVisitRecordFromForm } from "../api/visitRecord";
import { TextField, Button, Container, Typography, Paper, Box, Autocomplete, InputLabel, Select, MenuItem, FormControl } from "@mui/material";
import { LocationContext } from "../context/LocationContext";
import { fetchStoresNearby, createNewStore, fetchAllStores } from "../api/store";
import { fetchUsers } from "../api/user";
import { fillOutInSpreadSheets } from "../api/spreadsheets";
import { fetchStoresByQuery } from "../api/store";
import { useCallback } from "react";

const NAVBAR_HEIGHT = 50; // AppBarの高さ（MUIデフォルト）
const SPECIAL_USER = "はるひこ";

const VisitRecordForm1 = () => {
  const location = useContext(LocationContext);

  const [formData, setFormData] = useState({
    date: "",
    storeName: "",
    latitude: "",
    longitude: "",
    memo: "",
    user_name: "",
    price: "",
  });

  const [nearbyStores, setNearbyStores] = useState([]);
  const [isCustomStore, setIsCustomStore] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [storeOptions, setStoreOptions] = useState([]);  // 🔥 店舗の検索結果
  const [inputValue, setInputValue] = useState("");      // 🔥 検索の入力値

  const [isSearching, setIsSearching] = useState(false); // 🔥 検索中フラグ

    /** 近くの店舗を取得 */
    const getStoresNearby = async () => {
      try {
        if (location.lat && location.lng) {
          const data = await fetchStoresNearby(location.lat, location.lng);
          setNearbyStores(data);
          console.log("近くの店舗：", nearbyStores)
        }
      } catch (error) {
        console.log("近くの店舗の取得に失敗しました", error);
      }
    };

    const options = inputValue.length > 0
    ? storeOptions.map((store) => ({
        key: `${store.storeName}-${store.latitude}-${store.longitude}`,  // 一意のキーを設定
        label: store.storeName, 
        store_name: store.storeName,
        latitude: store.latitude,
        longitude: store.longitude,
      }))
    : nearbyStores.map((store) => ({
        key: `${store.storeName}-${store.latitude}-${store.longitude}`,  // 一意のキーを設定
        label: `${store.storeName} (${(store.distance ?? 0).toFixed(1)}km)`,
        store_name: store.storeName,
        latitude: store.latitude,
        longitude: store.longitude,
      }));
  


    useEffect(() => {
      if (inputValue.length > 0) {
        setIsSearching(true);
        setNearbyStores([]); // 🔥 検索時は nearbyStores をクリア
  
        const timeout = setTimeout(async () => {
          try {
            const stores = await fetchStoresByQuery(inputValue);
            setStoreOptions(stores);
          } catch (error) {
            console.error("店舗データの取得に失敗しました", error);
          } finally {
            setIsSearching(false);
          }
        }, 200);
  
        return () => clearTimeout(timeout);
      } else {
        setStoreOptions([]);
        getStoresNearby(); // 🔥 検索がクリアされたら nearbyStores を再取得
      }
    }, [inputValue, location]);

  useEffect(() => {
    const getUsersData = async () => {
      try {
        setLoading(true);
        const data = await fetchUsers();
        setUsers(data);
      } catch (error) {
        console.error("ユーザデータの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    getUsersData();
    // getAllStoresData();
  }, []);

  useEffect(() => {
    const today = new Date().toISOString();
    setFormData((prev) => ({
      ...prev,
      date: today,
      latitude: location.lat || "",
      longitude: location.lng || "",
    }));
  }, [location]);

  useEffect(() => {
    getStoresNearby();
  }, [location]);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isCustomStore) {
      await createNewStore({
        store_name: formData.storeName,
        latitude: formData.latitude,
        longitude: formData.longitude,
      });
    }

    try {
      await createVisitRecordFromForm(formData);
      // alert("訪問記録を保存しました");
      setFormData((prev) => ({
        ...prev,
        storeName: "",
        latitude: "",
        longitude: "",
        memo: "",
        price: "",
      }));

      if (formData.user_name == SPECIAL_USER) {
        try {
          await fillOutInSpreadSheets(formData);
          alert("訪問記録を仕入れ台帳に保存しました");
          setFormData((prev) => ({
            ...prev,
            storeName: "",
            latitude: "",
            longitude: "",
            memo: "",
            price: "",
          }));
        } catch (error) {
          console.error("エラー:", error);
          alert("スプレッドシートの記入にエラーが発生しました");
        }
      };

    } catch (error) {
      console.error("エラー:", error);
      alert("DBの格納にエラーが発生しました");
    }
  

  }


  return (
    
    <Container
        maxWidth="sm"
        sx={{
            minHeight: "100vh",
            padding: 1,
            marginTop: `${NAVBAR_HEIGHT}px`, // AppBar の高さ分だけ余白を作る
    }}>

      <Box
        sx={{
          // bgcolor: "#202123", // ChatGPT のダークモード背景色
          borderRadius: 1,    // 少し丸みをつける
          maxWidth: 600,      // 幅を制限
          mx: "auto",         // 中央揃え
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ fontWeight: "bold" }} // ChatGPT の明るいテキスト色
        >
          訪問記録フォーム
        </Typography>
      </Box>
      <Paper elevation={3} sx={{ padding: 3}}>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

        <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
            <InputLabel id="user-select-label">記録者を選択</InputLabel>
            <Select
                labelId="user-select-label"
                id="user-select"
                value={formData.user_name}
                onChange={(event) => {
                setFormData((prev) => ({
                    ...prev,
                    user_name: event.target.value,
                }));
                }}
            >
                <MenuItem value="">
                <em>None</em>
                </MenuItem>
                {users.map((user) => (
                <MenuItem key={user.nickname} value={user.nickname}>
                    {user.nickname}
                </MenuItem>
                ))}
            </Select>
        </FormControl>
          {/* 店名選択 or 新規登録 */}
          {!isCustomStore ? (
            <FormControl variant="standard" sx={{ m: 1, minWidth: 120, gap: 1} }>
              <Autocomplete
                freeSolo
                options={options}
                inputValue={inputValue}
                onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
                value={formData.storeName}
                onChange={(event, newValue) => {
                  if (typeof newValue === "string") {
                    setFormData({ ...formData, storeName: newValue, latitude: "", longitude: "" });
                  } else if (newValue) {
                    setFormData({
                      ...formData,
                      storeName: newValue.store_name,
                      latitude: newValue.latitude,
                      longitude: newValue.longitude,
                    });
                    setInputValue(newValue.store_name); // 🔥 選択した店舗名に固定
                  }
                }}
                ListboxProps={{
                  style: { maxHeight: 200, overflow: "auto" }, // 🔥 5件分くらいの高さでスクロールを発生
                }}
                disableCloseOnSelect // 🔥 スクロール中に閉じるのを防ぐ
                getOptionLabel={(option) => (typeof option === "string" ? option : option.label)} // ✅ 店舗名＋距離 or 直接入力対応
                renderInput={(params) => <TextField {...params} label="店名を選択または入力" variant="standard" />}
              />
              <Button 
                  variant="outlined"
                  sx={{ fontSize: "0.8rem", alignSelf: "flex-end" }} 
                  onClick={() => setIsCustomStore(true)}>
                  新しい店舗で登録
              </Button>
            </FormControl>
          ) : (
            <>
            <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                <TextField
                    id="standard-basic"
                    label="新しい店舗名"
                    name="storeName"
                    value={formData.storeName}
                    onChange={handleChange}
                    variant="standard"
                    required
                />
            </FormControl>
            <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                <TextField
                    id="standard-basic"
                    variant="standard"
                    label="緯度"
                    name="latitude"
                    type="number"
                    value={formData.latitude}
                    onChange={handleChange}
                    required
                />
            </FormControl>
            <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                <TextField
                    id="standard-basic"
                    variant="standard"
                    label="経度"
                    name="longitude"
                    type="number"
                    value={formData.longitude}
                    onChange={handleChange}
                    required
                />
            </FormControl>

            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
                <Button variant="outlined"
                    sx={{ fontSize: "0.8rem", alignSelf: "flex-end" }}
                    color="secondary" 
                    onClick={() => setIsCustomStore(false)}
                >
                    既存店舗の選択に変更
                </Button>
                <Button
                    variant="outlined"
                    sx={{ fontSize: "0.8rem", alignSelf: "flex-end" }}
                    onClick={() =>
                    setFormData((prev) => ({
                        ...prev,
                        latitude: location.lat || "",
                        longitude: location.lng || "",
                    }))
                    }
                >
                    現在地を自動入力
                </Button>
            </Box>
            </>
          )}

          {/* 仕入れ額の入力欄 */}
          <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
            <TextField
                id="standard-basic"
                variant="standard"
                label="仕入れ額"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
            />
        </FormControl>


          {/* メモ */}
          <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
            <TextField 
                id="standard-basic"
                variant="standard"
                label="メモ" 
                name="memo" 
                value={formData.memo} 
                onChange={handleChange} 
            />
        </FormControl>

          {/* 記録ボタン */}
          <Button type="submit" variant="contained" color="primary">
            記録を保存
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default VisitRecordForm1;
