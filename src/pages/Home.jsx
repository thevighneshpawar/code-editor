import React, { useState } from 'react'
import '../App.css'
import { v4 as uuidv4 } from 'uuid';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate} from 'react-router-dom'


function Home() {

    const navigate =useNavigate()

    const [roomId,setRoomId] = useState('')
    const[username,setUsername]= useState('')

    const createNewRoom=(e)=>{
        e.preventDefault()
        const id = uuidv4();
        setRoomId(id);
        toast.success('created a new room',{
            iconTheme: {
                primary: ' rgb(213, 111, 111)',
              },
        });

    }

    const joinRoom =()=>{
        if(!roomId || !username){
            toast.error('Room Id & Username is required')
            return
        }

        navigate(`/editor/${roomId}`)
    }

    const handleInputEnter=(e)=>{
        if(e.code === 'Enter'){
            joinRoom();
        }
    }

    return (
        <div>
            <div className='homepagewrapper'>
            <div className="formwrapper">

                <h2>&#10003; Code like Pro !!</h2>
                <h4 className='mainlabel'> Paste invitation
                    Room ID</h4>

                <div className="inputGroup">
                    <input type="text" className='inputBox'
                        placeholder='Room Id' 
                        onChange={(e)=> setRoomId(e.target.value)}
                        value={roomId}
                        onKeyUp={handleInputEnter}/>

                    <input type="text" className='inputBox'
                        placeholder='username'
                        onChange={(e)=> setUsername(e.target.value)}
                        value={username} 
                        onKeyUp={handleInputEnter}/>

                        <button 
                        onClick={joinRoom}
                        className="btn joinbtn">Join</button>
                    <span className="createInfo">
                        If you Dont have an invite then create &nbsp;
                        <a href="" 
                        onClick={createNewRoom}
                        className='createNewbtn'> New Room</a>
                    </span>
                </div>
            </div>

            
            <footer>
                <h4>Built with ❤️ by <a href="https://github.com/thevighneshpawar"> Vighnesh Pawar</a></h4>
            </footer>
        </div>

           
        </div>
        
    )
}

export default Home
