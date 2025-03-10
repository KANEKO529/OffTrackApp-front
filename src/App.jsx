import Example from "./components/tmp/Example";
import { BrowserRouter, Routes, Route} from 'react-router-dom';
import Dashboard from "./components/Dashboard";
import VisitRecordForm from "./components/VisitRecordForm";
import StoreTable from "./components/StoresTable";
import VisitRecordTable from "./components/VisitRecordTable";
import { LocationProvider } from "./context/LocationContext";

const App = () => {

    return (
        <LocationProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/example" element={<Example />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/visit-record-form" element={<VisitRecordForm />} />
                    <Route path="/visit-records" element={<VisitRecordTable />} />
                    <Route path="/stores" element={<StoreTable />} />
                
                </Routes>
            </BrowserRouter>
        </LocationProvider>

    );
};

export default App;
