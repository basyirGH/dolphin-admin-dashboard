import { Typography, Box, useTheme } from "@mui/material";
import { tokens } from "../theme";

const Header = ({ title, subtitle }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <Box mb="5px">
      <Typography
        variant="h4"
        color={colors.primary}
        //fontWeight="bold"
        sx={{ m: "0 0 5px 0" }}
      >
        {title}
      </Typography>
      <Typography variant="h5" color={colors.grey[200]}>
        {subtitle}
      </Typography>
    </Box>
  );
};

export default Header;
