import React, { useState } from "react";
import { Button, Menu, MenuItem, Typography, Box, Dialog, DialogTitle } from "@mui/material";
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
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false);


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
            onClick={() => setPrivacyDialogOpen(!privacyDialogOpen)} display="flex" sx={{ cursor: 'pointer' }} fontFamily={"lexend"} variant="h5" fontWeight={"regular"}
          >
            Privacy Notice
          </Box>

        </MenuItem>

        {/* <MenuItem onClick={handleClose}>
        <Box
            onClick={() => window.open("https://github.com/basyirGH?tab=repositories", "_blank")} display="flex" sx={{ textDecoration: 'underline', cursor: 'pointer' }} fontFamily={"lexend"} variant="h5" fontWeight={"regular"}
          >
            <img width="30px" src="https://raw.githubusercontent.com/basyirGH/images/main/github-svgrepo-com (3).svg" />

          </Box>
        </MenuItem> */}
      </Menu>
      <Dialog onClose={() => setPrivacyDialogOpen(!privacyDialogOpen)} open={privacyDialogOpen}>
        <DialogTitle><Typography variant="h4"
          fontFamily={"lexend"}
          fontWeight={"light"}>Privacy Notice</Typography></DialogTitle>
        <Typography
          p={3}
          mt="5px"
          variant="h5"
          fontFamily={"lexend"}
          fontWeight={"light"}
        >
          By starting the simulation, you agree that your IP address will be securely stored for an optimized user experience. It will not be shared to third parties, ever.
        </Typography>
      </Dialog>
    </>
  );
};

export default ResponsiveMenu;
