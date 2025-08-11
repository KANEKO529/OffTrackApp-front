import React, { useEffect, useState } from "react";
import { fetchVisitRecordsWithStore, deleteVisitRecords, updateVisitRecords } from "../api/visitRecord";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Button, Box, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { formatTime } from "../utils/getFormatDateTime";
import { formatDate } from "../utils/getFormatDateTime";

const VisitRecordTable = () => {
  const [visitRecords, setVisitRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editDate, setEditDate] = useState("");
  const [editMemo, setEditMemo] = useState("");

  useEffect(() => {
    const getVisitRecordsWithStore = async () => {
      try {
        setLoading(true);
        const data = await fetchVisitRecordsWithStore();
        console.log("data of VisitRecordsData:", data);
        setVisitRecords(data);
      } catch (error) {
        console.log("訪問情報の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    getVisitRecordsWithStore();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("本当に削除しますか？")) return;
    try {
      await deleteVisitRecords(id);
      setVisitRecords(visitRecords.filter(record => record.id !== id));
    } catch (error) {
      console.error("削除に失敗しました", error);
    }
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    setEditDate(record.date);
    setEditMemo(record.memo);
  };

  const handleUpdate = async (id) => {
    const updatedVisitRecord = { date: editDate, memo: editMemo };

    try {
      await updateVisitRecords(id, updatedVisitRecord);
      setEditingId(null);
      setVisitRecords(
        visitRecords.map(record =>
          record.id === id ? { ...record, ...updatedVisitRecord } : record
        )
      );
    } catch (error) {
      console.error("更新に失敗しました", error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        padding: 1,
        // ✅ AppBar の高さ分だけ余白を作る
      }}
    >
      <Box
        sx={{
          // bgcolor: "#202123", // ✅ ChatGPT のダークモード背景色
          borderRadius: 1,    // ✅ 少し丸みをつける
          maxWidth: 600,      // ✅ 幅を制限
          mx: "auto",         // ✅ 中央揃え
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ fontWeight: "bold" }} // ✅ ChatGPT の明るいテキスト色
        >
          訪問記録データ
        </Typography>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>日付</TableCell>
              <TableCell>店名</TableCell>
              <TableCell>作成者</TableCell>
              <TableCell>メモ</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visitRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell>
                  {editingId === record.id ? (
                    <TextField value={editDate} onChange={(e) => setEditDate(e.target.value)} size="small" />
                  ) : (
                    formatDate(record.date) + " " + formatTime(record.date)
                  )}
                </TableCell>
                <TableCell>{record.storeName}</TableCell>
                <TableCell>{record.userName}</TableCell>
                <TableCell>
                  {editingId === record.id ? (
                    <TextField value={editMemo} onChange={(e) => setEditMemo(e.target.value)} size="small" />
                  ) : (
                    record.memo
                  )}
                </TableCell>
                <TableCell>
                  {editingId === record.id ? (
                    <Button variant="contained" color="success" size="small" onClick={() => handleUpdate(record.id)}>保存</Button>
                  ) : (
                    <>
                      <Button variant="contained" color="warning" size="small" onClick={() => handleEdit(record)}>編集</Button>
                      <Button variant="contained" color="error" size="small" onClick={() => handleDelete(record.id)}>削除</Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default VisitRecordTable;
