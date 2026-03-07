const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const sequelize = require("./config/database");

const jobRoutes = require("./routes/jobs");
const chatRoutes = require("./routes/chat");
const userRoutes = require("./routes/users");

const chatSocket = require("./socket/chatSocket");

const app = express();
const server = http.createServer(app);

/* CORS */

app.use(cors({
  origin: ["https://pomi.pro", "https://www.pomi.pro"],
  credentials: true
}));

app.use(express.json());

/* ROUTES */

app.use("/api/jobs", jobRoutes);
app.use("/api/jobs", chatRoutes);   // <-- toto vytvoří /api/jobs/:jobId/messages
app.use("/api/users", userRoutes);

/* TEST ROUTE (pro debug) */

app.get("/api/test", (req,res)=>{
  res.json({status:"ok"});
});

/* SOCKET */

const io = new Server(server,{
  cors:{
    origin:["https://pomi.pro","https://www.pomi.pro"],
    methods:["GET","POST"]
  }
});

chatSocket(io);

/* START SERVER */

sequelize.sync({ alter:true }).then(()=>{

  const PORT = process.env.PORT || 3000;

  server.listen(PORT,()=>{
    console.log(`🚀 Server běží na portu ${PORT}`);
  });

}).catch(err=>{
  console.error("❌ DB ERROR:", err);
});
