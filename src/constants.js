import LocalMallIcon from '@mui/icons-material/LocalMall';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';
import StackedLineChartIcon from '@mui/icons-material/StackedLineChart';
import { Assistant, AutoAwesome, Circle, CloseOutlined, CreditCard, Help, Info, InfoOutlined, Menu, PlayArrow, Stop, SwapVert } from '@mui/icons-material';
import { Grain } from '@mui/icons-material';
import { GridView } from '@mui/icons-material';
import { Payments } from '@mui/icons-material';
import { Face } from '@mui/icons-material';
import { KeyboardDoubleArrowUpOutlined } from '@mui/icons-material';
import { DataUsageOutlined } from '@mui/icons-material'
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';

export const API_URL = "";

export const METRIC_TYPES = {
    SINGLE_AMOUNT: "SINGLE_AMOUNT",
    LINE_CHART: "LINE_CHART"
}

export const SINGLE_AMOUNT_METRIC_CODES = {
    TOTAL_REVENUE: "TOTAL_REVENUE",
    TOTAL_ORDERS: "TOTAL_ORDERS",
    AVERAGE_REVENUE: "AVERAGE_REVENUE",
    AVERAGE_QUANTITY: "AVERAGE_QUANTITY",
}

export const LINE_CHART_METRIC_CODES = {
    REAL_TIME_TRENDS: "REAL_TIME_TRENDS"
}

export const PIE_CHART_METRIC_CODES = {
    TOTAL_ORDERS_BY_DEMOGRAPHY: "TOTAL_ORDERS_BY_DEMOGRAPHY"
}

export const REAL_TIME_TRENDS = {
    TOTAL_REVENUE: "TOTAL_REVENUE",
    TOTAL_ORDERS: "TOTAL_ORDERS",
}

export const SOCKET_EVENTS = {
    INIT_SINGLE_AMOUNTS: "INIT_SINGLE_AMOUNTS",
    INIT_LINE_CHARTS: "INIT_LINE_CHARTS",
    INIT_PIE_CHARTS: "INIT_PIE_CHARTS",
    SIMULATE_NEW_ORDER: "SIMULATE_NEW_ORDER"
}

export const TIMEFRAMES = {
    HOURLY: "1h",
    DAILY: "1d",
    WEEKLY: "1w",
    MONTHLY: "1m",
    YEARLY: "YTD",
    ALL_TIME: "ALL"
}

export const ICONS = {
    TOTAL_ORDERS: LocalMallIcon,
    TOTAL_REVENUE: Payments,
    AVERAGE_REVENUE: ReceiptLongIcon,
    AVERAGE_QUANTITY: Grain,
    DEMOGRAPHY: Face,
    LEGEND: Circle,
    RATE_UP: KeyboardDoubleArrowUpOutlined,
    RATE_PROGRESS: DataUsageOutlined,
    MENU: Menu,
    NEW_TAB: OpenInNewOutlinedIcon,
    HELP: Help,
    PLAY: PlayArrow,
    STOP: Stop,
    ASSISTANT: AutoAwesome,
    CLOSE: CloseOutlined,
};
