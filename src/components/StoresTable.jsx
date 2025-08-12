import React, { useEffect, useState, Fragment } from "react";
import { fetchAllStores, deleteStore, updateStore } from "../api/store";
import { Dialog, Transition, Menu } from '@headlessui/react';
import { toast } from "react-toastify";
import {
  BuildingStorefrontIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  EllipsisHorizontalIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

import { MenuButton } from "@headlessui/react";
import {
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

// import MagnifyingGlassIcon from "@heroicons/react/24/outline";

const StoreTable = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  
  // 詳細ダイアログ用
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedStoreForView, setSelectedStoreForView] = useState(null);
  
  // 編集モーダル用
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedStoreForEdit, setSelectedStoreForEdit] = useState(null);
  const [storeName, setStoreName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  
  // 削除確認ダイアログ用
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState(null);

  // メニューの状態を管理
  const [openMenuId, setOpenMenuId] = useState(null);

  // フィルター状態
  const [filteredStores, setFilteredStores] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // ページネーション状態
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ページネーション計算
  const totalPages = Math.ceil(filteredStores.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStores = filteredStores.slice(startIndex, endIndex);

  // データ取得
  useEffect(() => {
    const getStores = async () => {
      try {
        setLoading(true);
        const data = await fetchAllStores();
        setStores(data);
      } catch (error) {
        console.log("店舗情報の取得に失敗しました");
        toast.error("店舗情報の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };
    getStores();
  }, []);

    // 変更後
  useEffect(() => {
    applyFilters();
    setCurrentPage(1); // ← この行を追加（フィルター変更時は1ページ目に戻る）
  }, [stores, searchQuery]);

  const applyFilters = () => {
    let filtered = [...stores];

    // 検索フィルター
    if (searchQuery.trim()) {
      filtered = filtered.filter(store => 
        store.storeName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredStores(filtered);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // スクロールを上部に移動
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  // 店舗削除
  const handleDeleteClick = (store) => {
    setStoreToDelete(store);
    setDeleteDialogOpen(true);
    setOpenMenuId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!storeToDelete) return;
    
    try {
      setActionLoading(storeToDelete.id);
      await deleteStore(storeToDelete.id);
      setStores(stores.filter(record => record.id !== storeToDelete.id));
      toast.success("店舗情報を削除しました");
    } catch (error) {
      console.error("削除に失敗しました", error);
      toast.error("店舗の削除に失敗しました");
    } finally {
      setActionLoading(null);
      setDeleteDialogOpen(false);
      setStoreToDelete(null);
    }
  };

  // 店舗更新
  const handleUpdate = async () => {
    if (!selectedStoreForEdit) return;
    
    if (!storeName.trim()) {
      toast.error("店舗名は必須です");
      return;
    }

    // 座標の検証
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (isNaN(lat) || lat < -90 || lat > 90) {
      toast.error("緯度は-90から90の間で入力してください");
      return;
    }
    
    if (isNaN(lng) || lng < -180 || lng > 180) {
      toast.error("経度は-180から180の間で入力してください");
      return;
    }

    const updatedStore = {
      storeName: storeName.trim(),
      latitude: lat,
      longitude: lng,
    };
    
    try {
      setActionLoading(selectedStoreForEdit.id);
      await updateStore(selectedStoreForEdit.id, updatedStore);
      setStores(
        stores.map(record => 
          record.id === selectedStoreForEdit.id ? { ...record, ...updatedStore } : record
        )
      );
      toast.success("店舗情報を更新しました");
      handleCloseEditModal();
    } catch (error) {
      console.error("店舗情報更新に失敗", error);
      toast.error("店舗情報の更新に失敗しました");
    } finally {
      setActionLoading(null);
    }
  };

  // 詳細ダイアログを開く
  const handleViewClick = (store) => {
    setSelectedStoreForView(store);
    setViewDialogOpen(true);

    // setViewModalOpen(true);
    // setOpenMenuId(null);
  };


  // 詳細モーダルを閉じる
  // const handleCloseViewModal = () => {
  //   setViewModalOpen(false);
  //   setSelectedStoreForView(null);
  // };

  // 編集モーダルを開く
  const handleEditClick = (store) => {
    setSelectedStoreForEdit(store);
    setStoreName(store.storeName);
    setLatitude(store.latitude.toString());
    setLongitude(store.longitude.toString());
    setEditModalOpen(true);
    setOpenMenuId(null);
  };

  // 編集モーダルを閉じる
  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedStoreForEdit(null);
    setStoreName("");
    setLatitude("");
    setLongitude("");
  };

  // メニューを開く/閉じる処理
  const handleMenuToggle = (storeId) => {
    setOpenMenuId(openMenuId === storeId ? null : storeId);
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">店舗データ一覧</h1>
              <p className="text-gray-600">
                {filteredStores.length}件中 {Math.min(startIndex + 1, filteredStores.length)}-{Math.min(endIndex, filteredStores.length)}件を表示
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
          </div>
        </div>

        {/* 店舗リスト */}
        {filteredStores.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
              <BuildingStorefrontIcon className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">店舗が見つかりません</h3>
            <p className="text-gray-500">
              {searchQuery
              ? "フィルター条件を変更してみてください"
              : "まだ店舗が登録されていません"}
            </p>
          </div>
        ) : (

          <>
            <div className="space-y-4">
              {currentStores.map((store) => (
              <div
                key={store.id}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      {/* 店舗名とアクションボタン */}
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 truncate mr-4">
                          {store.storeName}
                        </h3>
                        
                        {/* アクションボタン */}
                        <Menu as="div" className="relative inline-block text-left flex-shrink-0">
                          <MenuButton 
                            className="bg-gray-50 inline-flex items-center p-2 text-gray-700 hover:text-gray-600 hover:bg-blue-50 rounded-md transition-colors"
                            // onClick={() => handleMenuToggle(store.id)}
                          >
                            <EllipsisHorizontalIcon className="h-5 w-5" />
                          </MenuButton>

                          <Transition
                            // show={openMenuId === store.id}
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                          >
                            <Menu.Items 
                              className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                            >
                              <div className="py-1">
                                <Menu.Item>
                                  {({ active }) => (
                                    <button
                                      onClick={() => handleViewClick(store)}
                                      className={`${
                                        active ? 'bg-blue-50 text-blue-900' : 'bg-gray-100 text-gray-700'
                                      } group flex items-center px-4 py-2 text-sm w-full text-left hover:bg-blue-100`}
                                    >
                                      <EyeIcon className="h-4 w-4 mr-3 text-gray-400 group-hover:text-blue-500" />
                                      詳細表示
                                    </button>
                                  )}
                                </Menu.Item>
                                <Menu.Item>
                                  {({ active }) => (
                                    <button
                                      onClick={() => handleEditClick(store)}
                                      className={`${
                                        active ? 'bg-blue-50 text-blue-900' : 'bg-gray-100 text-gray-700'
                                      } group flex items-center px-4 py-2 text-sm w-full text-left hover:bg-blue-100`}
                                    >
                                      <PencilIcon className="h-4 w-4 mr-3 text-gray-400 group-hover:text-blue-500" />
                                      編集
                                    </button>
                                  )}
                                </Menu.Item>
                                <Menu.Item>
                                  {({ active }) => (
                                    <button
                                      onClick={() => handleDeleteClick(store)}
                                      disabled={actionLoading === store.id}
                                      className={`${
                                        active && actionLoading !== store.id 
                                          ? 'bg-red-50 text-red-900' : 'bg-gray-100 text-gray-700'
                                      } group flex items-center px-4 py-2 text-sm w-full text-left disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-100`}
                                    >
                                      {actionLoading === store.id ? (
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
                      
                      {/* 位置情報 */}
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        <span>緯度: {store.latitude}</span>
                        <span className="mx-2">•</span>
                        <span>経度: {store.longitude}</span>
                      </div>
                    </div>
                  </div>
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
                      <span className="font-medium">{Math.min(startIndex + 1, filteredStores.length)}</span>
                      -
                      <span className="font-medium">{Math.min(endIndex, filteredStores.length)}</span>
                      件目を表示中 (全
                      <span className="font-medium">{filteredStores.length}</span>
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

        {/* 詳細表示モーダル */}
        <Transition appear show={viewDialogOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50"　onClose={() => setViewDialogOpen(false)}>
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
                      店舗詳細
                    </Dialog.Title>

                    {selectedStoreForView && (
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                              <dt className="text-sm font-medium text-gray-500">店舗名</dt>
                              <dd className="mt-1 text-sm text-gray-900">{selectedStoreForView.storeName}</dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-gray-500">緯度</dt>
                              <dd className="mt-1 text-sm text-gray-900">{selectedStoreForView.latitude}</dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-gray-500">経度</dt>
                              <dd className="mt-1 text-sm text-gray-900">{selectedStoreForView.longitude}</dd>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-6 flex justify-end">
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        // onClick={handleCloseViewModal}

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

        {/* 編集モーダル */}
        <Transition appear show={editModalOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={handleCloseEditModal}>
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
                      店舗情報編集
                    </Dialog.Title>

                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2">
                            <dt className="text-sm font-medium text-gray-500">店舗名</dt>
                            <input
                              type="text"
                              value={storeName}
                              onChange={(e) => setStoreName(e.target.value)}
                              className="h-8 px-2 mt-1 border block w-full rounded-md border-gray-300 shadow-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 sm:text-md"
                              placeholder="店舗名を入力"
                            />
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">緯度</dt>
                            <input
                              type="number"
                              step="any"
                              value={latitude}
                              onChange={(e) => setLatitude(e.target.value)}
                              className="h-8 px-2 mt-1 border block w-full rounded-md border-gray-300 shadow-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 sm:text-md"
                              placeholder="緯度を入力"
                            />
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">経度</dt>
                            <input
                              type="number"
                              step="any"
                              value={longitude}
                              onChange={(e) => setLongitude(e.target.value)}
                              className="h-8 px-2 mt-1 border block w-full rounded-md border-gray-300 shadow-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 sm:text-md"
                              placeholder="経度を入力"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        onClick={handleCloseEditModal}
                      >
                        キャンセル
                      </button>
                      <button
                        type="button"
                        onClick={handleUpdate}
                        disabled={actionLoading === selectedStoreForEdit?.id}
                        // className=" justify-center  shadow-sm  
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      
                      
                      >
                        {actionLoading === selectedStoreForEdit?.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          // <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>

                        ) : (
                          <CheckIcon className="h-4 w-4 mr-2" />
                        )}
                        更新
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
          <Dialog as="div" className="relative z-50" onClose={() => setDeleteDialogOpen(false)}>
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
                          店舗を削除
                        </Dialog.Title>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm text-gray-500">
                        この店舗を削除してもよろしいですか？
                      </p>
                      <p className="text-sm text-gray-500">
                        関連する訪問記録も削除されます。この操作は元に戻すことができません。
                      </p>
                      {storeToDelete && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm font-medium text-gray-900">
                            店舗名: {storeToDelete.storeName}
                          </p>
                          <p className="text-sm text-gray-600">
                            位置: {storeToDelete.latitude}, {storeToDelete.longitude}
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
                        className="inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleDeleteConfirm}
                        disabled={actionLoading === storeToDelete?.id}
                      >
                        {actionLoading === storeToDelete?.id ? (
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
    </div>
  );
};

export default StoreTable;