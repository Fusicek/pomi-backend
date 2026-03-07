const express = require("express");
const router = express.Router();

const ChatMessage = require("../models/ChatMessage");
const User = require("../models/User");

const { requireUser } = require("../middleware/auth");

/* GET MESSAGES */

router.get("/:jobId/messages", requireUser, async (req,res)=>{

  const messages = await ChatMessage.findAll({

    where:{ jobId:req.params.jobId },

    include:[
      {
        model:User,
        as:"sender",
        attributes:["id","name"]
      }
    ],

    order:[["createdAt","ASC"]]

  });

  res.json(messages);

});

/* SEND MESSAGE */

router.post("/:jobId/messages", requireUser, async (req,res)=>{

  const { message } = req.body;

  const newMessage = await ChatMessage.create({

    jobId:req.params.jobId,
    userId:req.user.id,
    message

  });

  res.json(newMessage);

});

module.exports = router;
