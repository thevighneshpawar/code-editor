import React, { useEffect, useState} from 'react';
import MEditor from "@monaco-editor/react";
import socket from '../../socket';
import { useParams } from 'react-router-dom';
import ACTIONS from '../Action';

function Editor() {
    const [code, setCode] = useState("console.log('Monaco Editor!');");
    const { roomId } = useParams();
    useEffect(() => {
        // Listen for code changes from the server
        socket.on(ACTIONS.SYNC_CODE, ({ code }) => {
            setCode(code);
        });

        // Clean up by removing the event listener when component unmounts
        return () => {
            socket.off(ACTIONS.CODE_CHANGE);
        };
    }, []);

    const handleChange = (newCode) => {
        // Emit code changes to the server
        // console.log(newCode);
        socket.emit(ACTIONS.CODE_CHANGE, { code: newCode,roomId });
    };

    return (
        <MEditor
            height="100vh"
            language="javascript"
            theme="vs-dark"
            value={code}
            onChange={handleChange}
            options={{
                inlineSuggest: true,
                fontSize: "18px",
                formatOnType: true,
                autoClosingBrackets: true,
                autoClosingTags: true,
                minimap: { scale: 10 }
            }}
        />
    );
}

export default Editor;
