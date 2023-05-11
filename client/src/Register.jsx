import axios from "axios";
import { useContext, useState } from "react"
import { UserContext } from "./UserContext";


export default function Register() {
    const [username ,setUserName] = useState('');
    const [password , setPassword]= useState('');
    const[isLoginOrRegister, setLoginOrRegister]=useState('login')
   const{setUserName:setLoggedInUsername ,setId}= useContext(UserContext)
   async function handleSubmit(ev){  
    ev.preventDefault();
    const url = isLoginOrRegister === 'register' ? 'register' : 'login';
    console.log(url)
    const {data} = await axios.post(url, {username,password});
     setLoggedInUsername(username)
     console.log(username , data.id)
     setId(data.id)
    }
  return (
    <div className="bg-blue-50 h-screen flex items-center">
        <form  className="w-64 mx-auto mb-12" onSubmit={handleSubmit}>
            <input type="text"   
              className="block w-full p-2 mb-1 border rounded-sm" placeholder="username"
              value={username}
              onChange={ev=>setUserName(ev.target.value)}/>
            <input
            value={password}
            onChange={ev=>setPassword(ev.target.value)}
             type="password"
              className="block w-full p-2 mb-1 border rounded-sm" placeholder="password" />
            <button  className="bg-blue-500 w-full text-white p-2 rounded-sm block" >{
              isLoginOrRegister === 'register' ? 'Register' :'Login'
            }</button>
            <div className="text-center mt-3 ">
              {isLoginOrRegister === 'register' && (<div>
                Already a member? <button onClick={()=>{setLoginOrRegister('login')}}>Login here</button>
              </div>)

              }
               {isLoginOrRegister === 'login' && (<div>
                Dont have an account? <button onClick={()=>{setLoginOrRegister('register')}}>Register here</button>
              </div>)

              }
             
            </div>


        </form>
    </div>
  )
}
