import React, { useState } from "react";
import { Button, Menu, MenuItem, Typography, Box } from "@mui/material";
import { ICONS } from "../constants";


const ResponsiveMenu = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  //if (!isSmallScreen) return null; // Hide the button on larger screens
  const MenuIcon = ICONS.MENU;

  return (
    <>
      <Button
        color="inherit"
        id="basic-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      >
        <MenuIcon />
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <MenuItem onClick={handleClose}>
          <Box
            onClick={() => window.open("https://www.linkedin.com/in/mohamad-basyir-bin-zainuddin-0b411220b/", "_blank")} display="flex" sx={{ textDecoration: 'underline', cursor: 'pointer' }} fontFamily={"lexend"} variant="h5" fontWeight={"regular"}
          >
            <img width="30px" src="https://raw.githubusercontent.com/basyirGH/images/main/linkedin-svgrepo-com.svg" />

          </Box>
        </MenuItem>

        <MenuItem onClick={handleClose}>
        <Box
            onClick={() => window.open("https://github.com/basyirGH?tab=repositories", "_blank")} display="flex" sx={{ textDecoration: 'underline', cursor: 'pointer' }} fontFamily={"lexend"} variant="h5" fontWeight={"regular"}
          >
            <img width="30px" src="https://raw.githubusercontent.com/basyirGH/images/main/github-svgrepo-com (3).svg" />

          </Box>
        </MenuItem>
      </Menu>
    </>
  );
};

export default ResponsiveMenu;
