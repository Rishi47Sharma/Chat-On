const express = require('express')
const dotEnv= require('dotenv')
const mongoose= require("mongoose")
const User = require("./models/User")
const messages = require("./models/Message")
const jwt = require("jsonwebtoken")
const cors= require('cors')
const cookieParser= require('cookie-parser')
const ws = require('ws')





dotEnv.config()
mongoose.connect(process.env.MONGO_URL )
const jwtSecret = process.env.JWT_SECRET
const app = express()
app.use(cookieParser())
app.use(express.json())
app.use(
    cors({
        credentials:true,
        origin:process.env.CLIENT_URL,
    })
)

//console.log(process.env.MONGO_URL)
async function getUserDataFromRequest(req) {
  return new Promise((resolve, reject) => {
    const token = req.cookies?.token;
    if (token) {
      jwt.verify(token, jwtSecret, {}, (err, userData) => {
        if (err) throw err;
        resolve(userData);
      });
    } else {
      reject('no token');
    }
  });

}

app.get('/test',(req,res)=>{
    res.json('test ok')
})

app.get('/messages/:userId', async (req,res) => {
  const {userId} = req.params;
  const userData = await getUserDataFromRequest(req);
  const ourUserId = userData.userId;
  const Messages = await messages.find({
    sender:{$in:[userId,ourUserId]},
    recipient:{$in:[userId,ourUserId]},
  }).sort({createdAt: 1});
  res.json(Messages);
  
}) ;

app.get('/profile',(req,res)=>{
    const token= req.cookies?.token;
    if(token){
        jwt.verify(token,jwtSecret,{sameSite:'none',secure:true},(err,userData)=>{
            if (err) throw err;
            res.json(userData)
        })
    }else{
        res.status(401).json("no token")
    }
   

})
app.post('/login', async (req,res) => {
    const {username, password} = req.body;
    const foundUser = await User.findOne({username});
   
    if (foundUser) {
      const passOk = foundUser.password === password ? true:false
    

      if (passOk) {
        jwt.sign({userId:foundUser._id,username}, jwtSecret, {}, (err, token) => {
          res.cookie('rishi', token, {sameSite:'none', secure:true}).json({
            id: foundUser._id,
            
          });
        });
      }else{
        res.json("wrong password")
      }
     
      
    }
  });

app.post('/register', async(req,res)=>{
    const {username , password}=req.body;
    const createdUser = await User.create({username,password});
   jwt.sign({userId:createdUser._id,username},jwtSecret,{},(err,token)=>{
  if(err) throw err;
  res.cookie('token',token,{sameSite:"none",secure:true}).status(201).json(
    {
        
       id: createdUser._id,
        
    }
  );

   });
});

const server=app.listen(4000,()=>{
    console.log("server is running on port 4000")
})

const wss = new ws.WebSocketServer({server})

wss.on('connection',(connection, req)=>{


 
  const cookies = req?.headers?.cookie
  if(cookies){
    const tokenCookies=cookies.split(';').find(srt => srt.startsWith('token='))
   
    if(tokenCookies){
      const token = tokenCookies.split('=')[1]
      
      if(token){
        jwt.verify(token,jwtSecret,{},(err,userData)=>{
          const {userId,username}=userData
          

          //All user details are stored in connection object and connectin object is stored in wss.clients 
          connection.username=username
          connection.userId=userId

        })
      }
    }
   
   

  }
  
  
  connection.on('message', async(message)=>{
    const messageData = JSON.parse(message.toString());
    const {recipient,text}=messageData;
    
   if(recipient && text){
   const messageDoc = await messages.create({
      sender:connection.userId,
      recipient,
      text,
    });

    [...wss.clients].
    filter(c=>recipient === c.userId).
    forEach(c=>c.send(JSON.stringify({
      text,
      sender:connection.userId,
      recipient,
      _id:messageDoc._id,
    })))
   } 
   
  });


  [...wss.clients].forEach(client => {
    client.send(JSON.stringify({
      online: [...wss.clients].map(c => ({userId:c.userId,username:c.username})),
    }));
  });

 
  
})