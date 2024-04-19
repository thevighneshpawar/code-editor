import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import ACTIONS from '../Action';
import Client from '../Components/Client';
import Editor from '../Components/Editor';
import socket from '../../socket';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

function EditorPage() {
    const codeRef = useRef(null);
    const socketInitialized = useRef(false);
    const location = useLocation();
    const { roomId } = useParams();
    const reactNavigator = useNavigate();
    const [clients, setClients] = useState([]);

    useEffect(() => {
        const handleErrors = (e) => {
            console.log('socket error', e);
            toast.error('Socket connection failed, try again later.');
            reactNavigator('/');
        };

        const initSocket = async () => {
            socket.on('connect_error', handleErrors);
            socket.on('connect_failed', handleErrors);

            socket.emit(ACTIONS.JOIN, {
                roomId,
                username: location.state?.username,
            });

            socket.on(ACTIONS.JOINED, ({ clients, username, socketId }) => {
                if (username !== location.state?.username) {
                    toast.success(`${username} joined the room.`);
                    console.log(`${username} joined`);
                }
                setClients(clients);
                socket.emit(ACTIONS.SYNC_CODE, {
                    code: codeRef.current,
                    socketId,
                });
            });

            socket.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
                toast.error(`${username} leaves the room`);
                setClients((prev) => {
                    return prev.filter((client) => client.socketId !== socketId);
                });
            });

            // Return a cleanup function
            return () => {
                socket.disconnect();
                socket.off(ACTIONS.JOINED);
                socket.off(ACTIONS.DISCONNECTED);
            };
        };

    

    // Call initSocket only once when the component mounts
    if (!socketInitialized.current) {
        initSocket();
        socketInitialized.current = true;
    }
       
        // Cleanup function will be called when component unmounts
        return () => {
            // No need to do anything here since cleanup is handled inside initSocket
        };
    }, []);

    async function copyRoomId() {
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success('Room ID has been copied to your clipboard');
        } catch (err) {
            toast.error('Could not copy the Room ID');
            console.error(err);
        }
    }

    function leaveRoom() {
        reactNavigator('/');
    }

    // if (!location.state) {
    //     return <Navigate to="/" />;
    // }

    return (
        <div className="mainwrap">
            <div className="aside">
                <div className="aside-inner">
                    <div className="logo">
                        <h2>&#10003; Code like Pro !!</h2>
                    </div>
                    <h3>Connected</h3>
                    <div className="clientList">
                        {clients.map((client) => (
                            <Client key={client.socketId} username={client.username} />
                        ))}
                    </div>
                </div>
                <button className="btn copybtn" onClick={copyRoomId}>
                    Copy ROOM ID
                </button>
                <button className="btn leavebtn" onClick={leaveRoom}>
                    Leave
                </button>
            </div>
            <div className="editorwrap">
                <Editor
                    roomId={roomId}
                    onCodeChange={(code) => {
                        codeRef.current = code;
                    }}
                />
            </div>
        </div>
    );
}

export default EditorPage;
