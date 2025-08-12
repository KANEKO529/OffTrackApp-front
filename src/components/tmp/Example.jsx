import { Button, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
// import Link from 'next/link';
import { Link } from 'react-router-dom';
// import { Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Disclosure } from '@headlessui/react';
import React from 'react';      
import { DisclosureButton } from '@headlessui/react';
import { DisclosurePanel } from '@headlessui/react';
import { Transition, TransitionChild } from '@headlessui/react';

import { Description, Field, Fieldset, Input, Label, Legend, Select, Textarea } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'

import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react'
import { useState } from 'react'

import { ToastContainer, toast } from 'react-toastify';

// import { Toaster } from 'react-hot-toast';

// import { toast } from 'react-toastify';￥
import { useForm } from "react-hook-form";

const people = [
  { id: 1, name: 'Durward Reynolds' },
  { id: 2, name: 'Kenton Towne' },
  { id: 3, name: 'Therese Wunsch' },
  { id: 4, name: 'Benedict Kessler' },
  { id: 5, name: 'Katelyn Rohan' },
]

import { CheckIcon } from '@heroicons/react/20/solid'
const NAVBAR_HEIGHT = 50; 

// import dayjs from 'dayjs'

const Example = () => {

  const [selectedPerson, setSelectedPerson] = useState(people[0])
  const [query, setQuery] = useState('')

  const filteredPeople =
    query === ''
      ? people
      : people.filter((person) => {
          return person.name.toLowerCase().includes(query.toLowerCase())
        })

        const notify = () => toast("Wow so easy!");

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitted },
  } = useForm({
    mode: "onSubmit",          // 送信時に検証
    reValidateMode: "onChange" // 送信後は入力変更で再検証
  });

  const onSubmit = (data) => {
    console.log("submit:", data);
  };

  // 成功/エラー表示の条件（送信後のみ反映）
  const ok = (field) =>
    isSubmitted && !errors[field] && String(getValues(field) ?? "").trim().length > 0;
  const ng = (field) => isSubmitted && !!errors[field];

    const [filter, setFilter] = useState({
    period: "custom",
    creator: "",
    keyword: ""
  });

  const [records, setRecords] = useState([
    {
      id: 1,
      storeName: "新宿店",
      date: "2024-01-15",
      creator: "佐藤 美里",
      price: 8500,
      memo: "定期メンテナンスを実施。機器の調子は良好です。"
    },
    {
      id: 2,
      storeName: "銀座本店",
      date: "2024-01-15",
      creator: "佐藤 美里",
      price: 12000,
      memo: "新製品設置。"
    }
  ]);

  const handleExport = () => {
    console.log("Export CSV");
  };

  const handleEdit = (record) => {
    console.log("Edit", record);
  };

  const handleDelete = (id) => {
    setRecords(records.filter((r) => r.id !== id));
  };

  return (
    <>
      <div>
      
        <div className="bg-white shadow-md rounded-md p-4">
          <h2 className="text-lg font-semibold">タイトル</h2>
          <p>本文</p>
        </div>
        <div
          className="p-2 rounded-md shadow-md w-[170px] max-h-[250px] overflow-y-auto bg-white text-black"
        >
          {/* コンテンツ */}
          <p>本文</p>

            <CheckIcon className="size-4" />


        </div>

            <CheckIcon className="invisible size-4 fill-white group-data-selected:visible" />
            <CheckIcon className="invisible size-4 group-data-selected:visible" />

        <button onClick={() => toast.error('更新に失敗しました')}>
          Notify!
        </button>
        {/* <ToastContainer /> */}
          <button onClick={() => toast.success('更新に成功しました')}>
          Notify!!!
        </button>
          <button onClick={() => toast.style('sonota')}>
          Notify!!!
        </button>

    <div className="border-b py-3 flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">aiueko</h3>
        <div className="flex gap-2">
          <button onClick={() => onEdit(record)}>✏️</button>
          <button onClick={() => onDelete(record.id)}>🗑️</button>
        </div>
      </div>
      <div className="text-sm text-gray-500">{record.date}</div>
      <div className="text-sm">
        <span className="mr-2">記録作成者:</span>{record.creator}
      </div>
      <div className="text-blue-600 font-bold">¥{record.price.toLocaleString()}</div>
      <p className="text-sm">{record.memo}</p>
    </div>














        
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* name */}
      <div>
        <label
          htmlFor="name"
          className={clsx(
            "block mb-2 text-sm font-medium",
            ng("name") ? "text-red-700 dark:text-red-500"
                       : ""
          )}
        >
          お名前
        </label>

        <input
          id="name"
          type="text"
          aria-invalid={ng("name") ? "true" : "false"}
          {...register("name", {
            required: "必須入力",
            maxLength: { value: 50, message: "最大50文字です" },
            setValueAs: (v) => (typeof v === "string" ? v.trim() : v),
          })}
          className={clsx(
            "block w-full p-2.5 text-sm rounded-lg focus:ring-2 focus:outline-none dark:bg-gray-700",
            ng("name")
              ? "bg-red-50 border border-red-500 text-red-900 placeholder-red-700 focus:ring-red-500 focus:border-red-500"
              : ""
          )}
          placeholder="山田 太郎"
        />


        {ng("name") && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-500">
            {errors.name.message}
          </p>
        )}
        {/* {ok("name") && (
          <p className="mt-2 text-sm text-green-600 dark:text-green-500">Well done!</p>
        )} */}
      </div>

      {/* email */}
      <div>
        <label
          htmlFor="email"
          className={clsx(
            "block mb-2 text-sm font-medium",
            ng("email") ? "text-red-700 dark:text-red-500"
                        : ok("email") ? "text-green-700 dark:text-green-500" : ""
          )}
        >
          メールアドレス
        </label>

        <input
          id="email"
          type="email"
          aria-invalid={ng("email") ? "true" : "false"}
          {...register("email", {
            required: "必須入力",
            maxLength: { value: 50, message: "最大50文字です" },
            setValueAs: (v) => (typeof v === "string" ? v.trim() : v),
          })}
          className={clsx(
            "block w-full p-2.5 text-sm rounded-lg focus:ring-2 focus:outline-none dark:bg-gray-700",
            ng("email")
              ? "bg-red-50 border border-red-500 text-red-900 placeholder-red-700 focus:ring-red-500 focus:border-red-500 dark:text-red-500 dark:placeholder-red-500 dark:border-red-500"
              : "bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 dark:text-gray-100 dark:border-gray-600"
          )}
          placeholder="example@example.com"
        />

        {ng("email") && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-500">
            {errors.email.message}
          </p>
        )}
        {/* {ok("email") && (
          <p className="mt-2 text-sm text-green-600 dark:text-green-500">Well done!</p>
        )} */}
      </div>



      {/* 送信 */}
      <button
        type="submit"
        className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        送信
      </button>
    </form>



        <div className="w-full max-w-lg px-4">
          <Fieldset className="space-y-6 rounded-xl bg-white/5 p-6 sm:p-10">
            <Legend className="text-base/7 font-semibold text-white">Shipping details</Legend>
            <Field>
              <Label className="text-sm/6 font-medium text-white">Street address</Label>
              <Input
                className={clsx(
                  'mt-3 block w-full rounded-lg border-none bg-white/5 px-3 py-1.5 text-sm/6 text-white',
                  'focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25'
                )}
              />
            </Field>
            <Field>
              <Label className="text-sm/6 font-medium text-white">Country</Label>
              <Description className="text-sm/6 text-white/50">We currently only ship to North America.</Description>
              <div className="relative">
                <Select
                  className={clsx(
                    'mt-3 block w-full appearance-none rounded-lg border-none bg-white/5 px-3 py-1.5 text-sm/6 text-white',
                    'focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25',
                    // Make the text of each option black on Windows
                    '*:text-black'
                  )}
                >
                  <option>Canada</option>
                  <option>Mexico</option>
                  <option>United States</option>
                </Select>
                <ChevronDownIcon
                  className="group pointer-events-none absolute top-2.5 right-2.5 size-4 fill-white/60"
                  aria-hidden="true"
                />
              </div>
            </Field>
            <Field>
              <Label className="text-sm/6 font-medium text-white">Delivery notes</Label>
              <Description className="text-sm/6 text-white/50">
                If you have a tiger, we'd like to know about it.
              </Description>
              <Textarea
                className={clsx(
                  'mt-3 block w-full resize-none rounded-lg border-none bg-white/5 px-3 py-1.5 text-sm/6 text-white',
                  'focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25'
                )}
                rows={3}
              />
            </Field>
          </Fieldset>
        </div>



        <Combobox value={selectedPerson} onChange={setSelectedPerson} onClose={() => setQuery('')}>
          <ComboboxInput
            aria-label="Assignee"
            displayValue={(person) => person?.name}
            onChange={(event) => setQuery(event.target.value)}
          />
          <ComboboxOptions anchor="bottom" className="border empty:invisible">
            {filteredPeople.map((person) => (
              <ComboboxOption key={person.id} value={person} className="data-focus:bg-blue-100">
                {person.name}
              </ComboboxOption>
            ))}
          </ComboboxOptions>
        </Combobox>






        
        <button type="button" className="btn btn-primary">Primary</button>

        <button
          type="button"
          className="rounded bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 transition"
        >
          Primary1
        </button>

        <h1 className="text-3xl font-bold underline mt-4">
          Hello world!
        </h1>
      </div>

      <Button className="rounded bg-white px-4 py-2 text-sm text-black data-active:bg-sky-700 data-hover:bg-sky-500">
        Save changes
      </Button>

      <Button className="rounded-lg bg-white px-4 py-2 text-sm text-black hover:bg-sky-500 active:bg-sky-700">
        Save changes1
      </Button>

      <div className="relative inline-block text-left mt-6 ml-4">
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <MenuButton className="inline-flex justify-center w-full rounded-md bg-gray-800 text-white px-4 py-2 text-sm font-medium hover:bg-gray-700">
              My account
            </MenuButton>
          </div>

          <MenuItems className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none z-10">
            <div className="py-1">
              <MenuItem>
                {({ active }) => (
                  <a
                    href="/settings"
                    className={`block px-4 py-2 text-sm ${
                      active ? 'bg-blue-100 text-blue-900' : 'text-gray-700'
                    }`}
                  >
                    Settings
                  </a>
                )}
              </MenuItem>
              <MenuItem>
                {({ active }) => (
                  <a
                    href="/support"
                    className={`block px-4 py-2 text-sm ${
                      active ? 'bg-blue-100 text-blue-900' : 'text-gray-700'
                    }`}
                  >
                    Support
                  </a>
                )}
              </MenuItem>
              <MenuItem>
                {({ active }) => (
                  <a
                    href="/license"
                    className={`block px-4 py-2 text-sm ${
                      active ? 'bg-blue-100 text-blue-900' : 'text-gray-700'
                    }`}
                  >
                    License
                  </a>
                )}
              </MenuItem>
            </div>
          </MenuItems>
        </Menu>
      </div>
    </>
  );
};

export default Example;
