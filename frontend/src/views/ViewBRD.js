import { React, useState, useEffect } from 'react';
import axiosInstance from '../axios/axios_jwt';
import { ToastContainer, toast } from 'react-toastify';
import { Alert, AlertTitle } from '@material-ui/lab';
import Header from '../componets/Header';
import Footer from '../componets/Footer';
import UserChip from '../componets/UserChip';
import BrdIcon from '../media/images/brd-icon.png';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Skeleton from '@material-ui/lab/Skeleton';
import parse from 'html-react-parser';
import { CheckCircle, ArrowBack, Dashboard } from '@material-ui/icons';
import NotFoundImg from '../media/images/not-found.png';
import LoadingGif from '../media/images/loader.gif';
import '../media/css/content.css';
import { Link, useHistory, useLocation } from 'react-router-dom';
import differenceInDays from 'date-fns/differenceInDays';
// importing file icons
import PdfIcon from '../media/images/file-icons/pdf.png';
import PngIcon from '../media/images/file-icons/png.png';
import JpgIcon from '../media/images/file-icons/jpg.png';
import DocIcon from '../media/images/file-icons/doc.png';
import TxtIcon from '../media/images/file-icons/txt.png';
import ZipIcon from '../media/images/file-icons/zip.png';
import XlsIcon from '../media/images/file-icons/xls.png';
import { LinearProgress } from '@material-ui/core';

export default function ViewBRD(props) {
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
    const [ loading, setLoading ] = useState(false);
    const [ fileLoading, setFileLoading ] = useState(false);
    const [ updateLoading, setUpdateLoading ] = useState(false);
    const [ openConfirm, setOpenConfirm ] = useState(false);
    const [ brdDetails, setBrdDetails ] = useState(false);
    const [ brdAttachments, setBrdAttachments ] = useState(false);
    const [ brdAssignees, setBrdAssignees ] = useState(false);
    const [ attachmentFound, setAttachmentFound ] = useState(false);
    const [ brdFound, setBrdFound ] = useState(null);
    const [ dayDiff, setDayDiff ] = useState(0);
	const urlParams = new URLSearchParams(location.search);
	var brdId = urlParams.get('id');
    if(!brdId)
    {
        history.push("/dashboard");
    }
    const fileExtIcons = {
        pdf: PdfIcon,
        jpg: JpgIcon,
        jpeg: JpgIcon,
        png: PngIcon,
        txt: TxtIcon,
        doc: DocIcon,
        docx: DocIcon,
        xls: XlsIcon,
        xlsx: XlsIcon,
        zip: ZipIcon,
    };
    useEffect(() => {
        setLoading(true);
        async function FetchData()
        {
            await axiosInstance.get(`/brds/id/${brdId}`).then(
                result => {
                    if (result.status === 200) {
                        var diffInDays = differenceInDays(new Date(result.data.due_date), new Date());
                        if(diffInDays === NaN || diffInDays < 0)
                        {
                            diffInDays = 0;
                        }
                        else
                        {
                            diffInDays += 1;
                        }
                        setDayDiff(diffInDays);
                        setBrdFound(true);
                        setBrdDetails(result.data);
                    }
                }
            ).catch(error => {
                setBrdFound(false);
                if(error.code === 'ECONNABORTED')
                {
                    notify("Failed to communicate with the server! Please ensure you have stable internet connection.", "error");
                }
            })
            await axiosInstance.get(`/brds/assignees/brdId/${brdId}`).then(
                result => {
                    if (result.status === 200) {
                        setBrdAssignees(result.data);
                    }
                }
            ).catch(error => {
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
    const handleCloseConfirm = () => {
        setOpenConfirm(false);
    };     
    async function UpdateBRD()
    {
        setOpenConfirm(false);
        setUpdateLoading(true);
        await axiosInstance.patch(`/brds/id/${brdId}`, {
            status: "Completed"
        }).then(
            result => {
                if (result.status === 200) {
                    history.push("/completed-brd");
                }
            }
        ).catch(error => {
            if(error.code === 'ECONNABORTED')
            {
                notify("Failed to communicate with the server! Please ensure you have stable internet connection.", "error");
            }
            else
            {
                notify("Failed to Update BRD Status! Please try again later.", "error");	
            }
        })
        setUpdateLoading(false);
    }
    function convertDate(inp)
    {
        const date = new Date(inp);
        var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        var m = months[date.getMonth()];
        var d = date.getDate();
        var y = date.getFullYear();
        return d+" "+m+" "+y;
    }
    function DisplayBRDStatus(due_date = new Date(new Date().toDateString()))
    {
        if(brdDetails.status === "Assigned")
        {
            var d1 = new Date(new Date().toDateString());
            var d2 = new Date(due_date);
            d2 = new Date(d2.toDateString());
            if(d1 > d2)
            {
                return <Alert style={{width: "340px", textAlign: "left", margin: "auto"}} severity="error"><AlertTitle><strong>Due on:</strong>&nbsp;&nbsp;{convertDate(brdDetails.due_date)}</AlertTitle>This BRD is past its due date.</Alert>
            }
            else
            {
                return <Alert style={{width: "340px", textAlign: "left", margin: "auto"}} severity="info"><AlertTitle><strong>Due on:</strong>&nbsp;&nbsp;{convertDate(brdDetails.due_date)}</AlertTitle>This BRD has <strong>{dayDiff}</strong> day(s) left until its due.</Alert>
            }
        }
        else if(brdDetails.status === "Completed")
        {
            return <Alert style={{width: "340px", textAlign: "left", margin: "auto"}} severity="success">This BRD is marked as completed.</Alert>
        }
        else if(brdDetails.status === "Pending")
        {
            return <Alert style={{width: "340px", textAlign: "left", margin: "auto"}} severity="warning">This BRD is not assigned to anyone. Visit "Pending BRDs" section if you want to assign this BRD to an employee.</Alert>
        }
    }
    async function DownloadAttachment(fileKey)
    {
        setFileLoading(true);
        await axiosInstance.get(`/attachments/key/${fileKey}`, {responseType: 'blob'}).then(
            result => {
                setFileLoading(false);
                if(result.status === 200)
                {
                    const url = window.URL.createObjectURL(new Blob([result.data]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', fileKey);
                    document.body.appendChild(link);
                    link.click();
                }
            }
        ).catch(error => {
            setFileLoading(false);
            if(error.code === 'ECONNABORTED')
            {
                notify("Failed to communicate with the server! Please ensure you have stable internet connection.", "error");
            }
            else
            {
                notify("Failed to download the file! Please try later.");
            }
        });
    }
    return(
        <div>
            <ToastContainer />
            <Header config={navConfig} />
                <div className="brd-container content-container">
                {
                    brdFound ? (
                        <div className="brd-content">
                        {
                            brdDetails.status === "Assigned" ? (
                                <>
                                <Dialog
                                    open={openConfirm}
                                    onClose={handleCloseConfirm}
                                    aria-labelledby="alert-dialog-title"
                                    aria-describedby="alert-dialog-description"
                                >
                                    <DialogTitle style={{padding: "15px 25px", paddingBottom: "5px"}} id="alert-dialog-title"><h3 style={{fontFamily: "Noto Sans"}}>Completed work on this BRD?</h3></DialogTitle>
                                    <DialogContent>
                                        <DialogContentText style={{fontFamily: "Noto Sans", paddingBottom: "0px", marginBottom: "0px"}} id="alert-dialog-description">
                                            Mark this BRD as completed if you are done working on it. Once you click confirm this BRD will be moved to "Completed BRDs" section and the concerned manager will be notified.
                                        </DialogContentText>
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={handleCloseConfirm} style={{color: "var(--red)", textTransform: "none", fontWeight: 600, fontFamily: "Noto Sans", fontSize: "16px"}}>
                                            Cancel
                                        </Button>
                                        <Button onClick={UpdateBRD} style={{color: "var(--blue)", textTransform: "none", fontWeight: 600, fontFamily: "Noto Sans", fontSize: "16px"}}>
                                            Confirm
                                        </Button>
                                    </DialogActions>
                                </Dialog>
                                <div style={{textAlign: "right", margin: "20px auto"}}>
                                    {
                                        updateLoading ? (
                                            <>
                                                <img src={LoadingGif} width="50" /> Updating Status
                                            </>
                                        ):(
                                            <Button onClick={() => { setOpenConfirm(true); }} startIcon={<CheckCircle />} color="primary" style={{fontWeight: 600, fontFamily: "Noto Sans", textTransform: "none"}} variant="contained">Mark As Completed</Button>
                                        )
                                    }
                                </div>
                                </>
                            ):(
                                ''
                            )
                        }
                            <div className="brd-head">
                                <div><img src={BrdIcon} width="65" /></div>
                                <div><h1 style={{fontFamily: "Montserrat"}}>BRD Details</h1></div>
                            </div>
                            <br/>
                            {DisplayBRDStatus(brdDetails.due_date)}
                            <br/>
                            <div className="brd-details-elem">
                                <h4 className="brd-details-elem-h">BRD Title</h4>
                                {
                                    loading ? (
                                        <Skeleton animation="wave" style={{margin: "5px 15px", height: "25px"}} />
                                    ) : (
                                        <p className="brd-details-elem-p">{brdDetails.title}</p>
                                    )
                                }
                            </div>
                            <div className="brd-details-elem">
                                <h4 className="brd-details-elem-h">BRD Origin</h4>
                                {
                                    loading ? (
                                        <Skeleton animation="wave" style={{margin: "5px 15px", height: "25px"}} />
                                    ) : (
                                        <p className="brd-details-elem-p">{brdDetails.origin}</p>
                                    )
                                }
                            </div>
                            <div className="brd-details-elem">
                                <h4 className="brd-details-elem-h">BRD Justification</h4>
                                {
                                    loading ? (
                                        <Skeleton animation="wave" style={{margin: "5px 15px", height: "25px"}} />
                                    ) : (
                                        <p className="brd-details-elem-p">{brdDetails.justification}</p>
                                    )
                                }
                            </div>
                            <div className="brd-details-elem">
                                <h4 className="brd-details-elem-h">BRD Priority</h4>
                                {
                                    loading ? (
                                        <Skeleton animation="wave" style={{margin: "5px 15px", height: "25px"}} />
                                    ) : (
                                        <div style={{margin: "10px 15px", textAlign: "center", width: "100px", padding: "7.5px", fontFamily: "Montserrat", backgroundColor: "var(--blue)", color: "#ffffff", borderRadius: "5px"}}>
                                            {brdDetails.priority}
                                        </div>
                                    )
                                }
                            </div>
                            <div className="brd-details-elem">
                                <h4 className="brd-details-elem-h">BRD Assignees</h4>
                                {
                                    loading ? (
                                        <Skeleton animation="wave" style={{margin: "5px 15px", height: "75px"}} />
                                    ) : (
                                        brdAssignees ? (
                                            brdAssignees.map((user) => {
                                                return <div key={user.id} style={{display: "inline-block",}}><UserChip key={user.id} type="selected" id={user.id} text={user.first_name+" "+user.last_name} /></div>
                                            })
                                        ):(
                                            <p className="brd-details-elem-p" style={{color: "var(--red)", fontWeight: 600, fontSize: "14px"}}>No assignees found for this BRD</p>
                                        )
                                    )
                                }
                            </div>
                            <div className="brd-details-elem">
                                <h4 className="brd-details-elem-h">BRD Purpose</h4>
                                {
                                    loading ? (
                                        <Skeleton animation="wave" style={{margin: "5px 15px", height: "75px"}} />
                                    ) : (
                                        <div className="brd-details-elem-p brd-details-purpose">{parse(`${brdDetails.purpose}`)}</div>
                                    )
                                }
                            </div>
                            <div className="brd-details-elem">
                                <h4 className="brd-details-elem-h">BRD Attachments</h4>
                                <div style={{textAlign: "center", margin: "10px 5px"}}>
                                {
                                    attachmentFound ? (
                                        fileLoading ? (
                                            <LinearProgress />
                                        ) :
                                        ('')
                                    ) : ('')
                                }
                                {
                                    loading ? (
                                        <>
                                            <Skeleton animation="wave" style={{margin: "5px 15px", width: "75px", height: "85px", display: "inline-block"}} />
                                            <Skeleton animation="wave" style={{margin: "5px 15px", width: "75px", height: "85px", display: "inline-block"}} />
                                            <Skeleton animation="wave" style={{margin: "5px 15px", width: "75px", height: "85px", display: "inline-block"}} />
                                        </>
                                    ) : (
                                        attachmentFound ? (
                                            brdAttachments.map((att) => {
                                                const ext = att.name.split('.').pop();
                                                return <div key={att.id} onClick={() => { if(fileLoading === false) { DownloadAttachment(att.reference); } }} className={`brd-details-files ${fileLoading?('disabled'):('')}`} ><img src={fileExtIcons[ext]} width="70px" /><p>{att.name}</p></div>
                                            })
                                        ) : (
                                            <p className="brd-details-elem-p" style={{color: "var(--red)", fontWeight: 600, fontSize: "14px"}}>No files attached with this BRD!</p>
                                        )
                                    )
                                }
                                </div>
                            </div>
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
                        ):('')
                    )
                }
                    
                </div>
            <Footer />
        </div>
    );
}