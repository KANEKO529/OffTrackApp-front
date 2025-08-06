export const getLocation = (callback) => {
    if (!navigator.geolocation) {
      alert("Geolocationはこのブラウザでサポートされていません。");
      return;
    }
  
    navigator.geolocation.getCurrentPosition(
      (position) => {

        const latitude = position.coords.latitude.toFixed(6); // 小数点6桁まで
        const longitude = position.coords.longitude.toFixed(6);

        // 成功時のポップアップ表示
        alert(`位置情報を取得しました！\n緯度: ${latitude}\n経度: ${longitude}`);
      
        // `callback` を使って、2つの値を分けて渡す
        callback(latitude, longitude);
      },
      (error) => {
        alert("位置情報を取得できませんでした。エラーコード: " + error.code);
      }
    );
};