import { Box, Typography, useTheme } from "@mui/material";
import numeral from 'numeral';
import { ICONS } from "../constants";
import { tokens } from "../theme";

const SingleAmountBox = ({ amount, label, icon, progress, increase, prefix }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const textColor = theme.palette.mode === "dark" ? "#ffffff" : "#000000";

  // Format the number into K, M, or B with 2 decimal places
  const formatNumber = (num) => {
    if (num >= 1e9) return `${numeral(num / 1e9).format("0.00")}B`; // Billions
    if (num >= 1e6) return `${numeral(num / 1e6).format("0.00")}M`; // Millions
    if (num >= 1e3) return `${numeral(num / 1e3).format("0.00")}K`; // Thousands
    return num; // Less than 1000
  };

  const RateUpIcon = ICONS["RATE_UP"];
  const RateProgressIcon = ICONS["RATE_PROGRESS"];
  const rateColor = progress > 99 ? colors.greenAccent[400] : colors.grey[400];

  return (
    <Box width="100%" m="0 20px">
      <Box display="flex" justifyContent="flex-start">
        {icon}
        <Box m="0 10px">
          <Typography fontWeight={"light"} fontFamily={"lexend"} variant="h5" sx={{ color: textColor }}>
            {label}
          </Typography>
          <Typography
            fontWeight={"light"} 
            mt="0px"
            variant="h3"
            sx={{ color: colors.grey[100] }}
          >
            {amount ?
              prefix ?
                prefix + formatNumber(amount)
                : formatNumber(amount)
              : amount}
          </Typography>
          <Box mt="0px" display="flex">
            {progress ?
              progress > 99 ?
                <RateUpIcon sx={{ fontSize: "15px", mt: "3px", mr: "3px", color: rateColor }} /> :
                <RateProgressIcon sx={{ fontSize: "15px", mt: "3px", mr: "3px", color: rateColor }} />
              : <RateProgressIcon sx={{ fontSize: "15px", mt: "3px", mr: "3px", color: rateColor }} />}
            <Typography
              fontWeight={"light"}
              fontSize="17px"
              color={rateColor}
            >
              {progress === 0 ? 0 + "%" : progress ? progress + "%" : "Unavailable"}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default SingleAmountBox;
