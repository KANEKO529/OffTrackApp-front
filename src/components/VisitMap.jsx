import React, { useEffect, useState, useContext } from "react";
import { GoogleMap, Marker, InfoWindow, useLoadScript } from "@react-google-maps/api";
import { fetchPlotStoreData } from "../api/visitRecord";
import { LocationContext } from "../context/LocationContext";

import { useRef } from "react"; // ← 追加

import { mapStyle } from "../styles/mapStyle";

import { FiMapPin } from "react-icons/fi";

const NAVBAR_HEIGHT = 56; //　AppBar の高さ

const VisitMap = () => {
  const [plotStoreData, setPlotStoreData] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [mapHeight, setMapHeight] = useState(window.innerHeight - NAVBAR_HEIGHT);

  const [currentPosition, setCurrentPosition] = useState(null);

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
          <div
            className="p-2 rounded-md shadow-md w-[200px] max-h-[250px] overflow-y-auto bg-white text-black"
          >
            <p className="font-bold text-base">
              {selectedStore.storeName}
            </p>


            <p className="text-sm">
              最終訪問日: {selectedStore.lastVisitDateString} {selectedStore.lastVisitTime}
            </p>

            <p className="text-sm">
              訪問回数: {selectedStore.count}回
            </p>

            <p className="mt-2 font-bold text-base">
              訪問記録
            </p>

            {selectedStore.visit_records.length > 0 ? (
              <ul className="p-0 m-0 list-none">
                {selectedStore.visit_records.map((record, index) => (
                  <li
                    key={index}
                    className="border-b border-[#444] pb-2 mb-2"
                  >
                    <p className="font-bold text-[0.85rem]">
                      {record.date} / {record.time}
                    </p>
                    <p className="text-sm">
                      by{record.userName}
                    </p>
                    <p className="text-sm">
                      {record.memo}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm">
                訪問記録がありません
              </p>
            )}
          </div>


        </InfoWindow>

        )}
      </GoogleMap>

      <button
        onClick={() => {
          if (mapRef.current && currentPosition) {
            mapRef.current.panTo(currentPosition);
            mapRef.current.setZoom(12);
          }
        }}
        className="rounded-full absolute bottom-[20px] right-[10px] z-[1] bg-gray-800 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
      <FiMapPin className="w-8 h-8" />
      </button>
    </div>
  );
};

export default VisitMap;
