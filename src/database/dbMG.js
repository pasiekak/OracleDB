const oracledb = require("oracledb");
const moment = require("moment");
const loginData = {
    user : "ziibd37",
    password : "haslo2022",
    connectString : "155.158.112.45:1521/oltpstud",
}
async function getTableNames () {
    let connection;
    let tables;
    try {
        console.log('start getTableNames')
        connection = await oracledb.getConnection(loginData);
        let result = await connection.execute(`SELECT table_name FROM user_tables`);
        tables = result.rows;
    } catch (err) {
        return err;
    } finally {
        if (connection) {
            await connection.close();
        }
        console.log('end getTableNames')
        return tables;

    }
}

async function getTableRows (tableName) {
    let connection, result;
    try {
        console.log('start getTableRows')
        connection = await oracledb.getConnection(loginData);
        result = await connection.execute(`SELECT * FROM ${tableName}`);
    } catch (err) {
        return err;
    } finally {
        if (connection) {
            await connection.close();
            console.log('end getTableRows')
            return result;
        }
    }
}
async function getSearchResult ({searchText, tableName, tableColumn}) {
    let connection;
    let result;
    try {
        console.log('start getSearchResult')
        connection = await oracledb.getConnection(loginData)
        let query;
        if (tableColumn.search('HIRE_DATE') === -1) {
            query = `SELECT * FROM ${tableName} WHERE ${tableColumn} LIKE '%${searchText}%'`;
        } else {
            query = `SELECT * FROM ${tableName} WHERE TO_CHAR(${tableColumn},'yyyy/mm/dd') LIKE '%${searchText}%'`;
        }
        result = await connection.execute(query);
    } catch (err) {
        return err
    } finally {
        if (connection) {
            await connection.close();
            console.log('end getSearchResult')
            return result.rows;
        }
    }
}

async function getTableColumns (tableName) {
    let connection;
    let finalResult;
    try {
        console.log('start getTableColumns')
        connection = await oracledb.getConnection(loginData);
        let query = `SELECT * FROM ${tableName}`;
        let result = await connection.execute(query);
        finalResult = result.metaData.map(ob => ob.name);
    } catch (err) {
        return err
    } finally {
        if (connection) {
            await connection.close();
            console.log('end getTableColumns')
            return finalResult;
        }
    }
}
async function getNullableColumns(tableName) {
    let connection, result;
    try {
        console.log('start getNullableColumns');
        connection = await oracledb.getConnection(loginData);
        let sql = `SELECT column_name, nullable FROM user_tab_columns WHERE table_name = '${tableName}'`
        result = await connection.execute(sql);
    } catch (err) {
        return err;
    } finally {
        if (connection) {
            await connection.close();
            console.log('end getNullableColumns');
            return result.rows;
        }
    }
}

async function getColumnType({tableName, columnName}) {
    let connection, result;
    try {
        console.log('start sendColumnType')
        connection = await oracledb.getConnection(loginData)
        let sql = `SELECT column_name, data_type, data_length FROM user_tab_columns WHERE table_name = '${tableName}' AND column_name = '${columnName}'`;
        result = await connection.execute(sql)
    } catch (err) {
        return err
    } finally {
        if (connection) {
            await connection.close();
            console.log('end sendColumnType')
            return result.rows[0][1];
        }
    }
}

async function updateValue ({tableName, columnName, idColumnName, idValue, oldValue, newValue}) {
    oracledb.autoCommit = true;
    let connection, result;
    try {
        console.log('start updateValue')
        connection = await oracledb.getConnection(loginData);
        let sql;
        let columnType = await getColumnType({tableName, columnName});
        let idColumnType = await getColumnType({tableName, columnName: idColumnName});

        if (columnType === 'NUMBER') { newValue = Number(newValue) }
        else if (columnType === 'DATE') {
            let parts = newValue.split('-');
            newValue = new Date(parts[0], parts[1], parts[2]);
        }
        sql = `UPDATE ${tableName} SET ${columnName} = :newVal WHERE ${idColumnName} LIKE :idVal`;

        if (idColumnType === 'NUMBER') {
            idValue = Number(idValue)
            sql = sql.slice(0, sql.lastIndexOf(" WHERE "));
            sql += ` WHERE ${idColumnName} = :idVal`;
        };
        let binds = {
            newVal : newValue,
            idVal : idValue,
        }
        result = await connection.execute(sql, binds);
    } catch (err) {
        result = err;
        return result;
    } finally {
        if (connection) {
            await connection.close()
            oracledb.autoCommit = false;
            console.log('end updateValue')
            return result;
        }
    }
}

async function insertValues({tableName, values}) {
    let connection, result;
    oracledb.autoCommit = true;
    try {
        console.log('start insertValues')
        connection = await oracledb.getConnection(loginData);
        let sql = `INSERT INTO ${tableName} VALUES (`;
        values = values.map((value, index) => {
            sql += `:${index},`;
            if(moment(value, 'YYYY-MM-DD', true).isValid()) {
                let parts = value.split('-');
                value = new Date(parts[0], parts[1], parts[2]);
            }
            return value;
        })
        sql = sql.slice(0,sql.lastIndexOf(','));
        sql += ')'
        console.log(sql)
        console.log(values)
        result = await connection.execute(sql, values);
    } catch (err) {
        result = err;
        return err
    } finally {
        if (connection) {
            await connection.close();
            oracledb.autoCommit = false;
            console.log('end insertValues')
            return result
        }
    }
}

exports.getNullableColumns = getNullableColumns;
exports.getColumnType = getColumnType;
exports.getTableColumns = getTableColumns;
exports.getTableNames = getTableNames;
exports.getTableRows = getTableRows;
exports.getSearchResult = getSearchResult;
exports.updateValue = updateValue;
exports.insertValues = insertValues;