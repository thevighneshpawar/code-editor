import React, { useEffect } from 'react';
import { EditorState, EditorView, basicSetup } from "@codemirror/basic-setup";
import { javascript } from "@codemirror/lang-javascript";




function Editor() {
    useEffect(() => {
        async function init() {
            CodeMirror.fromTextArea(document.getElementById('realtimeEditor'), {
                mode: 'javascript',
                json: true,
            });
        }

        init();
    }, []);

    return (
        <textarea id="realtimeEditor"></textarea>
    );
}

export default Editor;
