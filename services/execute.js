const oracledb = require('oracledb');

const config = require('../config')
let connection;
async function query(sql, params) {
    try {
        let header = []
       
         connection = await oracledb.getConnection(config)
         console.log(sql)
        const result = await connection.execute(sql, [], { outFormat: oracledb.OUT_FORMAT_OBJECT, timeout:60000});
        if(result) {
            return result.rows
        } else {
            console.log("Some error in result of query")
        }
        
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