// import React, { useEffect, useState, useContext } from "react";
// import { GoogleMap, Marker, InfoWindow, useLoadScript } from "@react-google-maps/api";
// import { fetchPlotStoreData } from "../api/visitRecord";
// import { LocationContext } from "../context/LocationContext";

// import { useRef } from "react"; // ← 追加

// import { mapStyle } from "../styles/mapStyle";

// import { FiMapPin } from "react-icons/fi";

// const NAVBAR_HEIGHT = 56; //　AppBar の高さ

// const VisitMap = () => {
//   const [plotStoreData, setPlotStoreData] = useState([]);
//   const [selectedStore, setSelectedStore] = useState(null);
//   const [mapHeight, setMapHeight] = useState(window.innerHeight - NAVBAR_HEIGHT);

//   const [currentPosition, setCurrentPosition] = useState(null);

//   const [center, setCenter] = useState({ lat: 35.6895, lng: 139.6917 });

//   const mapRef = useRef(null); // ← 追加


//   // 画面サイズ変更時に `mapHeight` を更新
//   useEffect(() => {
//     const updateHeight = () => {
//       const viewportHeight = window.visualViewport?.height || window.innerHeight;
//       setMapHeight(viewportHeight - NAVBAR_HEIGHT);
//     };

//     window.addEventListener("resize", updateHeight);
//     updateHeight(); // 初回実行
//     return () => window.removeEventListener("resize", updateHeight);
//   }, []);

//   // 初回：現在地取得して中心に設定
//   useEffect(() => {
//     if (!navigator.geolocation) return;

//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         const { latitude, longitude } = position.coords;
//         const newPos = { lat: latitude, lng: longitude };
//         setCurrentPosition(newPos);
//         setCenter(newPos); // 初回だけ中心設定
//       },
//       (error) => {
//         console.warn("初回位置取得に失敗", error);
//       }
//     );
//   }, []);

//   // 追跡：位置変化だけ反映（中心は変えない）
//   useEffect(() => {
//     if (!navigator.geolocation) return;

//     // useEffect自体は初回と位置変化時に実行される
//     const watchId = navigator.geolocation.watchPosition(
//       (position) => {
//         const { latitude, longitude } = position.coords;
//         setCurrentPosition({ lat: latitude, lng: longitude }); // 中心は変えない
//       },
//       (error) => {
//         console.warn("位置追跡に失敗", error);
//       }
//     );

//     return () => navigator.geolocation.clearWatch(watchId);
//   }, []);

//   useEffect(() => {
//     const getPlotStoresData = async () => {
//       try {
//         const data = await fetchPlotStoreData();
//         const formattedData = data.map(store => {
//           const lastVisitDateObj = new Date(store.lastDate);
//           return {
//             ...store,
//             lastVisitDate: lastVisitDateObj,
//             lastVisitDateString: lastVisitDateObj.toLocaleDateString("ja-JP"),
//             lastVisitTime: lastVisitDateObj.toLocaleTimeString("ja-JP", { hour: '2-digit', minute: '2-digit' }),
//             latitude: parseFloat(store.latitude),
//             longitude: parseFloat(store.longitude),
//             visit_records: store.visitRecords
//               ? store.visitRecords.map(record => ({
//                   date: new Date(record.date).toLocaleDateString("ja-JP"),
//                   time: new Date(record.date).toLocaleTimeString("ja-JP", { hour: '2-digit', minute: '2-digit' }),
//                   memo: record.memo,
//                   userName: record.userName
//                 }))
//               : []
//           };
//         });

//         setPlotStoreData(formattedData);
//       } catch (error) {
//         console.log("プロットデータの取得に失敗しました");
//       }
//     };

//     getPlotStoresData();
//   }, []);

//   const getMarkerIcon = (color, size = 40) => ({
//     url: `/pin_logo/${color}-dot.png`,
//     scaledSize: new window.google.maps.Size(size, size),
//   });

//   const getMarkerColor = (lastVisitDate) => {
//     if (!lastVisitDate || isNaN(lastVisitDate.getTime())) return "blue";
//     const today = new Date();
//     const diffDays = (today - lastVisitDate) / (1000 * 60 * 60 * 24);

//     if (diffDays <= 7) return "green";
//     if (diffDays <= 14) return "yellow";
//     if (diffDays <= 28) return "blue";
//     return "purple";
//   };

//   const { isLoaded, loadError } = useLoadScript({
//     // googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
//     googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  
  
//   });

//   // console.log("Google Maps API Key:", process.env.REACT_APP_GOOGLE_MAPS_API_KEY);

//   if (loadError) return <p>地図の読み込みに失敗しました。</p>;
//   if (!isLoaded) return <p>地図を読み込み中...</p>;

//   const mapOptions = {
//     styles: mapStyle, // ← スタイルある場合はそのまま
//     disableDefaultUI: false,   // ← 全部無効にしたくない場合はfalseのままでOK
//     zoomControl: false,         // ズームボタン
//     mapTypeControl: false,     // 切り替えボタン
//     streetViewControl: false,  // ストリートビュー
//     rotateControl: false, // 回転ボタン
//     cameraControl: false,
//     scaleControl: false,
//     fullscreenControl: false,
//   };

//   return (
//     <div style={{ width: "100%", height: `${mapHeight}px`, position: "absolute", top: `${NAVBAR_HEIGHT}px` }}>
//       <GoogleMap 
//         mapContainerStyle={{ width: "100%", height: "100%" }} 
//         center={center} 
//         zoom={12}
//         options={mapOptions}
//         onLoad={(map) => {
//           mapRef.current = map; // ← 地図読み込み時にインスタンスを保存
//         }}
//       >
//         {/* 現在位置のマーカー（赤色） */}

//         {currentPosition && (
//           <Marker position={currentPosition} icon={getMarkerIcon("red", 30)} />
//         )} 

//         {/* 店舗のマーカー */}
//         {plotStoreData.map((record, index) => (
//           <Marker
//             key={index}
//             position={{ lat: record.latitude, lng: record.longitude }}
//             icon={getMarkerIcon(getMarkerColor(record.lastVisitDate), 30)}
//             onClick={() => setSelectedStore(record)}
//           />
//         ))}

//         {/* 店舗情報ウィンドウ */}
//         {selectedStore && (

//         <InfoWindow
//           position={{ lat: selectedStore.latitude, lng: selectedStore.longitude }}
//           onCloseClick={() => setSelectedStore(null)}

//         >
//           <div
//             className="p-2 rounded-md shadow-md w-[200px] max-h-[250px] overflow-y-auto bg-white text-black"
//           >
//             <p className="font-bold text-base">
//               {selectedStore.storeName}
//             </p>


//             <p className="text-sm">
//               最終訪問日: {selectedStore.lastVisitDateString} {selectedStore.lastVisitTime}
//             </p>

//             <p className="text-sm">
//               訪問回数: {selectedStore.count}回
//             </p>

//             <p className="mt-2 font-bold text-base">
//               訪問記録
//             </p>

//             {selectedStore.visit_records.length > 0 ? (
//               <ul className="p-0 m-0 list-none">
//                 {selectedStore.visit_records.map((record, index) => (
//                   <li
//                     key={index}
//                     className="border-b border-[#444] pb-2 mb-2"
//                   >
//                     <p className="font-bold text-[0.85rem]">
//                       {record.date} / {record.time}
//                     </p>
//                     <p className="text-sm">
//                       by{record.userName}
//                     </p>
//                     <p className="text-sm">
//                       {record.memo}
//                     </p>
//                   </li>
//                 ))}
//               </ul>
//             ) : (
//               <p className="text-sm">
//                 訪問記録がありません
//               </p>
//             )}
//           </div>


//         </InfoWindow>

//         )}
//       </GoogleMap>

//       <button
//         onClick={() => {
//           if (mapRef.current && currentPosition) {
//             mapRef.current.panTo(currentPosition);
//             mapRef.current.setZoom(12);
//           }
//         }}
//         className="rounded-full absolute bottom-[20px] right-[10px] z-[1] bg-gray-800 text-white px-4 py-2 rounded hover:bg-blue-700"
//       >
//       <FiMapPin className="w-8 h-8" />
//       </button>
//     </div>
//   );
// };

// export default VisitMap;
// import React, { useEffect, useState, useContext } from "react";
// import { GoogleMap, Marker, InfoWindow, useLoadScript } from "@react-google-maps/api";
// import { fetchPlotStoreData } from "../api/visitRecord";
// import { LocationContext } from "../context/LocationContext";

// import { useRef } from "react";

// import { mapStyle } from "../styles/mapStyle";

// import { FiMapPin, FiClock, FiUser, FiTarget, FiCalendar } from "react-icons/fi";

// const NAVBAR_HEIGHT = 56;

// const VisitMap = () => {
//   const [plotStoreData, setPlotStoreData] = useState([]);
//   const [selectedStore, setSelectedStore] = useState(null);
//   const [mapHeight, setMapHeight] = useState(window.innerHeight - NAVBAR_HEIGHT);
//   const [currentPosition, setCurrentPosition] = useState(null);
//   const [center, setCenter] = useState({ lat: 35.6895, lng: 139.6917 });
//   const [isLocationLoading, setIsLocationLoading] = useState(true);

//   const mapRef = useRef(null);

//   // 画面サイズ変更時に `mapHeight` を更新
//   useEffect(() => {
//     const updateHeight = () => {
//       const viewportHeight = window.visualViewport?.height || window.innerHeight;
//       setMapHeight(viewportHeight - NAVBAR_HEIGHT);
//     };

//     window.addEventListener("resize", updateHeight);
//     updateHeight();
//     return () => window.removeEventListener("resize", updateHeight);
//   }, []);

//   // 初回：現在地取得して中心に設定
//   useEffect(() => {
//     if (!navigator.geolocation) {
//       setIsLocationLoading(false);
//       return;
//     }

//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         const { latitude, longitude } = position.coords;
//         const newPos = { lat: latitude, lng: longitude };
//         setCurrentPosition(newPos);
//         setCenter(newPos);
//         setIsLocationLoading(false);
//       },
//       (error) => {
//         console.warn("初回位置取得に失敗", error);
//         setIsLocationLoading(false);
//       }
//     );
//   }, []);

//   // 追跡：位置変化だけ反映（中心は変えない）
//   useEffect(() => {
//     if (!navigator.geolocation) return;

//     const watchId = navigator.geolocation.watchPosition(
//       (position) => {
//         const { latitude, longitude } = position.coords;
//         setCurrentPosition({ lat: latitude, lng: longitude });
//       },
//       (error) => {
//         console.warn("位置追跡に失敗", error);
//       }
//     );

//     return () => navigator.geolocation.clearWatch(watchId);
//   }, []);

//   useEffect(() => {
//     const getPlotStoresData = async () => {
//       try {
//         const data = await fetchPlotStoreData();
//         const formattedData = data.map(store => {
//           const lastVisitDateObj = new Date(store.lastDate);
//           return {
//             ...store,
//             lastVisitDate: lastVisitDateObj,
//             lastVisitDateString: lastVisitDateObj.toLocaleDateString("ja-JP"),
//             lastVisitTime: lastVisitDateObj.toLocaleTimeString("ja-JP", { hour: '2-digit', minute: '2-digit' }),
//             latitude: parseFloat(store.latitude),
//             longitude: parseFloat(store.longitude),
//             visit_records: store.visitRecords
//               ? store.visitRecords.map(record => ({
//                   date: new Date(record.date).toLocaleDateString("ja-JP"),
//                   time: new Date(record.date).toLocaleTimeString("ja-JP", { hour: '2-digit', minute: '2-digit' }),
//                   memo: record.memo,
//                   userName: record.userName
//                 }))
//               : []
//           };
//         });

//         setPlotStoreData(formattedData);
//       } catch (error) {
//         console.log("プロットデータの取得に失敗しました");
//       }
//     };

//     getPlotStoresData();
//   }, []);

//   const getMarkerIcon = (color, size = 40) => ({
//     url: `/pin_logo/${color}-dot.png`,
//     scaledSize: new window.google.maps.Size(size, size),
//   });

//   const getMarkerColor = (lastVisitDate) => {
//     if (!lastVisitDate || isNaN(lastVisitDate.getTime())) return "blue";
//     const today = new Date();
//     const diffDays = (today - lastVisitDate) / (1000 * 60 * 60 * 24);

//     if (diffDays <= 7) return "green";
//     if (diffDays <= 14) return "yellow";
//     if (diffDays <= 28) return "blue";
//     return "purple";
//   };

//   const getStatusBadge = (lastVisitDate) => {
//     if (!lastVisitDate || isNaN(lastVisitDate.getTime())) {
//       return { text: "未訪問", color: "bg-gray-500" };
//     }
    
//     const today = new Date();
//     const diffDays = (today - lastVisitDate) / (1000 * 60 * 60 * 24);

//     if (diffDays <= 7) return { text: "最近", color: "bg-emerald-500" };
//     if (diffDays <= 14) return { text: "1週間前", color: "bg-amber-500" };
//     if (diffDays <= 28) return { text: "2週間前", color: "bg-blue-500" };
//     return { text: "1ヶ月以上前", color: "bg-purple-500" };
//   };

//   const { isLoaded, loadError } = useLoadScript({
//     googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
//   });

//   if (loadError) return (
//     <div className="flex items-center justify-center h-screen bg-gray-50">
//       <div className="text-center p-6">
//         <div className="text-red-500 text-6xl mb-4">⚠️</div>
//         <p className="text-gray-700 text-lg">地図の読み込みに失敗しました</p>
//       </div>
//     </div>
//   );
  
//   if (!isLoaded) return (
//     <div className="flex items-center justify-center h-screen bg-gray-50">
//       <div className="text-center p-6">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//         <p className="text-gray-700 text-lg">地図を読み込み中...</p>
//       </div>
//     </div>
//   );

//   const mapOptions = {
//     styles: mapStyle,
//     disableDefaultUI: false,
//     zoomControl: false,
//     mapTypeControl: false,
//     streetViewControl: false,
//     rotateControl: false,
//     cameraControl: false,
//     scaleControl: false,
//     fullscreenControl: false,
//   };

//   return (
//     <div className="relative w-full" style={{ height: `${mapHeight}px`}}>
//       <GoogleMap 
//         mapContainerStyle={{ width: "100%", height: "100%" }} 
//         center={center} 
//         zoom={12}
//         options={mapOptions}
//         onLoad={(map) => {
//           mapRef.current = map;
//         }}
//       >
//         {/* 現在位置のマーカー */}
//         {currentPosition && (
//           <Marker position={currentPosition} icon={getMarkerIcon("red", 30)} />
//         )}

//         {/* 店舗のマーカー */}
//         {plotStoreData.map((record, index) => (
//           <Marker
//             key={index}
//             position={{ lat: record.latitude, lng: record.longitude }}
//             icon={getMarkerIcon(getMarkerColor(record.lastVisitDate), 30)}
//             onClick={() => setSelectedStore(record)}
//           />
//         ))}

//         {/* 改善された店舗情報ウィンドウ */}
//         {selectedStore && (
//           <InfoWindow
//             position={{ lat: selectedStore.latitude, lng: selectedStore.longitude }}
//             onCloseClick={() => setSelectedStore(null)}
//           >
//             <div className="w-80 max-w-sm bg-white rounded-lg shadow-xl z-60">
//               {/* ヘッダー */}
//               <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
//                 <h3 className="font-bold text-lg mb-2 truncate">
//                   {selectedStore.storeName}
//                 </h3>
//                 <div className="flex items-center justify-between">
//                   <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusBadge(selectedStore.lastVisitDate).color}`}>
//                     {getStatusBadge(selectedStore.lastVisitDate).text}
//                   </span>
//                   <div className="flex items-center text-blue-100">
//                     <FiTarget className="w-4 h-4 mr-1" />
//                     <span className="text-sm font-medium">{selectedStore.count}回訪問</span>
//                   </div>
//                 </div>
//               </div>

//               {/* 最終訪問情報 */}
//               <div className="p-4 border-b border-gray-100">
//                 <div className="flex items-center text-gray-700 mb-2">
//                   <FiClock className="w-4 h-4 mr-2 text-blue-600" />
//                   <span className="font-medium text-sm">最終訪問</span>
//                 </div>
//                 <div className="ml-6 text-gray-600">
//                   <div className="text-sm">{selectedStore.lastVisitDateString}</div>
//                   <div className="text-sm">{selectedStore.lastVisitTime}</div>
//                 </div>
//               </div>

//               {/* 訪問記録 */}
//               <div className="p-4">
//                 <div className="flex items-center text-gray-700 mb-3">
//                   <FiCalendar className="w-4 h-4 mr-2 text-blue-600" />
//                   <span className="font-medium text-sm">訪問記録</span>
//                 </div>

//                 <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
//                   {selectedStore.visit_records.length > 0 ? (
//                     <div className="space-y-3">
//                       {selectedStore.visit_records.map((record, index) => (
//                         <div
//                           key={index}
//                           className="bg-gray-50 rounded-lg p-3 border border-gray-100 hover:bg-gray-100 transition-colors"
//                         >
//                           <div className="flex items-center justify-between mb-2">
//                             <div className="flex items-center text-gray-600">
//                               <FiCalendar className="w-3 h-3 mr-1" />
//                               <span className="text-xs font-medium">
//                                 {record.date} {record.time}
//                               </span>
//                             </div>
//                             <div className="flex items-center text-gray-500">
//                               <FiUser className="w-3 h-3 mr-1" />
//                               <span className="text-xs">{record.userName}</span>
//                             </div>
//                           </div>
//                           {record.memo && (
//                             <p className="text-sm text-gray-700 bg-white rounded px-2 py-1 border">
//                               {record.memo}
//                             </p>
//                           )}
//                         </div>
//                       ))}
//                     </div>
//                   ) : (
//                     <div className="text-center py-6">
//                       <div className="text-gray-400 text-4xl mb-2">📋</div>
//                       <p className="text-sm text-gray-500">まだ訪問記録がありません</p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </InfoWindow>
//         )}
//       </GoogleMap>

//       {/* 現在地に戻るボタン */}
//       <button
//         onClick={() => {
//           if (mapRef.current && currentPosition) {
//             mapRef.current.panTo(currentPosition);
//             mapRef.current.setZoom(12);
//           }
//         }}
//         disabled={!currentPosition || isLocationLoading}
//         className={`
//           fixed bottom-6 right-4 z-10 
//           flex items-center justify-center
//           w-14 h-14 rounded-full shadow-lg
//           transition-all duration-200 ease-in-out
//           ${currentPosition && !isLocationLoading
//             ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-xl transform hover:scale-105 active:scale-95'
//             : 'bg-gray-400 text-gray-200 cursor-not-allowed'
//           }
//         `}
//         title={isLocationLoading ? '位置情報を取得中...' : '現在地に戻る'}
//       >
//         {isLocationLoading ? (
//           <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
//         ) : (
//           <FiMapPin className="w-6 h-6" />
//         )}
//       </button>

//       {/* 凡例 */}
      // <div className="fixed top-16 left-2 z-10 bg-white rounded-lg shadow-lg p-3 border border-gray-200">
      //   <h4 className="text-sm font-semibold text-gray-700 mb-2">訪問状況</h4>
      //   <div className="space-y-1">
      //     <div className="flex items-center text-xs text-gray-900">
      //       <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
      //       <span>1週間以内</span>
      //     </div>
      //     <div className="flex items-center text-xs text-gray-900">
      //       <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
      //       <span>2週間以内</span>
      //     </div>
      //     <div className="flex items-center text-xs text-gray-900">
      //       <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
      //       <span>1ヶ月以内</span>
      //     </div>
      //     <div className="flex items-center text-xs text-gray-900">
      //       <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
      //       <span>1ヶ月以上</span>
      //     </div>
      //     <div className="flex items-center text-xs text-gray-900">
      //       <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
      //       <span>現在地</span>
      //     </div>
      //   </div>
      // </div>
//     </div>
//   );
// };

// export default VisitMap;

import React, { useEffect, useState, useContext } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { fetchPlotStoreData } from "../api/visitRecord";
import { LocationContext } from "../context/LocationContext";

import { useRef } from "react";

import { mapStyle } from "../styles/mapStyle";

import { 
  FiMapPin, 
  FiClock, 
  FiUser, 
  FiTarget, 
  FiCalendar, 
  FiX,
  FiChevronUp,
  FiChevronDown
} from "react-icons/fi";

import { createSVGMarker } from "../utils/createSVGMarker";

const NAVBAR_HEIGHT = 56;

const VisitMap = () => {
  const [plotStoreData, setPlotStoreData] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [mapHeight, setMapHeight] = useState(window.innerHeight - NAVBAR_HEIGHT);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [center, setCenter] = useState({ lat: 35.6895, lng: 139.6917 });
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [bottomSheetExpanded, setBottomSheetExpanded] = useState(false);

  const mapRef = useRef(null);

  // 画面サイズ変更時に `mapHeight` を更新
  useEffect(() => {
    const updateHeight = () => {
      const viewportHeight = window.visualViewport?.height || window.innerHeight;
      setMapHeight(viewportHeight - NAVBAR_HEIGHT);
    };

    window.addEventListener("resize", updateHeight);
    updateHeight();
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  // 初回：現在地取得して中心に設定
  useEffect(() => {
    if (!navigator.geolocation) {
      setIsLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newPos = { lat: latitude, lng: longitude };
        setCurrentPosition(newPos);
        setCenter(newPos);
        setIsLocationLoading(false);
      },
      (error) => {
        console.warn("初回位置取得に失敗", error);
        setIsLocationLoading(false);
      }
    );
  }, []);

  // 追跡：位置変化だけ反映（中心は変えない）
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentPosition({ lat: latitude, lng: longitude });
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

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    // 展開中はジェスチャ禁止、閉じたら復帰
    map.setOptions({
      draggable: !bottomSheetExpanded,
      scrollwheel: !bottomSheetExpanded,
      gestureHandling: bottomSheetExpanded ? 'none' : 'greedy',
    });
  }, [bottomSheetExpanded]);

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

  const getStatusBadge = (lastVisitDate) => {
    if (!lastVisitDate || isNaN(lastVisitDate.getTime())) {
      return { text: "未訪問", color: "bg-gray-500" };
    }
    
    const today = new Date();
    const diffDays = (today - lastVisitDate) / (1000 * 60 * 60 * 24);

    if (diffDays <= 7) return { text: "最近", color: "bg-emerald-500" };
    if (diffDays <= 14) return { text: "1週間前", color: "bg-amber-500" };
    if (diffDays <= 28) return { text: "2週間前", color: "bg-blue-500" };
    return { text: "1ヶ月以上前", color: "bg-purple-500" };
  };

  const handleMarkerClick = (store) => {
    setSelectedStore(store);
    // マーカーをクリックした際は最小表示から開始
    setBottomSheetExpanded(false);
  };

  const closeBottomSheet = () => {
    setSelectedStore(null);
    setBottomSheetExpanded(false);
  };

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  if (loadError) return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center p-6">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <p className="text-gray-700 text-lg">地図の読み込みに失敗しました</p>
      </div>
    </div>
  );
  
  if (!isLoaded) return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-700 text-lg">地図を読み込み中...</p>
      </div>
    </div>
  );

  const mapOptions = {
    styles: mapStyle,
    disableDefaultUI: false,
    zoomControl: false,
    mapTypeControl: false,
    streetViewControl: false,
    rotateControl: false,
    cameraControl: false,
    scaleControl: false,
    fullscreenControl: false,
  };

  return (
    <div className="relative w-full" style={{ height: `${mapHeight}px`}}>
      <GoogleMap 
        mapContainerStyle={{ width: "100%", height: "100%" }} 
        center={center} 
        zoom={12}
        options={{
          ...mapOptions,
          gestureHandling: bottomSheetExpanded ? 'none' : 'auto'  // ← 追加
        }}
        onLoad={(map) => {
          mapRef.current = map;
        }}
        onClick={() => {
          // 地図をクリックした際はボトムシートを閉じる
          if (selectedStore && !bottomSheetExpanded) {
            closeBottomSheet();
          }
        }}
      >
        {/* 現在位置のマーカー */}
        {/* {currentPosition && (
          <Marker position={currentPosition} icon={getMarkerIcon("red", 30)} />
        )} */}
        {currentPosition && (
          <Marker 
            position={currentPosition} 
            icon={createSVGMarker("red", true)}
          />
        )}

        {/* 店舗のマーカー */}
        {/* {plotStoreData.map((record, index) => (
          <Marker
            key={index}
            position={{ lat: record.latitude, lng: record.longitude }}
            icon={getMarkerIcon(getMarkerColor(record.lastVisitDate), 30)}
            onClick={() => handleMarkerClick(record)}
          />
        ))} */}
        {plotStoreData.map((record, index) => (
          <Marker
            key={index}
            position={{ lat: record.latitude, lng: record.longitude }}
            icon={createSVGMarker(getMarkerColor(record.lastVisitDate))}
            onClick={() => handleMarkerClick(record)}
          />
        ))}
      </GoogleMap>

      {/* 現在地に戻るボタン */}
      <button
        onClick={() => {
          if (mapRef.current && currentPosition) {
            mapRef.current.panTo(currentPosition);
            mapRef.current.setZoom(12);
          }
        }}
        disabled={!currentPosition || isLocationLoading}
        className={`
          fixed bottom-6 right-4 z-20 
          flex items-center justify-center
          w-14 h-14 rounded-full shadow-lg
          transition-all duration-200 ease-in-out
          ${currentPosition && !isLocationLoading
            ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-xl transform hover:scale-105 active:scale-95'
            : 'bg-gray-400 text-gray-200 cursor-not-allowed'
          }
        `}
        title={isLocationLoading ? '位置情報を取得中...' : '現在地に戻る'}
      >
        {isLocationLoading ? (
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
        ) : (
          <FiMapPin className="w-6 h-6" />
        )}
      </button>

      {/* 凡例 */}
      <div className="fixed top-16 left-2 z-10 bg-white rounded-lg shadow-lg p-3 border border-gray-200 pointer-events-none">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">訪問状況</h4>
        <div className="space-y-1">
          <div className="flex items-center text-xs text-gray-900">
            <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
            <span>1週間以内</span>
          </div>
          <div className="flex items-center text-xs text-gray-900">
            <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
            <span>2週間以内</span>
          </div>
          <div className="flex items-center text-xs text-gray-900">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span>1ヶ月以内</span>
          </div>
          <div className="flex items-center text-xs text-gray-900">
            <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
            <span>1ヶ月以上</span>
          </div>
          <div className="flex items-center text-xs text-gray-900">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span>現在地</span>
          </div>
        </div>
      </div>

      {/* ボトムシート */}
      {selectedStore && (
        <>
          {/* オーバーレイ */}
          <div 
            className={`fixed inset-0 bg-black transition-opacity duration-300 z-30 ${
              bottomSheetExpanded ? 'opacity-50' : 'opacity-0 pointer-events-none'
            }`}
            onClick={closeBottomSheet}
          />
          
          {/* ボトムシート本体 */}
          <div 
            className={`
              pb-4 fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-40 transform transition-transform duration-500 ease-in-out
              ${bottomSheetExpanded 
                ? 'translate-y-0' 
                : 'translate-y-[calc(100%-120px)]'
              }
            `}
            style={{ 
              maxHeight: bottomSheetExpanded ? '60vh' : '120px',
              minHeight: '120px',
              overscrollBehavior: 'contain'  // ← 追加
            }}
            onTouchStart={(e) => {           // ← 追加
              if (bottomSheetExpanded) {
                e.stopPropagation();
              }
            }}
            onTouchMove={(e) => {            // ← 追加
              if (bottomSheetExpanded) {
                e.stopPropagation();
              }
            }}
            onWheel={(e) => {                // ← 追加
              if (bottomSheetExpanded) {
                e.stopPropagation();
              }
            }}
          >
            {/* ハンドルバー */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
            </div>

            {/* ヘッダー部分（常に表示） */}
            <div 
              className="px-6 py-4 cursor-pointer"
              onClick={() => setBottomSheetExpanded(!bottomSheetExpanded)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-gray-900 truncate">
                    {selectedStore.storeName}
                  </h3>
                  <div className="flex items-center mt-1 space-x-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusBadge(selectedStore.lastVisitDate).color}`}>
                      {getStatusBadge(selectedStore.lastVisitDate).text}
                    </span>
                    <div className="flex items-center text-gray-600 text-sm">
                      <FiTarget className="w-4 h-4 mr-1" />
                      <span>{selectedStore.count}回</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {bottomSheetExpanded ? (
                    <FiChevronDown className="w-6 h-6 text-gray-400" />
                  ) : (
                    <FiChevronUp className="w-6 h-6 text-gray-400" />
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeBottomSheet();
                    }}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <FiX className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* 拡張コンテンツ */}
            <div className={`px-6 pb-6 overflow-y-auto ${bottomSheetExpanded ? 'block' : 'hidden'}`}
              // style={{
              // WebkitOverflowScrolling: 'touch', // iOS滑らかスクロール
              // touchAction: 'pan-y',             // 垂直だけ拾う
              // paddingBottom: 'env(safe-area-inset-bottom)', // ホームバー回避
            // }}
              style={{ 
                maxHeight: bottomSheetExpanded ? 'calc(60vh - 140px)' : '0',  // ← 追加
                overscrollBehavior: 'contain'                                // ← 追加
              }}
              onTouchStart={(e) => e.stopPropagation()}                     // ← 追加
              onTouchMove={(e) => e.stopPropagation()}                      // ← 追加
              onWheel={(e) => e.stopPropagation()}                          // ← 追加
            >
              {/* 最終訪問情報 */}
              <div className="mb-4 p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center text-gray-700">
                  <FiClock className="w-4 h-4 mr-2 text-blue-600" />
                  <span className="font-medium text-sm">最終訪問</span>
                  <div className="flex item-left ml-6 text-gray-600">
                    <div className="px-1 text-sm font-medium">{selectedStore.lastVisitDateString}</div>
                    <div className="text-sm">{selectedStore.lastVisitTime}</div>
                  </div>
                </div>

              </div>

              {/* 訪問記録 */}
              <div className="mb-0">
                <div className="flex items-center text-gray-700 mb-4">
                  <FiCalendar className="w-4 h-4 mr-2 text-blue-600" />
                  <span className="font-medium text-sm">訪問記録</span>
                </div>

                <div 
                  className="space-y-3"
                  style={{ overscrollBehavior: 'contain' }}  // ← 追加
                >
                  {selectedStore.visit_records.length > 0 ? (
                    selectedStore.visit_records.map((record, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
                        onTouchStart={(e) => e.stopPropagation()}  // ← 追加
                        onTouchMove={(e) => e.stopPropagation()}   // ← 追加
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center text-gray-600">
                            <FiCalendar className="w-3 h-3 mr-1" />
                            <span className="text-xs font-medium">
                              {record.date} {record.time}
                            </span>
                          </div>
                          <div className="flex items-center text-gray-500">
                            <FiUser className="w-3 h-3 mr-1" />
                            <span className="text-xs">{record.userName}</span>
                          </div>
                        </div>
                        {record.memo && (
                          <p className="text-sm text-gray-700 bg-gray-50 rounded px-3 py-2 border">
                            {record.memo}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-400 text-4xl mb-2">📋</div>
                      <p className="text-sm text-gray-500">まだ訪問記録がありません</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default VisitMap;