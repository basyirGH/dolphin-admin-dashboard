import Accordion from '@mui/material/Accordion';
import AccordionActions from '@mui/material/AccordionActions';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, useTheme } from '@mui/material';
import { tokens } from '../../theme';
import SystemDesign from '../systemdesign';
import DesignPattern from '../designpattern';


const Accordions = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    return (
        <Box m="40px 20px 80px 20px">
            <Accordion sx={{backgroundColor: 'rgb(5,5,5)'}}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1-content"
                    id="panel1-header"
                >
                    <Typography variant="h5" fontFamily={"lexend"} fontWeight={"light"}>Features</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    
                </AccordionDetails>
            </Accordion>
            <Accordion sx={{backgroundColor: 'rgb(5,5,5)'}}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1-content"
                    id="panel1-header"
                >
                    <Typography variant="h5" fontFamily={"lexend"} fontWeight={"light"}>Technical Overview</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <SystemDesign/>
                    <DesignPattern/>
                </AccordionDetails>
            </Accordion>
        </Box>
    )
}

export default Accordions;