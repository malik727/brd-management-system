import { React, useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../axios/axios_jwt';
import Header from '../componets/Header';
import Footer from '../componets/Footer';
import '../media/css/dash.css';
import Skeleton from '@material-ui/lab/Skeleton';
import { Launch } from '@material-ui/icons';
import DueDateIcon from '../media/images/due-brds.png';
import AssignedBRDIcon from '../media/images/assigned-brds.png';
import CompletedBRDIcon from '../media/images/completed-brds.png';
import MaterialTable from 'material-table';
import { tableIcons } from '../utils/MaterialTableConfig';
import LoadingGif from '../media/images/loader.gif'
import { useHistory } from 'react-router-dom';

export default function Dashboard(props) {
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
        navConfig.role = props.user.role;
	}
    const history = useHistory();
    const [ loading, setLoading ] = useState(true);
    const [ assignedCount, setAssignedCount ] = useState("-");
    const [ completedCount, setCompletedCount ] = useState("-");
    const [ dueCount, setDueCount ] = useState("-");
    const [cols, setCols] = useState([
        { title: 'BRD Title', field: 'title', width: "80%" },
        { title: 'Priority', field: 'priority', width: "10%" },
        { title: 'Due On', field: 'due_date', type:'date', width: "10%" }
    ]);
    const [ rows, setRows ] = useState([
        { title: <Skeleton />, priority: <Skeleton />, due_date: <Skeleton /> },
        { title: <Skeleton />, priority: <Skeleton />, due_date: <Skeleton /> },
        { title: <Skeleton />, priority: <Skeleton />, due_date: <Skeleton /> },
        { title: <Skeleton />, priority: <Skeleton />, due_date: <Skeleton /> },
        { title: <Skeleton />, priority: <Skeleton />, due_date: <Skeleton /> },
    ]);
    function convertDate(inp)
    {
        const date = new Date(inp);
        var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        var m = months[date.getMonth()];
        var d = date.getDate();
        var y = date.getFullYear();
        return d+" "+m+" "+y;
    }
    useEffect(() => {
        async function FetchData()
        {
            await axiosInstance.get('/brds/assigned').then(
                result => {
                    if (result.status === 200) {
                        if(Array.isArray(result.data) && result.data.length >= 1)
                        {
                            setAssignedCount(result.data.length);
                        }
                        else
                        {
                            setAssignedCount(0);
                        }
                    }
                }
            ).catch(error => {
                if(error.code === 'ECONNABORTED')
                {
                    notify("Failed to communicate with the server! Please ensure you have stable internet connection.", "error");
                }
                else if (error.response.status === 404)
                {
                    setAssignedCount(0);
                }
            })
            await axiosInstance.get('/brds/completed').then(
                result => {
                    if (result.status === 200) {
                        if(Array.isArray(result.data) && result.data.length >= 1)
                        {
                            setCompletedCount(result.data.length);
                        }
                        else if (Array.isArray(result.data) && result.data.length === 0)
                        {
                            setCompletedCount(0);
                        }
                    }
                }
            ).catch(error => {
                if(error.code === 'ECONNABORTED')
                {
                    notify("Failed to communicate with the server! Please ensure you have stable internet connection.", "error");
                }
                else if (error.response.status === 404)
                {
                    setCompletedCount(0);
                }
            })
            await axiosInstance.get('/brds/due/7').then(
                result => {
                    if (result.status === 200) {
                        setCols([
                            { title: 'BRD Title', field: 'title', width: "80%" },
                            { title: 'Priority', field: 'priority',  lookup: { 'High': 'High', 'Medium': 'Medium', 'Low': 'Low' }, width: "10%"},
                            { title: 'Due On', field: 'due_date', type:'date', width: "10%" }
                        ]);
                        if(Array.isArray(result.data) && result.data.length >= 1)
                        {
                            const temp = [];
                            const dueData = result.data;
                            dueData.forEach((obj) => {
                                temp.push({ id: obj.id, title: obj.title, priority: obj.priority, due_date: convertDate(obj.due_date) });
                            });
                            setRows(temp);
                            setDueCount(result.data.length);
                        }
                        else if (Array.isArray(result.data) && result.data.length === 0)
                        {
                            setRows([]);
                            setDueCount(0);
                        }
                    }
                }
            ).catch(error => {
                setRows([]);
                if(error.code === 'ECONNABORTED')
                {
                    notify("Failed to communicate with the server! Please ensure you have stable internet connection.", "error");
                }
                else if (error.response.status === 404)
                {
                    setDueCount(0);
                }
            })
            setLoading(false);
        }
        FetchData();
    }, []);
    return(
        <div>
            <Header config={navConfig} />
            <ToastContainer />
            <div className="dash-container content-container">
                <div className="dash-content">
                    <div className="dash-metrics">
                        <div className="dash-metrics-unit">
                            <div className="dash-metric-unit-s1">
                                <h4 style={{fontFamily: "Montserrat", textAlign: "left", color: "#455A64"}}>BRDs Assigned</h4>
                                {loading?(
                                    <img src={LoadingGif} style={{margin: "10px auto"}} width="50" />
                                ):(
                                    <p style={{fontFamily: "Noto Sans", fontWeight: "600", fontSize: "34px", margin: "10px auto"}}>{assignedCount}</p>
                                )}
                            </div>
                            <div className="dash-metric-unit-s2">
                                <img src={AssignedBRDIcon} width="65" />
                            </div>
                        </div>
                        <div className="dash-metrics-unit">
                            <div className="dash-metric-unit-s1">
                                <h4 style={{fontFamily: "Montserrat", textAlign: "left", color: "#455A64"}}>BRDs Due In Next 7 Days</h4>
                                {loading?(
                                    <img src={LoadingGif} style={{margin: "10px auto"}} width="50" />
                                ):(
                                    <p style={{fontFamily: "Noto Sans", fontWeight: "600", fontSize: "34px", margin: "10px auto"}}>{dueCount}</p>
                                )}
                            </div>
                            <div className="dash-metric-unit-s2">
                                <img src={DueDateIcon} width="65" />
                            </div>
                        </div>
                        <div className="dash-metrics-unit">
                            <div className="dash-metric-unit-s1">
                                <h4 style={{fontFamily: "Montserrat", textAlign: "left", color: "#455A64"}}>BRDs Completed</h4>
                                {loading?(
                                    <img src={LoadingGif} style={{margin: "10px auto"}} width="50" />
                                ):(
                                    <p style={{fontFamily: "Noto Sans", fontWeight: "600", fontSize: "34px", margin: "10px auto"}}>{completedCount}</p>
                                )}
                            </div>
                            <div className="dash-metric-unit-s2">
                                <img src={CompletedBRDIcon} width="65" />
                            </div>
                        </div>
                    </div>
                    <div className="dash-tables">
                        <MaterialTable
                            style={{boxShadow: "none"}}
                            icons={tableIcons}
                            title={<h2 style={{fontFamily: "Montserrat"}}>BRDs Due In Next 7 Days</h2>}
                            columns={cols}
                            data={rows}  
                            actions={
                                loading === false?[{
                                    icon: Launch,
                                    tooltip: 'Show Details',
                                    onClick: (event, rowData) => {
                                            history.push(`view-brd?id=${rowData.id}`);
                                    }
                                }]:([])
                            }                             
                            options={
                                loading === false?(
                                {
                                    exportButton: true,
                                    filtering: true,
                                    sorting: true,
                                    actionsColumnIndex: -1,
                                    headerStyle: {
                                        fontFamily: "Raleway",
                                        fontWeight: 700,
                                        fontSize: 18
                                    },
                                    rowStyle: {
                                        fontFamily: "Noto Sans",
                                        fontSize: 16
                                    }
                                }):({
                                    search: false,
                                    paging: false,
                                    headerStyle: {
                                        fontFamily: "Raleway",
                                        fontWeight: 700,
                                        fontSize: 18
                                    },
                                    rowStyle: {
                                        fontFamily: "Noto Sans",
                                        fontSize: 16
                                    }
                                })
                            }
                        />
                    </div>
                    <br/><br/>
                </div>
            </div>
            <Footer />
        </div>
    );
}