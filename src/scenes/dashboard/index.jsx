
import { Box, Button, ButtonGroup, Typography, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { ICONS, METRIC_TYPES, SINGLE_AMOUNT_METRIC_CODES, SMALL_WINDOW_TRENDS, SOCKET_EVENTS, TIMEFRAMES } from "../../constants";
import { tokens } from "../../theme";
import { apiRequestUtility } from "../../utils/apiRequestUtility";
import { useAuth } from "../../utils/AuthContext";
import DemographyPieChart from "../../components/DemographyPieChart";
import Header from "../../components/Header";
import RealTimeMetricChart from "../../components/RealTimeMetricChart";
import StatBox from "../../components/StatBox";

import useSocket from "../../utils/useSocket";

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const socket = useSocket();
  const { login, isAuthenticated } = useAuth();
  const [singleAmounts, setSingleAmounts] = useState([]);
  const [selectedTimeframeKey, setSelectedTimeframeKey] = useState();
  const [selectedTimeframeValue, setSelectedTimeframeValue] = useState();
  const [timeframeMessage, setTimeframeMessage] = useState();
  const [timeframeChanged, setTimeframeChanged] = useState(false);
  const [currentTimeframeMessage, setCurrentTimeframeMessage] = useState();
  const timeframeChangeAnimDuration = 500;

  // Log in internally and keep token in memory
  initAuth();

  async function initAuth() { isAuthenticated ? initSingleAmounts() : await tryLogin(); }

  async function tryLogin() {
    try {
      const responseBody = await apiRequestUtility(null, '/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: "1",
          password: "1"
        }),
      });
      const token = responseBody.token;
      if (token) {
        console.log("auth ok");
        login(token);
        initSingleAmounts();
      }
    } catch (err) { }
  }

  function initSingleAmounts() {
    if (singleAmounts.length > 0) return;
    setSingleAmounts([{ code: METRIC_TYPES.SINGLE_AMOUNT, metrics: [] }]);
  }

  /*
  Initialize dashboard with latest stats.
  React re-renders the component whenever state changes, 
  including the socket.on updates, causing infinite loop. So wrap it in useeffect hook.
  Initialize dashboard when socket is connected.
  The data/update that comes from the server is 
  implicitly passed to the callback function, handleMetricEvent.
  Cleanup on unmount
  */
  useEffect(() => {
    if (!socket) return;
    socket.emit(SOCKET_EVENTS.INIT_SINGLE_AMOUNTS, {}, () => {
      // console.log("Ack from server:", JSON.stringify(ackResponse, null, 2));
    });
    const handleMetricEvent = (metricCode) => (metricUpdate) => {
      const updatedType = metricUpdate.type;
      setSingleAmounts((prev) =>
        prev.map((type) => {
          if (type.code !== updatedType) {
            // If this is not the matching type, return it unchanged
            return type;
          }

          // Find if the metricCode already exists in the metrics array
          const existingMetricIndex = type.metrics.findIndex(
            (metric) => metric.code === metricCode
          );

          let updatedMetrics;
          if (existingMetricIndex !== -1) {
            // Replace the existing metric
            updatedMetrics = type.metrics.map((metric, index) =>
              index === existingMetricIndex
                ? { code: metricCode, ...metricUpdate } // Replace metric
                : metric // Keep other metrics unchanged
            );
          } else {
            // Append the new metric
            updatedMetrics = [...type.metrics, { code: metricCode, ...metricUpdate }];
          }

          // Return the updated type with the new metrics array
          return {
            ...type,
            metrics: updatedMetrics,
          };
        })
      );
    };
    Object.values(SINGLE_AMOUNT_METRIC_CODES).forEach((code) => {
      socket.on(code, handleMetricEvent(code));
    });
    return () => {
      Object.values(SINGLE_AMOUNT_METRIC_CODES).forEach((code) => {
        socket.off(code);
      });
      socket.off(SOCKET_EVENTS.INIT_SINGLE_AMOUNT);
    };
  }, [socket]);

  const handleTimeframeChange = (timeframeKey, timeframeValue) => {
    setSelectedTimeframeKey(timeframeKey);
    setSelectedTimeframeValue(timeframeValue);
    setTimeframeChanged(true);

    setTimeout(() => {
      setTimeframeChanged(false);
    }, timeframeChangeAnimDuration);
  }

  // Initialize selected timeframe when singleAmounts initialize
  useEffect(() => {
    if (!selectedTimeframeKey && !selectedTimeframeKey && !currentTimeframeMessage) {
      setSelectedTimeframeKey(singleAmounts[0]?.metrics[0]?.aggregatedData[1]?.timeframe || null);
      setCurrentTimeframeMessage(singleAmounts[0]?.metrics[0]?.aggregatedData[1]?.message || null);
      setSelectedTimeframeValue(TIMEFRAMES[singleAmounts[0]?.metrics[0]?.aggregatedData[1]?.timeframe || null]);
    }
  }, [singleAmounts])

  // change msg every time timeframe changes
  useEffect(() => {
    singleAmounts[0]?.metrics[0]?.aggregatedData.find(data =>
      data.timeframe === selectedTimeframeKey ?
        setTimeframeMessage(data.message) : null
    )
  }, [selectedTimeframeKey])

  const timeframeSelectShadow = "0px -5px 0px 0px rgb(0, 136, 255)";

  return (
    <Box m="10px 20px 20px 20px">
      {/* HEADER */}
      <Box mb="20px">
        <Header title="Dashboard" subtitle={null} />
        {/* <Box display="flex"> */}
        <ButtonGroup size="regular" aria-label="Basic button group">
          {Object.entries(TIMEFRAMES).map(([key, value]) => {
            return <Button color="info" variant={selectedTimeframeKey === key ? "contained" : "outlined"} key={key} onClick={() => {
              handleTimeframeChange(key, value)
            }}>{value}</Button>
          })}
        </ButtonGroup>
        {/* </Box> */}
      </Box>

      {/* GRID & CHARTS */}
      <Box
        mt="15px"
        gridAutoRows="100px"
      >
        <Typography mb="5px" variant="h5" >Showing amounts accumulated since {timeframeMessage || " ..."}</Typography>
        {/* ROW 1 */}
        <Box
          display="grid"
          gridTemplateColumns={{
            xs: "repeat(6, 1fr)",
            sm: "repeat(12, 1fr)",
            md: "repeat(12, 1fr)",
            lg: "repeat(12, 1fr)",
          }}
          //gridTemplateColumns="repeat(6, 1fr)"
          gridAutoRows="130px"
          gap="5px"
        >
          {singleAmounts.map((type) => {
            if (type.code === METRIC_TYPES.SINGLE_AMOUNT) {
              return type.metrics.map((metric) => {
                const IconComponent = ICONS[metric.code];
                return (
                  <Box
                    key={metric.code}
                    gridColumn="span 3"
                    gridRow="span 1"
                    backgroundColor={colors.primary[400]}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    //onClick={() => handleSelectedMetricChange(metric.code)}
                    sx={{
                      // cursor: "pointer",
                      transition: `box-shadow ${timeframeChangeAnimDuration / 1000}s ease-in-out`,
                      // "&:hover": {
                      //   backgroundColor: colors.primary[800], // Glow effect on hover
                      // },
                      boxShadow:
                        timeframeChanged ?
                          timeframeSelectShadow
                          : null
                    }}
                  >
                    <StatBox
                      // In JS, 0 is falsy
                      // Unlike ||, which treats 0 as falsy and would replace it, ?? keeps 0 but replaces undefined or null.
                      amount={metric.aggregatedData.find(item => item.timeframe === selectedTimeframeKey)?.amount ?? undefined}
                      label={metric.label}
                      prefix={metric.prefix}
                      progress={metric.aggregatedData.find(item => item.timeframe === selectedTimeframeKey)?.rateOfChange ?? undefined}
                      increase="+14%"
                      icon={IconComponent ?
                        <IconComponent
                          sx={{
                            color: colors.greenAccent[400],
                            fontSize: "30px"
                          }}
                        />
                        : null
                      }
                    />
                  </Box>
                )
              });
            }
            return null // fallback, in case no matching metric code found
          }
          )}
        </Box>
        {/* ROW 2 */}
        <Box
          display="grid"
          gridTemplateColumns={{
            xs: "repeat(3, 1fr)",
            sm: "repeat(3, 1fr)",
            md: "repeat(12, 1fr)",
            lg: "repeat(12, 1fr)",
          }}
          // gridAutoRows="100px"
          gap="5px"
          mt="5px"
        >
          <Box
            gridColumn={{
              xs: "span 3",  // Takes full width on small screens
              sm: "span 3",
              md: "span 3",
              lg: "span 3",
            }}
            sx={{
              // cursor: "pointer",
              transition: `box-shadow ${timeframeChangeAnimDuration / 1000}s ease-in-out`,
              // "&:hover": {
              //   backgroundColor: colors.primary[800], // Glow effect on hover
              // },
              boxShadow:
                timeframeChanged ?
                  timeframeSelectShadow
                  : null
            }}
            gridRow="span 4"
            backgroundColor={colors.primary[400]}
          >
            {socket && <DemographyPieChart socket={socket} selectedTimeframeKey={selectedTimeframeKey} selectedTimeframeValue={selectedTimeframeValue} />}
          </Box>
          <Box
            gridColumn={{
              xs: "span 3",  // Prevents overflow on small screens
              sm: "span 3",
              md: "span 9",
              lg: "span 9",
            }}
            gridRow="span 4"
          >
            <Box
              display="grid"
              gridTemplateColumns={{
                xs: "repeat(6, 1fr)",
                sm: "repeat(12 1fr)",
                md: "repeat(12, 1fr)",
                lg: "repeat(12, 1fr)",
              }}
              //gridTemplateColumns="repeat(6, 1fr)"
              gridAutoRows="100px"
              gap="5px"
              mt="0px"
            >
              {Object.values(SMALL_WINDOW_TRENDS).map((code) => {
                return (
                  <Box
                    key={code}
                    gridColumn="span 6"
                    gridRow="span 4"
                    backgroundColor={colors.primary[400]}
                  >
                    {socket && <RealTimeMetricChart socket={socket} metricCodeProp={code} />}
                  </Box>
                )
              })}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
