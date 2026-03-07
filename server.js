const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const sequelize = require("./config/database");

const chatSocket = require("./socket/chatSocket");

const chatRoutes = require("./routes/chat");

const app = express();
const server = http.createServer(app);

app.use(cors({
origin:["https://pomi.pro","https://www.pomi.pro"],
credentials:true
}));

app.use(express.json());

app.use("/api/jobs",chatRoutes);

const io = new Server(server,{
cors:{
origin:["https://pomi.pro","https://www.pomi.pro"]
}
});

chatSocket(io);

sequelize.sync({alter:true}).then(()=>{

server.listen(process.env.PORT || 3000,()=>{

console.log("🚀 Server běží");

});

});
