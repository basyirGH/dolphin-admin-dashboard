import { Box, Typography, useTheme } from "@mui/material";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import numeral from 'numeral';
import React, { memo, useRef } from 'react';
import { ICONS, LINE_CHART_METRIC_CODES, SOCKET_EVENTS } from '../constants';
import { tokens } from '../theme';

/* useRef vs useState
useRef
Store a mutable reference to a DOM element or a value.
Persist values across renders without causing re-renders.
Access the previous state or maintain values between renders.

useState
Store component state that triggers a re-render when updated.
Keep track of UI-related state changes.
*/

// memo prevents component re-render unless the props change
// to prevent highchart from redraw/restart
const RealTimeMetricChart = memo(({ socket, metricCodeProp }) => {
    let lastUpdate;
    let zeroIntervalId; // To manage the interval for replicating zero updates
    let subMetricTimeoutId;
    let zeroIntervalMS = 30000;
    let axisTitleIsSet = false;
    const chartRef = useRef();
    const subMetricNameRef = useRef();
    const subMetricAmountRef = useRef(0);
    const subMetricPrefix = useRef();
    const eventNameRef = useRef();
    const maxDataPoints = 500;
    const theme = useTheme();
    const textColor = theme.palette.mode === "dark" ? "#ffffff" : "#000000";
    const submetricTimeoutMS = 60000;
    const colors = tokens(theme.palette.mode);

    // Init socket event and listener
    const initSocketLineChartEvent = () => {
        socket.emit(SOCKET_EVENTS.INIT_LINE_CHARTS, { timeOccured: Date.now() }, (ackResponse) => {
            // //console.log("Ack from server:", ackResponse); // Optional acknowledgment logging
        });
    };

    // Listen for socket updates
    socket.on(LINE_CHART_METRIC_CODES.REAL_TIME_TRENDS, (update) => {
        ////console.log("update: " + JSON.stringify(update, null, 2));

        // If the update contains valid data, process it and restart the zero replication
        lastUpdate = update;
        ////console.log("update: " + JSON.stringify(update, null, 2))
        addSeries(update);
        // Restart the zero-value interval to ensure continuity
        startZeroReplication();
    });

    const startZeroReplication = () => {
        clearInterval(zeroIntervalId);
        zeroIntervalId = setInterval(() => {
            replicateZeroRevenue();
        }, zeroIntervalMS);
    };

    const replicateZeroRevenue = () => {
        if (!lastUpdate) return;
        // Create a new update object with replicated data
        const replicatedUpdate = {
            ...lastUpdate,
            aggregatedData: lastUpdate.aggregatedData.map((line) => ({
                ...line,
                subMetric: null,
                data: [[Date.now(), 0]], // Use the current timestamp with zero revenue
            })),
        };
        // //console.log("replicating zero...")
        addSeries(replicatedUpdate); // Add the replicated data to the chart
    };

    const addSeries = (update) => {
        if (!chartRef.current) { return };
        // if (!chartLabelRef.current.textContent) chartLabelRef.current.textContent = update.label;

        const chart = chartRef.current.chart; // Access the chart instance

        const line = update.aggregatedData.find((line) => line.metricCode === metricCodeProp);

        ////console.log("line: " + JSON.stringify(line, null, 2))

        if (line) {
            // //console.log("line: " + JSON.stringify(line, null, 2));
            const type = line.type;
            const seriesName = line.name;
            const newData = line.data;
            const lineColor = line.lineColor; // Line color for the series
            const fillColor = {
                linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
                stops: [
                    [0, lineColor],
                    [1, lineColor + "00"]
                ]
            };
            let series = chart.series.find((s) => s.name === seriesName);
            eventNameRef.current.textContent = seriesName;

            if (!series) {
                // If the series doesn't exist, add it to the chart
                series = chart.addSeries(
                    {
                        name: seriesName,
                        data: [], // Start with an empty series
                        color: lineColor, // Line color
                        type: type, // Ensure the type is areaspline
                        threshold: null,
                        fillColor: fillColor,
                        marker: {
                            enabled: false,  // This hides the points
                            states: {
                                hover: {
                                    enabled: true  // This shows the point when hovering
                                }
                            }
                        },
                        animation: {
                            enabled: true
                        }
                    },
                    false // Don't redraw immediately for performance
                );
            }

            // Add new data points to the series
            newData.forEach(([date, value]) => {
                const point = [date, value];
                const shift = series.data.length >= maxDataPoints;
                // Add the point to the series with shifting
                series.addPoint(point, false, shift);
            });

            if (line.subMetric) {
                subMetricAmountRef.current.textContent = numeral(line.subMetric.data).format('0.00a');
                subMetricNameRef.current.textContent = line.subMetric.name;
                subMetricPrefix.current.textContent = line.subMetric.prefix || null;

                if (subMetricTimeoutId) {
                    clearTimeout(subMetricTimeoutId)
                }

                subMetricTimeoutId = setTimeout(() => {
                    subMetricAmountRef.current.textContent = numeral(0).format("0.00a")
                }, submetricTimeoutMS)
            }

            if (!axisTitleIsSet) {
                // Update y-axis title
                chart.yAxis[0].setTitle({
                    text: line.ytitle,
                    style: { color: textColor, fontWeight: 'regular' }
                });

                chart.xAxis[0].setTitle({
                    text: line.xtitle,
                    style: { color: textColor, fontWeight: 'regular' }
                });

                axisTitleIsSet = true;
            }

            // Remove excess points in the `data` array if necessary
            if (line.metricCode === metricCodeProp) {
                const series = chart.series.find((s) => s.name === line.name);
                if (series) {
                    while (series.data.length > maxDataPoints) {
                        series.data.shift(); // Remove the oldest points
                    }
                }
            }
        }

        // Redraw the chart after all updates
        chart.redraw();
    }

    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Initialize the chart
    const options = {
        chart: {
            animation: true,
            height: "300",
            backgroundColor: null,
            events: {
                load: initSocketLineChartEvent
            },
        },
        yAxis: {
            labels: {
                style: { color: textColor },
            },
            // title: {
            //     text: ".",
            //     margin: 10,
            //     style: { color: textColor, fontWeight: 'bold' },
            // },
        },
        xAxis: {
            lineColor: textColor,
            tickColor: textColor,
            type: 'datetime',
            labels: {
                style: { color: textColor, fontSize: "10px" },
            },
        },
        accessibility: {
            enabled: false
        },
        credits: {
            enabled: false
        },
        time: {
            useUTC: false
        },
        legend: {
            enabled: false,
            itemStyle: {
                color: textColor,
            }
        },
        title: null,
        exporting: {
            enabled: false
        },
        navigator: {
            enabled: true
        },
        scrollbar: {
            enabled: true
        },
        time: {
            timezone: userTimezone
        }
    }

    const IconComponent = ICONS[metricCodeProp];

    return (
        <div>
            <Box
                p="15px 20px"
            >
                <Box>
                    <Box display="flex">
                        <IconComponent
                            sx={{
                                color: colors.blueAccent[400],
                                fontSize: "30px",
                                mt: "1px",
                                mr: "10px"
                            }}
                        />
                        <Box>
                            <Typography
                                fontWeight={"light"}
                                fontFamily={"lexend"}
                                mb="0px"
                                pb="0px"
                                variant="h5"
                                color={textColor}>
                                <span ref={eventNameRef}></span>
                            </Typography>
                            <Box display="flex">
                                <Typography
                                    variant="h5"
                                    fontWeight={"light"}
                                    fontFamily={"lexend"}
                                    color={textColor}
                                    mb="0px"
                                >
                                    <span ref={subMetricPrefix}></span>
                                </Typography>
                                <Typography
                                    variant="h5"
                                    fontWeight={"light"}
                                    color={textColor}
                                    mb="0px"
                                >
                                    <span ref={subMetricAmountRef}></span>
                                </Typography>
                                <Typography
                                    ml="5px"
                                    mt="0px"
                                    component="span" // Render as span to keep it inline
                                    variant="h6"  // Use a smaller variant like body2
                                >
                                    <span ref={subMetricNameRef}></span>
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                </Box>
            </Box>
            <Box m="30px 0 0 0">
                <HighchartsReact highcharts={Highcharts} options={options} ref={chartRef} />
            </Box>

        </div>
    );
});

export default RealTimeMetricChart;
