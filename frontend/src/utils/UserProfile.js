import axiosInstance from '../axios/axios_jwt';

var UserProfile = (function() {
    var loggedIn = false;
	var userID = "";
	var empID = "";
    var firstName = "";
    var lastName = "";
    var gender = "";
	var role = "";
    var department = "";
    var designation = "";

    var initialize = async () => {
			var token = JSON.parse(localStorage.getItem('token'));
			if(token)
			{
				var userObject = JSON.parse(localStorage.getItem('userObject'));
				if(!userObject)
				{
					await axiosInstance.get('/users/whoami')
						.then((response) => {
							var newUserObject = {
								'userID': response.data.id,
								'empID': response.data.emp_id,
								'firstName': response.data.first_name, 
								'lastName': response.data.last_name,
								'gender': response.data.gender,
								'role': response.data.role,
								'department': response.data.department,
								'designation': response.data.designation,
								'requestTime': currentTime
							};
							localStorage.setItem('userObject', JSON.stringify(newUserObject)); 
							userID = newUserObject.userID;
							empID = newUserObject.empID;
							firstName = newUserObject.firstName;
							lastName = newUserObject.lastName;
							gender = newUserObject.gender;
							role = newUserObject.role;
							department = newUserObject.department;
							designation = newUserObject.designation;
							loggedIn = true;
						}).catch (error => {
							console.log(error);
							localStorage.removeItem('userObject');
							localStorage.removeItem('token');
							loggedIn = false;
							return false;
					});
				}
				else
				{
					var currentTime = Math.floor(Date.now()/1000);
					var requestTime = userObject.requestTime;
					var reRequestSeconds = 300; // Number of seconds to wait before sending the request again
					if(requestTime && currentTime > requestTime+reRequestSeconds)
					{
						await axiosInstance.get('/users/whoami')
							.then((response) => {
								var newUserObject = {
									'userID': response.data.id,
									'empID': response.data.emp_id,
									'firstName': response.data.first_name, 
									'lastName': response.data.last_name,
									'gender': response.data.gender,
									'role': response.data.role,
									'department': response.data.department,
									'designation': response.data.designation,
									'requestTime': currentTime,
								};
								localStorage.setItem('userObject', JSON.stringify(newUserObject)); 
								userID = newUserObject.userID;
								empID = newUserObject.empID;
								firstName = newUserObject.firstName;
								lastName = newUserObject.lastName;
								gender = newUserObject.gender;
								role = newUserObject.role;
								department = newUserObject.department;
								designation = newUserObject.designation;
								loggedIn = true;
							}).catch (error => {
								console.log(error);
								localStorage.removeItem('userObject');
								localStorage.removeItem('token');
								loggedIn = false;
								return false;
						});
					}
					else
					{
						userObject.requestTime = currentTime;
						userID = userObject.userID;
						empID = userObject.empID;
						firstName = userObject.firstName;
						lastName = userObject.lastName;
						gender = userObject.gender;
						department = userObject.department;
						role = userObject.role;
						designation = userObject.designation;
						loggedIn = true;
						localStorage.setItem('userObject', JSON.stringify(userObject)); 
					}
				}
			}
			return true;
    };
  
    var isLoggedIn = () => {
        return loggedIn;
    };
	var getUserID = () => {
		return userID;
	};
	var getEmpID = () => {
		return empID;
	};
	var getRole = () => {
		return role;
	}
    var getFirstName = () => {
      return firstName;
    };
    var getLastName = () => {
        return lastName;
    };
    var getGender = () => {
        return gender;
    };
    var getDepartment = () => {
        return department;
    };
    var getDesignation = () => {
        return designation;
    };
  
    return {
        initialize: initialize,
        isLoggedIn: isLoggedIn,
		getUserID: getUserID,
		getEmpID: getEmpID,
		getRole: getRole,
        getFirstName: getFirstName,
        getLastName: getLastName,
        getGender: getGender,
        getDepartment: getDepartment,
        getDesignaton: getDesignation
    };
  
  })();
  
  export default UserProfile;