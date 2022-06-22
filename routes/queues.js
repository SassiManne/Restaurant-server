import express from "express";
import * as fs from 'fs';

const router = express.Router();

router.use(express.json());

const getData = () => {

    let queues = fs.readFileSync('./dataBase/queues.json');
    let allQueues = JSON.parse(queues)
    return allQueues
}




///////////CRUD Functionality//////////

//GET all queues
router.get('/', (req, res) => {

    let allQueues = getData()
    res.send(allQueues);
});


//GET group by "GroupSeqNo"
router.get('/:GroupSeqNo', (req, res) => {
    const { GroupSeqNo } = req.params;
    let groupByNo = getData();

    const foundGroup = groupByNo.find((group) => group.GroupSeqNo === GroupSeqNo);
    
    res.send(foundGroup);
});


//POST request
router.post('/', (req, res) => {
    let createGroup = req.body;
    let pars = getData();
    pars.push(createGroup);

    let newData = JSON.stringify(pars);
    fs.writeFileSync('./dataBase/queues.json', newData);

    return res.send(`group with the name ${req.body.GroupSeqNo} added to the database!`);
});


//DELETE group by "GroupSeqNo"
router.delete('/:GroupSeqNo', (req, res) => {
    const GroupSeqNo = req.params.GroupSeqNo;
    let allGroups = getData();
    let tempGroups = allGroups.filter((group) => group.GroupSeqNo !== GroupSeqNo);

    fs.writeFileSync('./dataBase/queues.json', JSON.stringify(tempGroups));

    return res.send(`the group with the number ${req.params.GroupSeqNo} deleted from the database!`);
});


//UPDATE queue by "GroupSeqNo"
router.patch('/:GroupSeqNo', (req, res) => {
    const { GroupSeqNo } = req.params;
    let allGroups = getData();
    
    let tempGroups = allGroups.filter((group) => group.GroupSeqNo !== GroupSeqNo);
    req.body.GroupSeqNo = GroupSeqNo
    tempGroups.push(req.body)
    fs.writeFileSync('./dataBase/queues.json', JSON.stringify(tempGroups));

    return res.send(`the group with the name ${req.body.GroupSeqNo} updated from the database!`);

});


export default router;