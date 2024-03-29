const query = require('../db/db-connection');
const { multipleColumnSet } = require('../utils/common.utils');

class AttachmentModel {
    tableName = 'attachment';

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
            if(columnSet.length >= 1)
            {
                const sql = `SELECT * FROM ${this.tableName} WHERE id IN (${columnSet})`;
                const result = await query(sql, [...valueSet]);
                return result;
            }
        }
        return [];
    }

    findByBrdId = async (id) => {
        let sql = `SELECT * FROM attachment_brd WHERE brd_id = ?`;
        let result = await query(sql, [id]);
        return result;
    }

    findByAttId = async (id) => {
        let sql = `SELECT * FROM attachment_brd WHERE attachment_id = ?`;
        let result = await query(sql, [id]);
        return result;
    }

    findUserBRDIn = async (params) => {
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
            const sql = `SELECT * FROM user_brd WHERE brd_id IN (${columnSet})`;
            const result = await query(sql, [...valueSet]);
            return result;
        }
        return false;
    }

    create = async (name, ref) => {
        const sql = `INSERT INTO ${this.tableName} (name, reference) VALUES (?,?)`;
        const result = await query(sql, [name, ref])
        const insertID = result ? result.insertId : 0;
        return insertID;
    };

    bind = async (attId, brdId) => {
        const sql = `INSERT INTO attachment_brd (attachment_id, brd_id) VALUES (?,?)`;
        const result = await query(sql, [attId, brdId])
        return result ? true : false;
    };

    addAttachmentLog = async ({name, reference, brd_id, removed_by, date_attached}) => {
        const sql = `INSERT INTO attachment_logs (name, reference, brd_id, removed_by, date_attached) VALUES (?,?,?,?,?)`;
        const result = await query(sql, [name, reference, brd_id, removed_by, date_attached])
        return result ? true : false;
    }

    delete = async (id) => {
        const sql = `DELETE FROM ${this.tableName} WHERE id = ?`;
        const result = await query(sql, [id]);
        return result ? true : false;
    };
}

module.exports = new AttachmentModel;