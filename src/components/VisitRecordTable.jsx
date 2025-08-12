import React, { useEffect, useState, Fragment } from "react";
import { Dialog, Transition, Menu, Listbox, Input } from '@headlessui/react';
import { 
  fetchVisitRecordsWithStore, 
  deleteVisitRecords, 
  updateVisitRecords 
} from "../api/visitRecord";
import { formatTime, formatDate } from "../utils/getFormatDateTime";
import {
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ChevronDownIcon,
  CalendarDaysIcon,
  UserIcon,
  BuildingStorefrontIcon,
  CurrencyYenIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';
import {
  CheckIcon as CheckIconSolid,
  ChevronUpDownIcon
} from '@heroicons/react/20/solid';

import { toast } from "react-toastify";

import {
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const VisitRecordTable = () => {
  const [visitRecords, setVisitRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);

  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editDate, setEditDate] = useState("");
  const [editMemo, setEditMemo] = useState("");
  const [editPrice, setEditPrice] = useState("");

  const [actionLoading, setActionLoading] = useState(null);

  // 削除ダイアログ
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);

  // 詳細ダイアログ
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const [recordToView, setRecordToView] = useState(null);
  
  // フィルター状態
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCreator, setSelectedCreator] = useState("すべての作成者");
  const [dateRange, setDateRange] = useState("今月");
  
  // ユニークな作成者リストを取得
  const uniqueCreators = ["すべての作成者", ...Array.from(new Set(visitRecords.map(record => record.userName)))];
  const dateRangeOptions = ["カスタム", "今日", "今週", "今月", "先月"];

  // ページネーション状態
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchVisitRecords();
  }, []);

  // 変更後
  useEffect(() => {
    applyFilters();
    setCurrentPage(1); // ← この行を追加（フィルター変更時は1ページ目に戻る）
  }, [visitRecords, searchQuery, selectedCreator, dateRange]);


  const fetchVisitRecords = async () => {
    try {
      setLoading(true);
      // setError("");
      const data = await fetchVisitRecordsWithStore();
      console.log("Visit records data:", data);
      setVisitRecords(data);
    } catch (error) {
      console.error("Failed to fetch visit records:", error);
      toast.error("訪問記録の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...visitRecords];

    // 検索フィルター
    if (searchQuery.trim()) {
      filtered = filtered.filter(record => 
        record.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.memo?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 作成者フィルター
    if (selectedCreator !== "すべての作成者") {
      filtered = filtered.filter(record => record.userName === selectedCreator);
    }

    // 日付フィルター（簡略化版）
    if (dateRange !== "カスタム") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.date);
        switch (dateRange) {
          case "今日":
            return recordDate >= today;
          case "今週":
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return recordDate >= weekAgo;
          case "今月":
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            return recordDate >= monthStart;
          case "先月":
            const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
            return recordDate >= lastMonthStart && recordDate <= lastMonthEnd;
          default:
            return true;
        }
      });
    }

    setFilteredRecords(filtered);
  };

  // ページネーション計算
const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;
const currentRecords = filteredRecords.slice(startIndex, endIndex);

const handlePageChange = (page) => {
  setCurrentPage(page);
  // スクロールを上部に移動
  window.scrollTo({ top: 0, behavior: 'smooth' });
};


const handleDeleteClick = (record) => {
  setRecordToDelete(record);
  setDeleteDialogOpen(true);
};

const handleViewClick = (record) => {
  setRecordToView(record);
  setViewDialogOpen(true);
};

const handleDeleteConfirm = async () => {
  if (!recordToDelete) return;
  
  try {
    setActionLoading(recordToDelete.id);
    await deleteVisitRecords(recordToDelete.id);
    setVisitRecords(prev => prev.filter(record => record.id !== recordToDelete.id));
    toast.success("記録を削除しました");
  } catch (error) {
    console.error("Delete failed:", error);
    toast.error("削除に失敗しました");
  } finally {
    setActionLoading(null);
    setDeleteDialogOpen(false);
    setRecordToDelete(null);
  }
};

const handleEdit = (record) => {
  setEditingId(record.id);
  // setEditDate(record.date);
  console.log("record.date:", record.date)

  setEditDate(formatForDateTimeLocal(record.date)); // 修正: フォーマット関数を使用

  console.log("formatForDateTimeLocal(record.date)):", formatForDateTimeLocal(record.date))

  setEditMemo(record.memo || "");
  setEditPrice(record.price || "");
  // setError("");
};

const handleCancelEdit = () => {
  setEditingId(null);
  setEditDate("");
  setEditMemo("");
  setEditPrice("");
};

const handleUpdate = async (id) => {

  if (!editDate) { // 修正: .trim()を削除
    toast.error("日付は必須です");
    return;
  }

  console.log("editDate:", editDate)

  const updatedVisitRecord = { 
    // date: editDate, 
    date: parseFromDateTimeLocal(editDate), // 修正: 正しい関数名と変数名
    memo: editMemo.trim(),

    price: editPrice ? editPrice.toString().trim() : ""
  };

  try {
    setActionLoading(id);
    await updateVisitRecords(id, updatedVisitRecord);
    
    setVisitRecords(prev =>
      prev.map(record =>
        record.id === id ? { ...record, ...updatedVisitRecord } : record
      )
    );
    
    setEditingId(null);
    setEditDate("");
    setEditMemo("");
    setEditPrice("");
    toast.success("記録を更新しました");
    // setSuccess("記録を更新しました");
  } catch (error) {
    console.error("Update failed:", error);
    toast.error("更新に失敗しました");
  } finally {
    setActionLoading(null);
  }
};

const handleExport = () => {
  // 簡単なCSVエクスポート機能
  const headers = ["日付", "店名", "作成者", "価格", "メモ"];
  const csvContent = [
    headers.join(","),
    ...filteredRecords.map(record => [
      `"${formatDate(record.date)} ${formatTime(record.date)}"`,
      `"${record.storeName}"`,
      `"${record.userName}"`,
      `"${record.price || ""}"`,
      `"${record.memo || ""}"`
    ].join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "訪問記録.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 追加した関数
const formatForDateTimeLocal = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  // getFullYear(), getHours()などはローカル時刻を返す
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const parseFromDateTimeLocal = (dateTimeLocal) => {
  if (!dateTimeLocal) return null;
  return new Date(dateTimeLocal).toISOString();
};

if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">データを読み込んでいます...</p>
      </div>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">訪問記録一覧</h1>
              {/* <p className="text-gray-600">{filteredRecords.length}件の記録</p> */}
              <p className="text-gray-600 text-sm">
                {filteredRecords.length}件中 {Math.min(startIndex + 1, filteredRecords.length)}-{Math.min(endIndex, filteredRecords.length)}件を表示
                {totalPages > 1 && ` (${currentPage}/${totalPages}ページ)`}
              </p>
            </div>

          </div>
        </div>

        {/* フィルターエリア */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 検索 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">店名で検索</label>
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="店名で検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {/* 作成者フィルター */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">作成者</label>
              <Listbox value={selectedCreator} onChange={setSelectedCreator}>
                <div className="relative">
                  <Listbox.Button className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm">
                    <span className="flex items-center">
                      <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="block truncate text-gray-900">{selectedCreator}</span>
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
                    </span>
                  </Listbox.Button>
                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                      {uniqueCreators.map((creator) => (
                        <Listbox.Option
                          key={creator}
                          className={({ active }) =>
                            `relative cursor-default select-none py-2 pl-10 pr-4 ${
                              active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                            }`
                          }
                          value={creator}
                        >
                          {({ selected }) => (
                            <>
                              <span className={`block truncate text-gray-900 ${selected ? 'font-medium' : 'font-normal'}`}>
                                {creator}
                              </span>
                              {selected ? (
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                  <CheckIconSolid className="h-5 w-5" />
                                </span>
                              ) : null}
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
            </div>
            {/* 期間フィルター */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">期間</label>
              <Listbox value={dateRange} onChange={setDateRange}>
                <div className="relative">
                  <Listbox.Button className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm">
                    <span className="flex items-center">
                      <CalendarDaysIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="block truncate">{dateRange}</span>
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
                    </span>
                  </Listbox.Button>
                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                      {dateRangeOptions.map((option) => (
                        <Listbox.Option
                          key={option}
                          className={({ active }) =>
                            `relative cursor-default select-none py-2 pl-10 pr-4 ${
                              active ? 'bg-blue-50 text-gray-900' : 'bg-white text-gray-900'
                            }`
                          }
                          value={option}
                        >
                          {({ selected }) => (
                            <>
                              <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                {option}
                              </span>
                              {selected ? (
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                  <CheckIconSolid className="h-5 w-5" />
                                </span>
                              ) : null}
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
            </div>
          </div>
        </div>

        {/* 記録リスト */}
        {filteredRecords.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
              <BuildingStorefrontIcon className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">記録が見つかりません</h3>
            <p className="text-gray-500">
            {searchQuery || selectedCreator !== "すべての作成者" || dateRange !== "今月"
              ? "フィルター条件を変更してみてください"
              : "まだ訪問記録がありません"}
            </p>
          </div>
        ) : (

          <>
           <div className="space-y-4">
            {currentRecords.map((record) => (
              <div
                key={record.id}
                className={`bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200 ${
                  editingId === record.id ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="p-6">
                  {editingId === record.id ? (
                    // 編集モード
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            訪問日時
                          </label>
                          <input
                            type="datetime-local"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            className={`px-2 h-8 justify-center bg-white border block w-full rounded-md border-gray-300 shadow-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                              !editDate.trim() ? 'border-red-300' : ''
                            }`}
                          />
                          
                          {!editDate.trim() && (
                            <p className="text-red-600 text-xs mt-1">日付は必須です</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            店名
                          </label>
                          <div className="mt-1">
                            <span className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
                              {record.storeName}
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            価格
                          </label>
                          <div className="relative">
                            <Input
                              type="number"
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              placeholder="0"
                              min="0"
                              className="h-8 block w-full pl-8 rounded-md border border-gray-300 shadow-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300 sm:text-sm"
                            />
                            <CurrencyYenIcon className="h-5 w-5 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          メモ
                        </label>
                        <textarea
                          value={editMemo}
                          onChange={(e) => setEditMemo(e.target.value)}
                          rows={4}
                          className="px-2 py-2 border block w-full rounded-md border-gray-300 shadow-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300 sm:text-sm"
                          placeholder="メモを入力..."
                        />
                      </div>
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={handleCancelEdit}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <XMarkIcon className="h-4 w-4 mr-2" />
                          キャンセル
                        </button>
                        <button
                          onClick={() => handleUpdate(record.id)}
                          disabled={actionLoading === record.id}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading === record.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          ) : (
                            <CheckIcon className="h-4 w-4 mr-2" />
                          )}
                          保存
                        </button>
                      </div>
                    </div>
                  ) : (
                    // 表示モード
                    <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* 店名とアクションボタン - 横並び */}
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 truncate mr-4">
                          {record.storeName}
                        </h3>
                        
                        {/* アクションボタン */}
                        <Menu as="div" className="relative inline-block text-left">
                              <Menu.Button className="bg-gray-50 inline-flex items-center p-2 text-gray-700 hover:text-gray-600 hover:bg-blue-50 rounded-md transition-colors">
                                <EllipsisHorizontalIcon className="h-5 w-5" />
                              </Menu.Button>

                              <Transition
                                as={Fragment}
                                enter="transition ease-out duration-100"
                                enterFrom="transform opacity-0 scale-95"
                                enterTo="transform opacity-100 scale-100"
                                leave="transition ease-in duration-75"
                                leaveFrom="transform opacity-100 scale-100"
                                leaveTo="transform opacity-0 scale-95"
                              >
                                <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                  <div className="py-1">
                                    <Menu.Item>
                                      {({ active }) => (
                                        <button
                                          onClick={() => handleViewClick(record)}
                                          className={`${
                                            active ? 'bg-white-50 text-blue-900' : 'bg-gray-100 text-gray-700'
                                          } group flex items-center px-4 py-2 text-sm w-full text-left hover:bg-blue-100`}
                                        >
                                          <EyeIcon className="h-4 w-4 mr-3 text-gray-700 group-hover:text-blue-500" />
                                          詳細表示
                                        </button>
                                      )}
                                    </Menu.Item>
                                    <Menu.Item>
                                      {({ active }) => (
                                        <button
                                          onClick={() => handleEdit(record)}
                                          disabled={editingId !== null}
                                          className={`${
                                            active && editingId === null ? 'bg-blue-50 text-blue-900' : 'bg-gray-100 text-gray-700'
                                          } group flex items-center px-4 py-2 text-sm w-full text-left disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-100`}
                                        >
                                          <PencilIcon className="h-4 w-4 mr-3 text-gray-400 group-hover:text-blue-500" />
                                          編集
                                        </button>
                                      )}
                                    </Menu.Item>
                                    <Menu.Item>
                                      {({ active }) => (
                                        <button
                                          onClick={() => handleDeleteClick(record)}
                                          disabled={actionLoading === record.id || editingId !== null}
                                          className={`${
                                            active && actionLoading !== record.id && editingId === null 
                                              ? 'bg-red-50 text-red-900' : 'bg-gray-100 text-gray-700'
                                          } group flex items-center px-4 py-2 text-sm w-full text-left disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-100 `}
                                        >
                                          {actionLoading === record.id ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-3"></div>
                                          ) : (
                                            <TrashIcon className="h-4 w-4 mr-3 text-gray-400 group-hover:text-red-500" />
                                          )}
                                          削除
                                        </button>
                                      )}
                                    </Menu.Item>
                                  </div>
                                </Menu.Items>
                              </Transition>
                            </Menu>
                      </div>
                      
                      {/* 日付、作成者、価格 - 横並び */}
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        {/* 日時 */}
                        <div className="flex items-center text-sm text-gray-600">
                          <CalendarDaysIcon className="h-4 w-4 mr-1" />
                          <span className="font-medium">{formatDate(record.date)}</span>
                          <span className="mx-1">•</span>
                          <span>{formatTime(record.date)}</span>
                        </div>
                        
                        {/* 作成者 */}
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                          <UserIcon className="h-3 w-3 mr-1" />
                          {record.userName}
                        </span>
                        
                        {/* 価格 */}
                        {record.price && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                            <CurrencyYenIcon className="h-3 w-3 mr-1" />
                            {Number(record.price).toLocaleString()}
                          </span>
                        )}
                      </div>
                      
                      {/* メモ */}
                      {record.memo && (
                        <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                          <p className="whitespace-pre-wrap line-clamp-3">{record.memo}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  )}
                </div>
              </div>
            ))}
          </div>

            {/* ページネーション */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow-sm border mt-6">
                <div className="flex-1 flex items-center justify-between">
                  <div className="hidden sm:block">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">{Math.min(startIndex + 1, filteredRecords.length)}</span>
                      -
                      <span className="font-medium">{Math.min(endIndex, filteredRecords.length)}</span>
                      件目を表示中 (全
                      <span className="font-medium">{filteredRecords.length}</span>
                      件)
                    </p>
                  </div>
                  <div className="flex-1 flex justify-center sm:justify-end">
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">前へ</span>
                        <ChevronLeftIcon className="h-5 w-5" />
                      </button>
                      
                      {/* ページ番号 - モバイルでは簡略版、デスクトップでは完全版 */}
                      {[...Array(totalPages)].map((_, index) => {
                        const page = index + 1;
                        
                        // モバイルでは現在ページと前後1つずつのみ表示
                        const isMobile = window.innerWidth < 640; // sm breakpoint
                        const showOnMobile = page === 1 || 
                                           page === totalPages || 
                                           (page >= currentPage - 1 && page <= currentPage + 1);
                        
                        // デスクトップでは現在ページと前後2つずつ表示
                        const showOnDesktop = page === 1 ||
                                             page === totalPages ||
                                             (page >= currentPage - 2 && page <= currentPage + 2);
                        
                        if (showOnDesktop) {
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`relative inline-flex items-center px-3 sm:px-4 py-2 border text-sm font-medium ${
                                page === currentPage
                                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        } else if (
                          (page === currentPage - 3 && page > 1) ||
                          (page === currentPage + 3 && page < totalPages)
                        ) {
                          return (
                            <span
                              key={page}
                              className="relative inline-flex items-center px-2 sm:px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                            >
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">次へ</span>
                        <ChevronRightIcon className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          
          </>

        )}

        {/* 詳細表示ダイアログ */}
        <Transition appear show={viewDialogOpen} as={Fragment}>
          <Dialog 
            as="div" 
            className="relative z-10" 
            onClose={() => setViewDialogOpen(false)}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900 mb-4"
                    >
                      訪問記録詳細
                    </Dialog.Title>

                    {recordToView && (
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <dt className="text-sm font-medium text-gray-500">店名</dt>
                              <dd className="mt-1 text-sm text-gray-900">{recordToView.storeName}</dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-gray-500">作成者</dt>
                              <dd className="mt-1 text-sm text-gray-900">{recordToView.userName}</dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-gray-500">訪問日</dt>
                              <dd className="mt-1 text-sm text-gray-900">{formatDate(recordToView.date)}</dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-gray-500">訪問時間</dt>
                              <dd className="mt-1 text-sm text-gray-900">{formatTime(recordToView.date)}</dd>
                            </div>
                            {recordToView.price && (
                              <div className="col-span-2">
                                <dt className="text-sm font-medium text-gray-500">価格</dt>
                                <dd className="mt-1 text-sm text-gray-900 font-medium">
                                  <span className="inline-flex items-center">
                                    <CurrencyYenIcon className="h-4 w-4 mr-1 text-green-600" />
                                    {Number(recordToView.price).toLocaleString()}
                                  </span>
                                </dd>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {recordToView.memo && (
                          <div>
                            <dt className="text-sm font-medium text-gray-500 mb-2">メモ</dt>
                            <dd className="text-sm text-gray-900 bg-white border rounded-lg p-3 whitespace-pre-wrap">
                              {recordToView.memo}
                            </dd>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-6 flex justify-end">
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        onClick={() => setViewDialogOpen(false)}
                      >
                        閉じる
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>

        {/* 削除確認ダイアログ */}
        <Transition appear show={deleteDialogOpen} as={Fragment}>
          <Dialog 
            as="div" 
            className="relative z-10" 
            onClose={() => setDeleteDialogOpen(false)}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                      </div>
                      <div className="ml-3">
                        <Dialog.Title
                          as="h3"
                          className="text-lg font-medium leading-6 text-gray-900"
                        >
                          記録を削除
                        </Dialog.Title>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm text-gray-500">
                        この訪問記録を削除してもよろしいですか？この操作は元に戻すことができません。
                      </p>
                      {recordToDelete && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm font-medium text-gray-900">
                            店名: {recordToDelete.storeName}
                          </p>
                          <p className="text-sm text-gray-600">
                            日付: {formatDate(recordToDelete.date)} {formatTime(recordToDelete.date)}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        onClick={() => setDeleteDialogOpen(false)}
                      >
                        キャンセル
                      </button>
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        onClick={handleDeleteConfirm}
                        disabled={actionLoading === recordToDelete?.id}
                      >
                        {actionLoading === recordToDelete?.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <TrashIcon className="h-4 w-4 mr-2" />
                        )}
                        削除
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>

      {/* <button
        onClick={handleExport}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
        エクスポート
      </button> */}
    </div>
  );
};

export default VisitRecordTable;