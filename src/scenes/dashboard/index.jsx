
import '@fontsource/lexend/500.css';
import { ChevronRight, Close, KeyboardArrowDown, Refresh, ShoppingCart } from "@mui/icons-material";
import { Box, Button, ButtonGroup, Chip, Drawer, FormControlLabel, LinearProgress, Slider, Switch, TextField, Tooltip, Typography, useTheme, Skeleton } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useEffect, useRef, useState } from "react";
import DemographyPieChart from "../../components/DemographyPieChart";
import RealTimeMetricChart from "../../components/RealTimeMetricChart";
import SingleAmountBox from "../../components/SingleAmountBox";
import { ICONS, METRIC_TYPES, REAL_TIME_TRENDS, SINGLE_AMOUNT_METRIC_CODES, SOCKET_EVENTS, TIMEFRAMES } from "../../constants";
import { tokens } from "../../theme";
import { apiRequestUtility } from "../../utils/apiRequestUtility";
import { useAuth } from "../../utils/AuthContext";
import useSocket from "../../utils/useSocket";
import "./style.css";
import Simulation from '../simulation';

const Dashboard = () => {
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
  const [diverOpen, setDiverOpen] = useState(false);
  const ANIM_DELAY = 500;

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
      //console.log("auth: " + isAuthenticated)
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
      // setSimLog(message ? "> metrics and sim cannot run right now " + message + `(${attemptCount})` : "> ")
      return;
    } else {
      // setSimLog(orderLimitReached ? LIMIT_REACHED_LOG : "> ready")
    }
    socket.emit(SOCKET_EVENTS.INIT_SINGLE_AMOUNTS, {}, () => {
      // //console.log("Ack from server:", JSON.stringify(ackResponse, null, 2));
    });
    const handleMetricEvent = (metricCode) => (metricUpdate) => {
      // //console.log("res! metricupdate: " + JSON.stringify(metricUpdate, null, 2));
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

    socket.on(SOCKET_EVENTS.DIVER_RESPONSE, (response) => handleDiverResponse(response));

    return () => {
      Object.values(SINGLE_AMOUNT_METRIC_CODES).forEach((code) => {
        socket.off(code);
      });
      socket.off(SOCKET_EVENTS.INIT_SINGLE_AMOUNT);
    };
  }, [socket, message, attemptCount]);


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
    ////console.log("res! singleAmounts: " + JSON.stringify(singleAmounts, null, 2));

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

  const HelpIcon = ICONS.HELP;

  const promptExamples = (
    <>
      Ask me questions like: <br />
      1. Which product category is most ordered by men under 25 so far? <br />
      2. Rank top selling product categories by revenue.  <br />
      3. How much orders were generated by simid: ... ?
    </>
  )

  const handleDiverClick = () => {
    setDiverOpen(!diverOpen);
  };

  const [diverMessage, setDiverMessage] = useState(promptExamples);
  const [userPrompt, setUserPrompt] = useState();
  const [promptInput, setPromptInput] = useState("");
  const [promptInputError, setPromptInputError] = useState(false);

  function sendPromptToDiver(body) {
    return new Promise((resolve, reject) => {
      socket.emit(SOCKET_EVENTS.DIVER_NEW_PROMPT, body, (ackResponse) => {
        resolve(ackResponse);
      });
    });
  }

  const [waitingDiver, setWaitingDiver] = useState(false);

  const handleNewDiverPrompt = async (prompt) => {

    if (!prompt.trim()) {
      setPromptInputError(true);
      return;
    }
    setPromptInputError(false);

    let body = {
      text: prompt,
    }
    setUserPrompt(prompt);
    setPromptInput("");
    try {
      setWaitingDiver(true);
      await sendPromptToDiver(body);
    } catch (error) {
      //console.error("diver error after a prompt: " + error)
      setDiverMessage("The server has encountered an error processing this prompt. Try again later.");
    } finally {
      setWaitingDiver(false);
    }
  }

  const handleDiverResponse = (responseBody) => {
    setDiverMessage(responseBody.response);
  }

  const CustomLinearProgress = styled(LinearProgress)({
    height: 2,
    borderRadius: 2,
    backgroundColor: "#121212",
    "& .MuiLinearProgress-bar": {
      background: "linear-gradient(90deg,rgb(0, 50, 200),rgb(30, 0, 255),rgb(47, 0, 255),rgb(106, 0, 255),rgb(200, 0, 255),rgb(183, 0, 125))",
    },
  });

  const handleCloseUserPrompt = () => {
    setDiverMessage(promptExamples);
    setUserPrompt(null);
  }

  const simDrawerWidth = 350;
  const [simOpen, setSimOpen] = useState(false);
  const [simStartedState, setSimStartedState] = useState(false);

  useEffect(() => {
    if (simStartedState) {
      handleTimeframeChange("SIMULATION", "SIMULATION")
    } else {
      handleTimeframeChange("WEEKLY", TIMEFRAMES.WEEKLY)
    }
  }, [simStartedState])

  const [isSingleAmountsLoading, setIsSingleAmountsLoading] = useState(false);

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
        sx={{
          flexGrow: 1,
          transition: "margin 0.3s",
          marginRight: {
            xs: 0,
            sm: 0,
            md: simOpen ? `${simDrawerWidth}px` : 0,
            lg: simOpen ? `${simDrawerWidth}px` : 0,
          }
        }}
      >
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
            <Box mt="0px" display="flex">
              <Box>
                <Typography color={colors.grey[300]} fontFamily={"lexend"} fontWeight={"light"} variant="h6">Time Frame</Typography>
                <ButtonGroup size="medium" aria-label="Basic button group">
                  {simStartedState ?
                    <Chip
                      sx={{
                        height: '37px',
                        border: '1px solid white',
                        fontFamily: 'lexend',
                        fontWeight: 'light',
                      }}
                      key={"timeframe-sim"}
                      label="SIMULATION"
                    />
                    : Object.entries(TIMEFRAMES).map(([key, value]) => {
                      return (
                        <Button
                          sx={{ height: '37px', border: '1px solid white' }}
                          color={"inherit"}
                          variant={selectedTimeframeKey === key ? "contained" : "outlined"}
                          key={key}
                          onClick={() => { handleTimeframeChange(key, value) }}
                        >
                          {value}
                        </Button>)
                    })}
                </ButtonGroup>
              </Box>
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
                <Box ml="10px" mt="30px">
                  <HelpIcon onTouchStart={handleTooltipTouch} />
                </Box>
              </Tooltip>
            </Box>
          </Box>
          <Box
            gridColumn={"span 3"}
            mt="22px"
            pb="15px"
            display={"flex"}
            justifyContent={{
              xs: "start",
              sm: "end",
              md: "end",
              lg: "end",
            }}
          >
            <Button sx={{ textTransform: "none" }} size="small" color="inherit" variant="outlined" onClick={handleDiverClick} >
              {/* <AssistantIcon /> */}
              <Box mt="5px" >
                <img width="19px" src="https://raw.githubusercontent.com/basyirGH/images/main/diving-svgrepo-com.svg" />
              </Box>
              <Typography ml="3px" fontSize={"13px"} fontFamily={"lexend"} fontWeight={"light"}>Diver</Typography>
            </Button>
            <Button
              // disabled={orderLimitReached ? true : false}
              sx={{ textTransform: "none", ml: '10px' }}
              size="small"
              //onClick={() => setSidStarted(simStarted ? false : true)}
              onClick={() => setSimOpen(simOpen ? false : true)}
              color="inherit"
              variant="outlined">
              {<ShoppingCart />}
              <Typography fontSize={"13px"} fontFamily={"lexend"} fontWeight={"light"} >Simulation</Typography>
            </Button>
          </Box>
        </Box>

        {/* GRID & CHARTS */}
        <Box
          display="flex">
          <Box
            width={"100%"}
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

                  return type.metrics.length === 4 ? type.metrics.map((metric) => {
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
                  })
                    :
                    Array.from({ length: 4 }).map((_, index) => (
                      <Box
                        key={index}
                        gridColumn="span 3"
                        gridRow="span 1"
                        backgroundColor="rgb(30, 30, 30)"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Skeleton variant="rectangular" width="100%" height="100%" />
                      </Box>
                    ))
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
                {socket ?
                  <DemographyPieChart socket={socket} selectedTimeframeKey={selectedTimeframeKey} selectedTimeframeValue={selectedTimeframeValue} />
                  :
                  <Skeleton variant="rectangular" width="100%" height="100%" />
                }
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
                        {socket ? <RealTimeMetricChart socket={socket} metricCodeProp={code} />
                        :
                        <Skeleton variant="rectangular" width="100%" height="100%" />
                        }
                      </Box>
                    )
                  })}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
      {/* DIVER */}
      <Drawer
        variant="persistent"
        open={diverOpen}
        anchor="bottom"
        slotprops={{ backdrop: { sx: { backgroundColor: "transparent" } } }}
        onClose={() => setDiverOpen(false)}
      >
        <Box
          textAlign={"left"}
          p="10px 10px 0px 10px"
          backgroundColor='#121212'
          sx={{ cursor: 'pointer' }}
          onClick={() => setDiverOpen(false)}
        >
          <KeyboardArrowDown />
        </Box>
        <Box
          backgroundColor='#121212'
          p={{
            xs: '0px 20px 10px 20px',
            sm: '0px 100px 10px 100px',
            md: '0px 200px 10px 200px',
            lg: '0px 300px 10px 300px'
          }}>
          <Box
            height="auto"
            minHeight={"400px"}
            display={"flex"}
            flexDirection={"column"}
            justifyContent={"space-between"} >
            <Box>
              <Box textAlign={"center"}>
                <Box justifyContent={"center"} display="flex">
                  <Box mt="2px" mr="5px">
                    <img width="20px" src="https://raw.githubusercontent.com/basyirGH/images/main/diving-svgrepo-com.svg" />
                  </Box>
                  <Typography fontFamily={"lexend"} fontWeight={"light"} variant="h4">
                    Diver
                  </Typography>
                  {/* <Typography mt="6px" mb="6px" pl="7px" pr="7px" sx={{ borderRadius: '0px', color: 'black', backgroundColor: 'white' }} ml="10px" fontSize="10px" fontFamily={"lexend"}> BETA</Typography> */}
                </Box>
                <Typography color={colors.grey[300]} fontFamily={"lexend"} fontWeight={"light"} variant="h6">
                  Get quick answers from the depths of the database.
                </Typography>
                {/* <Typography mt="20px" variant="h6" fontFamily={"lexend"} fontWeight={"light"} >
                  
                </Typography> */}
              </Box>
            </Box>
            <Box mt="auto">
              <Box
                mb="10px"
                display={userPrompt ? 'flex' : 'none'}
                justifyContent={"flex-end"}>
                <Box
                  display={"flex"}
                  flexDirection={"column"}
                >
                  <Typography
                    p="10px 15px 10px 15px"
                    backgroundColor={colors.grey[800]}
                    mb="5px"
                    fontFamily={"lexend"}
                    fontWeight={"light"}
                    borderRadius={"20px"}
                    variant="h6">
                    {userPrompt}
                  </Typography>
                  <Box display={"flex"} justifyContent={"flex-end"} mr="15px">
                    <Box
                      onClick={handleCloseUserPrompt}
                    >
                      <Close
                        sx={{
                          fontSize: '18px',
                          cursor: 'pointer',
                          '&:hover': { color: 'rgb(255, 73, 73)' }
                        }}
                      />
                    </Box>
                    <Box
                      onClick={() => handleNewDiverPrompt(userPrompt)
                      }
                    >
                      <Refresh
                        sx={{
                          fontSize: '17px',
                          cursor: 'pointer',
                          '&:hover': { color: 'rgb(0, 94, 217)' }
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Box>
              <Typography mb="20px" fontFamily={"lexend"} fontWeight={"light"} variant="h5">
                {waitingDiver ? <CustomLinearProgress /> : diverMessage}
              </Typography>
            </Box>
            <Box textAlign={"center"}>
              <TextField
                value={promptInput}
                fullWidth
                // multiline
                // maxRows={3}
                error={promptInputError}
                helperText={promptInputError ? "Empty input not allowed" : null}
                onChange={(e) => setPromptInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    //console.log("Enter key pressed!");
                    // Call your function here
                    handleNewDiverPrompt(e.target.value);
                  }
                }}
                InputProps={{
                  sx: { fontSize: 15, fontFamily: 'lexend', fontWeight: 'light' } // Change font size
                }}
                autoFocus={true}
                variant="outlined"
                placeholder="Be specific for the best results"
              />
              <Typography color={colors.grey[400]} mt="5px" fontFamily={"lexend"} fontWeight={"light"} fontSize={"11px"}>
                Generative AI Text-to-SQL powered by Google Gemini. Not for conversations or predictions. Responses can be inaccurate.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Drawer>
      <Simulation
        socket={socket}
        simOpen={simOpen}
        setSimOpen={setSimOpen}
        simStartedState={simStartedState}
        setSimStartedState={setSimStartedState} />
    </Box>
  );
};

export default Dashboard;
