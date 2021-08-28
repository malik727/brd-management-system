import React from 'react';
import Header from '../componets/Header';
import Footer from '../componets/Footer';
import NotFoundImg from '../media/images/not-found.png';
import '../media/css/content.css';
import { ArrowBack, Dashboard } from '@material-ui/icons';
import { Link, useHistory } from 'react-router-dom';


export default function NotFound(props) {
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
    const history = useHistory();
    const goBack = () => {
        history.goBack()
    }
    return(
        <div>
            <Header config={navConfig} />
                <div className="brd-container content-container">
                    <div className="brd-content">
                        <img src={NotFoundImg} width="150" style={{margin: "30px auto", display: "block"}} />
                        <h2 style={{fontFamily: "Montserrat"}}>Error 404</h2><br/><br/>
                        <h3 style={{fontFamily: "Raleway"}}>We failed to locate the resource you are looking for!</h3>
                        <button style={{display: "inline-block", margin: "20px 10px"}} className="form-btn" onClick={goBack}><div style={{display: "flex", justifyContent: "center", alignItems: "center"}}><ArrowBack />&nbsp;<span>Back</span></div></button>
                        <Link style={{display: "inline-block", margin: "20px 10px"}} to="/dashboard"><button className="form-btn"><div style={{display: "flex", justifyContent: "center", alignItems: "center"}}><Dashboard />&nbsp;<span>Dashboard</span></div></button></Link>
                    </div>
                </div>
            <Footer />
        </div>
    );
}