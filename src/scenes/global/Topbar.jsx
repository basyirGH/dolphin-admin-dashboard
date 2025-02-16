import { GitHub } from "@mui/icons-material";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { useContext } from "react";
import { ColorModeContext, tokens } from "../../theme";
import "./title.css";
import { Logout } from "@mui/icons-material";
import { Code } from "@mui/icons-material";
import { useAuth } from "../../utils/AuthContext";


const Topbar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const {logout} = useAuth();

  return (
    <Box display="flex" justifyContent="space-between" p={2}>
      {/* SEARCH BAR */}
      {/* <Box
        display="flex"
        backgroundColor={colors.primary[400]}
        borderRadius="3px"
      >
        <InputBase sx={{ ml: 2, flex: 1 }} placeholder="Search" />
        <IconButton type="button" sx={{ p: 1 }}>
          <SearchIcon />
        </IconButton>
      </Box> */}
      <Box display={"flex"}>
        <img width={"30px"} src="https://www.svgrepo.com/show/400173/dolphin.svg"/>
        <Typography
          marginLeft={"5px"}
          marginTop={"5px"}
          fontWeight={"bold"}
          variant={"h3"}>
          Dolphin
        </Typography>
      </Box>

      {/* ICONS */}
      <Box display="flex">
        {/* <IconButton>
          <span>Experience</span>
        </IconButton>*/}
        {/* <Typography  variant="h5">
          System Design
        </Typography>
        <Typography variant="h5">
          About
        </Typography> */}
        <IconButton>
          <Typography>System Design</Typography>
        </IconButton>
        <IconButton>
          <Typography>About</Typography>
        </IconButton>
        {/* <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "dark" ? (
            <DarkModeOutlinedIcon />
          ) : (
            <LightModeOutlinedIcon />
          )}
        </IconButton> */}
        {/* <IconButton onClick={logout}>
          <Logout />
        </IconButton> */}
        {/* <IconButton>
          <NotificationsOutlinedIcon />
        </IconButton>
        <IconButton>
          <SettingsOutlinedIcon />
        </IconButton>
        <IconButton>
          <PersonOutlinedIcon />
        </IconButton> */}
      </Box>
    </Box>
  );
};

export default Topbar;
