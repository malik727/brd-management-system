import { React, useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../axios/axios_jwt';
import Header from '../componets/Header'
import Footer from '../componets/Footer'
import '../media/css/login.css'
import { Lock, AccountCircle } from "@material-ui/icons"
import LoginImg from '../media/images/login.png'
import LoadingGif from '../media/images/loader.gif'
import { useLocation } from 'react-router-dom'

export default function LoginPage(props) {
	const notify = (msg, type) => {
		if(type === "error")
		{
			console.log(msg);
			toast.error(msg, {
				position: toast.POSITION.TOP_RIGHT,
			});
		}
	}
    var navConfig = {
		loggedIn: props.user.loggedIn, 
	}
	if(navConfig.loggedIn)
	{
		navConfig.empID = props.user.empID;
		navConfig.firstName = props.user.firstName;
		navConfig.lastName = props.user.lastName;
	}
	const [loginRequired, setLoginRequired] = useState(false);
	const location = useLocation();
	const urlParams = new URLSearchParams(location.search);
	var targetUrl = urlParams.get('target');
	useEffect(() => {
		if (targetUrl) {
			setLoginRequired(true);
		}
    }, []);
    var error = "";
    const [empID, setEmpID] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
    function HandleLogin(event) {
		setLoading(true);
		axiosInstance.post('/users/login', {
			emp_id: empID,
			password: password
		}).then(
			result => {
				if (result.status === 200) {
                    var tokenObject = {'token': result.data.token};
					localStorage.setItem('token', JSON.stringify(tokenObject));
					const host = window.location.host;
					if (targetUrl) {
						targetUrl = window.location.protocol + "//" + host + targetUrl;
						window.location = targetUrl;
					}
					else {
						window.location.href = "/dashboard";
					}
				}
			}
		).catch(error => {
			setLoading(false);
			if(error.code === 'ECONNABORTED')
			{
				notify("Failed to communicate with the server! Please ensure you have stable internet connection.", "error");
			}
			else
			{
				notify("Invalid employee id or password!", "error");	
			}
		})
	}
    function validateInput() {
		if (empID === "") {
			error = "*Please enter Employee ID to login!";
			return false;
		}
		if (password === "") {
			error = "*Please enter Password to login!";
			return false;
		}
		error = "";
		return true;
	}
    return(
        <div>
			{
				loginRequired?(notify("Please login to your account in order to continue!","error"),setLoginRequired(false)):''
			}
            {validateInput()}
            <Header config={navConfig} />
            <div className="login-container">
                <div className="login-content">
                    <h3 style={{fontFamily: "Montserrat"}}>Login to your Account</h3>
                    <img alt="Login Form" src={LoginImg} className="form-head-img" />
                    <div className="form-input-div">
                        <span className="form-input-icon"><AccountCircle /></span>
                        <input className="form-input" onChange={(event) => { setEmpID(event.target.value) }} placeholder="Employee Number" type="text" required/>
                    </div>
                    <div className="form-input-div">
                        <span className="form-input-icon"><Lock /></span>
                        <input className="form-input" onChange={(event) => { setPassword(event.target.value) }} placeholder="Password" type="password" required/>
                    </div>
                    <br />
					{loading ? (
						<div>
							<img alt="Loading Gif" src={LoadingGif} width="50" />
							<p style={{fontFamily: "Raleway"}}><small><b>Loading...</b></small></p>
						</div>
					) : (
							(error !== "") ? (
								<button className="form-btn btn-disabled">Login</button>
							) : (
								<button className="form-btn" onClick={(event) => { HandleLogin() }}>Login</button>
							)
					)}
					<ToastContainer />
					<p className="error-text">{error}</p>
					<br />
                </div>
            </div>
            <Footer />
        </div>
    );
}