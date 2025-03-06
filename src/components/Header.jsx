import { Typography, Box, useTheme } from "@mui/material";
import { tokens } from "../theme";

const Header = ({ title, subtitle }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <Box display="flex" mb="0px">
      <Typography
        variant="h4"
        color={colors.primary}
        //fontWeight="bold"
        sx={{ m: "4px 3px 10px 0" }}
      >
        {title}
      </Typography>
      {/* <Typography mt="2px" ml="5px" fontSize={"10px"}>
        {subtitle}
      </Typography> */}
    </Box>
  );
};

export default Header;
