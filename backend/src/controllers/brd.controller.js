const BRDModel = require('../models/brd.model');
const UserModel = require('../models/user.model');
const HttpException = require('../utils/HttpException.utils');
const { validationResult } = require('express-validator');
const getReq = require('../utils/httpGet');
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASS
    }
});
const fs = require('fs');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const dotenv = require('dotenv');
const path = require('path');
const handlebars = require('handlebars');
dotenv.config();

class BRDController {

    getAllPendingBRD = async (req, res, next) => {
        const brdList = await BRDModel.find({status: "Pending"});

        if (!brdList.length) {
            throw new HttpException(404, 'BRDs not found');
        }

        res.json(brdList);
    };

    getAllAssignedBRD = async (req, res, next) => {
        const role = req.currentUser.role;
        const user_id = req.currentUser.id;
        if(role === "Manager" || role === "SuperUser")
        {
            const brdList = await BRDModel.find({status: "Assigned"});
            if (!brdList.length) {
                throw new HttpException(404, 'BRDs not found');
            }
            res.json(brdList);
        }
        else
        {
            let brdList = await BRDModel.findBRDByStatus(user_id, "Assigned");
            if (!brdList.length) {
                throw new HttpException(404, 'BRDs not found');
            }
            res.json(brdList);
        }
    };

    getAllCompletedBRD = async (req, res, next) => {
        const role = req.currentUser.role;
        const user_id = req.currentUser.id;
        if(role === "Manager" || role === "SuperUser")
        {
            const brdList = await BRDModel.find({status: "Completed"});
            if (!brdList.length) {
                throw new HttpException(404, 'BRDs not found');
            }
            res.json(brdList);
        }
        else
        {
            let brdList = await BRDModel.findBRDByStatus(user_id, "Completed");
            if (!brdList.length) {
                throw new HttpException(404, 'Completed BRDs not found');
            }
            res.json(brdList);
        }
    };

    getAllDueBRD = async (req, res, next) => {
        const role = req.currentUser.role;
        const user_id = req.currentUser.id;
        const days = req.params.days;
        const brdList = await BRDModel.findDueBRDs(user_id, role, days);
        if (!brdList.length) {
            throw new HttpException(404, `No BRDs found due in ${days} days.`);
        }
        res.json(brdList);
    }

    getBRDByID = async (req, res, next) => {
        const role = req.currentUser.role;
        const user_id = req.currentUser.id;
        if(role === "Manager" || role === "SuperUser")
        {
            const brd = await BRDModel.findOne({ id: req.params.id });
            if (!brd) {
                throw new HttpException(404, 'BRD not found');
            }
            res.json(brd);
        }
        else
        {
            const brd = await BRDModel.findBRD(user_id, req.params.id);
            if (!brd[0]) {
                throw new HttpException(404, 'BRD not found');
            }
            res.json(brd[0]);
        }
    };

    createBRD = async (req, res, next) => {
        this.checkValidation(req);
        const result = await BRDModel.create(req.body);
        if (!result) {
            throw new HttpException(400, 'Something went wrong');
        }
        res.status(201).json({brd_id: result});
    };

    updateBRD = async (req, res, next) => {
        this.checkValidation(req);

        const { ...brdUpdates } = req.body;

        // do the update query and get the result
        // it can be partial edit
        const result = await BRDModel.update(brdUpdates, req.params.id);

        if (!result) {
            throw new HttpException(404, 'Something went wrong');
        }

        const { affectedRows, changedRows, info } = result;

        const message = !affectedRows ? 'BRD not found' :
            affectedRows && changedRows ? 'BRD updated successfully' : 'Failed to update BRD details';

        res.json({ message, info });
    };

    deleteBRD = async (req, res, next) => {
        const result = await BRDModel.delete(req.params.id);
        if (!result) {
            throw new HttpException(404, 'BRD not found');
        }
        res.json('BRD has been deleted');
    };

    addAssignees = async (req, res, next) => {
        const inputs = req.body.assignees;
        if(Array.isArray(inputs))
        {
            await BRDModel.deleteAssignees(inputs[0].brd_id);
            for(let inp of inputs)
            {
                const user = await UserModel.findOne({ id: inp.id });
                await BRDModel.addAssignee(inp.id, inp.brd_id);
                const fileHtml = await readFile(path.join(__dirname,'../email-templates/brd-assigned.html'), 'utf8');
                var template = handlebars.compile(fileHtml);
                var replacements = {
                    brd_duedays: 5,
                    brd_link: process.env.FRONTEND_URL+`/view-brd?id=${inp.brd_id}`
                };
                var htmlToSend = template(replacements);
                const mailOptions = {
                    from: '"BRD Portal" <brdportal.askaribank@gmail.com>',
                    to: user.email,
                    subject: 'New BRD Assigned',
                    html: htmlToSend
                };
                transporter.sendMail(mailOptions);
            }
            res.status(201).json("BRD was assigned successfully!");
        }
        else
        {
            res.status(400).json("Invalid JSON input!");
        }
    };

    getAssignees = async(req, res, next) => {
        const brdId = req.params.brdId;
        const assignees = await BRDModel.assignee(brdId);
        if(!assignees)
        {
            throw new HttpException(404, 'Assignees not found!');
        }
        var user_ids  = [];
        for(let user of assignees)
        {
            user_ids.push({id: user.assignee_id});
        }
        const result = await UserModel.findIn(user_ids);
        if(!result || result.length < 1)
        {
            throw new HttpException(404, 'Assignees not found!');
        }
        var users_result = [];
        for(let user of result)
        {
            const { password, ...users } = user;
            users_result.push(users);
        }
        res.status(200).json(users_result);
    }

    getPublicHolidays = async (req, res, next) => {
        const days = parseInt(req.params.days);
        var today = new Date();
        var dueDate = this.addDaysToDate(today, days);
        today = new Date(today).getTime();
        dueDate = new Date(dueDate).getTime();
        const options = {
            host: 'www.googleapis.com',
            port: 443,
            path: `/calendar/v3/calendars/en.pk%23holiday%40group.v.calendar.google.com/events?key=${process.env.G_CALENDAR_KEY}`,
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
        };
        getReq.getJSON(options, (statusCode, result) => {
            var holidays = result.items; 
            var result = [];
            for(let holiday of holidays)
            {
                const h_s = new Date(holiday.start.date).getTime();
                if(h_s <= dueDate && h_s >= today)
                {
                    result.push({name: holiday.summary, date: holiday.start.date, status: holiday.status});
                }
            }
            result.sort(function(a, b) {
                var c = new Date(a.date);
                var d = new Date(b.date);
                return c-d;
            });
            res.status(200).json(result);
        });
    }

    checkValidation = (req) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            throw new HttpException(400, JSON.stringify(errors));
        }
    }

    addDaysToDate = (date, days) => {
        var result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

}

module.exports = new BRDController;