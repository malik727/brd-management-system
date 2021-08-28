const AttachmentModel = require('../models/attachment.model');
const HttpException = require('../utils/HttpException.utils');
const { validationResult } = require('express-validator');
const dotenv = require('dotenv');
dotenv.config();

class AttachmentController {
    uploadAttachments = async (req, res, next) => {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No files were uploaded.');
        }
        var attachments = [];
        if(Array.isArray(req.files.attachment))
        {
            var fileKeys = Object.keys(req.files.attachment);
            fileKeys.forEach(function(key) {
                const fileSize = (req.files.attachment[key].size / (1024*1024)).toFixed(2);
                const fileExt = req.files.attachment.name.split('.').pop().toLowerString();
                if(!['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'].includes(fileExt))
                {
                    return res.status(400).json('One or more attachments are not allowed!');
                }
                else if(fileSize > 2.5)
                {
                    return res.status(400).json('One or more attachments have size greater than 2MB. Only add files having size less than 2MB.');
                }
                attachments.push(req.files.attachment[key]);
            });
        }
        else
        {
            const fileSize = (req.files.attachment.size / (1024*1024)).toFixed(2);
            const fileExt = req.files.attachment.name.split('.').pop().toLowerString();
            if(!['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'].includes(fileExt))
            {
                return res.status(400).json('One or more attachments are not allowed!');
            }
            else if(fileSize > 2.5)
            {
                return res.status(400).json('One or more attachments have size greater than 2MB. Only add files having size less than 2MB.');
            }
            attachments.push(req.files.attachment);
        }
        var result = [];
        for(let att of attachments)
        {
            const fileExt = att.name.split('.').pop().toLowerString();
            const timestamp = Date.now();
            const fileName = timestamp+"_"+this.randomString(6)+"."+fileExt;
            att.mv(`public/uploads/${fileName}`, function(err) {
                if (err)
                {
                    return res.status(500).json(err);
                }
            });
            const att_res = await AttachmentModel.create(att.name, fileName);
            result.push({attId: att_res, attName: att.name, attCode: fileName});
        }
        res.status(201).json(result);
    };   

    bindAttachments = async (req, res, next) => {
        console.log(req.body);
        if(req.body.brdId && req.body.attachments && Array.isArray(req.body.attachments))
        {
            const brdId = req.body.brdId;
            const atts = req.body.attachments;
            for(let att of atts)
            {
                const bind = await AttachmentModel.bind(att.attId, brdId);
                if(!bind)
                {
                    throw new HttpException(500, 'Failed to bind one or more attachments!');
                }
            }
            res.status(201).json("Attachments binded successfully!");
        }
        else
        {
            res.status(400).json("Invalid JSON Input!");
        }
    };

    getAttachments = async (req, res, next) => {
        let result = await AttachmentModel.findByBrdId(req.params.brdId);
        if(!result || result.length < 1)
        {
            throw new HttpException(404, 'Attachments not found!');
        }
        console.log(result);
        var att_ids = [];
        for(let att of result)
        {
            att_ids.push({id: att.attachment_id});
        }
        const attachments = await AttachmentModel.findIn(att_ids);
        if(!attachments || attachments.length < 1)
        {
            throw new HttpException(404, 'Attachments not found!');
        }
        res.status(200).json(attachments);
    }

    randomString = (length) => {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }    
        return result;
    };
}

module.exports = new AttachmentController;