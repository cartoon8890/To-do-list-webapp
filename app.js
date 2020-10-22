//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const app = express();
const _ =require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser:true,useUnifiedTopology: true});
const itemSchema={
  name:String
};
const Item=mongoose.model("Item",itemSchema);
const item1=new Item({
  name:"welcome to your todoList"
});
const item2=new Item({
  name:"hit + to more todolist"
});
const item3=new Item({
  name:"hit this to delete"
});
const defaultItem=[item1,item2,item3];
const listSchema={
  name:String,
  items:[itemSchema]
}
const List=mongoose.model("List",listSchema);

app.get("/", function(req, res) {

  Item.find({},function(err,foundItem)
{
  if(foundItem.length===0)
  {
    Item.insertMany(defaultItem,function(err)
    {
      if(err){
        console.log(err);
      }
      else{
        console.log("successfully saved default item to DB");
      }
    });
    res.redirect("/");
  }
  else
  {
res.render("list", {listTitle: "Today", newListItems: foundItem});
}
})


});

app.post("/", function(req, res){

  const itemName= req.body.newItem;
  const listName=req.body.list;

  const item=new Item({
    name: itemName
  });
  if(listName==="Today")
  {
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,foundList)
  {
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+listName);
  })
  }


});
app.post("/delete",function(req,res)
{
 const checkedItemid=req.body.checkbox;
 const listName=req.body.listName;
 if(listName==="Today")
 {
  Item.findByIdAndRemove(checkedItemid,function(err)
{
  if(!err)
  {
    console.log("successfully deleted that item");
    res.redirect("/");
  }
});
}
else
{
  List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemid}}},function(err,foundList)
{
  if(!err)
  {
    res.redirect("/"+listName);
  }
})
}
});
app.get("/:customListName",function(req,res)
{
  const customListName=_.capitalize(req.params.customListName);
  List.findOne({name:customListName},function(err,foundlist){
    if(!err)
    {
      if(!foundlist)
      {
        //create new list
        const list=new List({
          name:customListName,
          items:defaultItem
        });
        list.save();
        res.redirect("/"+customListName);
      }
      else
      {
        //show an existing list
        res.render("list", {listTitle:foundlist.name, newListItems:foundlist.items});
      }
    }
});

});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
