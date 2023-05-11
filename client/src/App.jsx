

import axios from 'axios'
import './App.css'

import { UserContextProvider } from './UserContext';
import Routes from './Routes';

function App() {
 axios.defaults.baseURL=import.meta.env.VITE_API_BASE_URL;
 axios.defaults.withCredentials=true;

  return (
    <>
     <div>
      <UserContextProvider>
     <Routes/>
      </UserContextProvider>
    
     </div>
    </>
  )
}

export default App
