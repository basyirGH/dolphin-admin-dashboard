import { apiRequestUtility } from "../../utils/apiRequestUtility";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "../../theme"

const Login = () => {

    const navigate = useNavigate();
    const { login } = useAuth();
    const [theme, colorMode] = useMode();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleSubmit = async (e) => {
        // Prevent the browser from refreshing the page after submitting the form.
        e.preventDefault();
        try {
            const responseBody = await apiRequestUtility(null, '/auth/login', {
                method: 'POST',
                body: JSON.stringify(formData),
            });
            const token = responseBody.token;
            if (token) {
                login(token);
                navigate("/");
            }
        } catch (err) {
        }
    };

    // when an event occurs, the browser automatically passes an event object to the event handler function, so onChange={handleFormChange}, not onChange={handleFormChange(e)}
    const handleFormChange = (e) => {
        // Destructuring assignment: Extracts the name and value properties of e.target into two
        // variables in a single line. 
        // unrelated to object
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            // [name] allows to dynamically set an object key based on the value of a variable or 
            // expression. 
            // unrelated to array
            [name]: value
        }));
    }

    useEffect(() => {
        console.log(JSON.stringify(formData, null, 2))
    }, [formData])

    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <form onSubmit={handleSubmit}>
                    login here
                    <div>
                        username:
                        <input
                            type="text"
                            name="email"
                            value={formData.email}
                            onChange={handleFormChange} />
                        password:
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleFormChange} />
                        <button type="submit">Submit</button>
                    </div>
                </form>
            </ThemeProvider>
        </ColorModeContext.Provider>
    )
}

export default Login;