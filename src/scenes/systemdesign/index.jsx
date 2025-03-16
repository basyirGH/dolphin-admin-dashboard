import { Fullscreen } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import FullScreenImage from "../../utils/FullScreenImage";
import '@fontsource/lexend/300.css';

const SystemDesign = () => {

    return (
        <Box m="80px 20px 30px 20px">
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
                <Box gridColumn={"span 1"} textAlign={"center"}>
                    <FullScreenImage src="https://raw.githubusercontent.com/basyirGH/images/main/dolphin-system-design.drawio.svg"/>
                </Box>
                <Box display={"flex"} flexDirection={"column"} justifyContent={"center"} gridColumn={"span 1"} mb="80px">
                    <Typography mb="10px" fontFamily={"lexend"} variant="h4" fontWeight={"regular"}>
                        A Resourceful Growth Opportunity 
                    </Typography>
                    <Typography fontFamily={"lexend"} variant="h5" fontWeight={"light"}>
                        {/* Due to its long-term relevance, I decided to build a business tool not only for a potential upscaling and commercialization, but also because it's a resourceful learning opportunity. */}
                        <br />
                        {/* As a business tool, Dolphin also has upscaling and commercialization potential, which makes it an interesting self-development commitment in the long run.<br/> */}
                        Recently, I've been upskilling and learning with Dolphin. This project is a full stack implementation that began in Dec 2024 using React.js and Java Spring Boot. Having been involved in an impactful statistics project before, I was inspired to create Dolphin—while also taking the event-driven programming approach with WebSocket instead of conventional CRUD and REST APIs.                        
                    </Typography>
                </Box>
            </Box>
        </Box>
    )
}

export default SystemDesign;