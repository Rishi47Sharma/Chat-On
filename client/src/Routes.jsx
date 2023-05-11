import { useContext } from "react";
import Register from "./Register";
import { UserContext } from "./UserContext";
import Chat from "./Chat";

export default function Routes(){
    const{username,id}=useContext(UserContext)

    if(username && typeof(id)=== 'string'){
      return (<Chat/>)
  }
    

    console.log(username ,id)
    return(
    
   
    <Register/>)
}