"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DBManagerSensorData = void 0;
const pg_1 = require("pg");
const db_config_1 = require("./config/db_config");
const db_config_2 = require("./config/db_config");
const pool = new pg_1.Pool({
    user: db_config_1.config.DB_USER,
    host: db_config_1.config.DB_HOST,
    database: db_config_1.config.DB_NAME,
    password: db_config_1.config.DB_PASSWORD,
    port: db_config_1.config.DB_PORT
});
class DBManagerSensorData {
    async initialize() {
        await pool.query(db_config_2.init.REM_SENSORDATA);
        await pool.query(db_config_2.init.INIT_SENSORDATA);
    }
    constructor() {
        //this.initialize();
        console.log(db_config_1.config.DB_MAIN_TABLE + " data base initialize");
    }
    saveSql = "INSERT INTO " + db_config_1.config.DB_MAIN_TABLE + "(temperature,  humidity, pressure) VALUES($1, $2, $3)";
    removeSql = "DELETE FROM " + db_config_1.config.DB_MAIN_TABLE + " WHERE id=$1";
    selectSql = "SELECT * FROM " + db_config_1.config.DB_MAIN_TABLE + " WHERE id=$1";
    updateSql = "UPDATE " + db_config_1.config.DB_MAIN_TABLE + " SET temperature=$1, humidity=$2, pressure=$3 WHERE id=$4";
    selectAllSql = "SELECT $1 FROM " + db_config_1.config.DB_MAIN_TABLE;
    async selectPeriod(columnName, date1, date2) {
        const selectPeriodSql = `SELECT ${columnName} FROM data WHERE timestamp BETWEEN $1 AND $2`;
        return (await pool.query(selectPeriodSql, [date1, date2])).rows;
    }
    async selectAll(columnName) {
        const query = `SELECT ${columnName} FROM ${db_config_1.config.DB_MAIN_TABLE}`;
        // Выполните запрос к базе данных и верните результаты
        return (await pool.query(query)).rows;
    }
    save(array) {
        pool.query(this.saveSql, array);
    }
    update(id, array) {
        pool.query(this.updateSql, array);
    }
    async select(id) {
        let obj = await pool.query(this.selectSql, [id]);
        return obj.rows;
    }
    remove(id) {
        pool.query(this.removeSql, [id]);
    }
}
exports.DBManagerSensorData = DBManagerSensorData;
