import React from 'react';
import { toast } from 'react-toastify';
import '../media/css/content.css';
import UploadIcon from '@material-ui/icons/CloudUpload';
import AttachmentIcon from '@material-ui/icons/Attachment';
import DeleteIcon from '@material-ui/icons/DeleteForever';

export default function Attachments(props) {
    let notify = false;
    const maxSize = props.maxSize;
    if(props.toasts && props.toasts == true)
    {
        notify = (msg, type) => {
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
    }
    function AttachmentChangeHandle(inpField)
    {
        if(inpField !== null)
        {
            let files = inpField.files;
            var attachments = [];
            var fileKeys = Object.keys(files);
            fileKeys.forEach(function(key) {
                const fileSize = (files[key].size / (1024*1024)).toFixed(2);
                const fileExt = files[key].name.split('.').pop().toLowerCase();
                const timestamp = Date.now();
                console.log(timestamp);
                if(!['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'].includes(fileExt))
                {
                    if(notify !== false)
                    {
                        notify(`"${files[key].name}" is not allowed! Only files of type pdf, doc, docx, xls, xlsx or txt are allowed.`, "error");
                    }
                }
                else if(fileSize > maxSize)
                {
                    if(notify !== false)
                    {
                        notify(`"${files[key].name}" has size greater than 2MB! Only files with size less than 2MB are allowed.`, "error");
                    }
                }
                else
                {
                    attachments.push(files[key]);
                }
            });
            let atts = Array.from(attachments); 
            props.setAttachments(attachments => ([...attachments, ...atts]));
        }
    }
    function AttachmentRemoveHandle(index)
    {
        let newAttachments = props.attachments.slice();
        newAttachments.splice(index, 1);
        props.setAttachments(newAttachments);
    }
    return(
            <div className="form-inp-fileupload">
                <label className="add-attachment-label" htmlFor="add-attachment">
                    <input onChange={()=>{AttachmentChangeHandle(document.getElementById("add-attachment"))}} type="file" id="add-attachment" multiple />
                    <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}><UploadIcon style={{fontSize: "24px"}} />&nbsp;&nbsp;<span>Upload</span></div>
                </label>
                <div className="form-inp-files">
                    <ol>
                    {
                        props.attachments.map((file, index) => {
                            let suffix = "bytes";
                            let size = file.size;
                            if (size >= 1024 && size < 1024000) 
                            {
                                suffix = "KB";
                                size = Math.round(size / 1024 * 10) / 10;
                            } 
                            else if (size >= 1024000) 
                            {
                                suffix = "MB";
                                size = Math.round(size / 1024000 * 10) / 10;
                            }
                            return <li key={index}><div style={{display: "flex", justifyContent: "center", alignItems: "center"}}><AttachmentIcon />&nbsp;<span title={file.name} className="form-attachment-name">{file.name}</span><span className="form-inp-filesize">{size} {suffix}</span><span className="form-attachment-icon"><DeleteIcon title="Remove Attachment" className="form-inp-del-icon" onClick={()=>{AttachmentRemoveHandle(index)}} /></span></div></li>
                        })
                    }
                    {
                        (props.attachments.length === 0)?(
                            <li className="form-inp-files-emp">No attachments added!</li>
                        ):('')
                    }
                    </ol>
                </div>
            </div>
    );
}