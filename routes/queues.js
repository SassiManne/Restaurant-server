import express from "express";
import * as fs from 'fs';


const router = express.Router();

router.use(express.json());

const getData = () => {

    let queues = fs.readFileSync('./dataBase/queues.json');
    let allQueues = JSON.parse(queues)

    let tables = fs.readFileSync('./dataBase/tables.json');
    let allTables = JSON.parse(tables)

    return [allQueues, allTables]
}


//////////get time and date ///////////
const dateTime = () => {

    var timeStamp = new Date().toLocaleString()

    return timeStamp
}


/////////sit by priority////////////

router.get('/sitByPriority', (req, res) => {

    let [queueData, tableData] = getData();

    const foundQueue = queueData.filter((group) => group.queue === "tobesitted");
    const foundTable = tableData.filter((table) => table.GroupSeqNum === null);

    if (!foundTable.length) {
        console.log("there is no table available")
        return res.send("there is no table available")
    }


    /// reverse sort to the size of groups
    function compareQueue(a, b) {
        if (+a.size > +b.size) {
            return -1;
        }
        if (+a.size < +b.size) {
            return 1;
        }
        return 0;
    }
    function compareTable(a, b) {
        if (+a.capacity > +b.capacity) {
            return -1;
        }
        if (+a.capacity < +b.capacity) {
            return 1;
        }
        return 0;
    }
    foundQueue.sort(compareQueue);
    foundTable.sort(compareTable);


    res.send(foundQueue);

});




///////////CRUD Functionality//////////

//GET all queues
router.get('/all', (req, res) => {

    let allQueues = getData();
    res.send(allQueues[0]);
});


// GET group by "queue status" 
router.get('/queu/:queue', (req, res) => {

    const { queue } = req.params;
    let groupByStatus = getData();

    const foundGroup = groupByStatus[0].filter((group) => group.queue === queue);

    res.send(foundGroup);
});


//GET group by "GroupSeqNo"
router.get('/:GroupSeqNo', (req, res) => {
    const { GroupSeqNo } = req.params;
    let ourQueues = getData();
    
    const foundGroup = ourQueues[0].find((group) => group.GroupSeqNo === GroupSeqNo);

    res.send(foundGroup);
});





//POST request
router.post('/', (req, res) => {
    let createGroup = req.body;
    let pars = getData();
    req.body.queue = "tobesitted";
    req.body.table = "null";
    req.body.timeStamp = dateTime();
    pars.push(createGroup);

    let newData = JSON.stringify(pars);
    fs.writeFileSync('./dataBase/queues.json', newData);

    return res.send(`group with the GroupSeqNo: ${req.body.GroupSeqNo} added to the database!`);
});


//DELETE group by "GroupSeqNo"
router.delete('/:GroupSeqNo', (req, res) => {
    const GroupSeqNo = req.params.GroupSeqNo;
    let allGroups = getData();
    let tempGroups = allGroups.filter((group) => group.GroupSeqNo !== GroupSeqNo);

    fs.writeFileSync('./dataBase/queues.json', JSON.stringify(tempGroups));

    return res.send(`the group with the GroupSeqNo: ${req.params.GroupSeqNo} deleted from the database!`);
});


//UPDATE queue by "GroupSeqNo"
router.patch('/:GroupSeqNo', (req, res) => {
    const { GroupSeqNo } = req.params;
    let allGroups = getData();

    let tempGroups = allGroups.filter((group) => group.GroupSeqNo !== GroupSeqNo);
    req.body.GroupSeqNo = GroupSeqNo
    tempGroups.push(req.body)
    fs.writeFileSync('./dataBase/queues.json', JSON.stringify(tempGroups));

    return res.send(`the group with the GroupSeqNo: ${req.body.GroupSeqNo} updated from the database!`);

});


export default router;