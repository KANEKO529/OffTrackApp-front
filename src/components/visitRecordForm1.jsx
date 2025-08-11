import React, { useState, useEffect, useContext } from "react";
import { createVisitRecordFromForm, deleteVisitRecords } from "../api/visitRecord";
import { LocationContext } from "../context/LocationContext";
import { fetchStoresNearby, createNewStore, fetchAllStores } from "../api/store";
import { fetchUsers } from "../api/user";
import { fillOutInSpreadSheets } from "../api/spreadsheets";
import { fetchStoresByQuery } from "../api/store";

import { Button, Description, Field, Fieldset, Input, Label, Legend, Select, Textarea } from '@headlessui/react'
import clsx from 'clsx'

import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid'

import { toast } from 'react-toastify';

import { createNewStoreSuccessFlag } from "../api/store";
import { createVisitRecordSuccessFlag } from "../api/visitRecord";

import { deleteStore } from "../api/store";
import { useForm} from "react-hook-form";


const SPECIAL_USER = "はるひこ";

const VisitRecordForm1 = () => {
  const location = useContext(LocationContext);

  const [nearbyStores, setNearbyStores] = useState([]);
  const [isCustomStore, setIsCustomStore] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [storeOptions, setStoreOptions] = useState([]);  // 店舗の検索結果

  const [inputValue, setInputValue] = useState("");      // 検索の入力値

  const [isSearching, setIsSearching] = useState(false); // 検索中フラグ

  const today = new Date().toISOString();

    /** 近くの店舗を取得 */
  const getStoresNearby = async () => {
    try {
      if (location.lat && location.lng) {
        const data = await fetchStoresNearby(location.lat, location.lng);
        setNearbyStores(data);
        console.log("近くの店舗：", data);
      }
    } catch (error) {
      console.log("近くの店舗の取得に失敗しました", error);
    }
  };

  let options = []; // カスタマイズした検索店舗情報　ドロップダウン表示用

  if (inputValue.length > 0) {
    options = storeOptions.map((store) => ({
        key: `${store.storeName}-${store.latitude}-${store.longitude}`, // 一意のキー
        label: store.storeName,
        store_name: store.storeName,
        latitude: store.latitude,
        longitude: store.longitude,
      }))
  } else {
    // inputValueが空の場合はnearbyStoresから取得.近くの店舗を表示
    options = nearbyStores.map((store) => ({
      key: `${store.storeName}-${store.latitude}-${store.longitude}`,
      label: `${store.storeName} (${(store.distance ?? 0).toFixed(1)}km)`,
      store_name: store.storeName,
      latitude: store.latitude,
      longitude: store.longitude,
    }))
  }
  
    // console.log("近くの店舗１：", options)
    // console.log("検索店舗：", storeOptions)
    // console.log("サーチ：", isSearching)

  useEffect(() => {
    if (inputValue.length > 0) {
      setIsSearching(true);
      setNearbyStores([]); // 🔥 検索時は nearbyStores をクリア

      const timeout = setTimeout(async () => {
        try {
          const stores = await fetchStoresByQuery(inputValue);
          setStoreOptions(stores);
        } catch (error) {
          console.error("店舗データの取得に失敗しました", error);
        } finally {
          setIsSearching(false);
        }
      }, 200);

      return () => clearTimeout(timeout);
    } else {
      setStoreOptions([]);
      getStoresNearby(); // 🔥 検索がクリアされたら nearbyStores を再取得
    }
  }, [inputValue]);

  useEffect(() => {

    const getUsersData = async () => {
      try {
        setLoading(true);
        const data = await fetchUsers();
        setUsers(data);
      } catch (error) {
        console.error("ユーザデータの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    getUsersData();
  }, []);

  useEffect(() => {

  }, [location]);

  useEffect(() => {
    getStoresNearby();
  }, [location]);

  const handleChange = (event) => {
  };

  const handleSubmitVisitRecord = async (data) => {

    let newStoreId = null;
    let newVisitRecordId = null;

    const payload = {
      date: today,
      userName: data.userName,
      storeName: data.storeName,
      latitude: data.latitude,
      longitude: data.longitude,
      price: data.price,
      memo: data.memo,
    };

    try {
      // 1. 新規店舗をDBに登録（必要であれば）
      if (isCustomStore) {

        try {
          newStoreId = await createNewStore({
            store_name: payload.storeName,
            latitude: payload.latitude,
            longitude: payload.longitude,
          });

          // toast.success("新規店舗を保存しました");

        }catch (error) {
          // toast.error("店舗の新規作成に失敗しました")
          throw new Error(`訪問記録保存処理で失敗: ${error.message}`);
        }

      }

    console.log("payload2:", payload);


      // 2. 訪問記録をDBに保存
      try {
        newVisitRecordId = await createVisitRecordFromForm(payload);

        // 成功トーストを表示
        // toast.success("訪問記録を保存しました");

      }catch (error) {
        // toast.error("訪問記録の保存に失敗しました");

        throw new Error(`訪問記録保存処理で失敗: ${error.message}`);
      }



      // 3. 特定ユーザーならスプレッドシートに保存
      if (payload.userName === SPECIAL_USER) {
        try {
          await fillOutInSpreadSheets(payload);
          // toast.success("仕入れ台帳に保存しました");
        } catch (error) {
          // toast.error("スプレッドシート保存に失敗しました");

          throw new Error(`スプレッドシート保存処理で失敗: ${error.message}`);
        }
      }

      //dataリセット
      reset({
        storeName: "",
        latitude: "",
        longitude: "",
        memo: "",
        price: "",
      })

      setSelected("")

      if(isCustomStore){
        toast.success("新店舗を保存しました");
      }
      toast.success("訪問記録を保存しました");



    } catch (throwError) {

      // 1.- 2.成功 3.失敗    ＝>2の取り消し
      // 1.成功 2.成功 3.失敗  =>1, 2,の取り消し
      // 1.成功 2.失敗 3.-    => 1の取り消し
      // 1.失敗 2.-   3.-　x
      console.log("createNewStoreSuccessFlag:", createNewStoreSuccessFlag)
      console.log("createVisitRecordSuccessFlag:", createVisitRecordSuccessFlag)

      if(createNewStoreSuccessFlag){
        deleteStore(newStoreId); // 
      }

      if(createVisitRecordSuccessFlag){
        deleteVisitRecords(newVisitRecordId); // 
      }


      console.error("送信エラー:", throwError.message);
      toast.error("訪問記録の送信に失敗しました");
    }
  };

  const [selected, setSelected] = useState('')

  // 成功/エラー表示の条件（送信後のみ反映）
  // const ok = (field) => isSubmitted && !errors[field] && String(getValues(field) ?? "").trim().length > 0;
  const ng = (field) => isSubmitted && !!errors[field];

  const {
    register,
    handleSubmit : rhfHandleSubmit,
    getValues,
    setValue,
    formState: { errors, isSubmitted },
    reset
  } = useForm({
    mode: "onSubmit",          // 送信時に検証
    reValidateMode: "onChange" // 送信後は入力変更で再検証
  });

  return (
    
      <div className="w-full max-w-lg mx-auto px-4">
        <h1 className="pt-4 text-xl font-semibold text-white text-center mb-6">
          訪問記録フォーム
        </h1>

        <Fieldset className="space-y-6 rounded-xl bg-white/5 p-5 sm:p-10">
            <form onSubmit={rhfHandleSubmit(handleSubmitVisitRecord)} className="flex flex-col gap-2">
              {/* フォームの中身 */}
              <Field>
                <div className="relative">
                  <Select
                    id="userName"
                    aria-invalid={ng("userName") ? "true" : "false"}
                    {...register("userName", {
                      required: "必須選択",
                      setValueAs: (v) => (typeof v === "string" ? v.trim() : v),
                    })}
                    className={clsx(
                      "mt-3 block w-full rounded-lg px-3 py-1.5 text-md appearance-none bg-white/5 text-white",
                      "focus:outline-none focus:ring-2 focus:ring-white/25",
                      "*:text-black",
                      ng("userName")
                        ? "border border-red-500  placeholder-red-700 focus:ring-red-500 focus:border-red-500"
                        : "border-none"
                    )}

                  >
                    <option value="">
                      <em>記録者を選択</em>
                    </option>
                    {users.map((user) => (
                      <option key={user.nickname} value={user.nickname}>
                        {user.nickname}
                      </option>
                    ))}
                  </Select>


                  <ChevronDownIcon
                      className="group pointer-events-none absolute top-2.5 right-2.5 size-4 fill-white/60"
                      aria-hidden="true"
                  />
                </div>
                {ng("userName") && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                    {errors.userName.message}
                  </p>
                )}

              </Field>

              {/* 店名選択 or 新規登録 */}
              {!isCustomStore ? (
                <Field>
                    <Combobox 
                      name="storeName"

                      value={selected} // 選択された値を保持
                      onChange={(value) => {

                        setSelected(value);

                        if (typeof value === 'string') {
                          setInputValue(value); // 入力欄も選択値に更新
                        } else if (value) {
                          setInputValue(value.store_name); // 入力欄も選択値に更新
                        }
                      }}
                      onClose={() => setInputValue('')}
                    >
                      <Label className="text-sm font-medium text-white">訪問先店舗</Label>

                      <div className="relative">

                        <ComboboxInput
                          id="storeName"
                          aria-invalid={ng("storeName") ? "true" : "false"}
                          {...register("storeName", {
                            required: "必須入力",
                            setValueAs: (v) => (typeof v === "string" ? v.trim() : v),
                          })}
                          className={clsx(
                            "mt-3 block w-full rounded-lg px-3 py-1.5 text-md appearance-none bg-white/5 text-white",
                            "focus:outline-none focus:ring-2 focus:ring-white/25",
                            "*:text-black",
                            ng("storeName")
                              ? "border border-red-500  placeholder-gray focus:ring-red-500 focus:border-red-500"
                              : "border-none"
                          )}
                          displayValue={(option) =>
                            typeof option === 'string' ? option : option?.store_name || ''
                          }
                          onChange={(e) => {
                            setInputValue(e.target.value);
                          }}
                          autoComplete="off"
                        />

                          <ComboboxButton className="bg-white/5 absolute right-2 top-1/2 -translate-y-1/2 p-1 flex items-center justify-center hover:bg-green-800">
                            <ChevronDownIcon
                              className="size-4 fill-white/60 pointer-events-none"
                              aria-hidden="true"
                            />
                          </ComboboxButton>
                      </div>

                      {ng("storeName") && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                          {errors.storeName.message}
                        </p>
                      )}

                      <ComboboxOptions
                        anchor="bottom"
                        transition
                        className={clsx(
                          'w-[250px] h-[150px] rounded-xl border border-white/5 bg-gray-900 p-1 [--anchor-gap:--spacing(1)] empty:invisible z-50',
                          'transition duration-100 ease-in data-leave:data-closed:opacity-0'
                        )}
                      >
                        {options.map((option) => (
                          <ComboboxOption
                            key={option.id}
                            value={option}
                            className="border-b border-dashed border-gray-800 group flex cursor-default items-center gap-2 rounded-lg px-0 py-1.5 select-none data-focus:bg-white/100 hover:bg-green-800"
                          >
                            <CheckIcon className="invisible size-4 group-data-selected:visible" />
                            
                            <div className="text-sm/6 text-white">{option.label}</div>
                          </ComboboxOption>
                        ))}
                      </ComboboxOptions>
                    </Combobox>

                    <Button
                      className="mt-4 focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                      onClick={() => setIsCustomStore(true)}
                    >
                      新しい店舗で登録
                    </Button>
                    
                </Field>
              ) : (
                <div>
                  <Field>
                    <div className="my-2 min-w-[120px]">
                      <Label htmlFor="storeName" className="block text-sm font-medium text-white mb-1">
                        新しい店舗名
                      </Label>
                      <Input
                        type="text"
                        id="storeName"
                        name="storeName"
                        onChange={handleChange}
                        aria-invalid={ng("storeName") ? "true" : "false"}
                        {...register("storeName", {
                          required: "必須入力",
                          setValueAs: (v) => (typeof v === "string" ? v.trim() : v),
                        })}
                        className={clsx(
                          "mt-3 block w-full rounded-lg px-3 py-1.5 text-md appearance-none bg-white/5 text-white",
                          "focus:outline-none focus:ring-2 focus:ring-white/25",
                          "*:text-black",
                          ng("storeName")
                            ? "border border-red-500  placeholder-gray focus:ring-red-500 focus:border-red-500"
                            : "border-none"
                        )}
                        placeholder="店舗名を入力"
                      />
                    </div>
                    {ng("storeName") && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                        {errors.storeName.message}
                      </p>
                    )}
                  </Field>
                  
                  <Field>

                    {/* 緯度入力フィールド */}
                    <div className="my-2 min-w-[120px]">
                      <Label htmlFor="latitude" className="block text-sm font-medium text-white mb-1">
                        緯度
                      </Label>
                      <Input
                        type="number"
                        id="latitude"
                        name="latitude"
                        onChange={handleChange}
                        step="any"
                        aria-invalid={ng("latitude") ? "true" : "false"}
                        {...register("latitude", {
                          required: "必須入力",
                          setValueAs: (v) => (typeof v === "string" ? v.trim() : v),
                        })}
                        className={clsx(
                          "mt-3 block w-full rounded-lg px-3 py-1.5 text-md appearance-none bg-white/5 text-white",
                          "focus:outline-none focus:ring-2 focus:ring-white/25",
                          "*:text-black",
                          ng("latitude")
                            ? "border border-red-500  placeholder-gray focus:ring-red-500 focus:border-red-500"
                            : "border-none"
                        )}
                        placeholder="緯度を入力"
                      />
                    </div>
                    {ng("latitude") && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                        {errors.latitude.message}
                      </p>
                    )}
                  </Field>

                  <Field>
                    {/* 経度入力フィールド */}
                    <div className="my-2 min-w-[120px]">
                      <Label htmlFor="longitude" className="block text-sm font-medium text-white mb-1">
                        経度
                      </Label>
                      <Input
                        type="number"
                        id="longitude"
                        name="longitude"
                        onChange={handleChange}
                        step="any"
                        aria-invalid={ng("longitude") ? "true" : "false"}
                        {...register("longitude", {
                          required: "必須入力",
                          setValueAs: (v) => (typeof v === "string" ? v.trim() : v),
                        })}
                        className={clsx(
                          "mt-3 block w-full rounded-lg px-3 py-1.5 text-md appearance-none bg-white/5 text-white",
                          "focus:outline-none focus:ring-2 focus:ring-white/25",
                          "*:text-black",
                          ng("longitude")
                            ? "border border-red-500  placeholder-gray focus:ring-red-500 focus:border-red-500"
                            : "border-none"
                        )}
                        placeholder="経度を入力"
                      />
                    </div>
                    {ng("longitude") && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                        {errors.longitude.message}
                      </p>
                    )}
                  </Field>

                  <Field>
                    {/* ボタンエリア */}
                    <div className="flex justify-between gap-2 mt-4">
                      <Button
                        type="button"
                        onClick={() => setIsCustomStore(false)}
                        className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                      >
                        既存店舗の選択
                      </Button>

                      <Button
                        type="button"
                        onClick={() => {
                          setValue("latitude", location.lat);
                          setValue("longitude", location.lng);
                        }}
                        className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                      >
                        現在地自動入力
                      </Button>
                    </div>
                  </Field>
                </div>
                

              )}

              <Field>
                <Label className="text-sm font-medium text-white">仕入れ金額</Label>
                <Input
                  type="number"
                  name="price"
                  id="price"
                  {...register("price", {
                    setValueAs: (v) => (typeof v === "string" ? v.trim() : v),
                    max: {
                      value: 2147483647,
                      message: "値が大きすぎます"
                    },
                  })}
                  onChange={handleChange}
                  className={clsx(
                    'mt-3 block w-full rounded-lg border-none bg-white/5 px-3 py-1.5 text-md text-white',
                    'focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25'
                  )}
                />
                {ng("price") && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                    {errors.price.message}
                  </p>
                )}
              </Field>

              <Field>
                <Label className="text-sm/6 font-medium text-white">メモ</Label>

                <Textarea
                  name="memo"
                  id="memo"
                  {...register("memo", {
                    // required: "必須入力",
                    setValueAs: (v) => (typeof v === "string" ? v.trim() : v),
                  })}
                  onChange={handleChange}
                  className={clsx(
                    'mt-3 block w-full resize-none rounded-lg border-none bg-white/5 px-3 py-1.5 text-md text-white',
                    'focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25'
                  )}
                  rows={3}
                />
              </Field>

              <Button
                type="submit"
                className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
              >
                記録を保存
              </Button>
          </form>
        </Fieldset>
    </div>
  );
};

export default VisitRecordForm1;
