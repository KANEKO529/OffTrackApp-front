import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Sidebar from "./components/tmp/Sidebar";
// import Header from "./components/tmp/Header";
import Dashboard from "./components/Dashboard";
import VisitRecordForm from "./components/tmp/VisitRecordForm";
import StoreTable from "./components/StoresTable";
import VisitRecordTable from "./components/VisitRecordTable";
import { LocationProvider } from "./context/LocationContext";
import VisitRecordForm1 from "./components/visitRecordForm1";
import { Box } from "@mui/material";
import Navigation from "./components/Navigation";
import { Navigate } from "react-router-dom";
import Example from "./components/tmp/Example"; // 追加: Example コンポーネントのインポート

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = (state) => () => {
    setSidebarOpen(state);
  };

  return (
    <BrowserRouter>
      <LocationProvider>
        <Navigation></Navigation>
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
