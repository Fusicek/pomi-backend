const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const sequelize = require("./config/database");

const chatRoutes = require("./routes/chat");
const jobRoutes = require("./routes/jobs");
const userRoutes = require("./routes/users");

const chatSocket = require("./socket/chatSocket");

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: ["https://pomi.pro","https://www.pomi.pro"],
  credentials: true
}));

app.use(express.json());

/* ROUTES */

app.use("/api/jobs", jobRoutes);
app.use("/api/jobs", chatRoutes);
app.use("/api/users", userRoutes);

/* SOCKET */

const io = new Server(server,{
  cors:{
    origin:["https://pomi.pro","https://www.pomi.pro"]
  }
});

chatSocket(io);

/* START */

sequelize.sync({ alter:true }).then(()=>{

  server.listen(process.env.PORT || 3000,()=>{
    console.log("🚀 Server běží");
  });

});
