import { React, useState, useEffect } from 'react';
import axiosInstance from '../axios/axios_jwt';
import { ToastContainer, toast } from 'react-toastify';
import Header from '../componets/Header';
import Footer from '../componets/Footer';
import Assign from '../componets/Assign'
import { CheckCircle, Dashboard } from "@material-ui/icons";
import LoadingGif from '../media/images/loader.gif';
import '../media/css/content.css';
import { useHistory, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import CompletedImg from '../media/images/tick-mark.png';


export default function AssignBRD(props) {
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
    const location = useLocation();
    const history = useHistory();
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [assignedUsers, setAssignedUsers] = useState([]);
    const [brdDueDate, setBrdDueDate] = useState(handleDate(new Date()));
	const urlParams = new URLSearchParams(location.search);
	var brdId = urlParams.get('id');
    if(!brdId)
    {
        history.push("/dashboard");
    }
    useEffect(() => {
        setLoading(true);
        async function FetchData()
        {
            await axiosInstance.get(`/brds/id/${brdId}`).then(
                result => {
                    if (result.status === 200) {
                        if(result.data.due_date)
                        {
                            setBrdDueDate(result.data.due_date);
                        }
                    }
                }
            ).catch(error => {
                if(error.code === 'ECONNABORTED')
                {
                    notify("Failed to communicate with the server! Please ensure you have stable internet connection.", "error");
                }
                history.push("/dashboard")
            })
            await axiosInstance.get(`/brds/assignees/brdId/${brdId}`).then(
                result => {
                    if (result.status === 200) {
                        var users = [];
                        result.data.map((user) => {
                            users.push({id: user.id, name: user.first_name+" "+user.last_name, brd_id: brdId});
                        });
                        setAssignedUsers([...users]);
                    }
                }
            ).catch(error => {
                if(error.code === 'ECONNABORTED')
                {
                    notify("Failed to communicate with the server! Please ensure you have stable internet connection.", "error");
                }
            })
            setLoading(false);
        }
        FetchData();
    }, []);
    function handleDate(date)
    {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();
 
        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;
        return [year, month, day].join('-');
    }
    function BrdDueDateHandler(date)
    {
        setBrdDueDate(handleDate(date));
    }
    function AssignedUsersHandler(users)
    {
        setAssignedUsers(users);
    }
    function GoToNextStep()
    {
        setCurrentStep(currentStep + 1);
    }
    async function HandleAssignBRD()
    {
        setLoading(true);
        if(brdId === false)
        {
            notify("No BRD selected! You need to select a BRD in order to assign it to an employee.", "error");	
        }
        else if(assignedUsers.length >= 1)
        {
            await axiosInstance.post('/brds/assign', {
                assignees: assignedUsers
            }).then(
                result => {
                    if (result.status === 201) {
                        if(result.data.brd_id === 0)
                        {
                            notify("Something went wrong! Please try again later.", "error");	
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
                    notify("Something went wrong! Please try again later.", "error");	
                }
            })
            await axiosInstance.patch(`/brds/id/${brdId}`, {
                status: "Assigned",
                due_date: handleDate(brdDueDate)
            }).then(
                result => {
                    if (result.status === 200) {
                        if(result.data.brd_id != 0)
                        {
                            notify("BRD Assigned successfully!", "success");
                            setLoading(false);
                            GoToNextStep();
                        }
                        else
                        {
                            notify("Failed to Assign BRD! Please try again later.", "error");	
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
                    notify("Failed to Assign BRD! Please try again later.", "error");	
                }
            })

        }
        else
        {
            notify("Select at least one employee to assign this BRD!", "error");   
        }
        setLoading(false);
    }
    return(
        <div>
            <ToastContainer />
            <Header config={navConfig} />
                <div className="brd-container content-container">
                    <div className="brd-content">
                        {
                            loading ? (
                                <div>
                                    <span style={{
                                        display: "block",
                                        textAlign: "center",
                                        marginTop: "50px",
                                        marginBottom: "100px",
                                        fontFamily: 'Raleway',
                                        fontWeight: '600'
                                    }}>
                                        <img src={LoadingGif} alt="Loading Gif" style={{display:"block", margin: "auto"}} width="75" />
                                        loading...
                                        <br/><br/>
                                        Please be patient for few minutes as we process your request!
                                    </span>
                                </div>
                            ):(
                                currentStep === 1 ? (
                                    <>
                                        <Assign brdId={brdId} dueDate={brdDueDate} setBrdDueDate={BrdDueDateHandler} assignedUsers={assignedUsers} setAssignedUsers={AssignedUsersHandler} />
                                        <br/><br/>
                                        <button className="form-btn" onClick={() => { HandleAssignBRD() }} ><div style={{display: "flex", justifyContent: "center", alignItems: "center"}}><CheckCircle />&nbsp;<span>Done</span></div></button>
                                    </>
                                ):(
                                    currentStep === 2 ? (
                                        <div>
                                            <div className="form-inp-div">
                                                <img src={CompletedImg} width="150px" /><br/><br/>
                                                <h3 style={{fontFamily: "Montserrat"}}>BRD Assigned Successfully!</h3> <br/>
                                                <h4 style={{fontFamily: "Noto Sans", fontWeight: "500"}}>Congrats! This BRD is now successfully assigned to the employees. If you want to edit this BRD visit "Edit BRDs" section.</h4>
                                            </div>
                                            <Link style={{display: "inline-block", margin: "20px 5px"}} to="/dashboard"><button className="form-btn"><div style={{display: "flex", justifyContent: "center", alignItems: "center"}}><Dashboard />&nbsp;<span>Dashboard</span></div></button></Link>
                                        </div>
                                    ):(
                                        ''
                                    )
                                )
                            )
                        }
                        
                    </div>
                </div>
            <Footer />
        </div>
    );
}