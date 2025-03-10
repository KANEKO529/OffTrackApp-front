import React, { useEffect, useState, useRef } from "react";
import { fetchStores, deleteStore, updateStore } from "../api/store";
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions 
} from "@mui/material";
import { Link } from "react-router-dom";


const StoreTable = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null); // 編集中の行ID
  const [openModal, setOpenModal] = useState(false); // モーダル開閉状態
  const [selectedStore, setSelectedStore] = useState(null); // 選択した店舗データ
  
  // フォームの状態を管理
  const [storeName, setStoreName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  // データ取得
  useEffect(() => {
    const getStores = async () => {
      try {
        setLoading(true);
        const data = await fetchStores();
        // console.log("data of fetchStores:", data);
        setStores(data);
      } catch (error) {
        console.log("訪問情報の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };
    getStores();
  }, []);

  // 店舗削除
  const handleDelete = async (id) => {
    if (!window.confirm("本当に削除しますか？訪問記録データも削除されます。")) return;
    try {
      await deleteStore(id);
      setStores(stores.filter(record => record.id !== id)); // 即時反映
      alert("店舗情報が削除されました。");
      handleCloseModal();
    
    } catch (error) {
      console.error("削除に失敗しました", error);
    }
  };

  // 店舗更新
  const handleUpdate = async (id) => {
    const updatedStore = {
      storeName,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    };
    try {
      await updateStore(id, updatedStore);
      setEditingId(null);
      setStores(
        stores.map(record => 
          record.id === id ? { ...record, ...updatedStore } : record
        )
      );
      alert("店舗情報が更新されました。");
      handleCloseModal();
    } catch (error) {
      console.error("更新に失敗しました", error);
    }
  };

  // 詳細モーダルを開く
  const handleOpenModal = (store) => {
    setSelectedStore(store);
    setStoreName(store.storeName);
    setLatitude(store.latitude);
    setLongitude(store.longitude);
    setOpenModal(true);
  };

  // モーダルを閉じる
  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedStore(null);
  };

  return (
    <>
      <div>
        <p>店舗データ</p>
      </div>
      <Link to="/dashboard" style={{ textDecoration: "none" }}>
        <Button variant="outlined" color="secondary">
            ダッシュボードへ戻る
        </Button>
        </Link>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>店名</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stores.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.storeName}</TableCell>
                <TableCell>
                  <Button 
                    variant="contained" 
                    color="info" 
                    size="small" 
                    onClick={() => handleOpenModal(record)}
                  >
                    詳細
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

            {/* モーダルウィンドウ */}
            <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>店舗の詳細</DialogTitle>
        <DialogContent>
          {selectedStore && (
            <>
              <p><strong>店名:</strong></p>
              <TextField 
                value={storeName} 
                onChange={(e) => setStoreName(e.target.value)}
                size="small" 
                fullWidth 
              />
              <p><strong>緯度:</strong></p>
              <TextField 
                value={latitude} 
                onChange={(e) => setLatitude(e.target.value)}
                size="small" 
                fullWidth 
              />
              <p><strong>経度:</strong></p>
              <TextField 
                value={longitude} 
                onChange={(e) => setLongitude(e.target.value)}
                size="small" 
                fullWidth 
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          {selectedStore && (
            <>
              <Button 
                variant="contained" 
                color="success" 
                onClick={() => handleUpdate(selectedStore.id)}
              >
                更新
              </Button>
              <Button 
                variant="contained" 
                color="error" 
                onClick={() => handleDelete(selectedStore.id)}
              >
                削除
              </Button>
              <Button 
                onClick={handleCloseModal} 
                color="primary"
              >
                閉じる
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

    </>
  );
};

export default StoreTable;
