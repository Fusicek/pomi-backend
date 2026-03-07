const User = require("../models/User");

const requireUser = async (req,res,next)=>{

  const userId = req.headers["x-user-id"];

  if(!userId)
    return res.status(401).json({error:"Nepřihlášený uživatel"});

  const user = await User.findByPk(userId);

  if(!user)
    return res.status(401).json({error:"Uživatel neexistuje"});

  req.user = user;

  next();

};

const requireRole = role => (req,res,next)=>{

  if(req.user.role !== role)
    return res.status(403).json({error:"Nedostatečné oprávnění"});

  next();

};

module.exports = {requireUser,requireRole};
