
import { Box, Button, ButtonGroup, Drawer, Input, TextField, Tooltip, Typography, useTheme } from "@mui/material";
import { useEffect, useState, useRef } from "react";
import { ICONS, METRIC_TYPES, SINGLE_AMOUNT_METRIC_CODES, REAL_TIME_TRENDS, SOCKET_EVENTS, TIMEFRAMES } from "../../constants";
import { tokens } from "../../theme";
import { apiRequestUtility } from "../../utils/apiRequestUtility";
import { useAuth } from "../../utils/AuthContext";
import DemographyPieChart from "../../components/DemographyPieChart";
import Header from "../../components/Header";
import RealTimeMetricChart from "../../components/RealTimeMetricChart";
import SingleAmountBox from "../../components/SingleAmountBox";
import generateOrder from "./generateOrder"
import useSocket from "../../utils/useSocket";
import '@fontsource/lexend/500.css';
import "./style.css"

const Dashboard = () => {
  const [simStarted, setSimStarted] = useState(false);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { socket, message, attemptCount } = useSocket();
  const { login, isAuthenticated, authOnce } = useAuth();
  const [singleAmounts, setSingleAmounts] = useState([]);
  const [selectedTimeframeKey, setSelectedTimeframeKey] = useState();
  const [selectedTimeframeValue, setSelectedTimeframeValue] = useState();
  const [timeframeMessage, setTimeframeMessage] = useState();
  const [timeframeChanged, setTimeframeChanged] = useState(false);
  const [currentTimeframeMessage, setCurrentTimeframeMessage] = useState();
  const [simLog, setSimLog] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const orderCountRef = useRef(0); // Track order count
  const MAX_ORDERS = 10;
  const ANIM_DELAY = 500;
  const SIM_DELAY = 3000;
  const SIM_LIMIT_ITEM_NAME = "ordersMaxedOut"
  const orderLimitReached = localStorage.getItem(SIM_LIMIT_ITEM_NAME) === "true";
  const LIMIT_REACHED_LOG = "> orders limit reached, sim stopped.";


  // Log in internally and keep token in memory
  initAuth();

  async function initAuth() { isAuthenticated ? initSingleAmounts() : tryLogin() }

  async function tryLogin() {
    try {
      const responseBody = await apiRequestUtility(null, '/auth/guest', {
        method: 'GET',
      });
      const token = responseBody.token;
      if (token) {
        login(token);
        authOnce();
        initSingleAmounts();
      }
    } catch (err) {
      authOnce();
      console.log("auth: " + isAuthenticated)
    }
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

    if (!socket) {
      setSimLog(message ? "> metrics and sim cannot run right now " + message + `(${attemptCount})` : "> ")
      return;
    } else {
      setSimLog(orderLimitReached ? LIMIT_REACHED_LOG : "> ready")
    }
    socket.emit(SOCKET_EVENTS.INIT_SINGLE_AMOUNTS, {}, () => {
      // console.log("Ack from server:", JSON.stringify(ackResponse, null, 2));
    });
    const handleMetricEvent = (metricCode) => (metricUpdate) => {
      //console.log("res! metricupdate: " + JSON.stringify(metricUpdate, null, 2));
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
  }, [socket, message, attemptCount]);

  // when simStarted=true, emit new orders repeatedly one after another with 1 sec delay instead of recursion that could overwhelm the server
  useEffect(() => {
    let running = true;

    async function initSim() {
      try {
        while (running && orderCountRef.current < MAX_ORDERS) {
          setSimLog(`> sending order ${orderCountRef.current + 1} of ${MAX_ORDERS}...`);

          const response = await sendOrder(generateOrder());

          if (response.status === "200") {
            setSimLog(`> +1 order OK (${orderCountRef.current + 1}/${MAX_ORDERS})`);
            orderCountRef.current++;
          } else {
            setSimLog("> order failed, trying again...");
          }

          await new Promise((resolve) => setTimeout(resolve, SIM_DELAY));

          if (!running) break;
        }

        if (orderCountRef.current >= MAX_ORDERS) {
          setSimStarted(false);
          localStorage.setItem(SIM_LIMIT_ITEM_NAME, true);
          setSimLog(LIMIT_REACHED_LOG);
        }
      } catch (error) {
        console.error("Error simulating order:", error);
      }
    }

    if (simStarted && !orderLimitReached) initSim();

    return () => {
      running = false;
      setSimLog(orderCountRef.current >= MAX_ORDERS || orderLimitReached ? LIMIT_REACHED_LOG : "> sim stopped");
    };
  }, [simStarted]);

  const handleTimeframeChange = (timeframeKey, timeframeValue) => {
    setSelectedTimeframeKey(timeframeKey);
    setSelectedTimeframeValue(timeframeValue);
    setTimeframeChanged(true);

    setTimeout(() => {
      setTimeframeChanged(false);
    }, ANIM_DELAY);
  }

  // Initialize selected timeframe when singleAmounts initialize
  useEffect(() => {
    if (singleAmounts && !selectedTimeframeKey && !selectedTimeframeValue && !currentTimeframeMessage) {
      setSelectedTimeframeKey(singleAmounts[0]?.metrics[0]?.aggregatedData[2]?.timeframe || null);
      setCurrentTimeframeMessage(singleAmounts[0]?.metrics[0]?.aggregatedData[2]?.message || null);
      setSelectedTimeframeValue(TIMEFRAMES[singleAmounts[0]?.metrics[0]?.aggregatedData[2]?.timeframe] || null);
    }
    //console.log("res! singleAmounts: " + JSON.stringify(singleAmounts, null, 2));

    // change msg every time timeframe changes, or when the hour changes via incoming data
    singleAmounts[0]?.metrics[0]?.aggregatedData?.find(data =>
      data.timeframe === selectedTimeframeKey ?
        setTimeframeMessage(data.message) : null
    )
  }, [singleAmounts, selectedTimeframeKey])

  function initSingleAmounts() {
    if (singleAmounts.length > 0) return;
    setSingleAmounts([{ code: METRIC_TYPES.SINGLE_AMOUNT, metrics: [] }]);
  }

  const timeframeSelectShadow = "0px -5px 0px 0px rgb(0, 136, 255)";

  function sendOrder(body) {
    return new Promise((resolve, reject) => {
      socket.emit(SOCKET_EVENTS.SIMULATE_NEW_ORDER, body, (ackResponse) => {
        if (ackResponse.error) {
          reject(ackResponse.error);
        } else {
          resolve(ackResponse);
        }
      });
    });
  }

  const [tooltipOpen, setToolTipOpen] = useState(false);
  const touchTriggeredRef = useRef(false); // Track touch events

  const handleTooltipTouch = (event) => {
    event.stopPropagation(); // Prevent immediate closing on touch
    setToolTipOpen(true);
    touchTriggeredRef.current = true; // Mark as touch-triggered

    setTimeout(() => {
      setToolTipOpen(false);
      touchTriggeredRef.current = false;
    }, 7000);
  };

  const [isAIBoxClicked, setIsAIBoxClicked] = useState(false);

  const handleAIBoxClick = () => {
    setIsAIBoxClicked(true);
    setTimeout(() => {
      setIsAIBoxClicked(false);
    }, 1000); // Reset after 1 second
  };



  const HelpIcon = ICONS.HELP;
  const PlayIcon = ICONS.PLAY;
  const StopIcon = ICONS.STOP;
  const AssistantIcon = ICONS.ASSISTANT;
  const CloseIcon = ICONS.CLOSE;

  return (
    <Box m="30px 20px 0px 15px">
      <Box mb="20px">
        <Typography fontFamily={"lexend"} variant="h5" fontWeight={"regular"}>
          {/* Recently, I've been upskilling and learning with a project. The end result is a live analytics dashboard for businesses and e-commerce.<br />  */}
          {/* Real-time analytics help business owners evaluate small-window performance and quickly make data-driven decisions to attract sales. */}
          {/* <br />Real-time metrics help sellers make data-driven decisions to attract the needed sales at the right time. <br /> */}
          {/* <br />Take a look around: */}
        </Typography>
      </Box>
      <Box
      // sx=
      // {{
      //   border: "1px solid grey",
      //   borderRadius: "20px",
      //   //boxShadow: '0px 4px 30px rgba(0, 0, 0, 0.2)',
      // }}
      // m="80px 20px 50px 20px"
      >
        <Box display={"flex"} justifyContent={"space-between"} mb="0px">
          <Box display="flex">
            {/* <img width={"20px"} src="https://www.svgrepo.com/show/400173/dolphin.svg" /> */}
            {/* <Typography fontFamily={"lexend"} fontWeight={"regular"} variant="h4" ml="5px">Sales Analytics</Typography> */}
          </Box>
        </Box>
        <Box
          display={"grid"}
          gridTemplateColumns={{
            xs: "repeat(3, 1fr)",
            sm: "repeat(6, 1fr)",
            md: "repeat(6, 1fr)",
            lg: "repeat(6, 1fr)",
          }}
          mt="0px"
          mb="2px"
        >
          <Box gridColumn={"span 3"} >
            <Box display="flex">
              <Button disabled={orderLimitReached ? true : false} sx={{ textTransform: "none" }} size="small" onClick={() => setSimStarted(simStarted ? false : true)} color="inherit" variant="outlined">
                {simStarted ? <StopIcon /> : <PlayIcon />}
                <Typography fontSize={"13px"} fontFamily={"lexend"} fontWeight={"light"}>Sim</Typography>
              </Button>

              <Button sx={{ textTransform: "none", ml: '10px' }} size="small" color="inherit" variant="outlined" onClick={() => setDrawerOpen(drawerOpen ? false : true)} >
                <AssistantIcon />
                <Typography ml="3px" fontSize={"13px"} fontFamily={"lexend"} fontWeight={"light"}>Diver</Typography>
              </Button>
            </Box>
            <Typography fontFamily={"lexend"} fontSize={"10px"} fontWeight={"light"}>
              {simLog}
            </Typography>
          </Box>
          <Box
            gridColumn={"span 3"}
            mt={{
              xs: "10px",
              sm: "0px",
              md: "0px",
              lg: "0px",
            }}
            pb="15px"
            display={"flex"}
            justifyContent={{
              xs: "start",
              sm: "end",
              md: "end",
              lg: "end",
            }}
          >
            <ButtonGroup size="small" aria-label="Basic button group">
              {Object.entries(TIMEFRAMES).map(([key, value]) => {
                return <Button color={"inherit"} variant={selectedTimeframeKey === key ? "contained" : "outlined"} key={key} onClick={() => {
                  handleTimeframeChange(key, value)
                }}>{value}</Button>
              })}
            </ButtonGroup>
            <Tooltip
              open={tooltipOpen}
              onOpen={() => {
                if (!touchTriggeredRef.current) setToolTipOpen(true);
              }}
              onClose={() => {
                if (!touchTriggeredRef.current) setToolTipOpen(false);
              }}
              sx={{ fontSize: "10px" }}
              title={
                <Typography fontSize={"15px"}>
                  {"Showing amounts accumulated since " + timeframeMessage || " ..."}
                </Typography>
              }
            >
              <Box ml="10px" mt="5px">
                <HelpIcon onTouchStart={handleTooltipTouch} />
              </Box>
            </Tooltip>
          </Box>
        </Box>

        {/* GRID & CHARTS */}
        <Box
          mt="10px"
          gridAutoRows="100px"
        >
          {/* ROW 1 */}
          <Box
            display="grid"
            gridTemplateColumns={{
              xs: "repeat(3, 1fr)",
              sm: "repeat(6, 1fr)",
              md: "repeat(6, 1fr)",
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
                      // backgroundColor={colors.primary[600]}
                      backgroundColor='rgb(30, 30, 30)'
                      display="flex"
                      alignItems="center"
                      sx={{
                        transition: `box-shadow ${ANIM_DELAY / 1000}s ease-in-out`,
                        boxShadow:
                          timeframeChanged ?
                            timeframeSelectShadow
                            : null
                      }}
                    >
                      <SingleAmountBox
                        // In JS, 0 is falsy
                        // Unlike ||, which treats 0 as falsy and would replace it, ?? keeps 0 but replaces undefined or null.
                        amount={metric.aggregatedData.find(item => item.timeframe === selectedTimeframeKey)?.amount ?? undefined}
                        label={metric.label}
                        prefix={metric.prefix}
                        progress={metric.aggregatedData.find(item => item.timeframe === selectedTimeframeKey)?.rateOfChange ?? undefined}
                        icon={IconComponent ?
                          <IconComponent
                            sx={{
                              color: colors.blueAccent[400],
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
              md: "repeat(9, 1fr)",
              lg: "repeat(9, 1fr)",
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
              // backgroundColor={colors.primary[600]}
              backgroundColor='rgb(30, 30, 30)'
              sx={{
                // cursor: "pointer",
                transition: `box-shadow ${ANIM_DELAY / 1000}s ease-in-out`,
                // "&:hover": {
                //   backgroundColor: colors.primary[800], // Glow effect on hover
                // },
                boxShadow:
                  timeframeChanged ?
                    timeframeSelectShadow
                    : null
              }}
              gridRow="span 4"
            >
              {socket && <DemographyPieChart socket={socket} selectedTimeframeKey={selectedTimeframeKey} selectedTimeframeValue={selectedTimeframeValue} />}
            </Box>
            <Box
              gridColumn={{
                xs: "span 3",  // Prevents overflow on small screens
                sm: "span 3",
                md: "span 6",
                lg: "span 6",
              }}
              gridRow="span 4"
            >
              <Box
                display="grid"
                gridTemplateColumns={{
                  xs: "repeat(3, 1fr)",
                  sm: "repeat(6 1fr)",
                  md: "repeat(6, 1fr)",
                  lg: "repeat(6, 1fr)",
                }}
                gridAutoRows="100px"
                gap="5px"
                mt="0px"
              >
                {Object.values(REAL_TIME_TRENDS).map((code) => {
                  return (
                    <Box
                      // backgroundColor={colors.primary[600]}
                      backgroundColor='rgb(30, 30, 30)'
                      key={code}
                      gridColumn="span 3"
                      gridRow="span 4"
                    // backgroundColor={colors.primary[400]}
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
      <Drawer
        open={drawerOpen}
        anchor="bottom"
        slotProps={{ backdrop: { sx: { backgroundColor: "transparent" } } }}
        onClose={() => setDrawerOpen(false)}
      >
        <Box
          textAlign={"right"}
          p="10px 10px 0px 10px"
          backgroundColor='#121212'
          sx={{ cursor: 'pointer' }}
          onClick={() => setDrawerOpen(false)}
        >
          <CloseIcon />
        </Box>
        <Box
          backgroundColor='#121212'
          p={{
            xs: '0px 20px 10px 20px',
            sm: '0px 200px 10px 200px',
            md: '0px 300px 10px 300px',
            lg: '0px 400px 10px 400px'
          }}>
          <Box
            height={"400px"}
            display={"flex"}
            flexDirection={"column"}
            justifyContent={"space-between"} >
            <Box>
              <Box textAlign={"center"}>
                <Typography fontFamily={"lexend"} fontWeight={"light"} variant="h4">
                  Diver
                </Typography>
                <Typography color={colors.grey[300]} fontFamily={"lexend"} fontWeight={"light"} variant="h6">
                  Get quick answers from the depths of the database
                </Typography>
                <Box>
                  <Typography mt="20px" variant="h6" fontFamily={"lexend"} fontWeight={"light"} >
                    "How much revenue was generated on 1 Jan 2025?" <br />
                    "Which product category was most ordered by men under 25 yesterday? "<br />
                    "Did this year's first quarter outsell last year's?"
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box textAlign={"center"}>
              <TextField
                fullWidth
                InputProps={{
                  sx: { fontSize: 15, fontFamily: 'lexend', fontWeight: 'light' } // Change font size
                }}
                autoFocus={true}
                variant="outlined"
                placeholder=""
              />
              <Typography color={colors.grey[400]} mt="5px" fontFamily={"lexend"} fontWeight={"light"} fontSize={"11px"}>
                Generative AI Text-to-SQL powered by Google Gemini. Not for conversations or predictions. Some queries might be error-prone.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
};

export default Dashboard;
