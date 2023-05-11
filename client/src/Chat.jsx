import { useEffect, useRef, useState } from "react"
import Avatar from "./Avatar"
import Logo from "./Logo"
import {uniqBy} from "lodash";
import { useContext } from "react"
import { UserContext } from "./UserContext"
import axios from "axios";



function Chat() {
    // eslint-disable-next-line no-unused-vars
    const[ws,setWs]=useState(null)
    const[peopleOnline, setPeopleOnline]=useState({})
    const [selectedUser ,setselectedUser]=useState(null)
    const [newMessages,setNewMessages]=useState('')
    const [messages ,setMessages]=useState([])
    const {id}= useContext(UserContext)
    const currentMessage = useRef(null)


// Automaticaly reconnect webSocket to  server 
useEffect(() => {
  const ws = new WebSocket('ws://localhost:4000');
  setWs(ws);
  ws.addEventListener('message', handleMessage);
}, []);


 useEffect(()=>{
        if(selectedUser){
          
          axios.get(`/messages/${selectedUser}`).then(
            (res)=>{
              setMessages(res.data)
            }
          )
            
        }
    },[selectedUser])

    function showPeopleOnline(people){
        const userOnline ={}
        people.forEach(({userId,username}) => {
            userOnline[userId]=username
            
        });
       setPeopleOnline(userOnline)
    }

    function handleMessage(e){
        const messageData = JSON.parse(e.data)
        if('online' in messageData){
            showPeopleOnline(messageData.online)

        }else{
          setMessages(prev => ([...prev,{
          ...messageData
            
          }]));
        }

    
    }

const userOnlineExclude = {...peopleOnline}
delete userOnlineExclude[id]

const messagesWithDupe = uniqBy(messages,'_id')

function sendMessage(ev){
  ev.preventDefault();
  ws.send(JSON.stringify({
   
    recipient:selectedUser,
      text:newMessages
    
  }))
  setNewMessages('')
  setMessages(prev => ([...prev,{
    text: newMessages,
    sender:id,
    recipient:selectedUser,
    _id:Date.now()
    
  }]));


}
useEffect (()=>{
  const div = currentMessage.current;
  if(div){
   div.scrollIntoView( {block:'end'})
  }

},[messages])




  return (
    <div className="flex h-screen">
        <div className="bg-white-300 w-1/3  ">
            <Logo/>
            
            
            
            {
          Object.keys(userOnlineExclude).map((userId)=>(
            <div onClick={()=>{setselectedUser(userId)}} key={userId} className={"  border-b flex gap-3 border-gray-50 items-center cursor-pointer " +(selectedUser === userId ? 'bg-blue-50':'')}>
              {userId === selectedUser && <div className="w-1 h-12 bg-blue-500 rounded-r-md"></div>}
              <div className="flex items-center py-2 pl-2 gap-3">
              <Avatar online={true} username={peopleOnline[userId]} userId={userId}/> 
               <span> {peopleOnline[userId]}</span>
              </div>
               
              
              
            </div>
         
          ))
        }</div>
        <div className="flex flex-col bg-blue-50 w-2/3">
           <div className="flex-grow">
           {!selectedUser && <div className=" h-full flex items-center justify-center opacity-50">
            Select a person from right Drawer</div>}
            {!!selectedUser && 
            
            <div className='relative h-full'>
              <div className=" overflow-y-scroll absolute inset-0 p-3 mb-3">
              {messagesWithDupe.map((message)=>(
                  
                  // eslint-disable-next-line react/jsx-key
                  <div key={message._id} className={(message.sender === id ? 'text-right':'text-left')}>
                  <div className={" text-left rounded-md p-2 my-2 inline-block "+(message.sender === id ? 'bg-blue-500 text-white':'bg-white text-gray-500')}>
                    {message.text}</div>
                   </div>
                ))}
                 <div ref={currentMessage} ></div>
              </div>
               
               

            </div>
              }
            </div> 
          {!!selectedUser &&<form className="flex gap-2 p-2" onSubmit={sendMessage}>
            <input value={newMessages} onChange={(el)=>{setNewMessages(el.target.value)}} type="text" placeholder="Type your message here"
            className="flex-grow p-1 rounded-sm"/>
            <button type="submit" className="bg-blue-500 text-white rounded-sm p-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
</svg>

            </button>
        </form>}

        
        </div>
        

    </div>
  )
}

export default Chat