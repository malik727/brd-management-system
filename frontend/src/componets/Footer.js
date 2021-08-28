import React from 'react'
import '../media/css/menus.css'
import { Copyright } from "@material-ui/icons";

export default function Footer(props) {
    return(
        <div className="footer-div">
            <div style={{display: "flex", justifyContent: "center", alignItems: "center", fontFamily: "Noto Sans"}}><span>Copyright</span>&nbsp;<Copyright style={{fontSize: "14px"}} />&nbsp;<span>{new Date().getFullYear()} Askari Bank Ltd, All rights reserved.</span></div>
        </div>
    );
}