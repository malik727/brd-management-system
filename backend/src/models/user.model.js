const query = require('../db/db-connection');
const { multipleColumnSet } = require('../utils/common.utils');

class UserModel {
    tableName = 'user';

    find = async (params = {}) => {
        let sql = `SELECT * FROM ${this.tableName}`;

        if (!Object.keys(params).length) {
            return await query(sql);
        }

        const { columnSet, values } = multipleColumnSet(params)
        sql += ` WHERE ${columnSet}`;

        return await query(sql, [...values]);
    }

    findOne = async (params) => {
        const { columnSet, values } = multipleColumnSet(params)

        const sql = `SELECT * FROM ${this.tableName}
        WHERE ${columnSet}`;

        const result = await query(sql, [...values]);

        // return back the first row (user)
        return result[0];
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

    create = async ({ emp_id, first_name, last_name, gender, department, designation, password }) => {
        const sql = `INSERT INTO ${this.tableName}
        (emp_id, first_name, last_name, gender, department, designation, password) VALUES (?,?,?,?,?,?,?)`;

        const result = await query(sql, [emp_id, first_name, last_name, gender, department, designation, password]);
        const affectedRows = result ? result.affectedRows : 0;

        return affectedRows;
    }

    update = async (params, id) => {
        const { columnSet, values } = multipleColumnSet(params)

        const sql = `UPDATE ${this.tableName} SET ${columnSet} WHERE id = ?`;

        const result = await query(sql, [...values, id]);

        return result;
    }

    delete = async (id) => {
        const sql = `DELETE FROM ${this.tableName}
        WHERE id = ?`;
        const result = await query(sql, [id]);
        const affectedRows = result ? result.affectedRows : 0;

        return affectedRows;
    }

    // This function searched a user based on his/her name and the search query
    // if the search query includes single word then that word is matched with first 
    // and last name of the users stored in db else if query contains multiple words the
    // first two words are matched with and last name respectively
    search = async (params) => {
        const sql = `SELECT * FROM ${this.tableName} WHERE first_name LIKE ? OR last_name LIKE ? LIMIT 10`;
        let squery = params.searchQuery.split(" ");
        let result;
        if(squery.length >= 2)
        {
            result = await query(sql, ['%'+squery[0]+'%', '%'+squery[1]+'%']);
        }
        else
        {
            result = await query(sql, ['%'+squery[0]+'%', '%'+squery[0]+'%']);
        }
        return result;
    }

    // This function returns true if the user password is authentic
    verifyPassword = async (id, hashed_password) => {
        const sql = `SELECT * FROM ${this.tableName} WHERE id = ? AND password = ? LIMIT 10`;
        const result = await query(sql, [id, hashed_password]);
        return result ? true : false;
    }
}

module.exports = new UserModel;