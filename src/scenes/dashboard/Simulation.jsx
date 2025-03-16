import { ChevronRight, Construction, People, PlayArrow, SentimentSatisfied, SentimentSatisfiedAlt, SentimentSatisfiedAltOutlined, ShoppingCart } from "@mui/icons-material";
import { Box, Button, Chip, Drawer, FormControlLabel, Select, Slider, Switch, Typography, MenuItem } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useRef, useState, useEffect } from "react";
import { ICONS, METRIC_TYPES, REAL_TIME_TRENDS, SINGLE_AMOUNT_METRIC_CODES, SOCKET_EVENTS, TIMEFRAMES } from "../../constants";
import { tokens } from "../../theme";
import { useTheme } from "@emotion/react";
import generateOrder from "./generateOrder";
import { format } from 'date-fns-tz';

const Simulation = ({ socket, simOpen, setSimOpen, simStartedState, setSimStartedState }) => {

    const MAX_SEND_PER_SIM = 100;
    const SIM_DELAY = 2000;
    const DRAWER_WIDTH = 350;
    const LIMIT_REACHED_LOG = "> orders limit reached, sim stopped.";
    const ANIM_DELAY = 500;
    const SIM_LIMIT_ITEM_NAME = "ordersMaxedOut"
    const GENDER_RATIO_DELAY = 45000;
    const ACTIVE_FACTORS_DELAY = 20000;
    const OPPOSITE_GENDER_BIAS_WEIGHT = 0.1;
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const orderLimitReached = localStorage.getItem(SIM_LIMIT_ITEM_NAME) === "true";
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
                { id: 1, name: "Automotive/Tools", checked: false, bias: 0, chance: 90, avgPrice: 500, avgPriceIndicator: "$$", icon: <Construction /> }, // 0 for male, 1 for female
                { id: 2, name: "Gaming/Electronics", checked: false, bias: 0, chance: 70, avgPrice: 700, avgPriceIndicator: "$$$" },
                { id: 3, name: "Kids/Baby", checked: false, bias: 1, chance: 90, avgPrice: 500, avgPriceIndicator: "$$" },
                { id: 4, name: "Pastry/Bakery", checked: false, bias: 1, chance: 70, avgPrice: 100, avgPriceIndicator: "$" },
            ],
            disabled: false
        },
        {
            id: 2,
            name: "Personal Care eCommerce (soon)",
            categories: [
                { id: 1, name: "Cosmetics", checked: false, bias: 1, chance: 99 },
                { id: 2, name: "Hair Gels", checked: false, bias: 0, chance: 98 },
                { id: 3, name: "Shaving", checked: false, bias: 0, chance: 60 },
                { id: 4, name: "Skincare", checked: false, bias: 1, chance: 65 },
            ],
            disabled: true
        },
        {
            id: 3,
            name: "Home Improvement & DIY eCommerce (soon)",
            categories: [
                { id: 1, name: "Plumbing", checked: false, bias: 0, chance: 97 },
                { id: 2, name: "Gardening", checked: false, bias: 1, chance: 80 },
                { id: 3, name: "Hand Tools", checked: false, bias: 0, chance: 90 },
                { id: 4, name: "Crafting", checked: false, bias: 1, chance: 85 },
            ],
            disabled: true
        }
    ];

    const [activeCategoriesState, setActiveCategoriesState] = useState(businessModels[1].categories);
    const getCurrentDate = (timeZone = 'Asia/Kuala_Lumpur') => {
        return format(new Date(), "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone });
    };

    const simStartedRef = useRef(false);
    const simAlreadyRunningRef = useRef(false);
    const productCategoriesRef = useRef([]);
    const priceRateRef = useRef(priceMarks[2].value);
    const genderRatioTimerIdRef = useRef(null);
    const [priceRateState, setPriceRateState] = useState(priceRateRef.current);
    const [genderRatioTimerState, setGenderRatioTimerState] = useState(GENDER_RATIO_DELAY);
    const [sessionID, setSessionID] = useState();
    useEffect(() => {
        console.log("simStarted: " + simStartedState)
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
                    setSimLog("Already running. Try again in 1-5 minutes, or when you notice an extended period of inactivity in the trend charts.");
                }
            });

        }
        // Once simulation is stopped by MAX_SEND_PER_SIM in runSim(), clear intervals.
        else if (!simStartedState) {
            console.log("sure?");
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
                console.log("Stopping simulation...");
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
            let eventReceived = false;
            return new Promise((resolve) => {
                const handleSimStatus = () => {
                    eventReceived = true;
                    clearTimeout(timeoutId);
                    socket.off(SOCKET_EVENTS.BROADCAST_ANSWER_SIM_STATUS, handleSimStatus);
                    setCheckingSim(false);
                    resolve(false); // SIM check failed
                };
                socket.on(SOCKET_EVENTS.BROADCAST_ANSWER_SIM_STATUS, handleSimStatus);
                const timeoutId = setTimeout(() => {
                    if (!eventReceived) {
                        console.info("Timeout: No BROADCAST_ANSWER_SIM_STATUS received. Proceeding with simulation");
                        socket.off(SOCKET_EVENTS.BROADCAST_ANSWER_SIM_STATUS, handleSimStatus);
                        setCheckingSim(false);
                        resolve(true); // SIM check passed
                    }
                }, 3000);
            });
        } else {
            console.error("An error was encountered after sending ASK_SIM_STATUS to the server");
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
        const handleAskSimStatus = () => {
            if (simAlreadyRunningRef.current) { handleSimStatusAnswered() }
        };
        socket.on(SOCKET_EVENTS.BROADCAST_ASK_SIM_STATUS, handleAskSimStatus);
        return () => {
            socket.off(SOCKET_EVENTS.BROADCAST_ASK_SIM_STATUS, handleAskSimStatus);
        };
    }, [socket]);

    const handleSimStatusAnswered = async () => {
        console.log("Broadcasting this running simulation status (running)");
        try {
            await broadcastAnswerSimStatus();
        } catch (error) {
            console.error("Failed to broadcast sim status:", error);
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


    const maxOrdersPerSendRef = useRef(100);
    const [simLog, setSimLog] = useState("Ready");
    const [simRevenue, setSimRevenue] = useState(0);
    const [simOrdersCount, setSimOrdersCount] = useState(0);
    // const [simCounterState, setSimCounterState] = useState(0);
    const runSim = async () => {
        let localSimCounter = 0;
        let localRevenue = 0;
        let localOrdersCount = 0;
        activeMaleRef.current = 90;
        activeFemaleRef.current = 10;
        setActiveMaleState(activeMaleRef.current);
        setActiveFemaleState(activeFemaleRef.current);
        while (simAlreadyRunningRef.current && localSimCounter < MAX_SEND_PER_SIM) {
            let orders = [];
            let customersActive = activeMaleRef.current !== 0 || activeFemaleRef.current !== 0;
            const currentDate = getCurrentDate();
            const randomOrderCount = getRandomNumber(0, maxOrdersPerSendRef.current);
            for (let i = 0; i < randomOrderCount; i++) {
                let customerId = getRandomCustomerId();
                let categoryId = getBiasedCategoryId(customerId);
                let categoryAvgPrice = productCategoriesRef.current?.[categoryId - 1]?.avgPrice;
                let categoryItemPrice = categoryAvgPrice + (categoryAvgPrice * (priceRateRef.current / 100));
                let order = generateOrder(customerId, categoryId, currentDate, categoryItemPrice);
                if (categoryId !== 0) { orders.push(order); console.log("original price: " + categoryAvgPrice + ", new: " + categoryItemPrice); }
            }
            if (orders.length < 1 || !customersActive) {
                console.log("skipping iteration " + localSimCounter);
                localSimCounter++;
                setSimLog(localSimCounter + "/" + MAX_SEND_PER_SIM + "th batch sent");
                await new Promise((resolve) => setTimeout(resolve, SIM_DELAY));
                continue;
            }
            const response = await sendOrdersBatch({ simulationDataList: orders });
            if (response.status === "200") {
                // console.log(`> +1 order OK (${localSimCounter}/${MAX_SEND_PER_SIM})`);
                orders.forEach(order => {
                    order.items.forEach(item => {
                        localRevenue = localRevenue + (item.quantity * item.pricePerUnit);
                    })
                });
                localOrdersCount = localOrdersCount + orders.length;
                localSimCounter++;
                setSimLog(localSimCounter + "/" + MAX_SEND_PER_SIM + "th batch sent. Total revenue: " + localRevenue + ", count: " + localOrdersCount);
            }
            await new Promise((resolve) => setTimeout(resolve, SIM_DELAY));
        }
        setSimStartedState(false)
        activeMaleRef.current = 0;
        activeFemaleRef.current = 0;
        setActiveMaleState(activeMaleRef.current);
        setActiveFemaleState(activeFemaleRef.current);
        setActiveFactorsState([externalFactors[0]]);
        maxOrdersPerSendRef.current = 100;
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
            // console.log("% picked male with male portion: " + activeMale)
            return 2 * getRandomNumber(1, 30); // 2, 4, 6, ..., 60
        } else {
            // console.log("% picked female with female portion: " + activeFemale)
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

    const handleCategorySwitch = (id) => {
        setActiveCategoriesState((prev) => {
            if (!prev) return [];
            return prev.map((cat) =>
                cat.id === id ? { ...cat, checked: !cat.checked } : cat
            )
        })
    };

    const externalFactors = [
        { id: 0, name: "No significant events", weight: 0, color: "#004e1b" },
        { id: 1, name: "Increasing competition", weight: 25, color: "#855151" },
        { id: 2, name: "Escalating fear of scams and frauds", weight: 25, color: "#855151" },
        { id: 3, name: "Poor customer service", weight: 25, color: "#855151" },
        { id: 4, name: "Rising tax/tariff", weight: 25, color: "#855151" },
        { id: 5, name: "Boycott", weight: 100, color: "#810000" },
    ]
    const activeFactorsIntervalIdRef = useRef();
    const [activeFactorsState, setActiveFactorsState] = useState([externalFactors[0]]);
    const initExternalFactors = () => {
        activeFactorsIntervalIdRef.current = setInterval(() => {
            setActiveFactorsState([]);
            maxOrdersPerSendRef.current = 100;
            let factorsLastIndex = externalFactors.length - 1;
            let random = getRandomNumber(0, factorsLastIndex);
            if (random === 0 || random === factorsLastIndex) {
                const newFactors = [];
                newFactors.push(externalFactors[random]);
                setActiveFactorsState(newFactors);
            } else {
                for (let i = 1; i <= random; i++) {
                    const subRandom = getRandomNumber(i, random);
                    setActiveFactorsState(prev => {
                        const newFactors = [...prev];
                        if (!newFactors.includes(externalFactors[subRandom])) {
                            newFactors.push(externalFactors[subRandom]);
                        }
                        return newFactors;
                    });
                }
            }
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
    const [maxOrdersCountState, setMaxOrdersCountState] = useState(maxOrdersPerSendRef.current);
    useEffect(() => {
        activeFactorsState.forEach(factor => {
            maxOrdersPerSendRef.current = maxOrdersPerSendRef.current - factor.weight;
        });
        //console.log("max: " + maxOrdersCountRef.current);
        setMaxOrdersCountState(maxOrdersPerSendRef.current);
    }, [activeFactorsState])

    useEffect(() => {
        let priceWeight = priceRateState * -1;
        maxOrdersPerSendRef.current = maxOrdersCountState + priceWeight;
        console.log("max: " + maxOrdersPerSendRef.current);
    }, [maxOrdersCountState, priceRateState]);

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

    const simTargets = [
        { id: 0, name: "" },
        { id: 1, name: "" },
        { id: 2, name: "" },
    ]

    const [activeSimTarget, setActiveSimTarget] = useState(simTargets[getRandomNumber(0, 2)]);

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
                    mb="50px"
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
                                Run a short-lived, virtual retail with random fluctuations and adjustable presets to hit the sales target.
                            </Typography>
                        </Box>
                        <Box mt="30px" >
                            <Typography color={colors.grey[300]} fontFamily={"lexend"} fontWeight={"light"} variant="h6">
                                Active Customers
                                <Chip
                                    sx={{
                                        ml: '5px',
                                        height: '15px',
                                        mb: '3px',
                                        fontSize: '14px'
                                    }}
                                    label={`${genderRatioTimerState / 1000}s`}
                                />
                            </Typography>
                            <Typography fontFamily={"lexend"} fontWeight={"light"} variant="h6">
                                Male {activeMaleState}%, Female {activeFemaleState}%
                            </Typography>
                        </Box>
                        <Box
                            mt="20px"
                            mb="10px"
                        >
                            <Typography color={colors.grey[300]} fontFamily={"lexend"} fontWeight={"light"} variant="h6">
                                External Factors
                                <Chip
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
                        <hr color="#383838" />
                        <Box mt="20px" mb="20px" >
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
                        <Box mt="20px" >
                            <Typography color={colors.grey[300]} fontFamily={"lexend"} fontWeight={"light"} variant="h6">
                                Product Listing
                            </Typography>
                            <Box ml="5px">
                                <Box >
                                    <FormControlLabel
                                        // key={cat.id}
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
                                        <Box>
                                            <Box>
                                                <FormControlLabel
                                                    key={cat.id}
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
                                                    // icon={<SentimentSatisfiedAlt color="black" sx={{ fontSize: '17px'}} />}
                                                    sx={{
                                                        pd: '3px',
                                                        mr: '3px',
                                                        height: '18px',
                                                        mb: '0px',
                                                        fontSize: '12px',
                                                        color: 'black',
                                                        fontFamily: 'lexend',
                                                        // backgroundColor: cat.bias ? "#ffc7e7" : colors.blueAccent[200]
                                                    }}
                                                    label={<SentimentSatisfiedAltOutlined sx={{ fontSize: '17px', mt: '5px', color: cat.bias ? colors.pinkAccent[200] : colors.blueAccent[300] }} />}
                                                />
                                                <Chip
                                                    // icon={<SentimentSatisfiedAlt color="black" sx={{ fontSize: '17px'}} />}
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

                                        </Box>
                                    ))
                                }
                            </Box>
                        </Box>
                        <Box mt="20px">
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
                        <hr color="#383838" />
                        <Box mt="20px">
                            <Box display="flex">
                                <Typography color={colors.grey[300]} fontFamily={"lexend"} fontWeight={"light"} variant="h6">
                                    Target
                                </Typography>
                            </Box>
                            <Box>
                                <Typography fontFamily={"lexend"} fontWeight={"light"} variant="h6">
                                    {activeSimTarget.name}
                                    Reach 60k peak of revenue before the 100th batch
                                </Typography>
                            </Box>
                        </Box>
                        <Box mt="20px">
                            <Box display="flex">
                                <Typography color={colors.grey[300]} fontFamily={"lexend"} fontWeight={"light"} variant="h6">
                                    Status
                                </Typography>
                            </Box>
                            <Typography fontFamily={"lexend"} fontWeight={"light"} variant="h6">
                                {simLog}
                            </Typography>
                        </Box>
                    </Box>
                    <Button
                        disabled={simStartedState ? true : false}
                        sx={{ textTransform: "none", marginTop: '20px' }}
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
                </Box>
            </Box>
        </Drawer>
    )
}

export default Simulation;