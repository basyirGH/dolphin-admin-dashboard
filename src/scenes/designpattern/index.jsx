import { Box, Typography } from "@mui/material";


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
                    <img width="100%" src="https://raw.githubusercontent.com/basyirGH/images/main/eventpattern.drawio.svg"/>
                </Box>
                <Box display={"flex"} flexDirection={"column"} justifyContent={"center"} gridColumn={"span 1"} >
                    <Typography mb="10px" fontFamily={"lexend"} variant="h4" fontWeight={"regular"}>
                        Leveraging OOP
                    </Typography>
                    <Typography fontFamily={"lexend"} variant="h5" fontWeight={"light"}>
                        When an order batch is made, SocketIOController publishes events to update the metrics' states. They generate metrics through the factory pattern because each event aggregates data differently. <br /><br />

                        First,  the listener responses by using MetricFactory to get a Metric instance. Inside the factory, Spring scans for MetricCreator beans and assign them with enums as an identifier. In an event class (the scanned bean), OrderService provides structured data, while other presentation properties are defined too. Once instantiated, the metric is returned to the factory, which is then used by the listener to broadcast the event application-wide via the socket.<br/><br/>
                        The simulation's batches were supposed to be sent over REST sequentially, but due to Cloud Run's one-service-one-port limitation, protocols had to be separated to their own Docker container. So, they are sent through the existing socket connection and follow the same factory pattern.

                        {/* In the same socket connection, an Order object is sent to publish NewOrderEvent, thus triggering the listener. From here, the event object generates  */}
                    </Typography>
                </Box>
            </Box>
        </Box>
    )
}

export default DesignPattern;