//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose = require("mongoose")
const _ = require("lodash")

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/webAppDB", {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})


const workItems = [];

//create schemas

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
})

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
})

const Item = mongoose.model("item", itemSchema)

const List = mongoose.model("list", listSchema)

const item1 = new Item({
  name: "Welcome to the TodoList App"
})

const item2 = new Item({
  name: "Hit the + button below to add an item"
})

const item3 = new Item({
  name: "<-- Tick the checkbox to delete an item"
})

const defaultItems = [item1, item2, item3];



app.get("/", function(req, res) {

// const day = date.getDate();
  Item.find({}, (err, foundItems) => {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        if (err) {
          console.log(err)
        } else {
          console.log("initial data inserted.")
          res.redirect("/");
        }
      })
      
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  })
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list

  const item = new Item({
    name: itemName
  })

  if (listName === "Today") {
    item.save()
    res.redirect("/")
  } else {
    List.findOne({name: listName}, (err, foundList) => {
      if (!err) { 
        foundList.items.push(item)
        foundList.save()
        res.redirect("/"+listName)
      }
    })
  }
});

app.post("/delete", (req, res) => {
  const value = req.body.checkbox
  const customList = req.body.customList

  //check which list the request is from
  
if (customList === "Today") {
  Item.findByIdAndRemove(value, (err) => {
    if (!err){
      console.log("Deletion successful!")
    }
    res.redirect("/")
  })
} else {
  List.findOneAndUpdate({name: customList}, {$pull: {items: {_id: value}}}, (err, result) => {
    res.redirect("/"+customList)
  })
}
  
})

app.get("/:newListName", (req, res) => {
  const newListName = _.capitalize(req.params.newListName)

  List.findOne({name: newListName}, (err, foundList) => {
    if (!err){
      if (foundList){
        // exists
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      } else {
        // Does not exist
        const newList = new List({
          name: newListName,
          items: defaultItems
        })
        newList.save()
        res.render("list", {listTitle: newList.name, newListItems: newList.items});
        // res.redirect("/"+newListName)
      }
    }
  })
  
})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
