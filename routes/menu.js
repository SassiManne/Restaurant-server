import express from "express";
import * as fs from 'fs';

const router = express.Router();

router.use(express.json());

const getData = () => {

    let menu = fs.readFileSync('./dataBase/menu.json');
    let allMenu = JSON.parse(menu)
    return allMenu
}




///////////CRUD Functionality//////////

//GET all menu
router.get('/', (req, res) => {

    let allMenu = getData()
    res.send(allMenu);
});


//GET dish by "name"
router.get('/:name', (req, res) => {
    const { name } = req.params;
    let dishByName = getData();

    const foundDish = dishByName.find((dish) => dish.name === name);

    res.send(foundDish);
});


//POST request
router.post('/', (req, res) => {
    let dish = req.body;
    let pars = getData();
    pars.push(dish);

    let newData = JSON.stringify(pars);
    fs.writeFileSync('./dataBase/menu.json', newData);

    return res.send(`dish with the name ${req.body.name} added to the database!`);
});


//DELETE dish by "name"
router.delete('/:name', (req, res) => {
    const name = req.params.name;
    let allMenu = getData();
    let tempMenu = allMenu.filter((dish) => dish.name !== name);

    fs.writeFileSync('./dataBase/menu.json', JSON.stringify(tempMenu));

    return res.send(`the dish with the name ${req.params.name} deleted from the database!`);
});


//UPDATE dish by "name"
router.patch('/:name', (req, res) => {
    const { name } = req.params;
    let allMenu = getData();
    
    let tempMenu = allMenu.filter((dish) => dish.name !== name);
    req.body.name = req.params.name
    tempMenu.push(req.body)
    fs.writeFileSync('./dataBase/menu.json', JSON.stringify(tempMenu));

    return res.send(`the dish with the name ${req.body.name} updated from the database!`);

});


export default router;