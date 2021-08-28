import { React, useEffect, useState } from 'react'
import DateFnsUtils from '@date-io/date-fns';
import differenceInDays from 'date-fns/differenceInDays';
import axiosInstance from '../axios/axios_jwt';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from "@material-ui/pickers";
import UserChip from './UserChip'
import '../media/css/content.css'
import { Search, AccountCircle, PersonAdd, ReplyAll } from "@material-ui/icons";
import { Alert, AlertTitle } from '@material-ui/lab';
import Switch from '@material-ui/core/Switch';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import LiveSearch from "../utils/LiveSearch"
import LoadingGif from '../media/images/loader.gif'


export default function Assign(props) {
    const [ searchLoading, setSearchLoading ] = useState(false);
    const [ searchResults, setSearchResults ] = useState([]);
    const [ switchState, setSwitchState ] = useState(false);
    const [ holidayLoading, setHolidayLoading ] = useState(false);
    const [ holidays, setHolidays ] = useState(null);

    let selectedUsers = props.assignedUsers;
    let brdDueDate = props.dueDate;
    const brd_id = props.brdId;

    useEffect(() => {
        if(switchState)
        {
            GetHolidays(brdDueDate);
        }
    }, [switchState]);

    async function PerformSearch(val) {
        if(val.length >= 1)
        {
            setSearchLoading(true);
            let query = `/users/search?query=${val}`;
            LiveSearch.setQuery(query);
            await LiveSearch.getQueryResults();
            if(LiveSearch.getStatus() === 401)
            {
                window.location.reload();
            }
            setSearchResults(LiveSearch.getResults());
            setSearchLoading(false);
        }
    };
    function SearchHandler()
    {
        let value = document.getElementById("brd-search");
        if(value !== null && value !== undefined)
        {
            value = value.value;
        }
        else
        {
            value = "";
        }
        PerformSearch(value);
    }
    function AddToAssigned(id, name, brd_id)
    {
        let user = {
            id,
            name,
            brd_id,
        };
        function userExists(userID) {
            return selectedUsers.some(function(e) {
                return e.id === userID;
            }); 
        }
        if(!userExists(user.id))
        {
            selectedUsers.push(user);
        }
        props.setAssignedUsers(selectedUsers => [...selectedUsers]);
        console.log(selectedUsers);
    }
    function RemoveFromAssigned(id)
    {
        var filtered = selectedUsers.filter(function(el) { return el.id !== id; }); 
        props.setAssignedUsers(filtered);
    }
    function HandleHolidaySwitch()
    {
        setSwitchState(!switchState);
    }
    async function GetHolidays(date)
    {
        var diffInDays = differenceInDays(new Date(date), new Date());
        if(diffInDays === NaN || diffInDays < 0)
        {
            diffInDays = 0;
        }
        else
        {
            diffInDays += 1;
        }
        setHolidayLoading(true);
        await axiosInstance.get(`/brds/public-holidays/${diffInDays}`)
        .then(
            result => {
                if (result.status === 200) {
                    setHolidays(result.data);
                }
                else
                {
                    setHolidays([]);
                }
            }
        ).catch(error => {
            setHolidays([]);
        });
        setHolidayLoading(false);
    }
    return(
        <div>
            <h2 style={{fontFamily: "Montserrat"}}><div style={{display: "flex", justifyContent: "center", alignItems: "center"}}><ReplyAll style={{fontSize: "30px"}} />&nbsp;<span>Assign BRD</span></div></h2>
            <br/>
            <div className="form-inp-div">
                <div className="form-inp-assignbrd">
                    <h3 style={{textAlign: "left", fontFamily: "Montserrat"}}>Select Employees</h3>
                    <p style={{textAlign: "left", fontFamily: "Raleway", margin: "5px"}}>Type the name of employees below and press enter key. Click on the blue button next to employee name to select them. You can also select multiple employees.</p>
                    <br/>
                    {
                        selectedUsers.map(users => {
                            return <div key={users.id} style={{display: "inline-block"}} onClick={() => RemoveFromAssigned(users.id)}><UserChip type="editable" key={users.id} id={users.id} text={users.name} /></div>
                        })
                    }
                    <div style={{width: "300px"}} className="form-inp-div">
                        <input autoComplete="off" type="search" onKeyDown={(event) => { if (event.keyCode === 13) { SearchHandler() } }} className="form-inp-field" placeholder="Search Employees" id="brd-search" name="brd_search" required />
                        <label htmlFor="brd-search" className="form__label"><div style={{display: "flex", justifyContent: "center", alignItems: "center"}}><Search />&nbsp;<span>Search Employees</span></div></label>
                    </div>
                    <div className="brd-search-results">
                        <ol>
                        {
                            (searchLoading)?(
                                <img src={LoadingGif} width="50" style={{display: "block", margin: "20px auto"}} />
                            ):('')
                        }
                        {
                            (searchResults && searchLoading === false)?searchResults.map(res => {
                                return <li key={res.id} className="search-res" >
                                    <span title="Employee Name" style={{display: "inline-block", verticalAlign: "middle", width: "245px", margin: "2.5px", textOverflow: "ellipsis", overflow: "hidden", fontWeight: "500"}}>
                                        <div style={{display: "flex", justifyContent: "left", alignItems: "center"}}>
                                            <AccountCircle />&nbsp;&nbsp;<span>{res.first_name+" "+res.last_name}&nbsp;&nbsp;({res.emp_id})</span>
                                        </div>
                                    </span>
                                    <span style={{display: "inline-block", verticalAlign: "middle", width: "50px", marginLeft: "2.5px", textOverflow: "ellipsis", overflow: "hidden"}}>
                                        <Tooltip title={`Assign this BRD to ${res.first_name} ${res.last_name}`} onClick={()=>AddToAssigned(res.id, res.first_name+" "+res.last_name, brd_id)}>
                                            <IconButton aria-label="delete">
                                                <PersonAdd style={{cursor:"pointer", color:"var(--black)", fontSize: "24px"}} />
                                            </IconButton>
                                        </Tooltip>                             
                                    </span>
                                </li>
                            }):('')
                        }
                        {
                            (searchResults  && searchLoading === false)?((searchResults.length === 0) ?(<li className="form-inp-files-emp">No results found!</li>):('')):('')
                        }
                        </ol>
                    </div>
                </div>
            </div>
            <div className="form-inp-div">
                <h3 style={{textAlign: "left", fontFamily: "Montserrat"}}>Due Date</h3>
                <p style={{textAlign: "left", fontFamily: "Raleway", margin: "5px"}}>Select the due date for this BRD. You can directly type the due date in the box or click on the calender icon to select the date.</p>
                <div className="form-inp-div" style={{textAlign: "left", marginTop: "5px"}}>
                    <p style={{display: "inline-block", verticalAlign: "middle", fontFamily: "Noto Sans", width: "250px", margin: "0px 5px"}}>Calculate Public Holidays</p>
                    <div style={{display: "inline-block", verticalAlign: "middle", textAlign: "right", margin: "0px 5px"}}>
                        <Switch
                            checked={switchState}
                            onChange={HandleHolidaySwitch}
                            color="primary"
                            name="checkedB"
                            inputProps={{ 'aria-label': 'primary checkbox' }}
                        />
                    </div>
                </div>
                <div className="form-inp-div">
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <KeyboardDatePicker
                            title="Select Due Date"
                            color="primary"
                            autoOk
                            variant="inline"
                            inputVariant="outlined"
                            label="Due Date"
                            format="dd/MM/yyyy"
                            value={brdDueDate}
                            InputAdornmentProps={{ position: "start" }}
                            onChange={(date) => {
                                    props.setBrdDueDate(date);
                                    if(switchState)
                                    {
                                        GetHolidays(date);
                                    }
                                }
                            }
                        />
                    </MuiPickersUtilsProvider>
                    { 
                        switchState?(
                            holidayLoading ? (
                                <img src={LoadingGif} width="50" style={{display: "block", margin: "20px auto"}} />
                            ):(
                                <>
                                    <Alert severity="info" style={{textAlign: "left", fontFamily: "Noto Sans", margin: "30px 10px", marginBottom: 0}}><AlertTitle>Public Holidays</AlertTitle>Found <strong>{Array.isArray(holidays)?(holidays.length):(0)}</strong> holiday(s) until the selected due date.
                                    <ul style={{listStylePosition: "inside", textAlign: "left", margin: "10px 5px"}}>
                                    {
                                        Array.isArray(holidays)?(
                                            holidays.map((holiday) => {
                                                return <li>{holiday.name} ({holiday.date})</li>
                                            })
                                        ):(
                                            ''
                                        )
                                    }
                                    </ul>
                                    </Alert>
                                </>
                            )
                        ):
                        ('')
                    }
                </div>
            </div>
        </div>
    );
}