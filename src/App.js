import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./scenes/dashboard";
import Team from "./scenes/team";
import Invoices from "./scenes/invoices";
import Contacts from "./scenes/contacts";
import Bar from "./scenes/bar";
import Form from "./scenes/form";
import Line from "./scenes/line";
import Pie from "./scenes/pie";
import FAQ from "./scenes/faq";
import Geography from "./scenes/geography";

import Calendar from "./scenes/calendar/calendar";
import Login from "./scenes/login"
import PrivateRoutes from "./utils/PrivateRoutes"

function App() {

  // Don't have to do check with server like below because 
  // PrivateRoutes will check using isAuthenticated from AuthContext

  // const navigate = useNavigate();
  // const tokenErrorCodes = ["MISSING_TOKEN", "TOKEN_EXPIRED"];
  // const { token } = useAuth();
  // useEffect(() => {
  //   const apiHome = async () => {
  //     try {
  //       const responseBody = await apiRequestUtility(token, '/home')
  //     } catch (error) {
  //       if (error.httpStatus === 401 && tokenErrorCodes.includes(error.code)) {
  //         navigate('/login');
  //       }
  //     }
  //   }
  //   apiHome();
  // }, []);

  return (
    <Routes>
      {/* Separate the routes because unauthenticated pages shouldn't have Sidebar */}
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />

      {/* Private Routes - outlet is in PrivateRoutes */}
      {/* Outlet is like a placeholder for nested child Route(s) */}
      <Route element={<PrivateRoutes />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/team" element={<Team />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/form" element={<Form />} />
        <Route path="/bar" element={<Bar />} />
        <Route path="/pie" element={<Pie />} />
        <Route path="/line" element={<Line />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/geography" element={<Geography />} />
      </Route>
    </Routes>
  );
}

export default App;
