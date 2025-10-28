import './index.css'
import React, {useState} from 'react'

function Login(){

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [generalErrorMessage, setGeneralErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    function handleUsernameChange(event){
        setUsername(event.target.value);
    }

    function handlePasswordChange(event){
        setPassword(event.target.value);
    }

    const handleLogin = () => loginAccount(username, password);

    async function loginAccount(username, password) {

        setGeneralErrorMessage("");
        setSuccessMessage("");
        
        if(username.length === 0 && password.length === 0) {
            setGeneralErrorMessage("Username and password field is empty!");
        } else if(username.length === 0) {
            setGeneralErrorMessage("Username field is empty!");
        } else if (password.length === 0) {
            setGeneralErrorMessage("Password field is empty!");
        } else {

            try {

                const response = await fetch('http://localhost:8000/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({username, password})
                });
                
                const data = await response.json();

                if(response.ok) {
                    localStorage.setItem('token', data.access_token);
                    setSuccessMessage("Login successful!");
                    setTimeout(() => window.location.href = '/tasks', 2000);
                } else {
                    setGeneralErrorMessage(data.detail);
                }

            } catch (error) {
                setGeneralErrorMessage("Network error. Please try again.");
                console.error('Fetch error:', error);
            }

        }

    }

    return(
        <div className="container">
            <header>
                <h1>Task Manager Login</h1>
                <p className="description">Login to your task manager account</p>
            </header>

            <div className="username-section">
                <label>Username:</label>
                <input type="text" value={username} onChange={handleUsernameChange} placeholder="Enter your username"/>
            </div>

            <div className="password-section">
                <label>Password:</label>
                <input type="password" value={password} onChange={handlePasswordChange} placeholder="Enter your password"/>
            </div>
            
            <button onClick={handleLogin}>Login</button>
            {generalErrorMessage && <p className="error-message">{generalErrorMessage}</p>}
            {successMessage && <p className="success-message">{successMessage}</p>}

            <div className="to-register-section">
                <p className="redirect">Don't have an account? <a href="/register">Register an account</a></p>
            </div>
            
        </div>
    );

}
export default Login