import React, { useEffect, useState } from 'react';
import MEditor from "@monaco-editor/react";
import socket from '../../socket';
import { useParams } from 'react-router-dom';
import ACTIONS from '../Action';

function Editor({ onCodeChange, selectedLanguage }) {
    const [code, setCode] = useState("");
    const { roomId } = useParams();
    const [language, setLanguage] = useState('javascript');

    useEffect(() => {
        const languageCodeMap = {
            '62': { name: 'java', code: '// Always use class name Main \nclass Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}\n' },
            '71': { name: 'python', code: 'print("Hello, World!")' },
            '50': { name: 'c', code: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}\n' },
            '52': { name: 'cpp', code: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}\n' },
        };
        
    
        const { name: languageName, code: defaultCode } = languageCodeMap[selectedLanguage] || { name: 'cpp', code: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}\n' };
        setLanguage(languageName);
        setCode(defaultCode);
        handleChange(defaultCode)
        // Listen for code changes from the server
        socket.on(ACTIONS.SYNC_CODE, ({ code }) => {
            setCode(code);
        });

    
        return () => {
            socket.off(ACTIONS.CODE_CHANGE);
        };
    }, [selectedLanguage]);

    const handleChange = (newCode) => {
        // Emit code changes to the server
        console.log(newCode);
        socket.emit(ACTIONS.CODE_CHANGE, { code: newCode,roomId });
    };

    return (
        <MEditor
            height="100vh"
            language={language}
            theme="vs-dark"
            value={code}
            onChange={handleChange}
            options={{
                inlineSuggest: true,
                fontSize: "18px",
                formatOnType: true,
                autoClosingBrackets: true,
                autoClosingTags: true,
            }}
        />
    );
}

export default Editor;
