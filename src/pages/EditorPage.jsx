import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import ACTIONS from '../Action';
import Client from '../Components/Client';
import Editor from '../Components/Editor';
import socket from '../../socket';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPlug } from '@fortawesome/free-solid-svg-icons';

function EditorPage() {
    const codeRef = useRef(null);
    const socketInitialized = useRef(false);
    const location = useLocation();
    const { roomId } = useParams();
    const reactNavigator = useNavigate();
    const [clients, setClients] = useState([]);
    const [display, setDisplay] = useState(false);
    const [displayr, setDisplayr] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState("");
    const [code, setCode] = useState(''); 
    const output = document.querySelector("#outputTextarea");
    

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
                    code: code,
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


    const toggleAsider = () => {
        if (display) {
            setDisplay(false)
        }
        setDisplayr(!displayr);
    };

    const toggleAside = () => {
        if (displayr) {
            setDisplayr(false)
        }
        setDisplay(!display);
    };
    
    const handleLanguageSelect = (event) => {
        setSelectedLanguage(event.target.value);
        // console.log(selectedLanguage);
    };

    const handleCodeChange = (newCode) => {
        setCode(newCode); // Update the code state
    };

    function showLoading () {
        output.value = ''
        output.style.backgroundImage = "url('https://compiler-thevighneshpawars-projects.vercel.app/loading.gif')"
        output.style.backgroundRepeat = 'no-repeat'
        output.style.backgroundPosition = 'center'
      }
      
      // Function to remove loading gif and display the received output
      function showOutput (outputData) {
        output.style.backgroundImage = 'none' // Remove loading.gif
        output.value = outputData // Display the received output
      }

    const handleRunButtonClick = async () => {
        try {
            
            const input = document.querySelector("#inputTextarea").value;
            //  console.log(code,input,selectedLanguage);
            // console.log();
            // console.log();
            // Ensure that a language is selected
            if (!selectedLanguage) {
                toast.error("Please select a language.");
                return;
            }

           
           
            // Construct the request body
            const requestBody = {
            code: code,
            input: input,
            lang: selectedLanguage
            };
            showLoading();
    
            // Make an API request to your server
            const response = await fetch("/compile", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestBody)
            });
    
            if (!response.ok) {
                const errorMessage = await response.text();
                throw new Error(`API request failed: ${errorMessage}`);
            }
    
            const data = await response.text()
            showOutput(data)
    
            toast.success("Code submitted for execution.");
        } catch (err) {
            // Handle errors, if any
            console.error(err);
            toast.error("An error occurred while running the code.");
        }
    };

    return (
        <div className="mainwrap">

            <div className="sidenav">
                <div className='inner-sidenav'>
                    <div className="run">
                        <FontAwesomeIcon icon={faPlay} onClick={toggleAsider} className='large-icon' />
                    </div>
                    <div className="connected">
                        <FontAwesomeIcon icon={faPlug} className='large-icon' onClick={toggleAside} />
                    </div>
                </div>
            </div>

            <div className='tab'>
                <div className={`aside ${display ? '' : 'd-none'}`}>
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

                <div className={`inputcode ${displayr ? '' : 'd-none'}`}>

                    <div className='top-run'>
                        <select className="form-select" id="inlineFormSelectPref" onChange={handleLanguageSelect}>
                            <option selected>Choose...</option>
                            <option value="50">C</option>
                            <option value="52">Cpp</option>
                            <option value="62">Java</option>
                            <option value="71">Python</option>
                        </select>
                        <button className='btn runbtn' onClick={handleRunButtonClick}> Run</button>
                    </div>
                    <div>
                        <h3>Input</h3>
                        <textarea name="" id="inputTextarea" cols="30" rows="6"></textarea>
                    </div>
                    <div>
                        <h3>Output</h3>
                        <textarea name="" id="outputTextarea" cols="30" rows="8"></textarea>
                    </div>
                </div>
            </div>

            

            <div className="editorwrap">
                <Editor
                roomId={roomId}
                selectedLanguage={selectedLanguage}
                onCodeChange={handleCodeChange} 
                />
            </div>

        </div>
    );
}

export default EditorPage;
