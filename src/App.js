import { Route, Routes } from "react-router-dom";

import Login from "./scenes/login";
import Main from "./scenes/main";
import PrivateRoutes from "./utils/PrivateRoutes";

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
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />

      {/* Private Routes - outlet is in PrivateRoutes */}
      {/* Outlet is like a placeholder for nested child Route(s) */}
      {/* Auth is done internally and automatically */}
      <Route element={<PrivateRoutes />}>
        <Route path="/" element={<Main />} />
      </Route>
    </Routes>
  );
}

export default App;
