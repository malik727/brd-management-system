import React from 'react';
import {Redirect,withRouter,Switch,Route} from 'react-router-dom';
import { createTheme, MuiThemeProvider } from '@material-ui/core';
import UserProfile from './utils/UserProfile';
import ProtectedRoute from './utils/ProtectedRoute';
import NotFound from './views/NotFound';
import Home from './views/Home';
import Login from './views/Login';
import Logout from './views/Logout';
import Dashboard from './views/Dashboard';
import CreateBRD from './views/CreateBRD';
import AssignBRD from './views/AssignBRD';
import EditBRD from './views/EditBRD';
import PendingBRD from './views/PendingBRD';
import AssignedBRD from './views/AssignedBRD';
import CompletedBRD from './views/CompletedBRD';
import ViewBRD from './views/ViewBRD';
import LoadingGif from './media/images/loader.gif';
import './media/css/main.css';

const theme = createTheme({
    palette: {
        primary: {
          main: '#1e90ff',
        },
      },  
});

class App extends React.Component
{
	constructor(props) 
	{
		super(props);
		this.state = {
		  	initialized: false,
			user: null,
		};
	}
	setUserDetails = () => {
		var user = {
			userID: UserProfile.getUserID(),
			loggedIn: UserProfile.isLoggedIn(),
			empID: UserProfile.getEmpID(),
			role: UserProfile.getRole(),
			firstName: UserProfile.getFirstName(),
			lastName: UserProfile.getLastName(),
			gender: UserProfile.getGender(),
			department: UserProfile.getDepartment(),
			designation: UserProfile.getDesignaton()
		};
		console.log(user);
		return user;
	}
	async componentDidMount()
	{
		await UserProfile.initialize();
		this.setState({
			initialized: true,
			user: this.setUserDetails(),
		});
	}
	async componentDidUpdate(prevProps) 
	{
		if (this.props.location.pathname !== prevProps.location.pathname) 
		{
			this.setState({
				initialized: false,
			});
			await UserProfile.initialize();
			this.setState({
				initialized: true,
				user: this.setUserDetails(),
			});
		}
	}
  	render() 
  	{
		if(this.state.initialized)
		{
			var user = this.state.user;
			return(
				<MuiThemeProvider theme={theme}>
					<Switch>
						<Route exact path="/">
							<Home user={user} />
						</Route>
						<Route exact path="/home">
							<Home user={user} />
						</Route>
						<Route exact path="/login" render={() => (
							user.loggedIn?(
								<Redirect to="/home" />
							):(
								<Login user={user} />
							)
						)} />
						<Route exact path="/logout">
							<Logout />
						</Route>
						<ProtectedRoute exact path="/dashboard" component={Dashboard}  dataProp={user} dataPropName="user" />
						<ProtectedRoute exact path="/create-brd" component={CreateBRD} dataProp={user} dataPropName="user" />
						<ProtectedRoute exact path="/edit-brd" component={EditBRD} dataProp={user} dataPropName="user" />
						<ProtectedRoute exact path="/view-brd" component={ViewBRD} dataProp={user} dataPropName="user" />
						<ProtectedRoute exact path="/assign-brd" component={AssignBRD} dataProp={user} dataPropName="user" />
						<ProtectedRoute exact path="/pending-brd" component={PendingBRD} dataProp={user} dataPropName="user" />
						<ProtectedRoute exact path="/assigned-brd" component={AssignedBRD} dataProp={user} dataPropName="user" />
						<ProtectedRoute exact path="/completed-brd" component={CompletedBRD} dataProp={user} dataPropName="user" />
						<Route>
							<NotFound user={user} />
						</Route>
					</Switch>
				</MuiThemeProvider>
			);
		}
		else
		{
			return(
				<div style={{
					display: 'block', 
					margin: 'auto', 
					position: 'relative', 
					textAlign: 'center', 
					width: '100%', 
					height: '100vh'
				}}>
					<span style={{
						margin: '0px',
						position: 'absolute',
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
						fontFamily: 'Raleway',
						fontWeight: '600'
					}}>
						<img src={LoadingGif} alt="Loading Gif" width="75" />
						<br/>
						loading...
					</span>
				</div>
			);
		}
  	}
};

export default withRouter(App);