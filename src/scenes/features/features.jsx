import { Box, Typography } from "@mui/material"


const Features = () => {

    return (
        <Box m="30px 20px 0px 15px">
            <Box mb="30px">
                <Typography fontFamily={"lexend"} variant="h4" fontWeight={"regular"}>
                    Dashboard
                </Typography>
                <Typography fontFamily={"lexend"} variant="h5" fontWeight={"light"}>
                    <br/>
                    This is a collection of seven widely used business metrics that entail live sales data as they happen—no refresh is required. Pages like this dashboard is usually part of a larger e-Commerce system, but due to its current stage, Dolphin is made for easier public access, quicker deployment and straighforward testing. 
                </Typography>
            </Box>
            <Box mb="30px">
                <Typography fontFamily={"lexend"} variant="h4" fontWeight={"regular"}>
                    Time Frame
                </Typography>
                <Typography fontFamily={"lexend"} variant="h5" fontWeight={"light"}>
                    <br/>
                    Allows a dynamic selection of fixed intervals that affect 5 out of 7 metrics. <br/>
                </Typography>
            </Box>
            <Box mb="30px">
                <Typography fontFamily={"lexend"} variant="h4" fontWeight={"regular"}>
                    Metrics
                </Typography>
                <Typography fontFamily={"lexend"} variant="h5" fontWeight={"light"}>
                    <br/>
                    Help optimizing pricing strategies and analyzing customer spending behavior:<br/>
                    1. Total Revenue - The accumulation of amount in RM for all orders made within the time frame. <br/>
                    2. Total Orders - The accumulation of orders count within the time frame. <br/>
                    3. Average Revenue Per Order - Total Revenue divided by Total Orders within the time frame. <br/>
                    4. Average Quantity Per Order - Total quantity of items divided by Total Orders within the time frame.<br/>
                    5. Total Orders By Demography - A break down of orders made within the time frame, grouped by customer gender and age.
                    <br/><br/>
                    Help detecting immediate feedback after sales strategies: <br/>
                    6. Revenue Trend (Last Few Minutes) - Revenue generated at the current second in a 30 minutes window.<br/>
                    7. Orders Trend (Last Few Minutes) - Number of orders generated at the current second in a 30 minutes window.
                </Typography>
            </Box>
            <Box mb="30px">
                <Typography fontFamily={"lexend"} variant="h4" fontWeight={"regular"}>
                    Simulation
                </Typography>
                <Typography fontFamily={"lexend"} variant="h5" fontWeight={"light"}>
                    <br/>
                    Allows orchestrating a short-lived session using random fluctuations and presets for testers while orders are sent in batches. It demonstrates basic examples of how the metrics can be used to understand and create relationships between data that reflect the current business climate. <br/>
                    * Fixed 60 customers online all the time. Them purchasing is determined by a probability model that uses a random number generator between 0 and a varying treshold amount. <br/>
                    * Each order only has 1 product category in its item list.<br/>
                    * Each order has random item quantities, between 1 and 3.<br/>
                </Typography>
            </Box>
            <Box mb="30px">
                <Typography fontFamily={"lexend"} variant="h4" fontWeight={"regular"}>
                    Diver
                </Typography>
                <Typography fontFamily={"lexend"} variant="h5" fontWeight={"light"}>
                    <br/>
                    An AI-powered, on-demand data finder, aggregator and analyzer that uncover facts that the metrics may not show. <br/>
                </Typography>
            </Box>
        </Box>
    )
}

export default Features;