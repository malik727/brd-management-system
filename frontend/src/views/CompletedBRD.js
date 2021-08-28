import { React, useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../axios/axios_jwt';
import Header from '../componets/Header';
import Footer from '../componets/Footer';
import '../media/css/content.css';
import Skeleton from '@material-ui/lab/Skeleton';
import { Launch } from '@material-ui/icons';
import MaterialTable from 'material-table';
import { tableIcons } from '../utils/MaterialTableConfig';
import { useHistory } from 'react-router-dom';

export default function CompletedBRD(props) {
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
    const [cols, setCols] = useState([
        { title: 'BRD Title', field: 'title', width: "80%" },
        { title: 'Originating Division', field: 'origin', width: "10%" },
        { title: 'Priority', field: 'priority', width: "10%" },
    ]);
    const [ rows, setRows ] = useState([
        { title: <Skeleton />, priority: <Skeleton />, origin: <Skeleton /> },
        { title: <Skeleton />, priority: <Skeleton />, origin: <Skeleton /> },
        { title: <Skeleton />, priority: <Skeleton />, origin: <Skeleton /> },
        { title: <Skeleton />, priority: <Skeleton />, origin: <Skeleton /> },
        { title: <Skeleton />, priority: <Skeleton />, origin: <Skeleton /> },
    ]);
    useEffect(() => {
        async function FetchData()
        {
            await axiosInstance.get('/brds/completed').then(
                result => {
                    if (result.status === 200) {
                        setCols([
                            { title: 'BRD Title', field: 'title', width: "60%" },
                            { title: 'Originating Division', field: 'origin', width: "30%" },
                            { title: 'Priority', field: 'priority',  lookup: { 'High': 'High', 'Medium': 'Medium', 'Low': 'Low' }, width: "10%"},
                        ]);
                        if(Array.isArray(result.data) && result.data.length >= 1)
                        {
                            const temp = [];
                            const pendingData = result.data;
                            pendingData.forEach((obj) => {
                                temp.push({ id: obj.id, title: obj.title, priority: obj.priority, origin: obj.origin });
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
            <Header config={navConfig} />
            <ToastContainer />
            <div className="brd-container content-container">
                <div className="brd-content" style={{width: "900px"}}>
                    <MaterialTable
                        style={{boxShadow: "none"}}
                        icons={tableIcons}
                        title={<h2 style={{fontFamily: "Montserrat"}}>Completed BRDs</h2>}
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
            </div>
            <Footer />
        </div>
    );
}