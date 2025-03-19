import { CachedOutlined, ChevronRight, Construction, People, PlayArrow, Refresh, SentimentSatisfied, SentimentSatisfiedAlt, SentimentSatisfiedAltOutlined, ShoppingCart } from "@mui/icons-material";
import { Box, Button, Chip, Drawer, FormControlLabel, Select, Slider, Switch, Typography, MenuItem, Snackbar, Alert } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useRef, useState, useEffect } from "react";
import { ICONS, METRIC_TYPES, REAL_TIME_TRENDS, SINGLE_AMOUNT_METRIC_CODES, SOCKET_EVENTS, TIMEFRAMES } from "../../constants";
import { tokens } from "../../theme";
import { useTheme } from "@emotion/react";
import generateOrder from "./generateOrder";
import { format } from 'date-fns-tz';
import domtoimage from "dom-to-image";
import "./style.css"

const Simulation = ({ socket, simOpen, setSimOpen, simStartedState, setSimStartedState }) => {

    const MAX_BATCH_PER_SIM = 30;
    const BATCH_DELAY = 2000;
    const DRAWER_WIDTH = 350;
    const GENDER_RATIO_DELAY = 30000;
    const ACTIVE_FACTORS_DELAY = 15000;
    const OPPOSITE_GENDER_BIAS_WEIGHT = 0.1;
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const priceMarks = [
        { value: -50, label: "-50", weight: 50 },
        { value: -25, label: "-25", weight: 25 },
        { value: 0, label: "0", weight: 0 },
        { value: 25, label: "+25", weight: -25 },
        { value: 50, label: "+50", weight: -50 },
    ];
    const IOSSwitch = styled((props) => (
        <Switch size="small" focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
    ))(({ theme }) => ({
        width: 21,
        height: 13,
        padding: 0,
        '& .MuiSwitch-switchBase': {
            padding: 0,
            margin: 1,
            transitionDuration: '300ms',
            '&.Mui-checked': {
                transform: 'translateX(8px)',
                color: '#fff',
                '& + .MuiSwitch-track': {
                    backgroundColor: '#65C466',
                    opacity: 1,
                    border: 0,
                    ...theme.applyStyles('dark', {
                        backgroundColor: colors.blueAccent[500],
                    }),
                },
                '&.Mui-disabled + .MuiSwitch-track': {
                    opacity: 0.5,
                },
            },
            '&.Mui-focusVisible .MuiSwitch-thumb': {
                color: '#33cf4d',
                border: '3px solid #fff',
            },
            '&.Mui-disabled .MuiSwitch-thumb': {
                color: theme.palette.grey[100],
                ...theme.applyStyles('dark', {
                    color: theme.palette.grey[600],
                }),
            },
            '&.Mui-disabled + .MuiSwitch-track': {
                opacity: 0.7,
                ...theme.applyStyles('dark', {
                    opacity: 0.3,
                }),
            },
        },
        '& .MuiSwitch-thumb': {
            boxSizing: 'border-box',
            width: 11,
            height: 11,
        },
        '& .MuiSwitch-track': {
            borderRadius: 13 / 2,
            backgroundColor: '#E9E9EA',
            opacity: 1,
            transition: theme.transitions.create(['background-color'], {
                duration: 500,
            }),
            ...theme.applyStyles('dark', {
                backgroundColor: '#39393D',
            }),
        },
    }));

    const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const businessModels = [
        {
            id: 0,
            // name: <>  *This doesn't affect the simulation <br /> because it's just a preference. <br /> *Cannot be changed after starting.</>,
            name: "",
            categories: [],
            disabled: true
        },
        {
            id: 1,
            name: "Multi-Seller Marketplace",
            categories: [
                { id: 1, name: "Hardware/Tools", checked: false, bias: 0, chance: 90, avgPrice: 500, avgPriceIndicator: "$$" },
                { id: 2, name: "Gaming/Electronics", checked: false, bias: 0, chance: 70, avgPrice: 700, avgPriceIndicator: "$$$" },
                { id: 3, name: "Cosmetics/Beauty", checked: false, bias: 1, chance: 90, avgPrice: 500, avgPriceIndicator: "$$" },
                { id: 4, name: "DIY Crafts/Kitchenware", checked: false, bias: 1, chance: 70, avgPrice: 100, avgPriceIndicator: "$" }, // 0 for male, 1 for female

            ],
            disabled: false
        },
        {
            id: 2,
            name: "Dry Foods (soon)",
            categories: [],
            disabled: true
        },
        {
            id: 3,
            name: "Clothing and Accessories (soon)",
            categories: [],
            disabled: true
        },
        {
            id: 4,
            name: "Home Improvement and Decor (soon)",
            categories: [],
            disabled: true
        }
    ];

    const [activeCategoriesState, setActiveCategoriesState] = useState(businessModels[1].categories);
    const getCurrentDate = (timeZone = 'Asia/Kuala_Lumpur') => {
        return format(new Date(), "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone });
    };

    // Function to set an item with expiration time
    const setWithExpiry = (key, value, ttl) => {
        const now = new Date();
        const item = {
            value: value,
            expiry: now.getTime() + ttl, // Current time + time-to-live (TTL) in milliseconds
        };
        localStorage.setItem(key, JSON.stringify(item));
    };

    // Function to get an item and check expiration
    const getWithExpiry = (key) => {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) {
            return null;
        }

        const item = JSON.parse(itemStr);
        const now = new Date();

        // Check if expired
        if (now.getTime() > item.expiry) {
            localStorage.removeItem(key);
            return null;
        }

        return item.value;
    };

    const simIDRef = useRef(null);
    const [simID, setSimID] = useState(null);
    const takeScreenshot = () => {
        domtoimage.toPng(document.body)
            .then((dataUrl) => {
                const link = document.createElement("a");
                link.href = dataUrl;
                link.download = `${simIDRef.current}.png`;
                link.click();
            })
            .catch((error) => {
                //console.error("Screenshot failed!", error);
            });
    };

    const simStartedRef = useRef(false);
    const simAlreadyRunningRef = useRef(false);
    const productCategoriesRef = useRef([]);
    const priceRateRef = useRef(priceMarks[2].value);
    const genderRatioTimerIdRef = useRef(null);
    const simExpired = getWithExpiry("simExpired");
    const [priceRateState, setPriceRateState] = useState(priceRateRef.current);
    const [genderRatioTimerState, setGenderRatioTimerState] = useState(GENDER_RATIO_DELAY);
    useEffect(() => {
        //console.log("simStarted: " + simStartedState)
        simStartedRef.current = simStartedState;
        productCategoriesRef.current = activeCategoriesState;
        priceRateRef.current = priceRateState;
        // Run simulation upon user action, only if one is not already running.
        if (simStartedState && !simAlreadyRunningRef.current) {
            // Check if a simulation is already ran by other clients. Must use .then for Promise
            checkSimStatus().then((isSimOK) => {
                if (isSimOK) {
                    simAlreadyRunningRef.current = true;
                    runSim();
                    initCustomers();
                    initGenderRatioTimer();
                    initExternalFactors();
                    initFactorsTimer();
                } else {
                    // A simulation is already running by another client.
                    setSimStartedState(false);
                }
            });

        }
        // Once simulation is stopped by MAX_SEND_PER_SIM in runSim(), clear intervals.
        else if (!simStartedState) {
            //console.log("sure?");
            setGenderRatioTimerState(GENDER_RATIO_DELAY);
            setFactorsTimerState(ACTIVE_FACTORS_DELAY);
            if (genderRatioTimerIdRef.current) {
                clearInterval(genderRatioTimerIdRef.current);
                genderRatioTimerIdRef.current = null;
            }
            if (customersIntervalIdRef.current) {
                clearInterval(customersIntervalIdRef.current);
                customersIntervalIdRef.current = null;
            }
            if (activeFactorsIntervalIdRef.current) {
                clearInterval(activeFactorsIntervalIdRef.current);
                activeFactorsIntervalIdRef.current = null;
            }
            if (factorsTimerIdRef.current) {
                clearInterval(factorsTimerIdRef.current);
                factorsTimerIdRef.current = null;
            }
        }
        // Bottom-up: React runs the cleanup function before running the effect again.
        // Initially, the effect runs, and the cleanup function is not executed yet because there's nothing to clean up.
        // In clean-up, value is from the previous render (not the latest state/ref update)
        return () => {
            if (!simStartedRef.current) {
                //console.log("Stopping simulation...");
                simAlreadyRunningRef.current = false;
            }
        }
    }, [simStartedState, activeCategoriesState, priceRateState]);

    // Check if a simulation is already ran by other clients
    const [checkingSim, setCheckingSim] = useState(false);
    const checkSimStatus = async () => {
        setCheckingSim(true);
        const response = await askSimStatus();
        if (response.code === "200") {
            //console.log("resp: " + JSON.stringify(response, null, 2))
            if (response.cooldownActive) {
                setCheckingSim(false);
                setSimLog("Sorry, you have to wait for an hour to run another simulation due to limited traffic. Please try again later.");
                return;
            }
            let eventReceived = false;
            return new Promise((resolve) => {
                const handleSimStatus = () => {
                    eventReceived = true;
                    clearTimeout(timeoutId);
                    socket.off(SOCKET_EVENTS.BROADCAST_ANSWER_SIM_STATUS, handleSimStatus);
                    setCheckingSim(false);
                    setSimLog("Already running. Try again in 1-5 minutes, or when you notice an extended period of inactivity in the trend charts.");
                    resolve(false);
                };
                socket.on(SOCKET_EVENTS.BROADCAST_ANSWER_SIM_STATUS, handleSimStatus);
                const timeoutId = setTimeout(() => {
                    if (!eventReceived) {
                        //console.info("Timeout: No BROADCAST_ANSWER_SIM_STATUS received. Proceeding with simulation");
                        socket.off(SOCKET_EVENTS.BROADCAST_ANSWER_SIM_STATUS, handleSimStatus);
                        setCheckingSim(false);
                        resolve(true);
                    }
                }, 3000);
            });
        } else {
            //console.error("An error was encountered after sending ASK_SIM_STATUS to the server");
            return true; // Default to SIM check passed if API fails
        }
    };
    const askSimStatus = () => {
        return new Promise((resolve, reject) => {
            socket.emit(SOCKET_EVENTS.ASK_SIM_STATUS, {}, (ackResponse) => {
                if (ackResponse.error) {
                    reject(ackResponse.error);
                } else {
                    resolve(ackResponse);
                }
            });
        })
    }

    useEffect(() => {
        if (!socket) return;
        const handleAskSimStatus = (response) => {
            if (simAlreadyRunningRef.current) { handleSimStatusAnswered() }
            //console.log("ask: " + JSON.stringify(response, null, 2))
            simIDRef.current = response.sessionID;
            setSimID(simIDRef.current);
        };
        socket.on(SOCKET_EVENTS.BROADCAST_ASK_SIM_STATUS, (response) => handleAskSimStatus(response));
        return () => {
            socket.off(SOCKET_EVENTS.BROADCAST_ASK_SIM_STATUS, (response) => handleAskSimStatus(response));
        };
    }, [socket]);

    const handleSimStatusAnswered = async () => {
        //console.log("Broadcasting this running simulation status (running)");
        try {
            await broadcastAnswerSimStatus();
        } catch (error) {
            //console.error("Failed to broadcast sim status:", error);
        }
    };

    const broadcastAnswerSimStatus = () => {
        return new Promise((resolve, reject) => {
            socket.emit(SOCKET_EVENTS.ANSWER_SIM_STATUS, {}, (ackResponse) => {
                if (ackResponse?.error) {
                    reject(ackResponse.error);
                } else {
                    resolve(ackResponse);
                }
            });
        });
    };


    const handleTargetChange = (e) => {
        activeSimTargetRef.current = simTargets[e.target.value]
        setActiveSimTargetState(activeSimTargetRef.current);
        // with modulo, if left < right, then left % right == left.
        // targetIndex.current++;
        // activeSimTargetRef.current = simTargets[targetIndex.current % simTargets.length]
        // setActiveSimTargetState(activeSimTargetRef.current);
    }
    const simTargets = [
        { id: 0, name: "Generate at least 200 total orders. ", level: 'Easy', criteria: (data) => data.simOrdersCount >= 200 },
        { id: 1, name: "Get at least 10% of orders made by female customers by only selling Gaming/Electronics.", level: 'Easy', criteria: (data) => data.femaleRatio >= 10 && data.categoryId === 2 },
        { id: 2, name: "Reach equal ratio of customer gender in total orders. (50% : 50%)", level: 'Hard', criteria: (data) => data.maleRatio === 50 },
        { id: 3, name: "Generate RM60K of revenue in a single batch.", level: 'Very Hard', criteria: (data) => data.batchRevenue >= 60000 },
    ]
    const maxOrdersPerBatchRef = useRef(100);
    const targetIndex = useRef(0);
    const activeSimTargetRef = useRef(simTargets[targetIndex.current]);
    let activeTargetMet = false;
    const [activeSimTargetState, setActiveSimTargetState] = useState(activeSimTargetRef.current);
    const [simLog, setSimLog] = useState("Ready");
    const runSim = async () => {
        let maleCount = 0;
        let maleRatio = 0;
        let criterias = [];
        let femaleCount = 0;
        let femaleRatio = 0;
        let batchCounter = 1;
        let simOrdersCount = 0;
        activeMaleRef.current = 50;
        activeFemaleRef.current = 50;
        let statusMessage = "";
        setActiveMaleState(activeMaleRef.current);
        setActiveFemaleState(activeFemaleRef.current);
        while (simAlreadyRunningRef.current && batchCounter <= MAX_BATCH_PER_SIM) {
            let order = {};
            let orders = [];
            let customerId = 0;
            let categoryId = 0;
            let batchRevenue = 0;
            let batchOrdersCount = 0;
            let categoryAvgPrice = 0;
            let categoryItemPrice = 0;
            let customersActive = activeMaleRef.current !== 0 || activeFemaleRef.current !== 0;
            const currentDate = getCurrentDate();
            const randomOrderCount = getRandomNumber(0, maxOrdersPerBatchRef.current);
            for (let i = 0; i < randomOrderCount; i++) {
                customerId = getRandomCustomerId();
                categoryId = getBiasedCategoryId(customerId);
                categoryAvgPrice = productCategoriesRef.current?.[categoryId - 1]?.avgPrice;
                categoryItemPrice = categoryAvgPrice + (categoryAvgPrice * (priceRateRef.current / 100));
                order = generateOrder(customerId, categoryId, currentDate, categoryItemPrice);
                if (categoryId !== 0) { orders.push(order) }
                //console.log("orders: " + JSON.stringify(orders, null, 2));
            }
            if (orders.length < 1 || !customersActive) {
                //console.log("skipping iteration " + batchCounter);

                if (!activeTargetMet) { statusMessage = "No orders made, but you are on the right track!"; }
                setSimLog(
                    <>
                        {statusMessage} Batch {batchCounter} / {MAX_BATCH_PER_SIM} sent. <br />
                    </>
                );
                batchCounter++;
                await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY));
                continue;
            } else {
                if (!activeTargetMet) { statusMessage = "You are doing well!"; }
            }
            const response = await sendOrdersBatch({ simulationDataList: orders });
            if (response.status === "200") {
                // //console.log(`> +1 order OK (${localSimCounter}/${MAX_SEND_PER_SIM})`);
                orders.forEach(order => {
                    order.items.forEach(item => {
                        categoryId = item.productId;
                        batchRevenue = batchRevenue + (item.quantity * item.pricePerUnit);
                    })
                    if (order.customerId % 2 === 0) { maleCount++ }
                    else { femaleCount++ }
                });
                batchOrdersCount = batchOrdersCount + orders.length;
                simOrdersCount = simOrdersCount + batchOrdersCount;
                maleRatio = Math.round((maleCount / simOrdersCount) * 100);
                femaleRatio = Math.round((femaleCount / simOrdersCount) * 100);
                criterias = {
                    maleRatio: maleRatio,
                    femaleRatio: femaleRatio,
                    batchRevenue: batchRevenue,
                    batchOrdersCount: batchOrdersCount,
                    categoryId: categoryId,
                    simOrdersCount: simOrdersCount
                };
                //console.table("table: " + JSON.stringify(criterias, null, 2));
                // Both && and || serve the same purpose: ensuring isActiveTargetMet defaults to false if criteria(criterias) returns a falsy value.
                // If only want to handle null or undefined cases, use ??. (Recommended)
                // If want to treat all falsy values as false, use || (but be careful with 0 and "").

                if (!activeTargetMet) {
                    activeTargetMet = activeSimTargetRef.current?.criteria(criterias) ?? false;
                    //console.log("why: " + femaleRatio + ", " + categoryId + ": " + activeTargetMet);
                }
                if (activeTargetMet) {
                    statusMessage = "You have succesfully reached your target! The simulation will keep running.";
                }
                setSimLog(
                    <>
                        {statusMessage} Batch {batchCounter} / {MAX_BATCH_PER_SIM} sent. <br />
                    </>
                );
            }
            batchCounter++;
            await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY));
        }
        if (activeTargetMet) { setSimLog("You have succesfully reached your target! Simulation ended. ") }
        else { setSimLog("You didn't reach your sales target, better luck next time! Simulation ended. ") }
        await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY));
        simStartedRef.current = false;
        await takeScreenshot();
        setSimStartedState(simStartedRef.current)
        activeMaleRef.current = 0;
        activeFemaleRef.current = 0;
        setActiveMaleState(activeMaleRef.current);
        setActiveFemaleState(activeFemaleRef.current);
        setActiveFactorsState([externalFactors[0]]);
        maxOrdersPerBatchRef.current = 100;
        setWithExpiry("simExpired", "true", 3600000);
        setShowAlert(true);
    }

    const sendOrdersBatch = (body) => {
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

    const customersIntervalIdRef = useRef(0);
    const activeMaleRef = useRef(0);
    const activeFemaleRef = useRef(0);
    const [activeMaleState, setActiveMaleState] = useState(0);
    const [activeFemaleState, setActiveFemaleState] = useState(0);
    // Random customer gender ratio every GENDER_RATIO_DELAY, auto restart.
    const initCustomers = () => {
        customersIntervalIdRef.current = setInterval(() => {
            let random = getRandomNumber(0, 100);
            activeMaleRef.current = random;
            activeFemaleRef.current = 100 - activeMaleRef.current;
            setActiveMaleState(activeMaleRef.current);
            setActiveFemaleState(activeFemaleRef.current);
            setGenderRatioTimerState(GENDER_RATIO_DELAY);
        }, GENDER_RATIO_DELAY);
    }

    // For every 1 second, track GENDER_RATIO_DELAY and reduce until 0
    const initGenderRatioTimer = () => {
        if (genderRatioTimerIdRef.current) { clearInterval(genderRatioTimerIdRef.current) }
        genderRatioTimerIdRef.current = setInterval(() => {
            setGenderRatioTimerState((prev) => (prev > 0 ? prev - 1000 : 0));
        }, 1000);
    }

    const getRandomCustomerId = () => {
        if (getRandomNumber(0, 100) < activeMaleRef.current) {
            // //console.log("% picked male with male portion: " + activeMale)
            return 2 * getRandomNumber(1, 30); // 2, 4, 6, ..., 60
        } else {
            // //console.log("% picked female with female portion: " + activeFemale)
            return 2 * getRandomNumber(0, 29) + 1; // 1, 3, 5, ..., 59
        }
    }

    const getBiasedCategoryId = (customerId) => {
        let productCategories = productCategoriesRef.current;
        const category = productCategories[getRandomNumber(0, productCategories.length - 1)];
        const categoryChance = getRandomNumber(0, 100);
        if (category.checked && categoryChance < category.chance) {
            if (customerId % 2 === category.bias) {
                return category.id;
            } else {
                const oppositeGenderBiasChance = category.chance * OPPOSITE_GENDER_BIAS_WEIGHT; // Reduce chance for opposite gender
                if (getRandomNumber(0, 100) < oppositeGenderBiasChance) {
                    return category.id; // Allow opposite gender selection with reduced probability
                }
            }
        }
        return 0;
    }

    const [selectedBusinessModel, setSelectedBusinessModel] = useState(businessModels[1].id);
    const handleBusinessChange = (e) => {
        const id = e.target.value;
        setSelectedBusinessModel(id)
        setActiveCategoriesState(businessModels[id].categories);
    }

    const handleAdjustPrice = (e) => { setPriceRateState(e.target.value) }

    const externalFactors = [
        { id: 0, name: "No significant events", weight: 0, color: "#004e1b" },
        { id: 1, name: "Increasing competition", weight: 25, color: "#855151" },
        { id: 2, name: "Escalating fear of scams and frauds", weight: 25, color: "#855151" },
        { id: 3, name: "Poor customer service", weight: 25, color: "#855151" },
        { id: 4, name: "Rising tax/tariff", weight: 25, color: "#855151" },
        { id: 5, name: "Nationwide internet speed outage", weight: 100, color: "#810000" },
    ]
    const activeFactorsIntervalIdRef = useRef();
    const [activeFactorsState, setActiveFactorsState] = useState([externalFactors[0]]);
    const initExternalFactors = () => {
        activeFactorsIntervalIdRef.current = setInterval(() => {
            setActiveFactorsState([]);
            maxOrdersPerBatchRef.current = 100;
            let factorsLastIndex = externalFactors.length - 1;
            let random = getRandomNumber(0, factorsLastIndex);
            const newFactors = [];
            newFactors.push(externalFactors[random]);
            setActiveFactorsState(newFactors);
            // Multiple factors at once
            // if (random === 0 || random === factorsLastIndex) {
            //     const newFactors = [];
            //     newFactors.push(externalFactors[random]);
            //     setActiveFactorsState(newFactors);
            // } else {
            //     for (let i = 1; i <= random; i++) {
            //         const subRandom = getRandomNumber(i, random);
            //         setActiveFactorsState(prev => {
            //             const newFactors = [...prev];
            //             if (!newFactors.includes(externalFactors[subRandom])) {
            //                 newFactors.push(externalFactors[subRandom]);
            //             }
            //             return newFactors;
            //         });
            //     }
            // }
            setFactorsTimerState(ACTIVE_FACTORS_DELAY);
        }, ACTIVE_FACTORS_DELAY)
    }

    // For every 1 second, track ACTIVE_FACTORS_DELAY and reduce until 0
    const factorsTimerIdRef = useRef(null);
    const [factorsTimerState, setFactorsTimerState] = useState(ACTIVE_FACTORS_DELAY);
    const initFactorsTimer = () => {
        if (factorsTimerIdRef.current) { clearInterval(factorsTimerIdRef.current) }
        factorsTimerIdRef.current = setInterval(() => {
            setFactorsTimerState((prev) => (prev > 0 ? prev - 1000 : 0));
        }, 1000);
    }

    // Track changes in active factors and price rate to influence max orders allowed.
    const [maxOrdersCountState, setMaxOrdersCountState] = useState(maxOrdersPerBatchRef.current);
    useEffect(() => {
        activeFactorsState.forEach(factor => {
            maxOrdersPerBatchRef.current = maxOrdersPerBatchRef.current - factor.weight;
        });
        ////console.log("max: " + maxOrdersCountRef.current);
        setMaxOrdersCountState(maxOrdersPerBatchRef.current);
    }, [activeFactorsState])

    useEffect(() => {
        let priceWeight = priceRateState * -1;
        maxOrdersPerBatchRef.current = maxOrdersCountState + priceWeight;
        //console.log("max: " + maxOrdersPerBatchRef.current);
    }, [maxOrdersCountState, priceRateState]);

    const handleCategorySwitch = (id) => {
        setActiveCategoriesState((prev) => {
            if (!prev) return [];
            return prev.map((cat) =>
                cat.id === id ? { ...cat, checked: !cat.checked } : cat
            )
        })
    };

    // "All-on/off" switch
    const [allCategoriesOn, setAllCategoriesOn] = useState(false);
    const handleAllCategoriesOn = (e) => {
        setAllCategoriesOn(e.target.checked);
    }
    useEffect(() => {
        setActiveCategoriesState(prev => {
            return prev.map(cat => {
                return {
                    ...cat,
                    checked: allCategoriesOn
                }
            })
        });
    }, [allCategoriesOn])

    const [showAlert, setShowAlert] = useState(false);


    return (
        <Drawer
            open={simOpen}
            variant="persistent"
            sx={{
                width: DRAWER_WIDTH,
                flexShrink: 0,
                "& .MuiDrawer-paper": {
                    width: DRAWER_WIDTH,
                    boxSizing: "border-box",
                },
            }}
            // PaperProps={{
            //   sx: { mt: 12 } // Adjust as needed
            // }}
            anchor="right"
            slotprops={{ backdrop: { sx: { backgroundColor: "transparent" } } }}
            onClose={() => setSimOpen(false)}
        >
            <Box
                textAlign={"left"}
                p="10px 10px 0px 10px"
                backgroundColor='#121212'
                sx={{ cursor: 'pointer' }}
                onClick={() => setSimOpen(false)}
            >
                <ChevronRight sx={{ fontSize: '20px' }} />
            </Box>
            <Box
                backgroundColor='#121212'
                p={{
                    xs: '0px 20px 10px 20px',
                    sm: '0px 20px 10px 20px',
                    md: '0px 20px 10px 20px',
                    lg: '0px 20px 10px 20px'
                }}>
                <Box
                    mb="0px"
                    display={"flex"}
                    flexDirection={"column"}
                    justifyContent={"space-between"}
                >
                    <Box flexGrow={1}>
                        <Box textAlign={"center"}>
                            <Box justifyContent={"center"} display="flex">
                                <Box mt="0px" mr="5px">
                                    <ShoppingCart sx={{ fontSize: '22px' }} />
                                </Box>
                                <Typography fontFamily={"lexend"} fontWeight={"light"} variant="h4">
                                    Simulation
                                </Typography>
                                {/* <Typography mt="6px" mb="6px" pl="7px" pr="7px" sx={{ borderRadius: '0px', color: 'black', backgroundColor: 'white' }} ml="10px" fontSize="10px" fontFamily={"lexend"}> BETA</Typography> */}
                            </Box>
                            <Typography color={colors.grey[300]} fontFamily={"lexend"} fontWeight={"light"} variant="h6">
                                Run a virtual retail and hit the sales target.<br />
                            </Typography>
                            {/* <Typography color={colors.grey[300]} fontFamily={"lexend"} fontWeight={"light"} fontSize={"12px"}>
                                {simID ? "simID: " + simID : null}
                            </Typography> */}
                        </Box>

                        <Box mt="20px" >
                            <Box >
                                {/* <Typography color={colors.grey[300]} fontFamily={"lexend"} fontWeight={"light"} variant="h6">
                                    Random Fluctuations</Typography> */}
                                <Typography color={colors.grey[300]} fontFamily={"lexend"} fontWeight={"light"} variant="h6">
                                    Active Customers
                                    <Chip
                                        id="gender-ratio"
                                        sx={{
                                            ml: '5px',
                                            height: '15px',
                                            mb: '3px',
                                            fontSize: '14px'
                                        }}
                                        label={`${genderRatioTimerState / 1000}s`}
                                    />
                                </Typography>
                                {/* <SentimentSatisfiedAltOutlined sx={{ fontSize: '17px', mt: '1px', color: colors.blueAccent[300] }} />
                                {activeMaleState}%
                                <SentimentSatisfiedAltOutlined sx={{ fontSize: '17px', mt: '1px', color: colors.pinkAccent[300] }} />{activeFemaleState}% */}
                                <Box display="flex">
                                    <Box display="flex"><SentimentSatisfiedAltOutlined sx={{ mr: '3px', fontSize: '17px', mt: '1px', color: colors.blueAccent[300] }} />
                                        <Typography mr="30px" fontWeight={"light"} fontFamily={"lexend"}> {activeMaleState || 0}%</Typography></Box>
                                    <Box display="flex"><SentimentSatisfiedAltOutlined sx={{ mr: '3px', fontSize: '17px', mt: '1px', color: colors.pinkAccent[300] }} />
                                        <Typography mr="30px" fontWeight={"light"} fontFamily={"lexend"}> {activeFemaleState || 0}%</Typography></Box>
                                </Box>
                            </Box>
                            <Box
                                mt="10px"
                                mb="10px"
                            >
                                <Typography color={colors.grey[300]} fontFamily={"lexend"} fontWeight={"light"} variant="h6">
                                    External Factors
                                    <Chip
                                        key="ext-factors"
                                        sx={{
                                            ml: '5px',
                                            height: '15px',
                                            mb: '3px',
                                            fontSize: '14px'
                                        }}
                                        label={`${factorsTimerState / 1000}s`}
                                    />
                                </Typography>
                                <Box pt="4px" >
                                    {activeFactorsState.map(factor => (
                                        <Chip
                                            key={factor.id}
                                            sx={{
                                                marginBottom: '3px',
                                                marginRight: '3px',
                                                height: '25px',
                                                fontFamily: 'lexend',
                                                fontWeight: 'regular',
                                                fontSize: '12px',
                                                backgroundColor: factor.color
                                            }}
                                            label={factor.name}></Chip>
                                    ))}
                                </Box>
                            </Box>
                        </Box>
                        {/* <hr color="#383838" /> */}
                        <Box mt="20px">
                            <Typography color={colors.grey[300]} fontFamily={"lexend"} fontWeight={"light"} variant="h6">
                                Business Model
                            </Typography>
                            <Box display="flex" pt="5px">
                                <Select
                                    disabled={simStartedState}
                                    MenuProps={{ disableScrollLock: true }}
                                    onChange={handleBusinessChange}
                                    value={selectedBusinessModel}
                                    sx={{
                                        height: '30px',
                                        width: 'auto',
                                        fontFamily: 'lexend',
                                        fontWeight: 'light',
                                        fontSize: '14px'
                                    }}
                                >
                                    {businessModels.map(model => (
                                        <MenuItem
                                            sx={{
                                                fontFamily: 'lexend',
                                                fontWeight: 'light',
                                                fontSize: '14px'
                                            }}
                                            key={model.id}
                                            disabled={model.disabled}
                                            value={model.id}>
                                            {model.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </Box>
                        </Box>
                        <Box key="product-listing-box" mt="10px" >
                            <Typography key="product-listing-title" color={colors.grey[300]} fontFamily={"lexend"} fontWeight={"light"} variant="h6">
                                Product Listing
                            </Typography>
                            <Box ml="5px">
                                <Box >
                                    <FormControlLabel
                                        key="active-all-categories"
                                        control={
                                            <IOSSwitch
                                                sx={{ m: 1 }}
                                                checked={allCategoriesOn}
                                                onChange={handleAllCategoriesOn}
                                            />}
                                        label="All"
                                        sx={{
                                            '& .MuiFormControlLabel-label': {
                                                fontFamily: 'lexend',
                                                fontWeight: 'light',
                                                fontSize: '14px'
                                            },
                                        }}
                                    />
                                </Box>
                                {activeCategoriesState &&
                                    activeCategoriesState.map(cat => (
                                        <Box key={"category-switch-box-" + cat.id}>
                                            <FormControlLabel
                                                key={"cat-" + cat.id}
                                                control={
                                                    <IOSSwitch
                                                        sx={{ m: 1 }}
                                                        checked={cat.checked}
                                                        onChange={() => handleCategorySwitch(cat.id)}
                                                    />}
                                                label={cat.name}
                                                sx={{
                                                    mr: 1,
                                                    '& .MuiFormControlLabel-label': {
                                                        fontFamily: 'lexend',
                                                        fontWeight: 'light',
                                                        fontSize: '14px'
                                                    },
                                                }}
                                            />
                                            <Chip
                                                key={"gender-bias"}
                                                sx={{
                                                    pd: '3px',
                                                    mr: '3px',
                                                    height: '18px',
                                                    mb: '0px',
                                                    fontSize: '12px',
                                                    color: 'black',
                                                    fontFamily: 'lexend',
                                                }}
                                                label={<SentimentSatisfiedAltOutlined sx={{ fontSize: '17px', mt: '5px', color: cat.bias ? colors.pinkAccent[300] : colors.blueAccent[300] }} />}
                                            />
                                            <Chip
                                                // icon={<SentimentSatisfiedAlt color="black" sx={{ fontSize: '17px'}} />}
                                                key="avg-price"
                                                sx={{
                                                    mt: '0px',
                                                    height: '18px',
                                                    mb: '0px',
                                                    fontSize: '13px',
                                                    color: 'white',
                                                    fontWeight: 'light',
                                                    fontFamily: 'lexend',
                                                    // backgroundColor: '#e8e8e8'
                                                }}
                                                label={`${cat.avgPriceIndicator}`}
                                            />
                                        </Box>
                                    ))
                                }
                            </Box>
                        </Box>
                        <Box mt="10px">
                            <Box display="flex">
                                <Typography color={colors.grey[300]} fontFamily={"lexend"} fontWeight={"light"} variant="h6">
                                    Prices (%)
                                </Typography>
                            </Box>
                            <Box textAlign={"center"}>
                                <Slider
                                    color="white"
                                    value={priceRateState}
                                    onChange={(e) => handleAdjustPrice(e)}
                                    valueLabelDisplay="auto"
                                    min={-50}
                                    max={50}
                                    step={5} // Allows smooth adjustments
                                    marks={priceMarks}
                                    sx={{
                                        width: '90%',
                                        "& .MuiSlider-markLabel": {
                                            fontSize: "13px", // Make labels smaller
                                        },
                                    }}
                                />
                            </Box>
                        </Box>
                        {/* <hr color="#383838" /> */}
                        <Box mt="10px">
                            <Box>
                                <Box display="flex">
                                    <Typography color={colors.grey[300]} fontFamily={"lexend"} fontWeight={"light"} variant="h6">
                                        Target
                                    </Typography>
                                    <Chip
                                        key="sim-target"
                                        sx={{
                                            ml: '10px',
                                            height: '15px',
                                            mt: '4px',
                                            mb: '0px',
                                            fontSize: '12px',
                                            color: 'white',
                                            fontWeight: 'light',
                                            fontFamily: 'lexend',
                                        }}
                                        label={activeSimTargetState.level}
                                    />
                                </Box>
                                <Select
                                    disabled={simStartedState}
                                    onChange={handleTargetChange}
                                    value={activeSimTargetState.id}
                                    fullWidth
                                    renderValue={(selected) => {
                                        const selectedTarget = simTargets.find((target) => target.id === selected);
                                        return (
                                            <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                                                {selectedTarget ? selectedTarget.name : "Select a target"}
                                            </div>
                                        );
                                    }}
                                    sx={{
                                        height: "auto",
                                        fontFamily: "lexend",
                                        fontWeight: "light",
                                        fontSize: "14px",
                                        "& .MuiSelect-select": {
                                            padding: 1,
                                        },
                                    }}
                                    MenuProps={{
                                        disableScrollLock: true,
                                    }}
                                >
                                    {simTargets.map(target => {
                                        return (
                                            <MenuItem
                                                sx={{
                                                    fontFamily: 'lexend',
                                                    fontWeight: 'light',
                                                    fontSize: '14px'
                                                }}
                                                key={target.id}
                                                value={target.id}>
                                                {target.name}
                                            </MenuItem>
                                        )
                                    })}
                                </Select>
                            </Box>
                        </Box>
                        <Box mt="10px">
                            <Box display="flex">
                                <Typography color={colors.grey[300]} fontFamily={"lexend"} fontWeight={"light"} variant="h6">
                                    Status
                                </Typography>
                            </Box>
                            <Typography fontFamily={"lexend"} fontWeight={"light"} variant="h6">
                                {simLog}
                            </Typography>
                            <Typography mt="5px" color={colors.grey[300]} fontFamily={"lexend"} fontWeight={"light"} fontSize={"12px"}>
                                {simID ? "simID: " + simID : null}
                            </Typography>
                            {/* <button onClick={() => setShowAlert(true)}>Show Alert</button> */}
                            <Snackbar anchorOrigin={{ vertical: "bottom", horizontal: "center" }} open={showAlert} autoHideDuration={15000} onClose={() => setShowAlert(false)}>
                                <Alert sx={{ fontFamily: 'lexend', fontSize: '15px', fontWeight: 'light', color: 'white', p: 2 }} severity="success" onClose={() => setShowAlert(false)}>
                                    You can use your simID to ask Diver about your generated orders. A screenshot was also downloaded for your reference.
                                </Alert>
                            </Snackbar>
                        </Box>
                    </Box>
                    <Button
                        disabled={simStartedState ? true : false}
                        sx={{ textTransform: "none", marginTop: '10px' }}
                        size="small"
                        onClick={() => setSimStartedState(simStartedState ? false : true)}
                        color="inherit"
                        variant="outlined">
                        {<PlayArrow />}
                        <Typography
                            fontSize={"13px"}
                            fontFamily={"lexend"}
                            fontWeight={"light"}
                        >
                            {simStartedState ? checkingSim ? "Checking..." : "Running..." : "Start"}
                        </Typography>
                    </Button>
                    {/* <Typography
                        mt="5px" 
                        color={colors.grey[300]}
                        fontSize={"12px"}
                        fontFamily={"lexend"}
                        fontWeight={"light"}
                    >
                        By clicking Start, you agree that your one of your personal data is securely stored for optimized user experience. It will not be shared to third parties.
                    </Typography> */}
                </Box>
            </Box>
        </Drawer>
    )
}

export default Simulation;