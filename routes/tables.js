import express from "express";
import * as fs from 'fs';

const router = express.Router();

router.use(express.json());

const getData = () => {

    let tables = fs.readFileSync('./dataBase/tables.json');
    let allTables = JSON.parse(tables)
    return allTables
}



///////////CRUD Functionality//////////

//GET all tables
router.get('/', (req, res) => {

    let allTables = getData()
    res.send(allTables);
});


//GET table by "tableName"
router.get('/:tableName', (req, res) => {
    const { tableName } = req.params;
    let tableByName = getData();

    const foundTable = tableByName.find((table) => table.tableName === tableName);
    res.send(foundTable);
});



//POST request
router.post('/', (req, res) => {
    let table = req.body;
    let pars = getData();
    pars.push(table);

    let newData = JSON.stringify(pars);
    fs.writeFileSync('./dataBase/tables.json', newData);

    return res.send(`table with the name ${req.body.tableName} added to the database!`);
});


//DELETE table by "tableName"
router.delete('/:tableName', (req, res) => {
    const tableName = req.params.tableName;
    let allTables = getData();
    let tempTables = allTables.filter((table) => table.tableName !== tableName);

    fs.writeFileSync('./dataBase/tables.json', JSON.stringify(tempTables));

    return res.send(`the table with the name ${req.params.tableName} deleted from the database!`);
});


//UPDATE table by "tableName"
router.patch('/:tableName', (req, res) => {
    const { tableName } = req.params;
    let allTables = getData();
    
    let tempTables = allTables.filter((table) => table.tableName !== tableName);
    req.body.tableName = tableName
    tempTables.push(req.body)
    fs.writeFileSync('./dataBase/tables.json', JSON.stringify(tempTables));

    return res.send(`the table with the name ${req.body.tableName} updated from the database!`);

});

    
export default router;