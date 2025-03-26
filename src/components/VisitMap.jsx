import React, { useEffect, useState, useContext } from "react";
import { GoogleMap, Marker, InfoWindow, useLoadScript } from "@react-google-maps/api";
import { fetchPlotStoreData } from "../api/visitRecord";
import { LocationContext } from "../context/LocationContext";
import { Paper, Typography, Box } from "@mui/material";


const NAVBAR_HEIGHT = 50; // ✅ AppBar の高さ

const VisitMap = () => {
  const [plotStoreData, setPlotStoreData] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [mapHeight, setMapHeight] = useState(window.innerHeight - NAVBAR_HEIGHT);

  // ✅ 画面サイズ変更時に `mapHeight` を更新
  useEffect(() => {
    const updateHeight = () => {
      const viewportHeight = window.visualViewport?.height || window.innerHeight;
      setMapHeight(viewportHeight - NAVBAR_HEIGHT);
    };

    window.addEventListener("resize", updateHeight);
    updateHeight(); // 初回実行
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  const location = useContext(LocationContext);
  const [center, setCenter] = useState({ lat: 35.6895, lng: 139.6917 });

  useEffect(() => {
    if (location?.lat && location?.lng) {
      setCenter({ lat: location.lat, lng: location.lng });
    }
  }, [location]);

  useEffect(() => {
    const getPlotStoresData = async () => {
      try {
        const data = await fetchPlotStoreData();
        const formattedData = data.map(store => {
          const lastVisitDateObj = new Date(store.lastDate);
          return {
            ...store,
            lastVisitDate: lastVisitDateObj,
            lastVisitDateString: lastVisitDateObj.toLocaleDateString("ja-JP"),
            lastVisitTime: lastVisitDateObj.toLocaleTimeString("ja-JP", { hour: '2-digit', minute: '2-digit' }),
            latitude: parseFloat(store.latitude),
            longitude: parseFloat(store.longitude),
            visit_records: store.visitRecords
              ? store.visitRecords.map(record => ({
                  date: new Date(record.date).toLocaleDateString("ja-JP"),
                  time: new Date(record.date).toLocaleTimeString("ja-JP", { hour: '2-digit', minute: '2-digit' }),
                  memo: record.memo,
                  userName: record.userName
                }))
              : []
          };
        });

        setPlotStoreData(formattedData);
      } catch (error) {
        console.log("プロットデータの取得に失敗しました");
      }
    };

    getPlotStoresData();
  }, []);

  const getMarkerIcon = (color, size = 40) => ({
    url: `/pin_logo/${color}-dot.png`,
    scaledSize: new window.google.maps.Size(size, size),
  });

  const getMarkerColor = (lastVisitDate) => {
    if (!lastVisitDate || isNaN(lastVisitDate.getTime())) return "blue";
    const today = new Date();
    const diffDays = (today - lastVisitDate) / (1000 * 60 * 60 * 24);

    if (diffDays <= 7) return "green";
    if (diffDays <= 14) return "yellow";
    if (diffDays <= 28) return "blue";
    return "purple";
  };

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  if (loadError) return <p>地図の読み込みに失敗しました。</p>;
  if (!isLoaded) return <p>地図を読み込み中...</p>;

  return (
    <div style={{ width: "100%", height: `${mapHeight}px`, position: "absolute", top: `${NAVBAR_HEIGHT}px` }}>
      <GoogleMap 
        mapContainerStyle={{ width: "100%", height: "100%" }} 
        center={center} 
        zoom={12}
      >
        {/* 現在位置のマーカー（赤色） */}
        {/* {location.lat && (
          <Marker position={location} icon={getMarkerIcon("red", 50)} />
        )} */}

        {/* 店舗のマーカー */}
        {plotStoreData.map((record, index) => (
          <Marker
            key={index}
            position={{ lat: record.latitude, lng: record.longitude }}
            icon={getMarkerIcon(getMarkerColor(record.lastVisitDate), 40)}
            onClick={() => setSelectedStore(record)}
          />
        ))}

        {/* 店舗情報ウィンドウ */}
        {selectedStore && (

        <InfoWindow
          position={{ lat: selectedStore.latitude, lng: selectedStore.longitude }}
          onCloseClick={() => setSelectedStore(null)}
          sx={{
            // padding: 1,
            // bgcolor: "#2c2c2e", // ✅ 背景をダークモードカラーに
            // color: "#ececf1", // ✅ 文字色を明るく
            borderRadius: 2,
            maxWidth: 500, // ✅ 幅を調整
          }}

        >
          <Paper
            elevation={3}
            sx={{
              padding: 1,
              // bgcolor: "#2c2c2e", // ✅ 背景をダークモードカラーに
              // color: "#ececf1", // ✅ 文字色を明るく
              borderRadius: 2,
              maxWidth: 500, // ✅ 幅を調整
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              {selectedStore.storeName}
            </Typography>
            <Typography variant="body2">
              最終訪問日: {selectedStore.lastVisitDateString} {selectedStore.lastVisitTime}
            </Typography>
            <Typography variant="body2">訪問回数: {selectedStore.count}回</Typography>

            <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: "bold" }}>
              訪問記録
            </Typography>

            {selectedStore.visit_records.length > 0 ? (
              <Box component="ul" sx={{ padding: 0, margin: 0, listStyle: "none" }}>
                {selectedStore.visit_records.map((record, index) => (
                  <Box
                    component="li"
                    key={index}
                    sx={{
                      borderBottom: "1px solid #444",
                      paddingBottom: 1,
                      marginBottom: 1,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                      {record.date} / {record.time} 
                    </Typography>
                    <Typography variant="body2">by{record.userName}</Typography>
                    <Typography variant="body2">{record.memo}</Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2">訪問記録がありません</Typography>
            )}
          </Paper>
        </InfoWindow>

        )}
      </GoogleMap>
    </div>
  );
};

export default VisitMap;
