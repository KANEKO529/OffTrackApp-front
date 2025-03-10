import React, { useEffect, useState, useContext } from "react";
import { GoogleMap, Marker, InfoWindow, useLoadScript } from "@react-google-maps/api";
import { fetchPlotStoreData

 } from "../api/visitRecord";
import logToServer from "../api/logToServer";
import { LocationContext } from "../context/LocationContext"; // LocationContextをインポート

const mapContainerStyle = {
  width: "100%",
  height: "600px",
};



// 中心点（東京に設定）
// const center = { lat: 35.6895, lng: 139.6917 };

const VisitMap = () => {
  const [plotStoreData, setPlotStoreData] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);

  // console.log(process.env.REACT_APP_GOOGLE_MAPS_API_KEY)
  // logToServer(process.env.REACT_APP_GOOGLE_MAPS_API_KEY);

  // Google Maps API の読み込み
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY, // ここに Google Maps APIキーを設定
  });

  const location = useContext(LocationContext);

  const [center, setCenter] = useState({ lat: 35.6895, lng: 139.6917 });

    // 🌍 **現在地を取得し、地図の中心を変更**
    useEffect(() => {
      if (location?.lat && location?.lng) {
        setCenter({ lat: location.lat, lng: location.lng });
      }
    }, [location]);

  // center = location;


  useEffect(() => {

    const getPlotStoresData = async () => {
    try {
        // setLoading(true); 
        const data = await fetchPlotStoreData();
        // console.log("data of fetchPlotStoreData:", data)


        // 緯度・経度を数値型に変換し、訪問記録の日付と時刻を分割
        const formattedData = data.map(store => {

        const lastVisitDateObj = new Date(store.lastDate);

        return {
          ...store,
          lastVisitDate: lastVisitDateObj,
          lastVisitDateString: lastVisitDateObj.toLocaleDateString("ja-JP"),
          lastVisitTime: lastVisitDateObj.toLocaleTimeString("ja-JP", { hour: '2-digit', minute: '2-digit' }),
          latitude: parseFloat(store.latitude), // 数値型に変換
          longitude: parseFloat(store.longitude), // 数値型に変換
          visit_records: store.visitRecords
            ? store.visitRecords.map(record => {
                const dateTime = new Date(record.date); // `date` を Date オブジェクトに変換
                return {
                  date: dateTime.toLocaleDateString("ja-JP"), // YYYY-MM-DD形式
                  time: dateTime.toLocaleTimeString("ja-JP", { hour: '2-digit', minute: '2-digit' }), 
                  memo: record.memo
                };
              })
            : [] // `visit_records` が undefined の場合は空配列をセット
        };
        });

        console.log("formattedData:", formattedData);

        setPlotStoreData(formattedData);
// setPlotStoreData(data);

    } catch (error) {
        console.log("プロットデータの取得に失敗しました");
    } finally {
        // setLoading(false);  
    }
    };

    getPlotStoresData();

  }, []);

  useEffect(() => {
    console.log("プロット店舗データ:", plotStoreData);
  }, [plotStoreData]); // plotStoreData が更新されるたびに実行


  const getMarkerIcon = (color, size = 40) => ({
    url: `/pin_logo/${color}-dot.png`, // public/images/ フォルダ内の画像を参照
    scaledSize: new window.google.maps.Size(size, size),
  });

  // ★ 訪問日からピンの色を決定する関数
  const getMarkerColor = (lastVisitDate) => {
    if (!lastVisitDate || isNaN(lastVisitDate.getTime())) {
      return "blue";
    }
    const today = new Date();
    const diffTime = today - lastVisitDate; // ミリ秒単位の差
    const diffDays = diffTime / (1000 * 60 * 60 * 24); // 日数に変換

    if (diffDays <= 7) {
      return "green";
    } else if (diffDays <= 14) {
      return "yellow";
    } else if (diffDays <= 28) {
      return "orange";
    } else {
      return "purple";
    }
  };

  if (loadError) return <p>地図の読み込みに失敗しました。</p>;
  if (!isLoaded) return <p>地図を読み込み中...</p>;

  return (
    <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={12}>

      {/* 現在位置のマーカー（赤色） */}
      {location.lat && (
        <Marker
          position={location}
          icon={getMarkerIcon("red", 50)} // 現在地は大きめ
          
        />
      )}

      {plotStoreData.map((record, index) => (
        <Marker
          key={index}
          position={{ lat: record.latitude, lng: record.longitude }}
          icon={getMarkerIcon(getMarkerColor(record.lastVisitDate), 40)}
          onClick={() => setSelectedStore(record)}
        />
      ))}

      {selectedStore && (
        <InfoWindow
          position={{ 
            lat: selectedStore.latitude,
            lng: selectedStore.longitude
          }}
          onCloseClick={() => setSelectedStore(null)}
        >
          <div>
            <h3>{selectedStore.storeName}</h3>
            <p>最終訪問日: {selectedStore.lastVisitDateString} {selectedStore.lastVisitTime}</p>
            <p>訪問回数: {selectedStore.count}</p>
            <h4>訪問記録</h4>
            {selectedStore.visit_records && selectedStore.visit_records.length > 0 ? (
              <ul>
                {selectedStore.visit_records.map((record, index) => (
                  <li key={index}>
                    <strong>{record.date} / {record.time}</strong>
                    <p>{record.memo}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>訪問記録がありません</p>
            )}
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default VisitMap;
