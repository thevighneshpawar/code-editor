import React, { useEffect ,useRef } from 'react';
import MEditor from "@monaco-editor/react";

function Editor() {
    const code = "console.log('Monaco Editor!');";
    return (
      <MEditor
        height="100vh"
        language="javascript"
        theme="vs-dark"
        value={code}
        options={{
            inlineSuggest: true,
            fontSize: "18px",
            formatOnType: true,
            autoClosingBrackets: true,
            autoClosingTags: true,
            minimap: { scale: 10 }
          }}
      />
    )
}

export default Editor;
