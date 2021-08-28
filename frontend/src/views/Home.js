import React from 'react'
import Header from '../componets/Header'
import Footer from '../componets/Footer'
import '../media/css/home.css'
import HomeImg from '../media/images/home.jpg'
import { CheckCircle } from '@material-ui/icons'

export default function HomePage(props) {
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
    return(
        <div>
            <Header config={navConfig} />
            <div className="home-container content-container">
                <div className="home-content">
                    <div className="home-details">
                        <h2>Welcome to the BRD Management System!</h2>
                        <br/>
                        <h3>By using this portal you can easily:</h3>
                        <ul>
                            <li><div style={{display: "flex", justifyContent: "left", alignItems: "center"}}><CheckCircle style={{color: "limegreen"}} />&nbsp;&nbsp;<span>Create and Assign BRDs</span></div></li>
                            <li><div style={{display: "flex", justifyContent: "left", alignItems: "center"}}><CheckCircle style={{color: "limegreen"}} />&nbsp;&nbsp;<span>Update existing BRDs</span></div></li>
                            <li><div style={{display: "flex", justifyContent: "left", alignItems: "center"}}><CheckCircle style={{color: "limegreen"}} />&nbsp;&nbsp;<span>Determine Priority of BRD</span></div></li>
                            <li><div style={{display: "flex", justifyContent: "left", alignItems: "center"}}><CheckCircle style={{color: "limegreen"}} />&nbsp;&nbsp;<span>Approve or Dismiss a BRD</span></div></li>
                        </ul>
                    </div>
                    <div className="home-image">
                        <img alt="Main Home Placeholder" src={HomeImg} className="home-img" />
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}