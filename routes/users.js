import express from "express";
import * as fs from 'fs';

const router = express.Router();

router.use(express.json());

const getData = () => {

    let users = fs.readFileSync('./dataBase/user.json');
    let allUsers = JSON.parse(users)
    return allUsers
}




///////////CRUD Functionality//////////

//GET all users
router.get('/', (req, res) => {

    let allUsers = getData()
    res.send(allUsers);
});


//GET user by "firstName"
router.get('/:firstName', (req, res) => {
    const { firstName } = req.params;
    let userByName = getData();

    const foundUser = userByName.find((user) => user.firstName === firstName);

    res.send(foundUser);
});


//POST request
router.post('/', (req, res) => {
    let user = req.body;
    let pars = getData();
    pars.push(user);

    let newData = JSON.stringify(pars);
    fs.writeFileSync('./dataBase/user.json', newData);

    return res.send(`user with the name ${req.body.firstName} added to the database!`);
});


//DELETE user by "firstName"
router.delete('/:firstName', (req, res) => {
    const firstName = req.params.firstName;
    let allUsers = getData();
    let allNewUsers = allUsers.filter((user) => user.firstName !== firstName);

    fs.writeFileSync('./dataBase/user.json', JSON.stringify(allNewUsers));

    return res.send(`the user with the name ${req.params.firstName} deleted from the database!`);
});


//UPDATE user by "firstName"
router.patch('/:firstName', (req, res) => {
    const { firstName } = req.params;
    let allUsers = getData();
    
    let tempUsers = allUsers.filter((user) => user.firstName !== firstName);
    req.body.firstName = req.params.firstName
    tempUsers.push(req.body)
    fs.writeFileSync('./dataBase/user.json', JSON.stringify(tempUsers));

    return res.send(`the user with the name ${req.body.firstName} updated from the database!`);

});


export default router;