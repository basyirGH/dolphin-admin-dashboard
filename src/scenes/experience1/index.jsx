import { Box, Button, Link, Typography } from "@mui/material";
import { useState } from "react";
import { ICONS } from "../../constants";
import '@fontsource/lexend/500.css';

const Energy = () => {
    const NewTabIcon = ICONS.NEW_TAB;
    const imgTurn = Math.floor(Math.random() * 5) + 1;

    return (
        <Box m="60px 20px 40px 20px">
            <Box
                display="grid"
                gridTemplateColumns={{
                    xs: "repeat(1, 1fr)",
                    sm: "repeat(1, 1fr)",
                    md: "repeat(2, 1fr)",
                    lg: "repeat(2, 1fr)",
                }}

                gap="20px"
            >
                <Box mt="20px" display="flex" flexDirection={"column"} justifyContent={"center"} >
                    <Typography mt="20px" fontFamily={"lexend"} variant="h4" fontWeight={"regular"}>Past Public Projects</Typography>
                    <Typography mt="30px" mb="30px" fontFamily={"lexend"} variant="h5" fontWeight={"regular"}>
                        Thank you for checking out my prototype/page!<br />
                        My name is Mohamad Basyir.
                        A majority of my experience is web development with Java, including five real-world projects across
                        Energy and Fintech sectors spanning 1.5 years.
                        Award-winning 2023 Bachelor of Computer Science graduate from UMT with Distinction.
                        You can find me through the links below, or email me at basyirzainuddin@gmail.com
                        <br />
                        <Box display="flex">
                            <Box
                                mt="10px"
                                mr="10px"
                                onClick={() => window.open("https://www.linkedin.com/in/mohamad-basyir-bin-zainuddin-0b411220b/", "_blank")} sx={{ cursor: "pointer" }} display="flex">
                                <img width="25px" src="https://www.svgrepo.com/show/494176/linkedin.svg" />
                            </Box>
                            <Box
                                mt="10px"
                                onClick={() => window.open("https://github.com/basyirGH?tab=repositories", "_blank")} sx={{ cursor: "pointer" }} display="flex">
                                <img width="30px" src="https://www.svgrepo.com/show/438592/github-square.svg" />
                            </Box>
                        </Box>
                    </Typography>
                </Box>
                <Box gridColumn="span 1" gridRow="span 1">

                    <Box textAlign={"center"}>
                        {/* <img alt="retro and vibrant decorative sci-fi image" width="100%" src={`https://raw.githubusercontent.com/basyirGH/images/main/${imgTurn === 3 ? 2 : imgTurn}.jpg`} /> */}
                        <img alt="companies logos and screenshot image" width="100%" src={`https://raw.githubusercontent.com/basyirGH/images/main/energy.drawio.svg`} />
                    </Box>
                    <Typography >Copyright Energy Commission 2024 © All Rights Reserved. <br/>© 2023 QuicKredit (a product of ManagePay Resources Sdn. Bhd)  </Typography>
                </Box>

            </Box>

        </Box>
    )
}

export default Energy;