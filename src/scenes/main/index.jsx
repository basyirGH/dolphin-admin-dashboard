
import FadingLines from "../../components/FadingLines";
import Dashboard from "../dashboard";
import Intro from "../dashboard/intro";
import DesignPattern from "../designpattern";
import Footer from "../footer";
import SystemDesign from "../systemdesign";
import Accordions from "../accordions";


const Main = () => {
    return (
        <div>
            <Dashboard />
            <Accordions/>
            {/* <SystemDesign />
            <DesignPattern /> */}
            <FadingLines />
            <Intro />
            <Footer />
        </div>
    )
}

export default Main;