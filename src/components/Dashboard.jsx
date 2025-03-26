import VisitMap from "./VisitMap";
import VisitRecordTable from "./VisitRecordTable";
import { Link } from 'react-router-dom';
// import { LocationProvider } from "./context/LocationContext";
import Sidebar from "./tmp/Sidebar";
import { Typography } from "@mui/material";

const Dashboard = () => {

    return (
      <>
        <div>
          <VisitMap></VisitMap>
        </div>
      </>
    );
  };
  
  export default Dashboard;
  