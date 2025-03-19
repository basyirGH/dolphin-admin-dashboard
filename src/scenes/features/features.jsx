import { Box, Typography } from "@mui/material"


const Features = () => {

    return (
        <Box m="30px 20px 0px 15px">
            <Box mb="30px">
                <Typography fontFamily={"lexend"} variant="h4" fontWeight={"regular"}>
                    Dashboard
                </Typography>
                <Typography fontFamily={"lexend"} variant="h5" fontWeight={"light"}>
                    This is a collection of seven widely relevant business metrics that entail live sales data as they happen—no refresh is required for updates. Pages like this dashboard is usually part of a larger e-Commerce system, but due to its current stage, Dolphin is made for easier public access, quicker deployment and straighforward testing. 
                </Typography>
            </Box>
            <Box mb="30px">
                <Typography fontFamily={"lexend"} variant="h4" fontWeight={"regular"}>
                    Time Frame
                </Typography>
                <Typography fontFamily={"lexend"} variant="h5" fontWeight={"light"}>
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
                    6. Orders Trend (Last Few Minutes) - Number of orders generated at the current second in a 30 minutes window.
                </Typography>
            </Box>
            <Box mb="30px">
                <Typography fontFamily={"lexend"} variant="h4" fontWeight={"regular"}>
                    Simulation
                </Typography>
                <Typography fontFamily={"lexend"} variant="h5" fontWeight={"light"}>
                    Allows orchestrating a short-lived, multi-seller business to see the metrics in action and achieve a sales target. <br/>
                </Typography>
            </Box>
            <Box mb="30px">
                <Typography fontFamily={"lexend"} variant="h4" fontWeight={"regular"}>
                    Diver
                </Typography>
                <Typography fontFamily={"lexend"} variant="h5" fontWeight={"light"}>
                    An AI-powered SQL query and natural language response builder for specific sales questions without coded data aggregators. <br/>
                </Typography>
            </Box>
        </Box>
    )
}

export default Features;