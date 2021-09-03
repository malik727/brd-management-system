import { React, useState, useEffect } from 'react'
import axiosInstance from '../axios/axios_jwt';
import MaterialTable from 'material-table';
import { ToastContainer, toast } from 'react-toastify';
import Header from '../componets/Header'
import Footer from '../componets/Footer'
import { tableIcons } from '../utils/MaterialTableConfig';
import Edit from '@material-ui/icons/Edit';
import '../media/css/content.css'
import { ReplyAll, Launch } from '@material-ui/icons';
import { useHistory } from 'react-router-dom';
import Skeleton from '@material-ui/lab/Skeleton';
import { Button } from '@material-ui/core';


export default function EditBRDs(props) {
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
    const history = useHistory();
    const [cols, setCols] = useState([
        { title: 'BRD Title', field: 'title', width: "80%" },
        { title: 'Origin', field: 'origin', width: "10%" },
        { title: 'Priority', field: 'priority', width: "10%" },
    ]);
    const [ rows, setRows ] = useState([
        { title: <Skeleton />, priority: <Skeleton />, origin: <Skeleton /> },
        { title: <Skeleton />, priority: <Skeleton />, origin: <Skeleton /> },
        { title: <Skeleton />, priority: <Skeleton />, origin: <Skeleton /> },
        { title: <Skeleton />, priority: <Skeleton />, origin: <Skeleton /> },
        { title: <Skeleton />, priority: <Skeleton />, origin: <Skeleton /> },
    ]);
    const [loading, setLoading] = useState(false);
    function convertDate(inp)
    {
        const date = new Date(inp);
        var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        var m = months[date.getMonth()];
        var d = date.getDate();
        var y = date.getFullYear();
        return d+" "+m+" "+y;
    }
    useEffect( async() => {
        async function FetchData()
        {
            await axiosInstance.get('/brds/').then(
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
                            const pendingData = result.data;
                            pendingData.forEach((obj) => {
                                temp.push({ id: obj.id, title: obj.title, priority: obj.priority, origin: obj.origin, due_date: convertDate(obj.due_date), justification: obj.justification });
                            });
                            setRows(temp);
                        }
                        else if (Array.isArray(result.data) && result.data.length === 0)
                        {
                            setRows([]);
                        }
                    }
                }
            ).catch(error => {
                setRows([]);
                if(error.code === 'ECONNABORTED')
                {
                    notify("Failed to communicate with the server! Please ensure you have stable internet connection.", "error");
                }
            })
            setLoading(false);
        }
        FetchData();
    }, []);
    return(
        <div>
            <ToastContainer />
            <Header config={navConfig} />
                <div className="brd-container content-container">
                    <div className="brd-content" style={{width: "900px"}}>
                        <MaterialTable
                            style={{boxShadow: "none"}}
                            icons={tableIcons}
                            title={<h2 style={{fontFamily: "Montserrat"}}>Edit or Update BRDs</h2>}
                            columns={cols}
                            data={rows}   
                            actions={[{
                                    icon: ReplyAll,
                                    tooltip: 'Re-Assign BRD',
                                    onClick: (event, rowData) => {
                                            history.push(`assign-brd?id=${rowData.id}`);
                                    }
                                },
                                {
                                    icon: Edit,
                                    tooltip: 'Edit BRD',
                                    onClick: (event, rowData) => {
                                        history.push(`edit-brd?id=${rowData.id}`);
                                    }
                                },
                            ]}                             
                            options={{
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
                            }}
                            detailPanel={
                                (rowData) => {
                                        return (
                                            <div style={{padding: "10px"}}>
                                                <div style={{display: "inline-block", width: "50%", verticalAlign: "top", padding: "5px 10px"}}>
                                                    <h3 style={{fontFamily: "Montserrat", fontSize: "18px", color: "var(--blue)"}}>Origin</h3>
                                                    <p style={{marginLeft: "5px", fontFamily: "Noto Sans", fontSize: "16px"}} >{rowData.origin}</p><br/>
                                                    <h3 style={{fontFamily: "Montserrat", fontSize: "18px", color: "var(--blue)"}}>Justification</h3>
                                                    <p style={{marginLeft: "5px", fontFamily: "Noto Sans", fontSize: "16px"}} >{rowData.justification}</p>
                                                </div>
                                                <div style={{display: "inline-block", width: "50%", verticalAlign: "top", padding: "5px 10px"}}>
                                                    <h3 style={{fontFamily: "Montserrat", fontSize: "18px", color: "var(--blue)"}}>Assignees</h3>
                                                    <p style={{marginLeft: "5px", fontFamily: "Noto Sans", fontSize: "16px"}} >Click on the " <ReplyAll /> " button found under actions column next to the BRD title to manage assigned users or update due date.</p>
                                                </div><br/>
                                                <div style={{textAlign: "center", margin: "15px auto"}}>
                                                    <Button style={{textTransform: "none", fontWeight: 600, fontFamily: "Noto Sans", borderRadius: "20px", fontSize: "16px"}} variant="contained" color="primary" onClick={() => { history.push(`/view-brd?id=${rowData.id}`) }} endIcon={<Launch />}>Show More Details</Button>
                                                </div>
                                            </div>
                                        )
                                }
                            }
                            onRowClick={(event, rowData, togglePanel) => {
                                togglePanel(); 
                            }}
                        />
                    </div>
                </div>
            <Footer />
        </div>
    );
}