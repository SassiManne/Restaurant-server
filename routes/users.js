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
    let userJson = fs.readFileSync('./dataBase/user.json');
    let pars = JSON.parse(userJson);
    pars.push(user);

    let newData = JSON.stringify(pars);
    res.json(pars)
    fs.writeFileSync('./dataBase/user.json', newData);

    res.send(`user with the name ${user.firstName} added to the database!`);
});


//DELETE user by "firstName"
router.delete('/:firstName', (req, res) => {
    const firstName = req.params.firstName;
    let allUsers = getData();
    let allNewUsers = allUsers.filter((user) => user.firstName !== firstName);

    fs.writeFileSync('./dataBase/user.json', JSON.stringify(allNewUsers));

    res.send(`the user with the name ${firstName} deleted from the database!`);
});


//UPDATE user by "firstName"
router.patch('/:firstName', (req, res) => {
    const firstName = req.params.firstName;
    const { lastName, age } = req.body;
    let allUsers = getData();

    let user = allUsers.find((user) => user.firstName === firstName);

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (age) user.age = age;
    allUsers.push(user)
    fs.writeFileSync('./dataBase/user.json', JSON.stringify(user));

res.send(`the user with the name ${user.firstName} updated from the database!`);

});


export default router;