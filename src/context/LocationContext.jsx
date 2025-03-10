import React, { createContext, useState, useEffect } from "react";

export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState({ lat: null, lng: null });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          console.log("現在地取得成功:", position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("位置情報の取得に失敗しました:", error);
        }
      );
    } else {
      console.error("このブラウザでは位置情報がサポートされていません。");
    }
  }, []);

  return (
    <LocationContext.Provider value={location}>
      {children}
    </LocationContext.Provider>
  );
};
