import express, { Express, Request, Response } from 'express';
import { config } from './config/server_config';
import path from 'path';
import { DBManager, DBManagerSensorData } from './db_manager';
import { boundaries_config } from './config/boundaries';

const app: Express = express();

const db_manager: DBManagerSensorData = new DBManagerSensorData();

app.use(express.urlencoded({ extended: true }));

app.set('view engine', config.view_template);
app.set('views', path.join(__dirname, config.views));

app.get('/viewAll', async (req: Request, res: Response) => {
    try {
        const fetchData = async (tableName: string, columnName: string) => {
            const rows: any[] = await db_manager.selectAll(tableName);
            return rows.map(row => row[columnName]);
        };

        const [temperatures, humiditys, pressures, dates] = await Promise.all([
            fetchData('temperature', 'temperature'),
            fetchData('humidity', 'humidity'),
            fetchData('pressure', 'pressure'),
            db_manager.selectAll('timestamp')
        ]);

        const boundaries = [
            boundaries_config.temperatures,
            boundaries_config.humiditys,
            boundaries_config.pressures
        ];

        const dates_ready: Array<Array<number>> = dates.map(row => {
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
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/viewSingle', async (req: Request, res: Response) => {

    const { date_start, date_end } = req.body || undefined;
    if (date_start === undefined || date_end === undefined) {
        res.redirect('/viewAll');
    }

    let date_start_text: string = (date_start as string) + ' 00:00:00';
    let date_end_text: string = (date_end as string) + ' 23:59:59';

    try {

        const fetchData = async (columnName: string) => {
            const rows: any[] = await db_manager.selectPeriod(columnName, date_start_text, date_end_text);
            return rows.map(row => row[columnName]);
        }

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

        const boundaries: number[] = [boundaries_config.temperatures, boundaries_config.humiditys, boundaries_config.pressures];

        res.render('view', {
            temperatures,
            humiditys,
            pressures,
            dates: dates_ready,
            boundaries
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    }
})

app.listen(config.port, () => {
    console.log(`The server is running on port ${config.port}`);
});