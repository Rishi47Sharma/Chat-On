import axios from "axios";
import { createContext, useEffect, useState } from "react";
export const UserContext = createContext({})

// eslint-disable-next-line react/prop-types
export function UserContextProvider({children}){
    const[username , setUserName] = useState(null)
    const[id, setId]= useState(null)
    useEffect(()=>{
        axios.get("/profile").then(response=>{
                setUserName(response.data.username);
                setId(response.data.userId)
        })
    },[])
    return(
        <UserContext.Provider value={{username ,setId,setUserName ,id}}>
            {children}
        </UserContext.Provider>
    )
}