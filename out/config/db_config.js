"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = exports.config = void 0;
exports.config = {
    DB_USER: 'rokplacema_1',
    DB_HOST: '77.222.41.67',
    DB_NAME: 'rokplacema_1',
    DB_PASSWORD: 'Idaun228',
    DB_PORT: 5432,
    DB_MAIN_TABLE: 'data'
};
const remove_sensoredata = "DROP TABLE IF EXISTS " + exports.config.DB_MAIN_TABLE;
const init_sensordata = "CREATE TABLE " + exports.config.DB_MAIN_TABLE + "( id SERIAL PRIMARY KEY, temperature DOUBLE PRECISION," +
    " humidity DOUBLE PRECISION, pressure DOUBLE PRECISION, timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP)";
exports.init = {
    REM_SENSORDATA: remove_sensoredata,
    INIT_SENSORDATA: init_sensordata
};
