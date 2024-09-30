"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const server_config_1 = require("./config/server_config");
const path_1 = __importDefault(require("path"));
const db_manager_1 = require("./db_manager");
const boundaries_1 = require("./config/boundaries");
const app = (0, express_1.default)();
const db_manager = new db_manager_1.DBManagerSensorData();
app.use(express_1.default.urlencoded({ extended: true }));
app.set('view engine', server_config_1.config.view_template);
app.set('views', path_1.default.join(__dirname, server_config_1.config.views));
app.get('/viewAll', async (req, res) => {
    try {
        const fetchData = async (tableName, columnName) => {
            const rows = await db_manager.selectAll(tableName);
            return rows.map(row => row[columnName]);
        };
        const [temperatures, humiditys, pressures, dates] = await Promise.all([
            fetchData('temperature', 'temperature'),
            fetchData('humidity', 'humidity'),
            fetchData('pressure', 'pressure'),
            db_manager.selectAll('timestamp')
        ]);
        const boundaries = [
            boundaries_1.boundaries_config.temperatures,
            boundaries_1.boundaries_config.humiditys,
            boundaries_1.boundaries_config.pressures
        ];
        const dates_ready = dates.map(row => {
            const date = new Date(row.timestamp);
            return [date.getHours(), date.getMinutes(), date.getSeconds()];
        });
        res.render('view', {
            temperatures,
            humiditys,
            pressures,
            dates: dates_ready,
            boundaries
        });
    }
    catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    }
});
app.post('/viewSingle', async (req, res) => {
    const { date_start, date_end } = req.body || undefined;
    if (date_start === undefined || date_end === undefined) {
        res.redirect('/viewAll');
    }
    let date_start_text = date_start + ' 00:00:00';
    let date_end_text = date_end + ' 23:59:59';
    try {
        const fetchData = async (columnName) => {
            const rows = await db_manager.selectPeriod(columnName, date_start_text, date_end_text);
            return rows.map(row => row[columnName]);
        };
        const [temperatures, humiditys, pressures, dates] = await Promise.all([
            fetchData('temperature'),
            fetchData('humidity'),
            fetchData('pressure'),
            db_manager.selectPeriod('timestamp', date_start_text, date_end_text)
        ]);
        const dates_ready = dates.map(row => {
            const date = new Date(row.timestamp);
            return [date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()];
        });
        const boundaries = [boundaries_1.boundaries_config.temperatures, boundaries_1.boundaries_config.humiditys, boundaries_1.boundaries_config.pressures];
        // const dates: any[] = await db_manager.selectPeriod('timestamp', date_start_text, date_end_text);
        // const dates_ready: Array<Array<number>> = dates.map(row => {
        //     const date = new Date(row.timestamp);
        //     const day = date.getDate();
        //     const hours: number = date.getHours();
        //     const minutes: number = date.getMinutes()
        //     const seconds: number = date.getSeconds()
        //     return [day, hours, minutes, seconds];
        // });
        res.render('view', {
            temperatures,
            humiditys,
            pressures,
            dates: dates_ready,
            boundaries
        });
    }
    catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    }
});
app.listen(server_config_1.config.port, () => {
    console.log(`The server is running on port ${server_config_1.config.port}`);
});
