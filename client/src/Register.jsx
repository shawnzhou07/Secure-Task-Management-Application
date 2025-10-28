import './index.css'
import React, {useState} from 'react'

function Register(){

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [usernameErrorMessage, setUsernameErrorMessage] = useState("");
    const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
    const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] = useState("");
    const [generalErrorMessage, setGeneralErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    function handleUsernameChange(event){
        setUsername(event.target.value);
    }

    function handlePasswordChange(event){
        setPassword(event.target.value);
    }

    function handleConfirmPasswordChange(event){
        setConfirmPassword(event.target.value);
    }

    const handleRegister = () => createAccount(username, password, confirmPassword);

    async function createAccount(username, password, confirmPassword) {

        setUsernameErrorMessage("");
        setPasswordErrorMessage("");
        setConfirmPasswordErrorMessage("");
        setGeneralErrorMessage("");
        setSuccessMessage("");

        let validAccount = checkValidAccount(username, password, confirmPassword);

        if(validAccount){
           
            const userData = {
                username: username,
                password: password
            }

            try {
                
                const response = await fetch('http://localhost:8000/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userData)
                });

                const data = await response.json();

                if (response.ok) {
                    setSuccessMessage("Registration successful!");
                    setTimeout(() => window.location.href = '/login', 2000);
                } else {
                    if(data.detail === "Username already exists"){
                        setUsernameErrorMessage(data.detail);
                    } else {
                        setGeneralErrorMessage(data.detail);
                    }
                }

            } catch (error) {
                setGeneralErrorMessage("Network error. Please try again.");
                console.error('Fetch error:', error);
            }
            
        }

    }

    function checkValidAccount(usernameInput, passwordInput, confirmPasswordInput) {

        let validAccount = true;

        for(let i = 0; i < usernameInput.length; i++){
            if(!(usernameInput[i] >= 'a' && usernameInput[i] <= 'z') && 
            !(usernameInput[i] >= 'A' && usernameInput[i] <= 'Z') && 
            !(usernameInput[i] >= '0' && usernameInput[i] <= '9')) {
                validAccount = false;
                setUsernameErrorMessage("Username has invalid characters!");
                break; 
            }
        }

        if(usernameInput.length < 3){
            validAccount = false;
            setUsernameErrorMessage("Username too short!");
        }
        if(usernameInput.length > 20){
            validAccount = false;
            setUsernameErrorMessage("Username too long!");
        }

        if(usernameInput.length === 0){
            validAccount = false;
            setUsernameErrorMessage("Username field empty!");
        }

        for(let i = 0; i < passwordInput.length; i++){
            if(passwordInput[i] === ' ') {
                validAccount = false;
                setPasswordErrorMessage("Password has invalid characters!");
                break;
            }
        }

        if(passwordInput.length < 8){
            validAccount = false;
            setPasswordErrorMessage("Password too short!");
        }

        if(passwordInput.length === 0){
            validAccount = false;
            setPasswordErrorMessage("Password field empty!");
        }

        if(passwordInput !== confirmPasswordInput){
            validAccount = false;
            setConfirmPasswordErrorMessage("Passwords are different!");
        }
        
        if(confirmPasswordInput.length === 0){
            validAccount = false;
            setConfirmPasswordErrorMessage("Confirm password field empty!");
        }

        return validAccount;

    }

    return(
        <div className="container">
            <header>
                <h1>Task Manager Register</h1>
                <p className="description">Register your task manager account</p>
            </header>
            
            <div className="username-section">
                <label>Username:</label>
                <input type="text" value={username} onChange={handleUsernameChange} placeholder="Enter your username"/>
                {usernameErrorMessage && <p className="error-message">{usernameErrorMessage}</p>}
                <p>Username Requirements:</p>
                <p>- include only letters and numbers</p>
                <p>- 3-20 characters</p>
            </div>

            <div className="password-section">
                <label>Password:</label>
                <input type="password" value={password} onChange={handlePasswordChange} placeholder="Enter your password"/>
                {passwordErrorMessage && <p className="error-message">{passwordErrorMessage}</p>}
                <p>Password Requirements:</p>
                <p>- no spaces allowed</p>
                <p>- minimum 8 characters</p>
            </div>

            <div className="confirm-password-section">
                <label>Confirm Password:</label>
                <input type="password" value={confirmPassword} onChange={handleConfirmPasswordChange} placeholder="Confirm your password"/>
                {confirmPasswordErrorMessage && <p className="error-message">{confirmPasswordErrorMessage}</p>}
            </div>

            <button onClick={handleRegister}>Register</button>
            {generalErrorMessage && <p className="error-message">{generalErrorMessage}</p>}
            {successMessage && <p className="success-message">{successMessage}</p>}

            <div className="to-login-section">
                <p className="redirect">Already have an account? <a href="/login">Return to login</a></p>
            </div>

        </div>
    );

}
export default Register