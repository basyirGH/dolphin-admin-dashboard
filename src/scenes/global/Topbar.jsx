import { Box, IconButton, Typography, useMediaQuery, useTheme } from "@mui/material";
import ResponsiveMenu from "../../components/ResponsiveMenu";
import "./title.css";

const Topbar = () => {
  const theme = useTheme();
  const textColor = theme.palette.mode === "dark" ? "#ffffff" : "#000000";
  const isSmallScreen = useMediaQuery("(max-width:500px)"); // Adjust breakpoint as needed


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
            <Typography mt="6px" mb="6px" pl="7px" pr="7px" sx={{ borderRadius: '0px', color: 'black', backgroundColor: 'white' }} ml="10px" fontSize="10px" fontFamily={"lexend"}> BETA</Typography>
            {/* <Typography fontFamily={"lexend"} fontSize="12px">
            {"software engineer | beyond the resume"}
          </Typography> */}
          </Box>
          <Typography fontFamily={"lexend"} variant={"h6"} fontWeight={"light"}>
            Simple, Live Analytics e-Commerce Dashboard
          </Typography>
        </Box>
      </Box>
      {isSmallScreen ? <ResponsiveMenu /> :
        <Box gap="10px" display="flex">
          <Box
            onClick={() => window.open("https://www.linkedin.com/in/mohamad-basyir-bin-zainuddin-0b411220b/", "_blank")} display="flex" sx={{ textDecoration: 'underline', cursor: 'pointer' }} fontFamily={"lexend"} variant="h5" fontWeight={"regular"}
          >
            <img width="30px" src="https://raw.githubusercontent.com/basyirGH/images/main/linkedin-svgrepo-com.svg" />

          </Box>
          <Box
            onClick={() => window.open("https://github.com/basyirGH?tab=repositories", "_blank")} display="flex" sx={{ textDecoration: 'underline', cursor: 'pointer' }} fontFamily={"lexend"} variant="h5" fontWeight={"regular"}
          >
            <img width="30px" src="https://raw.githubusercontent.com/basyirGH/images/main/github-svgrepo-com (3).svg" />

          </Box>
        </Box>
      }
    </Box>
  );
};

export default Topbar;
