import { React, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../media/css/menus.css';
import MainLogo from '../media/logos/main-logo.jpg';
import { Menu, MenuOpen, Dashboard, NoteAdd, Edit, AssignmentTurnedIn, HourglassFull, ExitToApp, Assignment, ExpandMore, Apps, Settings } from '@material-ui/icons';
import IconButton from '@material-ui/core/IconButton';
import DefaultAvatar from '../media/images/default-avatar.png';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Button from '@material-ui/core/Button';
import MainMenu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Fade from '@material-ui/core/Fade';

export default function Header(props) {
    const loggedIn = props.config.loggedIn;
    const userRole = props.config.role;
    const [sideMenuStatus, setSideMenuStatus] = useState(false);
    function HandleSideMenu()
    {
        setSideMenuStatus(!sideMenuStatus);
    }
    // Always scroll to top between componet switches
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    const [anchorEl, setAnchorEl] = useState(null);
    const menuOpen = Boolean(anchorEl);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };
    return(
        <div className={sideMenuStatus?"nav-menu nav-menu-displaced opened":"nav-menu"}>
            {
                sideMenuStatus && loggedIn ? (
                    <ClickAwayListener onClickAway={() => {setSideMenuStatus(!sideMenuStatus);}} >
                        <div className={sideMenuStatus?"nav-side-menu opened":"nav-side-menu"}>
                            <div className="nav-user-details">
                                <div className="nav-user-avatar">
                                    <img className="nav-user-avatar-img" alt="User Avatar" src={DefaultAvatar} />
                                </div>
                                <div>
                                    <h3>{props.config.firstName} {props.config.lastName}</h3>
                                </div>
                            </div>
                            <div className="side-menu-links">
                                <Link style={{textDecoration: "none", color: "#000"}} to="/dashboard">
                                    <li>
                                        <div style={{display: "flex", justifyContent: "left", alignItems: "center"}}><Dashboard />&nbsp;&nbsp;<span>Dashboard</span></div>
                                    </li>
                                </Link>
                                {
                                    (userRole === "Manager" || userRole === "SuperUser")?(
                                        <>
                                            <Link style={{textDecoration: "none", color: "#000"}} to="/create-brd">
                                                <li>
                                                    <div style={{display: "flex", justifyContent: "left", alignItems: "center"}}><NoteAdd />&nbsp;&nbsp;<span>Create New BRD</span></div>
                                                </li>
                                            </Link>
                                            <Link style={{textDecoration: "none", color: "#000"}} to="/edit-brds">
                                                <li>
                                                    <div style={{display: "flex", justifyContent: "left", alignItems: "center"}}><Edit />&nbsp;&nbsp;<span>Edit BRDs</span></div>                           
                                                </li>
                                            </Link>
                                            <Link style={{textDecoration: "none", color: "#000"}} to="/pending-brd">
                                                <li>
                                                    <div style={{display: "flex", justifyContent: "left", alignItems: "center"}}><HourglassFull />&nbsp;&nbsp;<span>Pending BRDs</span></div>
                                                </li>
                                            </Link>
                                        </>
                                    ):(
                                        <>
                                            <Link style={{textDecoration: "none", color: "#000"}} to="/assigned-brd">
                                                <li>
                                                    <div style={{display: "flex", justifyContent: "left", alignItems: "center"}}><Assignment />&nbsp;&nbsp;<span>Assigned BRDs</span></div>
                                                </li>
                                            </Link>
                                        </>
                                    )
                                }
                                <Link style={{textDecoration: "none", color: "#000"}} to="/completed-brd">
                                    <li>
                                        <div style={{display: "flex", justifyContent: "left", alignItems: "center"}}><AssignmentTurnedIn />&nbsp;&nbsp;<span>Completed BRDs</span></div>
                                    </li>
                                </Link>
                                {
                                    (userRole === "Manager" || userRole === "SuperUser")?(
                                        <Link style={{textDecoration: "none", color: "#000"}} to="/manage-apps">
                                            <li>
                                                <div style={{display: "flex", justifyContent: "left", alignItems: "center"}}><Apps />&nbsp;&nbsp;<span>Manage Apps</span></div>
                                            </li>
                                        </Link>
                                    ) : (
                                        <Link style={{textDecoration: "none", color: "#000"}} to="/view-apps">
                                                <li>
                                                    <div style={{display: "flex", justifyContent: "left", alignItems: "center"}}><Apps />&nbsp;&nbsp;<span>Show Apps</span></div>
                                                </li>
                                        </Link>
                                    )
                                }
                            </div>
                        </div>
                    </ClickAwayListener>
                ) : (
                    ''
                )
            }
            <div className="nav-logo">
                {
                    loggedIn? (
                        <div className="nav-side-menu-icon" onClick={(event) => { HandleSideMenu() }}>
                            {
                                sideMenuStatus?(
                                    <IconButton>
                                        <MenuOpen style={{color: "var(--black)"}} /> 
                                    </IconButton>               
                                ):(
                                    <IconButton>
                                        <Menu style={{color: "var(--black)"}} /> 
                                    </IconButton>   
                                )
                            }
                        </div>
                    ):('')
                }
                <img src={MainLogo} className="nav-logo-img" alt="Main Logo" height="70" />
            </div>
            <div className="nav-links">
                <Link to="/home" style={{color: 'inherit', textDecoration: 'none', display: "inline-block", verticalAlign: "middle"}}>
                    <Button style={{borderRadius: "25px",margin: "auto 5px", fontFamily: 'Montserrat', fontWeight: 600, cursor: "pointer", fontSize: "var(--font-l)", transition: "0.2s ease-in-out", color: "var(--black)", textTransform: "none"}}>Home</Button>
                </Link>
                {
                    loggedIn?(
                        <>
                            <Button aria-haspopup="true" style={{borderRadius: "25px",display: "inline-block", verticalAlign: "middle", margin: "auto 5px", fontFamily: 'Montserrat', fontWeight: 600, cursor: "pointer", fontSize: "var(--font-l)", transition: "0.2s ease-in-out", textTransform: "none"}} onClick={handleMenuOpen} ><img alt="User Avatar" src={DefaultAvatar} style={{ width: "27px", height: "27px", display: "inline-block", borderRadius: "50%", verticalAlign: "middle", backgroundColor: "#fff"}} />&nbsp;<span style={{display: "inline-block", verticalAlign: "middle"}}>{props.config.firstName}</span><ExpandMore style={{display: "inline-block", verticalAlign: "middle"}} /></Button>
                            <MainMenu
                                anchorEl={anchorEl}
                                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                                id="fade-menu"
                                keepMounted
                                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                open={menuOpen}
                                onClose={handleMenuClose}
                                TransitionComponent={Fade}
                            >
                                <Link to="/settings" style={{color: 'inherit', textDecoration: 'none'}}>
                                    <MenuItem onClick={handleMenuClose}>
                                        <Settings style={{verticalAlign: 'middle', display: 'inline-block'}} /> 
                                        <p style={{verticalAlign: 'middle', display: 'inline-block', marginLeft: '5px'}}>Settings</p>
                                    </MenuItem>
                                </Link>
                                <Link to="/logout" style={{color: 'inherit', textDecoration: 'none'}}>
                                    <MenuItem onClick={handleMenuClose}>
                                        <ExitToApp style={{verticalAlign: 'middle', display: 'inline-block'}} /> 
                                        <p style={{verticalAlign: 'middle', display: 'inline-block', marginLeft: '5px'}}>Logout</p>
                                    </MenuItem>
                                </Link>
                            </MainMenu>
                        </>
                    ):(
                        <Link to="/login" style={{color: 'inherit', textDecoration: 'none', display: "inline-block", verticalAlign: "middle"}}>
                            <Button variant="contained" color="primary" style={{borderRadius: "25px",margin: "auto 5px", fontFamily: 'Montserrat', fontWeight: 600, cursor: "pointer", fontSize: "var(--font-l)", transition: "0.2s ease-in-out", textTransform: "none"}}>Login</Button>
                        </Link>
                    )
                }    
            </div>
        </div>

    );
}