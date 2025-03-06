import { Box, Typography } from "@mui/material";
import FullScreenImage from "../../utils/FullScreenImage";


const DesignPattern = () => {


    return (
        <Box m="50px 20px 80px 20px">
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
                <Box  gridColumn={"span 1"} textAlign={"center"}>
                    <FullScreenImage src="https://raw.githubusercontent.com/basyirGH/images/main/eventpattern.drawio.svg"/>
                </Box>
                <Box display={"flex"} flexDirection={"column"} justifyContent={"center"} gridColumn={"span 1"} >
                    <Typography mb="10px" fontFamily={"lexend"} variant="h4" fontWeight={"regular"}>
                        Leveraging OOP
                    </Typography>
                    <Typography fontFamily={"lexend"} variant="h5" fontWeight={"light"}>
                        {/* Due to its long-term relevance, I decided to build a business tool not only for a potential upscaling and commercialization, but also because it's a resourceful learning opportunity. */}
                        <br />
                        {/* As a business tool, Dolphin also has upscaling and commercialization potential, which makes it an interesting self-development commitment in the long run.<br/> */}
                        When an order is made, SocketIOController publishes events to update the metrics' states. They generate metrics through the factory pattern because each event aggregates data differently. <br /><br />

                        First,  the listener responses by using MetricFactory to get a Metric instance. Inside the factory, Spring scans for MetricCreator beans and assign them with enums as an identifier. In an event class (the scanned bean), OrderService provides structured data, while other presentation properties are defined too. Once instantiated, the metric is returned to the factory, which is then used by the listener to broadcast the event application-wide via the socket.<br/><br/>
                        The simulation was supposed to send orders over REST sequentially, but due to Google Cloud Run's one-service-one-port limitation, protocols had to be separated. So, they are sent through the existing socket connection and follow the same factory pattern.

                        {/* In the same socket connection, an Order object is sent to publish NewOrderEvent, thus triggering the listener. From here, the event object generates  */}
                    </Typography>
                </Box>
            </Box>
        </Box>
    )
}

export default DesignPattern;