const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _= require("lodash");
const PORT = process.env.PORT || 3000;
// const date = require(__dirname + "/date.js");
// console.log(date);


const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

//mongodb://127.0.0.1:27017/todolistDB

mongoose.set('strictQuery', false);
mongoose.connect("mongodb+srv://admin-rk:Test123@cluster0.thlm6db.mongodb.net/todolistDB", { useNewUrlParser: true }).then(() => {
    console.log("Connected to MongoDB");
}).catch(() => {
    console.log("Failed to connect to MongoDB");
});

const itemsSchema = new mongoose.Schema({
    name: String
});
const Item = mongoose.model('Item', itemsSchema);
const item1 = new Item({
    name: "Welcome to your todoList!"
});
const item2 = new Item({
    name: "Hit the + button to add a new Item."
});
const item3 = new Item({
    name: "<---- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema=  new mongoose.Schema({
    name: String,
    items: [itemsSchema]
});
const List = mongoose.model('List', listSchema);


// let items = [];
// let workItems = [];

// To render "weekday" and "weekend"
// app.get("/", function(req, res){

//     let today = new Date();
//     let currentDay = today.getDay();
//     let day = "";

//     if(currentDay == 6 || currentDay == 0){
//         day = "weekend";
//     }
//     else{
//         day = "weekday";
//     }
//     res.render("list", {kindOfDay: day});
//     // res.send("Hello");
// });

// To render the exact day of week
// app.get("/", function(req, res){

//     let today = new Date();
//     let currentDay = today.getDay();
//     const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
//     let day = weekday[currentDay];

//     res.render("list", {kindOfDay: day});

// });

app.get("/", function (req, res) {

    // let day = date.getDate();

    Item.find({}, (err, foundItems) => {

        if (foundItems.length === 0) {

            Item.insertMany(defaultItems, (err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Inserted all the default Items.");
                }
            });
            res.redirect("/");

        } else {
            res.render("list", { listTitle: "Today", newListItems: foundItems });
        }

    })


});

app.post("/", function (req, res) {

    // console.log(req.body)

    let itemName = req.body.newItem;
    let listName = req.body.list;

    const item = new Item({
        name: itemName
    })

    if(listName === "Today") {
        item.save();
        res.redirect("/");
    }else{
        List.findOne({name: listName}, (err, foundList)=>{
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }
    
});

app.post("/delete", function (req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    // Item.deleteOne({ "_id": checkedItemId }, (err) => {
    //     if (!err) {
    //         console.log("Record deleted successfully!");
    //     }
    // });

    if(listName === "Today"){

        Item.findByIdAndRemove(checkedItemId, (err) => {
            if (!err) {
                console.log("Record deleted successfully!");
            }
        });
        res.redirect("/");
    }else{
        // List.findOne({name: listName}, (err, foundList)=>{
        //     let newId = "ObjectId" + "(" + `"` + checkedItemId + `"` + ")";
        //     let itemsArr = foundList.items;
        //     let itemsArr1= itemsArr.filter((element)=>{
        //         return element._id !== checkedItemId;
        //     });
        //     // foundList.save();
        //     console.log(itemsArr1);
        // });

        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, (err, foundList)=>{
            if (!err) {
                res.redirect("/" + listName);
            }
        });
    }

    
});

app.get("/:customListName", function (req, res) {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({ name: customListName }, (err, foundList)=>{
        if(!err){
            if(!foundList){
                // create a new list
                const list = new List({
                    name: customListName,
                    items: defaultItems 
                });
                list.save();
                res.redirect("/" + customListName);
            }else{
                // show an existing list
                res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
            }
        }
    });

    
});

app.get("/about", function (req, res) {
    res.render("about")
});

app.listen(PORT, function () {
    console.log(`server is listening on port ${PORT}`);
});
