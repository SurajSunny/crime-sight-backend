const oracledb = require('oracledb');

const config = require('../config')
let connection;
async function query(sql, params) {
    try {
         connection = await oracledb.getConnection(config)
        const result = await connection.execute(sql);
        return result.rows;
    } catch (error) {
        console.log(error)
        return error
    } finally {
        if(connection) {
            try {
                await connection.close()
            } catch (error) {
                console.log(error)
                return error
            }
        }
    }
    
}

module.exports = {
    executeQuery : query
}