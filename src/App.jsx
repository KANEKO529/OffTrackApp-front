import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import VisitRecordForm from "./components/tmp/VisitRecordForm";
import StoreTable from "./components/StoresTable";
import VisitRecordTable from "./components/VisitRecordTable";
import { LocationProvider } from "./context/LocationContext";
import VisitRecordForm1 from "./components/visitRecordForm1";
import Navigation from "./components/Navigation";
import { Navigate } from "react-router-dom";
import Example from "./components/tmp/Example"; // 追加: Example コンポーネントのインポート

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = (state) => () => {
    setSidebarOpen(state);
  };

  return (
    <BrowserRouter>
      <LocationProvider>
        <Navigation></Navigation>
        <ToastContainer
          position="top-right"
          autoClose={2000}
          draggable={true}
          hideProgressBar
          closeOnClick
          theme="dark"
          toastClassName="!w-[200px] !min-h-[40px] !mt-2 !p-2 !text-xs rounded-md shadow-md"
          bodyClassName="text-xs leading-tight"
          style={{
            fontSize: '14px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
          toastStyle={{
            backgroundColor: 'white',
            color: '#374151', // text-gray-700
            padding: '0',
            borderRadius: '0.5rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e5e7eb',
            minHeight: '60px',
            maxWidth: '380px',
          }}
          toastOptions={{
            success: {
              iconTheme: {
                primary: '#22c55e', // green-500
                secondary: '#f0fdf4', // green-50
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444', // red-500
                secondary: '#fef2f2', // red-50
              },
            },
          }}
        />
        <Routes>
          <Route path="/test" element={<Example/>} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/visit-record-form" element={<VisitRecordForm />} />
          <Route path="/visit-record-form1" element={<VisitRecordForm1 />} />
          <Route path="/visit-records" element={<VisitRecordTable />} />
          <Route path="/stores" element={<StoreTable />} />
        </Routes>
      </LocationProvider>
    </BrowserRouter>
  );
};

export default App;
