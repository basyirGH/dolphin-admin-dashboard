import { Box, Typography } from "@mui/material";


const Footer = () => {

    return (
        <Box pt="80px" backgroundColor="black" textAlign={"center"} >
            <Typography fontFamily={"lexend"} variant="h6" fontWeight={"light"}>
                © 2025 Mohamad Basyir bin Zainuddin
            </Typography>

            <Box align={"center"}>
                <Typography fontFamily={"lexend"} variant="h6" mt="0px" fontWeight={"light"}>
                    {/* "MyEnergyStats" logo, Copyright Energy Commission 2024 © <br />
                    "QuicKredit" logo, © 2023 QuicKredit (a product of ManagePay Resources Sdn. Bhd)<br /> */}
                    AI art prompt by Mac Baconai
                </Typography>
                <br/><br/>
            </Box>
        </Box>
    )
}

export default Footer;