import React, { useState } from 'react'
import '../media/css/chips.css'
import { CheckCircle, Cancel } from "@material-ui/icons"

export default function UserChip(props) {
    const chipName = props.text;
    const chipID = props.id;
    // const chipAvatar = "";
    const chipType = props.type;
    const [addStyles, setAddStyles] = useState("");
    const [chipIcon, setChipIcon] = useState(<CheckCircle />);
    function handleHover(e) {
        if(chipType === "editable")
        {
            setAddStyles("remove");
            setChipIcon(<Cancel />);
        }
    }
    function handleLeave(e) {
        setAddStyles("");
        setChipIcon(<CheckCircle />);
    }
    return(
        <div onMouseOver={(e) => handleHover(e)} onMouseOut={(e) => handleLeave(e)} id={chipID} className={"chip-div "+addStyles}>
            <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}><span style={{color: "var(--black)"}}>{chipName}</span>&nbsp;&nbsp;{chipIcon}</div>
        </div>
    );
}