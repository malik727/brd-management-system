import { useEffect } from 'react';

export default function Logout()
{
    const logout = () => {
        if(localStorage.getItem('userObject') || localStorage.getItem('token'))
        {
            localStorage.removeItem('userObject');
            localStorage.removeItem('token');
            window.location.href = '/home';
        }
    }
    useEffect(() => {
		  logout();
    }, []);
    return ("");
}