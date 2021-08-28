import React from 'react'
import { withRouter } from 'react-router-dom'


class ProtectedRoute extends React.Component {
    componentDidMount() 
    {
        if(this.props.dataProp.loggedIn === false)
        {
            this.props.history.push("/login?target="+encodeURI(this.props.location.pathname));  
        } 
    }
    render() 
    {
        return this.props.dataProp.loggedIn ? (
            <this.props.component {...{[this.props.dataPropName]:this.props.dataProp}} />
        ) : (
            ""
        );
    }
  }
  
  export default withRouter(ProtectedRoute);