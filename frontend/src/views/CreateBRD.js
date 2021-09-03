import { React, useState } from 'react'
import axiosInstance from '../axios/axios_jwt';
import { ToastContainer, toast } from 'react-toastify';
import Header from '../componets/Header'
import Footer from '../componets/Footer'
import Attachments from '../componets/Attachments';
import '../media/css/content.css'
import { ArrowForward, NoteAdd, Dashboard, ReplyAll } from "@material-ui/icons";
import CompletedImg from '../media/images/tick-mark.png'
import LoadingGif from '../media/images/loader.gif'
import { Button } from '@material-ui/core';
import { Link } from 'react-router-dom';
// TinyMCE Editor Imports
import 'tinymce/tinymce';
import 'tinymce/icons/default';
import 'tinymce/themes/silver';
import 'tinymce/plugins/paste';
import 'tinymce/plugins/link';
import 'tinymce/plugins/image';
import 'tinymce/plugins/table';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/advlist';
import 'tinymce/plugins/wordcount';
import 'tinymce/skins/ui/oxide/skin.min.css';
import { Editor } from '@tinymce/tinymce-react';

export default function CreateBRD(props) {
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
    var error = "";
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [attachments, setAttachments] = useState([]);
    const [brdId, setBrdId] = useState(false);
    const [brdTitle, setBrdTitle] = useState("");
    const [brdOrigin, setBrdOrigin] = useState("");
    const [brdJustification, setBrdJustification] = useState("");
    const [brdPriority, setBrdPriority] = useState("");
    const [contentEditor, setContentEditor] = useState("");
    const handleEditorChange = (content, editor) => {
        setContentEditor(content);
    }
    function HandleError()
    {
        if(brdTitle === "" || brdOrigin === "" || brdPriority === "" || contentEditor  === "" || brdJustification === "")
        {
            error = "*You need to fill all fields to continue!";
        }
        else
        {
            error = "";
        }
    }
    function AttachmentHandler(atts)
    {
        setAttachments(atts);
    }
    function GoToNextStep()
    {
        setCurrentStep(currentStep + 1);
    }
    async function HandleCreateBRD()
    {
        setLoading(true);
        var up_atts = [];
        // Attachment Upload
        if(attachments.length >= 1)
        {
            var fd = new FormData();
            attachments.map((file) => {
                fd.append("attachment", file);
            });
            const config = {
                headers: {
                    'content-type': 'multipart/form-data'
                }
            }
            await axiosInstance.post('/attachments/upload', fd, config).then(
                result => {
                    if (result.status === 201) {
                        up_atts = result.data;	
                    }
                }
            ).catch(error => {
                setLoading(false);
                if(error.code === 'ECONNABORTED')
                {
                    notify("Failed to communicate with the server! Please ensure you have stable internet connection.", "error");
                }
                else
                {
                    notify("Failed to upload attachments! Please visit \"Edit BRD\" section and re-upload attachments from there.", "error");	
                }
            })
        }
        // Create BRD
        await axiosInstance.post('/brds/', {
			created_by: props.user.userID,
            title: brdTitle,
            origin: brdOrigin,
            justification: brdJustification,
            priority: brdPriority,
            status: "Pending",
            purpose: contentEditor
		}).then(
			async (result) => {
				if (result.status === 201) {
                    if(result.data.brd_id != 0)
                    {
                        setBrdId(result.data.brd_id);
                        notify("BRD created successfully! You can now assign this BRD to an employee.", "success");
                        await HandleAttachmentBind(result.data.brd_id, up_atts);
                    }
                    else
                    {
                        notify("Failed to create BRD! Please try again later.", "error");	
                    }
				}
			}
		).catch(error => {
			setLoading(false);
			if(error.code === 'ECONNABORTED')
			{
				notify("Failed to communicate with the server! Please ensure you have stable internet connection.", "error");
			}
			else
			{
				notify("Failed to create BRD! Please try again later.", "error");	
			}
		})
    }
    async function HandleAttachmentBind(brd_id, up_atts)
    {
        // Bind Attachments with the newly created BRD
        if(brd_id !== false && up_atts.length >= 1)
        {
            await axiosInstance.post('/attachments/bind', {
                brdId: brd_id,
                attachments: up_atts,
            }).then(
                result => {
                    if (result.status === 201) {
                        if(result.data.brd_id != 0)
                        {
                            notify("Attachments Uploaded Successfully!", "success");
                            setLoading(false);
                            GoToNextStep();
                        }
                        else
                        {
                            notify("Failed to upload attachments! Please visit \"Edit BRD\" section and re-upload attachments from there.", "error");		
                        }
                    }
                }
            ).catch(error => {
                setLoading(false);
                if(error.code === 'ECONNABORTED')
                {
                    notify("Failed to communicate with the server! Please ensure you have stable internet connection.", "error");
                }
                else
                {
                    notify("Failed to upload attachments! Please visit \"Edit BRD\" section and re-upload attachments from there.", "error");	
                }
            })
        }
        else if(brd_id !== false)
        {
            setLoading(false);
            GoToNextStep();
        }
    }
    return(
        <div>
            {HandleError()}
            <ToastContainer />
            <Header config={navConfig} />
                <div className="brd-container content-container">
                    <div className="brd-content">
                        {
                            loading ? (
                            <div>
                                <span style={{
                                    display: "block",
                                    textAlign: "center",
                                    marginTop: "50px",
                                    marginBottom: "100px",
                                    fontFamily: 'Raleway',
                                    fontWeight: '600'
                                }}>
                                    <img src={LoadingGif} alt="Loading Gif" style={{display:"block", margin: "auto"}} width="75" />
                                    loading...
                                    <br/><br/>
                                    Please be patient for a couple of minutes as we process your request!
                                </span>
                            </div>
                            ) : (
                            (currentStep === 1) ? (
                            <div>
                                <h2 style={{fontFamily: "Montserrat"}}><div style={{display: "flex", justifyContent: "center", alignItems: "center"}}><NoteAdd style={{fontSize: "30px"}} />&nbsp;<span>Create a New BRD</span></div></h2>
                                <br/>
                                <div className="form-inp-div">
                                    <input type="input" className="form-inp-field" placeholder="BRD Title" id="brd-title" onChange={(e) => {setBrdTitle(e.target.value);}} name="brd_title" required />
                                    <label htmlFor="brd-title" className="form__label">Title</label>
                                </div>
                                <div className="form-inp-div">
                                    <input type="input" className="form-inp-field" placeholder="BRD Justification" id="brd-justification" onChange={(e) => {setBrdJustification(e.target.value)}} name="brd_justification" required />
                                    <label htmlFor="brd-justification" className="form__label">Justification</label>
                                </div>
                                <div className="form-inp-div">
                                    <input type="input" className="form-inp-field" placeholder="BRD Origin" id="brd-origin" name="brd_origin" onChange={(e) => {setBrdOrigin(e.target.value)}} required />
                                    <label htmlFor="brd-origin" className="form__label">Origin</label>
                                </div>
                                <div className="form-inp-div">
                                    <h3 style={{textAlign: "left", fontFamily: "Montserrat"}}>Priority</h3>
                                    <div className="form-inp-div-sub">
                                        <input type="radio" name="brd_priority" value="High" onChange={(e) => {setBrdPriority(e.target.value)}} id="option-1" />
                                        <label htmlFor="option-1" className="option option-1">
                                            <div className="dot"></div>
                                            <span>High</span>
                                        </label>
                                    </div>
                                    <div className="form-inp-div-sub">
                                        <input type="radio" name="brd_priority" value="Medium" onChange={(e) => {setBrdPriority(e.target.value)}} id="option-2" />
                                        <label htmlFor="option-2" className="option option-2">
                                            <div className="dot"></div>
                                            <span>Medium</span>
                                        </label>
                                    </div>
                                    <div className="form-inp-div-sub">
                                        <input type="radio" name="brd_priority" value="Low" onChange={(e) => {setBrdPriority(e.target.value)}} id="option-3" />
                                        <label htmlFor="option-3" className="option option-3">
                                            <div className="dot"></div>
                                            <span>Low</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="form-inp-div">
                                    <h3 style={{textAlign: "left", fontFamily: "Montserrat"}}>Add Attachments</h3>
                                    <p style={{textAlign: "left", fontFamily: "Raleway", margin: "5px"}}>Use the button below to add attachments for this brd. If you don't wish to add any attachments then you can simply click next to skip this step.</p>
                                    <Attachments attachments={attachments} toasts={true} maxSize={parseFloat(2.5)} setAttachments={AttachmentHandler} />
                                </div>
                                <div className="form-inp-div" style={{width: "500px"}}>
                                    <h3 style={{fontFamily: "Montserrat"}}>BRD Purpose</h3>
                                    <br />
                                    <Editor
                                        init = {{
                                            content_style: "@import url('https://fonts.googleapis.com/css2?family=Noto+Sans&display=swap'); body { font-family: 'Noto Sans';}",
                                            height: 300,
                                            menubar: false,
                                            branding: false,
                                            plugins: [
                                                'advlist lists link image table paste wordcount',
                                            ],
                                            toolbar:
                                                'formatselect | bold italic backcolor | \
                                                alignleft aligncenter alignright alignjustify | \
                                                bullist numlist outdent indent | table | removeformat'
                                        }}
                                        value={contentEditor}
                                        onEditorChange={handleEditorChange}
                                    />
                                </div>
                                <br/><br/>
                                {
                                    error === ""?(
                                        <Button variant="contained" style={{borderRadius: "25px", textTransform: "none", fontWeight: "600"}} color="primary" onClick={() => { HandleCreateBRD() }} endIcon={<ArrowForward />} >Next</Button>
                                    ):(
                                        <div>
                                            <Button variant="contained" style={{borderRadius: "25px", textTransform: "none", fontWeight: "600"}} color="primary" disabled endIcon={<ArrowForward />} >Next</Button><br/>
                                            <p className="error-text">{error}</p>
                                        </div>
                                    )
                                }            
                            </div>
                            ):
                            ((currentStep === 2 && brdId !== false)  ? (
                                <div>
                                    <div className="form-inp-div">
                                        <img src={CompletedImg} width="150px" /><br/><br/>
                                        <h3 style={{fontFamily: "Montserrat"}}>BRD Created Successfully!</h3> <br/>
                                        <h4 style={{fontFamily: "Noto Sans", fontWeight: "500"}}>Great work! Now the next step is to assign this BRD to an employee. You can assign it right now by clicking on the "Assign BRD" button below or you could assign it later by visiting the "Pending BRDs" section.</h4>
                                    </div>
                                    <Link style={{display: "inline-block", margin: "20px 5px"}} to={`/assign-brd?id=${brdId}`}><button className="form-btn"><div style={{display: "flex", justifyContent: "center", alignItems: "center"}}><ReplyAll />&nbsp;<span>Assign BRD</span></div></button></Link>
                                    <Link style={{display: "inline-block", margin: "20px 5px"}} to="/dashboard"><button className="form-btn"><div style={{display: "flex", justifyContent: "center", alignItems: "center"}}><Dashboard />&nbsp;<span>Dashboard</span></div></button></Link>
                                </div>
                            ):
                            (''))
                            )       
                        }
                    </div>
                </div>
            <Footer />
        </div>
    );
}