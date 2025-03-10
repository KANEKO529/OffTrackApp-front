import VisitMap from "./VisitMap";
import VisitRecordTable from "./VisitRecordTable";
import { Link } from 'react-router-dom';
// import { LocationProvider } from "./context/LocationContext";

const Dashboard = () => {

    return (
      <>
        <div>
          <h1>OffTrackApp</h1>
          <Link to="/visit-record-form">訪問記録フォーム</Link>
          <Link to="/visit-records">訪問記録データ</Link>
          <Link to="/stores">店舗データ</Link>
          <VisitMap></VisitMap>
        </div>
      </>
    );
  };
  
  export default Dashboard;
  