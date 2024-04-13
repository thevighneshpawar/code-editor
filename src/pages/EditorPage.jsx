import React, { useState } from 'react'
import Client from '../Components/Client'
import Editor from '../Components/Editor'

function Editorpage() {
    const[ clients,setClients] = useState([
        {socketId:1,username:'Vighnesh'},
        {socketId:2,username:'John doe'},
    ])
    return (
        <div className="mainwrap">
            <div className="aside">
                <div className="aside-inner">
                    <div className="logo">
                    <h2 >&#10003; Code like Pro !!</h2>
                    </div>
                    <h3>Connected</h3>
                    <div className="clientList">
                       {
                            clients.map((client)=> {
                               return <Client key={client.socketId} username={client.username}/>
                            })
                        }
                    </div>
                </div>
                <button className='btn copybtn'>Copy Room Id</button>
                <button className='btn leavebtn'>Leave</button>
            </div>
            <div className="editorwrap">
                <Editor/>
            </div>
        </div>
    )
}

export default Editorpage
