const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server);
const port = process.env.PORT  ||  3010 ; 

 app.set("view engine" , "ejs");
app.use(express.static("public"));
app.use(express.urlencoded ({extended: true}));

let roomsAll= { };
var count = 0;

// app.get("/" , (req,res) => {
//     res.send("hey")
// })

app.get("/" , (req,res)=> {
    res.render("forms");
});

app.post("/rooms" , (req,res) => {  
    // console.log(req.body)
    console.log(roomsAll[req.body.roomname])
    if (roomsAll[req.body.roomname] == undefined ){
        roomsAll[req.body.roomname] = { user : [ ] };
        // console.log("heyyyy")
        res.redirect("/" +req.body.roomname );
    }  else if (roomsAll[req.body.roomname] != null && roomsAll[req.body.roomname].user.length <= 1)  {
        console.log(roomsAll[req.body.roomname].user.length);
        res.redirect(req.body.roomname);
    } else if(roomsAll[req.body.roomname] != null && roomsAll[req.body.roomname].user.length >1 )  {
        res.redirect("/");
        console.log("room full");
    } else{
        res.redirect("/");
    }
});


 
app.get("/:room" , (req,res) => { 
    // console.log(req.params.room);
    if(req.params.room != null   ) {
        res.render("chats" , {roomName : req.params.room });
    }
    else{
        res.redirect("/")
        console.log("full");
    }
   
}) 



io.of("/").on ("connection" , (socket) =>{
    // console.log("new user has connected" ,socket.id);
    socket.on("join" , function(roomVal , userVal){
        
        const rooms = io.sockets.adapter.rooms;
        const room = rooms.get(roomVal);
         if(room === undefined) {
            socket.join(roomVal);
            roomsAll[roomVal].user.push(userVal);
            socket.emit("created" , "Room is created");

         } else if (room.size <= 2) {
             socket.join(roomVal);
             roomsAll[roomVal].user.push(userVal);
             socket.emit("joined" , "another person joined the room");
        }  else {
            socket.emit("full");
        }

        });
        
        socket.on("ready" , function(roomVal) {
            socket.to(roomVal).broadcast.emit("ready");
        })

        socket.on("initiate" , function(roomVal){
            console.log("initiate is entered");
            io.emit("initiate");
        })

        socket.on("candidate" , function(candidate , roomVal) {
            socket.to(roomVal).broadcast.emit("candidate" , candidate)
        })

        socket.on("offer" , function(offer) {
            socket.to(offer.roomVal).broadcast.emit("offer" , offer );
        })

        socket.on("offers" , function(offer){
            socket.to(offer.roomVal).broadcast.emit("offers" , offer );
        })

        socket.on("answer" , function(answer) {
            socket.to(answer.roomVal).broadcast.emit("answer" , answer);
        })

        socket.on("typing"  , function(roomVal , text) {
            socket.to(roomVal).broadcast.emit("display-typing" , text)
        })

        socket.on("send" , function(val , roomVal , userVal) {
            socket.to(roomVal).broadcast.emit("received" , val , userVal);
        })
 }) 


server.listen(port , ()=>{
    console.log("server has started running");
});

