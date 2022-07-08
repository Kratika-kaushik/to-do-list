

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://admin-kratika:test123@cluster0.fzia0.mongodb.net/todolistDb", {useNewUrlParser:true});

const itemsSchema={
    name:String
};
const Items=mongoose.model("Item",itemsSchema); //Items is the model of collection called items

const item1=new Items({
    name:"Buy snacks"
});
const item2=new Items({
    name:"Buy banana"
});
const item3=new Items({
    name:"Car wash"
});
var defaultItems=[item1,item2,item3];

const listSchema={
  name:String,
  items:[itemsSchema]
}
const List=mongoose.model("List",listSchema);

app.get("/", function(req, res) {

  Items.find(function(err,items){  //items can be anything- this is going to contain the things found in Items collection
    if(items.length==0){
      Items.insertMany(defaultItems,function(err){
        if(err){
            console.log(err);
        }else{
            console.log("Successfully done!");
        }
    });
    res.redirect("/");
    }else{

      res.render("list", {listTitle: "Today", newListItems: items});
    }
  });


});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listname=req.body.list;
  const item4=new Items({
    name:itemName
  });

  if(listname==="Today"){
    item4.save();
    res.redirect("/");
  }else{
    List.findOne({name:listname},function(err,foundlist){
      foundlist.items.push(item4);
      foundlist.save();
      res.redirect("/"+listname);
    });
  }
  


});
app.post("/delete",function(req,res){
  const checkedItem=req.body.checkbox;
  const listname= req.body.listname;

  if(listname==="Today"){
    Items.findByIdAndRemove(checkedItem,function(err){
      if(err){
        console.log(err);
      }else{
        console.log("successfully deleted!");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name: listname},{$pull:{items:{_id:checkedItem}}}, function(err,foundlist){
      if(!err){
        res.redirect("/"+listname);
      }
    });
  }
 
});

app.get("/:name",function(req,res){
  const customname=_.capitalize(req.params.name);

  List.findOne({name:customname},function(err,list){
    if(!err){
         if(!list){
          //create new list
          const list=new List({
            name:customname,
            items:defaultItems
          });
          list.save();
          res.redirect("/"+customname);
         }else{
          //print existing list

          res.render("list",{listTitle: list.name, newListItems: list.items});
         }



    }
  });






});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
