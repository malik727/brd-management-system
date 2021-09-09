import { React, useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../axios/axios_jwt';
import Header from '../componets/Header'
import Footer from '../componets/Footer'
import '../media/css/login.css'
import { Lock } from "@material-ui/icons"
import PasswordImg from '../media/images/password.png'
import LoadingGif from '../media/images/loader.gif'

export default function Settings(props) {
	const notify = (msg, type) => {
		if(type === "error")
		{
			toast.error(msg, {
				position: toast.POSITION.TOP_RIGHT,
			});
		}
        else if(type === "success")
		{
			toast.success(msg, {
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
        navConfig.role = props.user.role;
	}
    var error = "";
    const [ loading, setLoading ] = useState(false);
    const [ oldPassword, setOldPassword ] = useState("");
    const [ confirmPassword, setConfirmPassword ] = useState("");
	const [ newPassword, setNewPassword ] = useState("");
    function validateInput() {
		if (oldPassword === "" || newPassword === "" || confirmPassword === "") {
			error = "*Please fill all fields!";
			return false;
		}
        else if(newPassword !== "" && newPassword.length < 6)
        {
            error = "*New Password must have a minimum length of 6 characters!";
			return false;
        }
		else if (newPassword !== confirmPassword) {
			error = "*New passwords and confirm new password must match!";
			return false;
		}
		error = "";
		return true;
	}
    async function HandlePasswordChange() {
        setLoading(true);
        await axiosInstance.patch(`/users/change-password`, {
            password: oldPassword,
            new_password: newPassword,
            confirm_password: confirmPassword
        }).then(
            result => {
                if (result.status === 200) {
                    notify("Password Updated Successfully!", "success");
                    setNewPassword("");
                    setOldPassword("");
                    setConfirmPassword("");
                }
            }
        ).catch(error => {
            if(error.code === 'ECONNABORTED')
            {
                notify("Failed to communicate with the server! Please ensure you have stable internet connection.", "error");
            }
            else
            {
                notify("Failed change password! Please try again later.", "error");	
            }
        })
        setLoading(false);
    }
    return(
        <div>
            {validateInput()}
            <Header config={navConfig} />
            <div className="brd-container content-container">
                <div className="brd-content">
                    <h2 style={{fontFamily: "Montserrat"}}>Change Password</h2>
                    <img alt="Login Form" src={PasswordImg} className="form-head-img" />
                    <div className="form-input-div">
                        <span className="form-input-icon"><Lock /></span>
                        <input className="form-input" value={oldPassword} onChange={(event) => { setOldPassword(event.target.value) }} placeholder="Old Password" type="password" required/>
                    </div>
                    <div className="form-input-div">
                        <span className="form-input-icon"><Lock /></span>
                        <input className="form-input" value={newPassword} onChange={(event) => { setNewPassword(event.target.value) }} placeholder="New Password" type="password" required/>
                    </div>
                    <div className="form-input-div">
                        <span className="form-input-icon"><Lock /></span>
                        <input className="form-input" value={confirmPassword} onChange={(event) => { setConfirmPassword(event.target.value) }} placeholder="Confirm New Password" type="password" required/>
                    </div>
                    <br />
					{loading ? (
						<div>
							<img alt="Loading Gif" src={LoadingGif} width="50" />
							<p style={{fontFamily: "Raleway"}}><small><b>Loading...</b></small></p>
						</div>
					) : (
							(error !== "") ? (
								<button className="form-btn btn-disabled">Change Password</button>
							) : (
								<button className="form-btn" onClick={(event) => { HandlePasswordChange() }}>Change Password</button>
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