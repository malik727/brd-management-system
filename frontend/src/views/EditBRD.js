import { React, useState, useEffect } from 'react';
import axiosInstance from '../axios/axios_jwt';
import { ToastContainer, toast } from 'react-toastify';
import Header from '../componets/Header';
import Footer from '../componets/Footer';
import { CheckCircle, Dashboard, Edit } from '@material-ui/icons';
import NotFoundImg from '../media/images/not-found.png';
import LoadingGif from '../media/images/loader.gif';
import Attachments from '../componets/Attachments';
import { Button } from '@material-ui/core';
import '../media/css/content.css';
import { Link, useHistory, useLocation } from 'react-router-dom';
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
    const location = useLocation();
    const history = useHistory();
    var error = "";
    const [ loading, setLoading ] = useState(false);
    const [ brdAttachments, setBrdAttachments ] = useState(false);
    const [attachments, setAttachments] = useState([]);
    const [ attachmentFound, setAttachmentFound ] = useState(false);
    const [ brdFound, setBrdFound ] = useState(null);
    const [ brdTitle, setBrdTitle ] = useState("");
    const [ brdOrigin, setBrdOrigin ] = useState("");
    const [ brdJustification, setBrdJustification ] = useState("");
    const [ brdPriority, setBrdPriority ] = useState("");
    const [ contentEditor, setContentEditor ] = useState("");
    const handleEditorChange = (content, editor) => {
        setContentEditor(content);
    }
    function AttachmentHandler(atts)
    {
        setAttachments(atts);
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
	const urlParams = new URLSearchParams(location.search);
	var brdId = urlParams.get('id');
    if(!brdId)
    {
        history.push("/edit-brds");
    }
    useEffect(() => {
        setLoading(true);
        async function FetchData()
        {
            await axiosInstance.get(`/brds/id/${brdId}`).then(
                result => {
                    if (result.status === 200) {
                        setBrdFound(true);
                        setBrdTitle(result.data.title);
                        setBrdOrigin(result.data.origin);
                        setBrdJustification(result.data.justification);
                        setBrdPriority(result.data.priority);
                        setContentEditor(result.data.purpose);
                    }
                }
            ).catch(error => {
                setBrdFound(false);
                if(error.code === 'ECONNABORTED')
                {
                    notify("Failed to communicate with the server! Please ensure you have stable internet connection.", "error");
                }
            })
            await axiosInstance.get(`/attachments/brdId/${brdId}`).then(
                result => {
                    if (result.status === 200) {
                        setAttachmentFound(true);
                        setBrdAttachments(result.data);
                    }
                }
            ).catch(error => {
                setAttachmentFound(false);
                if(error.code === 'ECONNABORTED')
                {
                    notify("Failed to communicate with the server! Please ensure you have stable internet connection.", "error");
                }
            })
            setLoading(false);
        }
        FetchData();
    }, []);    
    async function UpdateBRD()
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
            // Binding the attachments
            await axiosInstance.post('/attachments/bind', {
                brdId: brdId,
                attachments: up_atts,
            }).then(
                result => {
                    if (result.status === 201) {
                        if(result.data.brd_id != 0)
                        {
                            notify("Attachments Updated Successfully!", "success");
                        }
                        else
                        {
                            notify("Failed to upload attachments! Please visit \"Edit BRD\" section and re-upload attachments from there.", "error");		
                        }
                    }
                }
            ).catch(error => {
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
        await axiosInstance.patch(`/brds/id/${brdId}`, {
            title: brdTitle,
            origin: brdOrigin,
            justification: brdJustification,
            priority: brdPriority,
            purpose: contentEditor
        }).then(
            result => {
                if (result.status === 200) {
                    history.push("/edit-brds");
                }
            }
        ).catch(error => {
            if(error.code === 'ECONNABORTED')
            {
                notify("Failed to communicate with the server! Please ensure you have stable internet connection.", "error");
            }
            else
            {
                notify("Failed to Edit BRD! Please try again later.", "error");	
            }
        })
        setLoading(false);
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
                                brdFound ? (
                                    <div>
                                        <h2 style={{fontFamily: "Montserrat"}}><div style={{display: "flex", justifyContent: "center", alignItems: "center"}}><Edit style={{fontSize: "30px"}} />&nbsp;<span>Edit BRD</span></div></h2>
                                        <br/>
                                        <div className="form-inp-div">
                                            <input type="input" value={brdTitle} className="form-inp-field" placeholder="BRD Title" id="brd-title" onChange={(e) => {setBrdTitle(e.target.value);}} name="brd_title" required />
                                            <label htmlFor="brd-title" className="form__label">Title</label>
                                        </div>
                                        <div className="form-inp-div">
                                            <input type="input" value={brdJustification} className="form-inp-field" placeholder="BRD Justification" id="brd-justification" onChange={(e) => {setBrdJustification(e.target.value)}} name="brd_justification" required />
                                            <label htmlFor="brd-justification" className="form__label">Justification</label>
                                        </div>
                                        <div className="form-inp-div">
                                            <input type="input" value={brdOrigin} className="form-inp-field" placeholder="BRD Origin" id="brd-origin" name="brd_origin" onChange={(e) => {setBrdOrigin(e.target.value)}} required />
                                            <label htmlFor="brd-origin" className="form__label">Origin</label>
                                        </div>
                                        <div className="form-inp-div">
                                            <h3 style={{textAlign: "left", fontFamily: "Montserrat"}}>Priority</h3>
                                            <div className="form-inp-div-sub">
                                                {
                                                    brdPriority === "High" ? (
                                                        <input type="radio" name="brd_priority" value="High" onChange={(e) => {setBrdPriority(e.target.value)}} id="option-1" checked />
                                                    ) : (
                                                        <input type="radio" name="brd_priority" value="High" onChange={(e) => {setBrdPriority(e.target.value)}} id="option-1" />
                                                    )
                                                }
                                                <label htmlFor="option-1" className="option option-1">
                                                    <div className="dot"></div>
                                                    <span>High</span>
                                                </label>
                                            </div>
                                            <div className="form-inp-div-sub">
                                                {
                                                    brdPriority === "Medium" ? (
                                                        <input type="radio" name="brd_priority" value="Medium" onChange={(e) => {setBrdPriority(e.target.value)}} id="option-2" checked />
                                                    ) : (
                                                        <input type="radio" name="brd_priority" value="Medium" onChange={(e) => {setBrdPriority(e.target.value)}} id="option-2" />
                                                    )
                                                }
                                                <label htmlFor="option-2" className="option option-2">
                                                    <div className="dot"></div>
                                                    <span>Medium</span>
                                                </label>
                                            </div>
                                            <div className="form-inp-div-sub">
                                                {
                                                    brdPriority === "Low" ? (
                                                        <input type="radio" name="brd_priority" value="Low" onChange={(e) => {setBrdPriority(e.target.value)}} id="option-3" checked />
                                                    ) : (
                                                        <input type="radio" name="brd_priority" value="Low" onChange={(e) => {setBrdPriority(e.target.value)}} id="option-3" />
                                                    )
                                                }
                                                <label htmlFor="option-3" className="option option-3">
                                                    <div className="dot"></div>
                                                    <span>Low</span>
                                                </label>
                                            </div>
                                        </div>
                                        <div className="form-inp-div">
                                            <h3 style={{textAlign: "left", fontFamily: "Montserrat"}}>Edit Attachments</h3>
                                            <p style={{textAlign: "left", fontFamily: "Raleway", margin: "5px"}}>Use the button below to add more attachments for this brd. The attachments having green text represent currently attached documents to this BRD.</p>
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
                                                <Button variant="contained" style={{borderRadius: "25px", textTransform: "none", fontWeight: "600"}} color="primary" onClick={() => { UpdateBRD() }} startIcon={<CheckCircle />} >Done</Button>
                                            ):(
                                                <div>
                                                    <Button variant="contained" style={{borderRadius: "25px", textTransform: "none", fontWeight: "600"}} color="primary" disabled startIcon={<CheckCircle />} >Done</Button><br/>
                                                    <p className="error-text">{error}</p>
                                                </div>
                                            )
                                        }  
                                    </div>
                                ):(
                                    brdFound === false ? (
                                        <div className="brd-content">
                                            <img src={NotFoundImg} width="150" style={{margin: "30px auto", display: "block"}} />
                                            <h2 style={{fontFamily: "Montserrat"}}>Error 404</h2><br/><br/>
                                            <h3 style={{fontFamily: "Raleway"}}>Failed to locate this BRD! You might not have privilages to access this BRD or it may have been deleted.</h3>
                                            <br/>
                                            <Link style={{display: "inline-block", margin: "20px 10px"}} to="/dashboard"><button className="form-btn"><div style={{display: "flex", justifyContent: "center", alignItems: "center"}}><Dashboard />&nbsp;<span>Dashboard</span></div></button></Link>
                                        </div>
                                    ) : ('')
                                )
                            )
                    }
                    </div>
                </div>
            <Footer />
        </div>
    );
}