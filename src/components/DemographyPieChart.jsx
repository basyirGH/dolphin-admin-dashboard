import React, { useEffect, useRef, useState } from 'react';
import Highcharts from 'highcharts';
import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from '../theme';
import { ICONS } from '../constants';
import { SOCKET_EVENTS, PIE_CHART_METRIC_CODES } from '../constants';
import Accessibility from "highcharts/modules/accessibility";
import NoDataToDisplay from "highcharts/modules/no-data-to-display";
import { SentimentSatisfiedAltOutlined } from '@mui/icons-material';

const DemographyPieChart = ({ socket, selectedTimeframeKey, selectedTimeframeValue }) => {
  const chartContainerRef = useRef(null);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const textColor = theme.palette.mode === "dark" ? "#ffffff" : "#000000";
  const [newData, setNewData] = useState();
  const [chart, setChart] = useState(null);
  const chartLabelRef = useRef();

  // Init socket event and listener
  const initSocketPieEvent = () => {
    socket.emit(SOCKET_EVENTS.INIT_PIE_CHARTS, {}, (ackResponse) => {
      ////console.log("Ack from server:", ackResponse); // Optional acknowledgment logging
    });
  }

  socket.on(PIE_CHART_METRIC_CODES.TOTAL_ORDERS_BY_DEMOGRAPHY, (update) => {
    setNewData(update?.aggregatedData || []);
    ////console.log("update: " + JSON.stringify(update, null, 2)) 
    chartLabelRef.current.textContent = update.label;
  });

  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Init chart instance
  useEffect(() => {
    const chartInstance = Highcharts.chart(chartContainerRef.current, {
      chart: {
        backgroundColor: null,
        height: "300px"
      },
      responsive: null,
      title: null,
      legend: {
        enabled: false,
        layout: 'horizontal', // Can be 'horizontal' or 'vertical'
        align: 'center', // Positioning (left, center, right)
        verticalAlign: 'bottom', // Top, middle, bottom
        itemStyle: {
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#333'
        },
        labelFormatter: function () {
          return `${this.name}: <b>${this.y}</b>`; // Custom label format
        }
      },
      tooltip: {
        valueDecimals: 0,
        valueSuffix: ' orders',
      },
      tooltip: {
        pointFormat: "{series.name}: <b>{point.y} orders ({point.percentage:.1f}%)</b>",
      },
      plotOptions: {
        series: {
          borderWidth: 0,
          borderRadius: "10px",
          colorByPoint: true,
          type: 'pie',
          size: '100%',
          innerSize: '0%',
          dataLabels: {
            formatter: function () {
              return capitalizeFirstLetterOnly(this.point.name);
            },
            enabled: false,
            crop: false,
            distance: '-20%',
            backgroundColor: colors.primary[400], // Works with `shape: "callout"`
            borderColor: "#000000",
            borderRadius: 5,
            padding: 2,
            shape: "callout", // Required for background color to work
            style: {
              color: textColor,
              fontWeight: "regular",
              fontSize: "10px",
              textOutline: "none",
            },
            connectorWidth: 0,
          }
        },
      },
      // colors: [colors.blueAccent[300], colors.blueAccent[400], colors.blueAccent[600], colors.pinkAccent[300], colors.pinkAccent[400]], // Base colors for gradients
      series: [
        {
          type: 'pie',
        },
      ],
      credits: {
        enabled: false
      },
      time: {
        timezone: userTimezone
      },
      accessibility: {
        enabled: true
      }
    });

    initSocketPieEvent();

    setChart(chartInstance);

    return () => {
      chartInstance.destroy();
    };
  }, []);

  // Populate data into chart
  const [femaleRatio, setFemaleRatio] = useState(0);
  const [maleRatio, setMaleRatio] = useState(0);
  useEffect(() => {
    if (chart && newData && chartContainerRef.current) {

      const selectedData = newData.find(data => data.timeframe === selectedTimeframeKey);
      //console.log("selectedData: " + JSON.stringify(selectedData, null, 2))
      let femaleCount = 0;
      let maleCount = 0;
      let totalCount = 0;
      selectedData.series?.forEach(demo => {
        totalCount = totalCount + demo[1];
        if (demo[0].includes("FEMALE")) {
          femaleCount = femaleCount + demo[1];
        } else if (demo[0].includes("MALE")) {
          maleCount = maleCount + demo[1];
        }
      });
      setFemaleRatio(Math.round((femaleCount / totalCount) * 100));
      setMaleRatio(Math.round((maleCount / totalCount) * 100));
      /*
      Instead of
      data: selectedData?.series || [["No orders", 0]]

      do deep copy
      data: selectedData?.series ? JSON.parse(JSON.stringify(selectedData.series)) : [["No orders", 0]]

      why?
      selectedData.series could be pointing to an object inside newData.
      If Highcharts modifies series, it might be modifying newData.series, affecting future timeframe switches.
      The deep copy (JSON.parse(JSON.stringify(selectedData.series))) ensures chart.update() works on an independent object.

      //console.log("handleTimeframeChange key: " + selectedTimeframeKey)
      //console.log("handleTimeframeChange value: " + selectedTimeframeValue)
      //console.log("newData: " + JSON.stringify(newData, null, 2));
      //console.log("selectedData with " + selectedTimeframeKey + "\n" + JSON.stringify(selectedData, null, 2))

      */

      try {
        chart.update({
          animation: {
            enabled: true
          },
          series: [
            {
              name: selectedTimeframeValue,
              data: selectedData?.series ? JSON.parse(JSON.stringify(selectedData.series)).map(
                ([demography, orders, color]) => ({
                  name: demography,
                  y: orders,
                  color: color
                }
                )
              )
                : []
            }
          ]
        });
      } catch (error) {
        //console.error('Error updating chart:', error);
      }
    }
    ////console.log("newdata: " + JSON.stringify(newData, null, 2))
  }, [newData, selectedTimeframeKey, chart]);

  const IconComponent = ICONS["DEMOGRAPHY"];
  const LegendIcon = ICONS["LEGEND"];

  return (
    <Box
      p="15px 20px"
    >
      <Box display="flex">
        <IconComponent sx={{ color: colors.blueAccent[400], fontSize: "30px", mt: "0px", mr: "10px" }} />
        <Typography
          fontWeight={"light"}
          fontFamily={"lexend"}
          mb="35px"
          variant="h5"
          color={textColor}>
          <span ref={chartLabelRef}></span>
        </Typography>
      </Box>
      <Box ref={chartContainerRef} id="container"></Box>
      <Box sx={{
        display: "flex",
        justifyContent: "center",
        gap: "5px", // Space between boxes
        pl: "30px",
        pr: "30px",
      }} >
        <SentimentSatisfiedAltOutlined sx={{ fontSize: '17px', mt: '1px', color: colors.blueAccent[300] }} />
        <Typography fontWeight={"light"} fontFamily={"lexend"}>Male {maleRatio || 0}%</Typography>
        <SentimentSatisfiedAltOutlined sx={{ fontSize: '17px', mt: '1px', color: colors.pinkAccent[300] }} />
        <Typography fontWeight={"light"} fontFamily={"lexend"}>Female {femaleRatio || 0}%</Typography>
      </Box>
    </Box>
  );
};

function capitalizeFirstLetterOnly(str) {
  if (!str) return str; // Handle empty strings
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export default DemographyPieChart;
