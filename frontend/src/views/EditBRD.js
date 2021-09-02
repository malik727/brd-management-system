import { React, useState, useEffect } from 'react'
import axiosInstance from '../axios/axios_jwt';
import MaterialTable from 'material-table';
import { ToastContainer, toast } from 'react-toastify';
import Header from '../componets/Header'
import Footer from '../componets/Footer'
import { tableIcons } from '../utils/MaterialTableConfig';
import Edit from '@material-ui/icons/Edit';
import LoadingGif from '../media/images/loader.gif'
import '../media/css/content.css'
import { ReplyAll } from '@material-ui/icons';
import { useHistory } from 'react-router-dom';


export default function EditBRD(props) {
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
    const cols = [
        { title: 'BRD Title', field: 'title', width: "80%" },
        { title: 'Priority', field: 'priority',  lookup: { 'High': 'High', 'Medium': 'Medium', 'Low': 'Low' }, width: "10%" },
        { title: 'Due On', field: 'due_date', type:'date', width: "10%" }
    ]
    const rows = [
        { title: 'This is the title of my first BRD. Just increasing its width. A little bit more increase.', priority: 'High', due_date: '20-Aug-2022' },
        { title: 'This is the title of my first BRD. Just increasing its width.', priority: 'High', due_date: '20-Aug-2022' },
        { title: 'This is the title of my first BRD. Just increasing its width.', priority: 'Medium', due_date: '20-Aug-2022' },
        { title: 'This is the title of my first BRD. Just increasing its width.', priority: 'Medium', due_date: '20-Aug-2022' },
        { title: 'This is the title of my first BRD. Just increasing its width.', priority: 'Low', due_date: '20-Aug-2022' },
        { title: 'This is the title of my first BRD. Just increasing its width.', priority: 'High', due_date: '20-Aug-2022' },
    ]
    const [loading, setLoading] = useState(false);
    function LoadBRDs()
    {

    }
    // Load the data
    useEffect( async() => {
        const res = await LoadBRDs();
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
                                    onClick: (event, rowData) => alert("You saved " + rowData.name)
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
                                [{
                                    tooltip: 'Show Assigned People',
                                    render: rowData => {
                                      return (
                                        <div
                                          style={{
                                            fontSize: 100,
                                            textAlign: 'center',
                                            color: 'white',
                                            backgroundColor: '#43A047',
                                          }}
                                        >
                                          Hello
                                        </div>
                                      )
                                    }
                                }]
                            }
                            onRowClick={(event, rowData, togglePanel) => togglePanel()}
                        />
                    </div>
                </div>
            <Footer />
        </div>
    );
}