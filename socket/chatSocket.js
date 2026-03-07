const ChatMessage = require("../models/ChatMessage");
const User = require("../models/User");

module.exports = function(io){

io.on("connection",(socket)=>{

console.log("🔌 User connected:",socket.id);

socket.on("joinJob",(jobId)=>{

socket.join(`job_${jobId}`);

});

socket.on("send_message", async(data)=>{

try{

const {jobId,userId,text} = data;

const message = await ChatMessage.create({

jobId,
userId,
message:text

});

const msg = await ChatMessage.findByPk(message.id,{
include:[{model:User,as:"sender",attributes:["id","name"]}]
});

io.to(`job_${jobId}`).emit("receive_message",{

id:msg.id,
jobId,
userId,
text:msg.message,
sender:msg.sender?.name,
createdAt:msg.createdAt

});

}catch(err){

console.error("Chat error:",err);

}

});

socket.on("disconnect",()=>{

console.log("❌ User disconnected:",socket.id);

});

});

};
