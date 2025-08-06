export const formatTime = (timeString) => {
  if (!timeString) return ""; // 空や不正な時間なら空文字を表示
  const date = new Date(timeString);
  if (isNaN(date)) return ""; // 無効な日付をチェック
  return date.toLocaleTimeString("ja-JP", { hour: '2-digit', minute: '2-digit' }); // HH:MM形式に変換
};


// 日付を短くフォーマットする関数
export const formatDate = (dateString) => {
  if (!dateString) return "N/A";  // 空や不正な日付ならN/Aを表示
  const date = new Date(dateString);
  return !isNaN(date)
    ? date.toLocaleDateString("ja-JP")
    : "Invalid Date";  // 日付が無効なら Invalid Date を表示
};