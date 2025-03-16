import { Box, Button, Link, Typography } from "@mui/material";
import { useState } from "react";
import { ICONS } from "../../../constants";
import '@fontsource/lexend/500.css';

const Intro = () => {
    const NewTabIcon = ICONS.NEW_TAB;
    const imgTurn = Math.floor(Math.random() * 5) + 1;

    return (
        <Box backgroundColor="black" m="0px 0px 0px 0px">
            <Box
                display="grid"
                gridTemplateColumns={{
                    xs: "repeat(1, 1fr)",
                    sm: "repeat(1, 1fr)",
                    md: "repeat(1, 1fr)",
                    lg: "repeat(1, 1fr)",
                }}

                gap="0px"
            >
                {/* <Box gridColumn="span 1" gridRow="span 1">
                    <img alt="retro and vibrant decorative sci-fi image" width="100%" height={"100%"} src={`https://raw.githubusercontent.com/basyirGH/images/main/2.jpg`} />
                </Box> */}
                <Box m="20px 20px 20px 20px" display="flex" flexDirection={"column"} justifyContent={"center"} >
                    <Typography mt="40px" color="white" fontFamily={"lexend"} variant="h4" fontWeight={"regular"}>Thank You For Visiting!</Typography>
                    <Typography color="white" mt="10px" mb="5px" fontFamily={"lexend"} variant="h5" fontWeight={"light"}>
                        My name is Mohamad Basyir.
                        A majority of my experience is web development with Java, including five real-world projects across
                        Energy and Fintech sectors spanning 1.5 years.<br/>
                        Award-winning 2023 Bachelor of Computer Science graduate from UMT with Distinction.<br /><br />
                        Please email me your suggestions, bugs or job openings at basyirzainuddin@gmail.com. <br />
                        You can also find me through the buttons below. <br />
                        <Box mt="10px" gap="10px" display="flex">

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
                    </Typography>
                    <Typography color="white" mt="20px" mb="10px" fontFamily={"lexend"} variant="h5" fontWeight={"light"}>
                       Past projects (public):
                    </Typography>
                    <Box >
                        <Typography color="white" onClick={() => window.open("https://myenergystats.st.gov.my/dashboard", "_blank")} display="flex" sx={{ textDecoration: '', cursor: 'pointer' }} fontFamily={"lexend"} variant="h5" fontWeight={"light"}>
                            Software Engineer, Energy Comission's MyEnergyStats ©
                            <Box mt="3px" ml="5px" mr="20px">
                                <img width="15px" src="https://raw.githubusercontent.com/basyirGH/images/main/new-window-svgrepo-com (1).svg" />
                            </Box>
                            <br />
                        </Typography>
                        <Typography color="white" onClick={() => window.open("https://www.quickredit.my/index.html", "_blank")} display="flex" sx={{ textDecoration: '', cursor: 'pointer' }} fontFamily={"lexend"} variant="h5" fontWeight={"light"}>
                            Junior Java Developer, ManagePay Sdn. Bhd.'s QuicKredit ©
                            <Box mt="3px" ml="5px" mr="20px">
                                <img width="15px" src="https://raw.githubusercontent.com/basyirGH/images/main/new-window-svgrepo-com (1).svg" />
                            </Box>
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

export default Intro;