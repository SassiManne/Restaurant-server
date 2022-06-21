import express from 'express';
import bodyParser from 'body-parser';

import usersRoutes from './routes/users.js';


///////set up the Server//////////

const app = express();
const PORT = 8080;

app.use(bodyParser.json());

app.use('/api/users', usersRoutes);

app.get('/', (req, res) => res.send('welcome to the restaurant'));

app.listen(PORT, () => console.log('Server runing on port: http://localhost:' + `${PORT}`));