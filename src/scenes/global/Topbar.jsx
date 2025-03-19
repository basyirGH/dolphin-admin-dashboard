import { Box, Chip, Dialog, DialogTitle, IconButton, Typography, useMediaQuery, useTheme } from "@mui/material";
import ResponsiveMenu from "../../components/ResponsiveMenu";
import "./title.css";
import { useState } from "react";

const Topbar = () => {
  const theme = useTheme();
  const textColor = theme.palette.mode === "dark" ? "#ffffff" : "#000000";
  const isSmallScreen = useMediaQuery("(max-width:700px)"); // Adjust breakpoint as needed
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false);

  return (
    <Box m="15px 15px 0px 15px" display="flex" justifyContent="space-between" >
      <Box>
        {/* <img width={"30px"} src="https://www.svgrepo.com/show/400173/dolphin.svg" /> */}
        <Box display={"flex"} flexDirection={"column"}>
          <Box mb="3px" display={"flex"} flexDirection={"row"}>

            <Typography
              fontFamily={"lexend"}
              fontWeight={"bold"}
              variant={"h3"}
            >
              Dolphin
            </Typography>
            {/* <Typography mt="7px" mb="5px" pl="7px" pr="7px" sx={{ borderRadius: '0px', color: 'black', backgroundColor: 'white' }} ml="10px" fontSize="10px" fontFamily={"lexend"}> PROTOTYPE</Typography> */}
            <Chip sx={{ height: '20px', ml: '5px', mt: '5px', fontFamily: 'lexend' }} label="PROTOTYPE" />
            {/* <Typography fontFamily={"lexend"} fontSize="12px">
            {"software engineer | beyond the resume"}
          </Typography> */}
          </Box>
          <Typography fontFamily={"lexend"} variant={"h6"} fontWeight={"light"}>
            Real-Time Analytics for e-Commerce with Simulation and AI Text-To-SQL Tool
          </Typography>
        </Box>
      </Box>
      {isSmallScreen ? <ResponsiveMenu /> :
        <Box gap="10px" display="flex">
          <Box
            onClick={() => setPrivacyDialogOpen(!privacyDialogOpen)} display="flex" sx={{ cursor: 'pointer' }} fontFamily={"lexend"} variant="h5" fontWeight={"regular"}
          >
            Privacy Notice
          </Box>
          <Dialog onClose={()=>setPrivacyDialogOpen(!privacyDialogOpen)} open={privacyDialogOpen}>
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
              By starting the simulation, you agree that your IP address will be securely stored for a limited time so that you can get an optimized user experience. It will not be shared to third parties, ever.
            </Typography>
          </Dialog>
          {/* <Box
            onClick={() => window.open("https://www.linkedin.com/in/mohamad-basyir-bin-zainuddin-0b411220b/", "_blank")} display="flex" sx={{ textDecoration: 'underline', cursor: 'pointer' }} fontFamily={"lexend"} variant="h5" fontWeight={"regular"}
          >
            <img width="30px" src="https://raw.githubusercontent.com/basyirGH/images/main/linkedin-svgrepo-com.svg" />

          </Box>
          <Box
            onClick={() => window.open("https://github.com/basyirGH?tab=repositories", "_blank")} display="flex" sx={{ textDecoration: 'underline', cursor: 'pointer' }} fontFamily={"lexend"} variant="h5" fontWeight={"regular"}
          >
            <img width="30px" src="https://raw.githubusercontent.com/basyirGH/images/main/github-svgrepo-com (3).svg" />

          </Box> */}
        </Box>
      }
    </Box>
  );
};

export default Topbar;
