const logToServer = (message) => {
    fetch("/api/logs", { // フロントエンドの開発サーバーに送る
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ log: message }),
    }).catch(err => console.error("ログ送信に失敗しました:", err));
  };
  
  export default logToServer;
  