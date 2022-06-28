import express from "express";
import * as fs from 'fs';


const router = express.Router();

router.use(express.json());


const getQueueData = () => {

    let queues = fs.readFileSync('./dataBase/queues.json');
    let allQueues = JSON.parse(queues)

    return allQueues
}

const getTableData = () => {


    let tables = fs.readFileSync('./dataBase/tables.json');
    let allTables = JSON.parse(tables)

    return allTables
}

// const saveData = ( foundQueue, foundTable) => {
//     let queues = fs.writeFileSync('./dataBase/queues.json')
//     let updatedQueue = JSON.stringify(foundQueue)

//     let tables = fs.writeFileSync('./dataBase/tables.json')
//     let updatedTable = JSON.stringify(foundTable)


// }


//////////get time and date ///////////
const dateTime = () => {

    var timeStamp = new Date().toLocaleString()


    return timeStamp
}


/////////sit by priority////////////

router.get('/sitByPriority', (req, res) => {

    let queueData = getQueueData();
    let tableData = getTableData();

    let foundQueue = queueData.filter((group) => group.queue === "tobesitted");
    let foundTable = tableData.filter((table) => table.GroupSeqNum === null);


    /////if the restaurnt is fully booked
    if (!foundTable.length) {
        console.log("there is no table available")
        return res.send("there is no table available")
    }


    ///// if the queue is empty
    if (!foundQueue.length) {
        console.log("no one wait")
        return res.send("no one wait")
    }


    /////reverse sort to the size of groups
    
    function getMaxGroup (a ,b) {
        return ((+b.size) - (+a.size));
    }

    /////sort time stamp
    function sortByTime (a ,b) {
        return ((+a.timeStamp) - (+b.timeStamp));
    }

    ////// sort for capacity of the tables
    function compareTable(a, b) {
        return ((+a.capacity) - (+b.capacity));
    }



    let sortMax =  foundQueue.sort(getMaxGroup);
    let sortTime = sortMax.sort(sortByTime);
    console.log(sortTime)

    foundTable.sort(compareTable);
    


    

    let matchTable, matchQueue, matchBreak;
    
    for (let i of sortTime) {
        for (let j of foundTable) {

            if (foundTable.at(-1).capacity < i.size){break}
            if (j.capacity >= i.size) {
                matchTable = j
                matchQueue = i
                matchBreak = true

            }
            if(matchBreak) break;

        }
        if(matchBreak) break;
    }

    if (!matchBreak) return res.send("no table for this group")

    const tablesIndex = tableData.findIndex ((item) => {
        return item.tableName === matchTable.tableName
    });

    const queueIndex = queueData.findIndex((item) => {
        return item.GroupSeqNo === matchQueue.GroupSeqNo
    });

    tableData[tablesIndex].GroupSeqNum = queueData[queueIndex].GroupSeqNo
    queueData[queueIndex].queue = "sitting"
    queueData[queueIndex].table = tableData[tablesIndex].tableName

    let updateQueue = JSON.stringify(queueData);
    fs.writeFileSync('./dataBase/queues.json', updateQueue);

    let updateTable = JSON.stringify(tableData);
    fs.writeFileSync('./dataBase/tables.json', updateTable);

    res.send(`group with the GroupSeqNo: ${queueData[queueIndex].GroupSeqNo} sat dwon!`);

});



///////////CRUD Functionality//////////

//GET all queues
router.get('/all', (req, res) => {

    let allQueues = getQueueData();
    res.send(allQueues);
});


// GET group by "queue status" 
router.get('/queu/:queue', (req, res) => {

    const { queue } = req.params;
    let groupByStatus = getQueueData();

    const foundGroup = groupByStatus[0].filter((group) => group.queue === queue);

    res.send(foundGroup);
});


//GET group by "GroupSeqNo"
router.get('/:GroupSeqNo', (req, res) => {
    const { GroupSeqNo } = req.params;
    let ourQueues = getQueueData();

    const foundGroup = ourQueues[0].find((group) => group.GroupSeqNo === GroupSeqNo);

    res.send(foundGroup);
});




//POST request
router.post('/', (req, res) => {
    let createGroup = req.body;
    let pars = getQueueData();
    console.log(pars)
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
    let allGroups = getQueueData();
    let tempGroups = allGroups.filter((group) => group.GroupSeqNo !== GroupSeqNo);

    fs.writeFileSync('./dataBase/queues.json', JSON.stringify(tempGroups));

    return res.send(`the group with the GroupSeqNo: ${req.params.GroupSeqNo} deleted from the database!`);
});


//UPDATE queue by "GroupSeqNo"
router.patch('/:GroupSeqNo', (req, res) => {
    const { GroupSeqNo } = req.params;
    let allGroups = getQueueData();

    let tempGroups = allGroups.filter((group) => group.GroupSeqNo !== GroupSeqNo);
    req.body.GroupSeqNo = GroupSeqNo
    tempGroups.push(req.body)
    fs.writeFileSync('./dataBase/queues.json', JSON.stringify(tempGroups));

    return res.send(`the group with the GroupSeqNo: ${req.body.GroupSeqNo} updated from the database!`);

});


export default router;