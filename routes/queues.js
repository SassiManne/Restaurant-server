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

const getMenuData = () => {


    let menu = fs.readFileSync('./dataBase/menu.json');
    let allMenu = JSON.parse(menu)

    return allMenu
}




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
        console.log("No place to sit for any group")
        return res.send("No place to sit for any group")
    }


    ///// if the queue is empty
    if (!foundQueue.length) {
        console.log("no one wait")
        return res.send("no one wait")
    }


    /////reverse sort to the size of groups

    function getMaxGroup(a, b) {
        return ((+b.size) - (+a.size));
    }

    /////sort time stamp
    function sortByTime(a, b) {
        return ((+a.timeStamp) - (+b.timeStamp));
    }

    ////// sort for capacity of the tables
    function compareTable(a, b) {
        return ((+a.capacity) - (+b.capacity));
    }


    let sortMax = foundQueue.sort(getMaxGroup);
    let sortGroupByTime = sortMax.sort(sortByTime);

    foundTable.sort(compareTable);


    let matchTable, matchQueue, matchBreak;

    for (let i of sortGroupByTime) {
        for (let j of foundTable) {

            if (foundTable.at(-1).capacity < i.size) { break }
            if (j.capacity >= i.size) {
                matchTable = j
                matchQueue = i
                matchBreak = true

            }
            if (matchBreak) break;

        }
        if (matchBreak) break;
    }

    if (!matchBreak) return res.send("no table for this group")

    const tablesIndex = tableData.findIndex((item) => {
        return item.tableName === matchTable.tableName
    });

    const queueIndex = queueData.findIndex((item) => {
        return item.GroupSeqNo === matchQueue.GroupSeqNo
    });

    tableData[tablesIndex].GroupSeqNum = queueData[queueIndex].GroupSeqNo
    queueData[queueIndex].queue = "awaiting service"
    queueData[queueIndex].table = tableData[tablesIndex].tableName

    let updateQueue = JSON.stringify(queueData);
    fs.writeFileSync('./dataBase/queues.json', updateQueue);

    let updateTable = JSON.stringify(tableData);
    fs.writeFileSync('./dataBase/tables.json', updateTable);

    res.send(`group with the GroupSeqNo: ${queueData[queueIndex].GroupSeqNo} sat dwon!`);

});



//////////awaiting service/////////////

router.get('/awaitingService', (req, res) => {

    let queueData = getQueueData();
    let toServe = queueData.filter((group) => group.queue === "awaitingservice");

    if (!toServe.length) {
        console.log("No group awaiting service")
        return res.send("No group awaiting service")
    }

    function getMaxGroup(a, b) {
        return ((+b.size) - (+a.size));
    }

    function sortByTime(a, b) {
        return ((+a.timeStamp) - (+b.timeStamp));
    }

    let sortMax = toServe.sort(getMaxGroup);
    let sortGroupByTime = sortMax.sort(sortByTime);

    res.send(sortGroupByTime[0].GroupSeqNo + " " + sortGroupByTime[0].table)

});


//////////OrderToTable///////////

router.patch('/OrderToTable/:GroupSeqNo', (req, res) => {
    const { GroupSeqNo } = req.params;
    
    let allGroups = getQueueData();
  
    for (let group of allGroups) {
        if (group.GroupSeqNo == GroupSeqNo) {
            group.orders = req.body.orders
            group.queue = "awaitingbill"
            break
        }
    }

    fs.writeFileSync('./dataBase/queues.json', JSON.stringify(allGroups));

    return res.send(`the GroupSeqNo: ${GroupSeqNo}  ,choosed meals: ${req.body.orders} !`);

});


///////////order summary//////

router.get('/orderSummary/:GroupSeqNo', (req, res) => {
    const { GroupSeqNo } = req.params;

    
    let menuData = getMenuData();
    
    let allGroups = getQueueData();

    for (let group of allGroups) {
        if (group.GroupSeqNo == GroupSeqNo) {
            let theDishesOrderd = group.orders;
            var arrayLength = theDishesOrderd.length;
            let totalInfo = [ ];
            for (var i = 0; i < arrayLength; i++) {
                const findDish = menuData.find((dish) => dish.name === theDishesOrderd[i]);
                totalInfo.push(findDish.price)
                console.log(theDishesOrderd)
                console.log(totalInfo)
                
                
            }
            


            
        }


    }

    
});





///////////CRUD Functionality//////////

//GET all queues

router.get('/all', (req, res) => {

    let allQueues = getQueueData();
    res.send(allQueues);
});


// GET group by "queue status" 
router.get('/queue/:queue', (req, res) => {

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
    req.body.table = null;
    req.body.orders = null;
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