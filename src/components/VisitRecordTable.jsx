import React, { useEffect, useState } from "react";
import { fetchVisitRecordsWithStore, deleteVisitRecords, updateVisitRecords } from "../api/visitRecord";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Button } from "@mui/material";
import { Link } from "react-router-dom";

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
    <>
      <div>
        <p>訪問記録データ</p>
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
              <TableCell>日付</TableCell>
              <TableCell>店名</TableCell>
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
                    record.date
                  )}
                </TableCell>
                <TableCell>{record.storeName}</TableCell>
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
    </>
  );
};

export default VisitRecordTable;
