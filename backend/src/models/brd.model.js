const query = require('../db/db-connection');
const { multipleColumnSet } = require('../utils/common.utils');

class BRDModel {
    tableName = 'brd';

    find = async (params = {}) => {
        let sql = `SELECT * FROM ${this.tableName}`;
        if (!Object.keys(params).length) {
            return await query(sql);
        }
        const { columnSet, values } = multipleColumnSet(params, " AND ")
        sql += ` WHERE ${columnSet}`;
        let result = await query(sql, [...values]);
        return result;
    }

    findOne = async (params) => {
        const { columnSet, values } = multipleColumnSet(params, " AND ")

        const sql = `SELECT * FROM ${this.tableName}
        WHERE ${columnSet}`;

        const result = await query(sql, [...values]);

        return result[0];
    }

    findBRD = async(user_id, brd_id) => {
        const sql = `SELECT * FROM user_brd WHERE assignee_id = ? AND brd_id = ?`;
        const res1 = await query(sql, [user_id, brd_id]);
        if(res1 && res1.length >= 1)
        {
            const sql2 = `SELECT * FROM ${this.tableName} WHERE id = ?`;
            const res2 = await query(sql2, [brd_id]);
            return (res2 && res2.length >= 1)? res2 : false;
        }
        else
        {
            return false;
        }
    }

    findIn = async (params) => {
        if(Array.isArray(params) && params.length >= 1)
        {
            let valueSet = [];
            let columnSet = [];
            for(let param of params)
            {
                valueSet.push(param.id);
                columnSet.push("?");
            }
            columnSet = columnSet.join(', ');
            const sql = `SELECT * FROM ${this.tableName} WHERE id IN (${columnSet})`;
            const result = await query(sql, [...valueSet]);
            return result;
        }
        return false;
    }

    create = async ({ created_by, origin, title, justification, priority, status, purpose }) => {
        const sql = `INSERT INTO ${this.tableName}
        (created_by, origin, title, justification, priority, status, purpose) VALUES (?,?,?,?,?,?,?)`;
        const result = await query(sql, [created_by, origin, title, justification, priority, status, purpose]);
        const insertID = result ? result.insertId : 0;
        await this.addBrdLog({ brd_id: insertID, created_by: created_by, action_by: created_by, origin: origin, title: title, justification: justification, priority: priority, status: status, purpose: purpose });
        return insertID;
    }

    assignee = async (brd_id) => {
        const sql = `SELECT assignee_id, assign_date FROM user_brd WHERE brd_id = ?`;
        const result = await query(sql, [brd_id]);
        return result;
    }

    findBRDByStatus = async (user_id, status) => {
        const sql = `SELECT DISTINCT brd_id AS id FROM user_brd WHERE assignee_id = ?`;
        const res1 = await query(sql, [user_id]);
        let valueSet = [];
        let columnSet = [];
        for(let param of res1)
        {
            valueSet.push(param.id);
            columnSet.push("?");
        }
        columnSet = columnSet.join(', ');
        if(columnSet.length >= 1)
        {
            const sql2 = `SELECT * FROM ${this.tableName} WHERE id IN (${columnSet}) AND status = ?`;
            const result = await query(sql2, [...valueSet, status]);
            return result?result:[];
        }
        return [];
    }

    findDueBRDs = async (user_id, role, day) => {
        const days = parseInt(day);
        if(role === "Manager" || role === "SuperUser")
        {
            const sql = `SELECT * FROM ${this.tableName} WHERE due_date <= DATE(NOW()) + INTERVAL + ? DAY AND status = "Assigned"`;
            const result = await query(sql, [days]);
            return result?result:[];
        }
        else
        {
            const sql1 = `SELECT DISTINCT brd_id AS id FROM user_brd WHERE assignee_id = ?`;
            const res1 = await query(sql1, [user_id]);
            let valueSet = [];
            let columnSet = [];
            for(let param of res1)
            {
                valueSet.push(param.id);
                columnSet.push("?");
            }
            columnSet = columnSet.join(', ');
            if(columnSet.length >= 1)
            {
                const sql2 = `SELECT * FROM ${this.tableName} WHERE id IN (${columnSet}) AND due_date <= DATE(NOW()) + INTERVAL + ? DAY AND status = "Assigned"`;
                const result = await query(sql2, [...valueSet, days]);
                return result?result:[];
            }
            return [];
        }
    }

    update = async (params, id) => {
        const { columnSet, values } = multipleColumnSet(params)

        const sql = `UPDATE ${this.tableName} SET ${columnSet} WHERE id = ?`;

        const result = await query(sql, [...values, id]);

        return result;
    }

    addBrdLog = async ({ brd_id, created_by, action_by, origin, title, justification, priority, status, purpose, creation_date }) => {
        var result = false;
        if(!creation_date)
        {
            const sql = `INSERT INTO brd_logs
            (brd_id, created_by, action_by, origin, title, justification, priority, status, purpose) VALUES (?,?,?,?,?,?,?,?,?)`;
            result = await query(sql, [brd_id, created_by, action_by, origin, title, justification, priority, status, purpose])
        }
        else
        {
            const sql = `INSERT INTO brd_logs
            (brd_id, created_by, action_by, origin, title, justification, priority, status, purpose, creation_date) VALUES (?,?,?,?,?,?,?,?,?,?)`;
            result = await query(sql, [brd_id, created_by, action_by, origin, title, justification, priority, status, purpose, creation_date])
        }
        if(!result)
        {
            return false;
        }
        return true;
    }

    addAssignee = async(user_id, brd_id) => {
        const sql = `INSERT INTO user_brd (assignee_id, brd_id) VALUES (?, ?)`;
        const result = await query(sql, [user_id, brd_id]);
        return result?true:false;
    }

    deleteAssignees = async (brd_id) => {
        const sql = `DELETE FROM user_brd WHERE brd_id = ?`;
        const result = await query(sql, [brd_id]);
        return result?true:false;
    }

    delete = async (id) => {
        const sql = `UPDATE ${this.tableName} SET status = 'Deleted' WHERE id = ?`;
        const result = await query(sql, [id]);
        const affectedRows = result ? result.affectedRows : 0;
        return affectedRows;
    }
}

module.exports = new BRDModel;