import { Pool, Query, QueryResult, QueryResultRow } from 'pg';
import { config } from './config/db_config';
import { init } from './config/db_config';
import { on } from 'events';

const pool: Pool = new Pool({
    user: config.DB_USER,
    host: config.DB_HOST,
    database: config.DB_NAME,
    password: config.DB_PASSWORD,
    port: config.DB_PORT
});

export interface DBManager {
    save(array: Array<any>): void;
    update(id: number, array: []): void;
    select(id: number): void;
    remove(id: number): void;
}

export class DBManagerSensorData implements DBManager {

    private async initialize() {
        await pool.query(init.REM_SENSORDATA);
        await pool.query(init.INIT_SENSORDATA);
    }

    public constructor() {
        //this.initialize();
        console.log(config.DB_MAIN_TABLE + " data base initialize");
    }

    private saveSql: string = "INSERT INTO " + config.DB_MAIN_TABLE + "(temperature,  humidity, pressure) VALUES($1, $2, $3)";
    private removeSql: string = "DELETE FROM " + config.DB_MAIN_TABLE + " WHERE id=$1";
    private selectSql: string = "SELECT * FROM " + config.DB_MAIN_TABLE + " WHERE id=$1";
    private updateSql: string = "UPDATE " + config.DB_MAIN_TABLE + " SET temperature=$1, humidity=$2, pressure=$3 WHERE id=$4";
    private selectAllSql: string = "SELECT $1 FROM " + config.DB_MAIN_TABLE;

    public async selectPeriod(columnName: string, date1: string, date2: string,): Promise<any[]> {
        const selectPeriodSql: string = `SELECT ${columnName} FROM data WHERE timestamp BETWEEN $1 AND $2`;
        return (await pool.query(selectPeriodSql, [date1, date2])).rows;
    }

    public async selectAll(columnName: string): Promise<any[]> {
        const query = `SELECT ${columnName} FROM ${config.DB_MAIN_TABLE}`;
        // Выполните запрос к базе данных и верните результаты
        return (await pool.query(query)).rows;
    }

    public save(array: Array<any>) {
        pool.query(this.saveSql, array);
    }

    public update(id: number, array: Array<any>) {
        pool.query(this.updateSql, array);
    }

    public async select(id: number): Promise<any[]> {
        let obj: QueryResult = await pool.query(this.selectSql, [id]);
        return obj.rows;
    }

    public remove(id: number) {
        pool.query(this.removeSql, [id]);
    }
}