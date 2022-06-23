import express from 'express';
import bodyParser from 'body-parser';

import menuRoutes from './routes/menu.js';
import tablesRoutes from './routes/tables.js';
import queuesRoutes from './routes/queues.js';




///////set up the Server//////////

const app = express();
const PORT = 5000;

app.use(bodyParser.json());

app.use('/api/menu', menuRoutes);
app.use('/api/tables', tablesRoutes);
app.use('/api/queues', queuesRoutes);



app.get('/', (req, res) => res.send('welcome to the restaurant'));

app.listen(PORT, () => console.log('Server runing on port: http://localhost:' + `${PORT}`));