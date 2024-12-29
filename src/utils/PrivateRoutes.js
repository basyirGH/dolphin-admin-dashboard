import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import Topbar from "../scenes/global/Topbar"
import Sidebar from "../scenes/global/Sidebar";
import { useState } from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "../theme"

const PrivateRoutes = () => {
    const { isAuthenticated } = useAuth();
    const [isSidebar, setIsSidebar] = useState(true);   
    const [theme, colorMode] = useMode();

    return isAuthenticated ?
        (
            //Outlet must be together with Sidebar, CssBaseline, ThemeProvider and ColorModeContext.Provider for the child route components to appear
            <ColorModeContext.Provider value={colorMode}>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <div className="app">
                        <Sidebar isSidebar={isSidebar} />
                        <main className="content">
                            <Topbar setIsSidebar={setIsSidebar} />
                            {/* outlet is like a placeholder for nested child Route(s) */}
                            <Outlet />
                        </main>
                    </div>
                </ThemeProvider>
            </ColorModeContext.Provider>
        )
        : <Navigate to="/login" />;
};
export default PrivateRoutes;