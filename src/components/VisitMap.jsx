import React, { useEffect, useState, useContext } from "react";
import { GoogleMap, Marker, InfoWindow, useLoadScript } from "@react-google-maps/api";
import { fetchPlotStoreData } from "../api/visitRecord";
import { LocationContext } from "../context/LocationContext";
import { Paper, Typography, Box } from "@mui/material";

import { useRef } from "react"; // ← 追加

import Button from "@mui/material/Button"; // ← 追加

import { mapStyle } from "../styles/mapStyle";


const NAVBAR_HEIGHT = 50; //　AppBar の高さ

const VisitMap = () => {
  const [plotStoreData, setPlotStoreData] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [mapHeight, setMapHeight] = useState(window.innerHeight - NAVBAR_HEIGHT);

  const [currentPosition, setCurrentPosition] = useState(null);

  // const [markerRef, setMarkerRef] = useState(null);

  const [center, setCenter] = useState({ lat: 35.6895, lng: 139.6917 });

  const mapRef = useRef(null); // ← 追加


  // 画面サイズ変更時に `mapHeight` を更新
  useEffect(() => {
    const updateHeight = () => {
      const viewportHeight = window.visualViewport?.height || window.innerHeight;
      setMapHeight(viewportHeight - NAVBAR_HEIGHT);
    };

    window.addEventListener("resize", updateHeight);
    updateHeight(); // 初回実行
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  // 初回：現在地取得して中心に設定
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newPos = { lat: latitude, lng: longitude };
        setCurrentPosition(newPos);
        setCenter(newPos); // 初回だけ中心設定
      },
      (error) => {
        console.warn("初回位置取得に失敗", error);
      }
    );
  }, []);

  // 追跡：位置変化だけ反映（中心は変えない）
  useEffect(() => {
    if (!navigator.geolocation) return;

    // useEffect自体は初回と位置変化時に実行される
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentPosition({ lat: latitude, lng: longitude }); // 中心は変えない
      },
      (error) => {
        console.warn("位置追跡に失敗", error);
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

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
    // googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  
  
  });

  // console.log("Google Maps API Key:", process.env.REACT_APP_GOOGLE_MAPS_API_KEY);

  if (loadError) return <p>地図の読み込みに失敗しました。</p>;
  if (!isLoaded) return <p>地図を読み込み中...</p>;

  const mapOptions = {
    styles: mapStyle, // ← スタイルある場合はそのまま
    disableDefaultUI: false,   // ← 全部無効にしたくない場合はfalseのままでOK
    zoomControl: false,         // ズームボタン
    mapTypeControl: false,     // 切り替えボタン
    streetViewControl: false,  // ストリートビュー
    rotateControl: false, // 回転ボタン
    cameraControl: false,
    scaleControl: false,
    fullscreenControl: false,
  };

  return (
    <div style={{ width: "100%", height: `${mapHeight}px`, position: "absolute", top: `${NAVBAR_HEIGHT}px` }}>
      <GoogleMap 
        mapContainerStyle={{ width: "100%", height: "100%" }} 
        center={center} 
        zoom={12}
        options={mapOptions}
        onLoad={(map) => {
          mapRef.current = map; // ← 地図読み込み時にインスタンスを保存
        }}
      >
        {/* 現在位置のマーカー（赤色） */}

        {currentPosition && (
          <Marker position={currentPosition} icon={getMarkerIcon("red", 30)} />
        )} 

        {/* 店舗のマーカー */}
        {plotStoreData.map((record, index) => (
          <Marker
            key={index}
            position={{ lat: record.latitude, lng: record.longitude }}
            icon={getMarkerIcon(getMarkerColor(record.lastVisitDate), 30)}
            onClick={() => setSelectedStore(record)}
          />
        ))}

        {/* 店舗情報ウィンドウ */}
        {selectedStore && (

        <InfoWindow
          position={{ lat: selectedStore.latitude, lng: selectedStore.longitude }}
          onCloseClick={() => setSelectedStore(null)}

        >
          <Paper
            elevation={3}
            sx={{
              padding: 1,
              // bgcolor: "#2c2c2e", // ✅ 背景をダークモードカラーに
              // color: "#ececf1", // ✅ 文字色を明るく
              borderRadius: 2,
              width: 170, // ✅ 幅を調整
              maxHeight: 250,      // 縦の最大サイズ
              overflowY: "auto",   // 内容がはみ出たらスクロール
            }}
          >

            <Typography component="p" sx={{ fontWeight: "bold", fontSize: "1.0rem" }}>
              {selectedStore.storeName}
            </Typography>


            <Typography component="p" sx={{fontSize: "0.75rem" }}>
              最終訪問日: {selectedStore.lastVisitDateString} {selectedStore.lastVisitTime}
            </Typography>
            <Typography component="p" sx={{fontSize: "0.75rem" }}>訪問回数: {selectedStore.count}回</Typography>

            <Typography vcomponent="p"  sx={{ mt: 1, fontWeight: "bold", fontSize: "1.0rem"  }}>
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
                    <Typography component="p"  sx={{ fontWeight: "bold", fontSize: "0.85rem"  }}>
                      {record.date} / {record.time} 
                    </Typography>
                    <Typography component="p" sx={{fontSize: "0.75rem" }}>by{record.userName}</Typography>
                    <Typography component="p" sx={{fontSize: "0.75rem" }}>{record.memo}</Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography component="p" sx={{fontSize: "0.75em" }} >訪問記録がありません</Typography>
            )}
          </Paper>
        </InfoWindow>

        )}
      </GoogleMap>

      <Button
        variant="contained"
        onClick={() => {
          if (mapRef.current && currentPosition) {
            mapRef.current.panTo(currentPosition);
            mapRef.current.setZoom(12); // 👈 ここでズームを好きな倍率に調整（例：15）
          }
        }}
        sx={{
          position: "absolute",
          bottom: 20,
          right: 10,
          zIndex: 1
        }}
      >
        現在地
      </Button>
    </div>
  );
};

export default VisitMap;
