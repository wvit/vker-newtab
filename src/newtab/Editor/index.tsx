/** 参考： https://github.com/microsoft/monaco-editor/blob/21007360cad28648bdf46282a2592cb47c3a7a6f/samples/browser-esm-vite-react/src/components/Editor.tsx */
import React, { useRef, useState, useEffect, memo } from 'react'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import './userWorker'

export const Editor = memo(() => {
  const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor>()
  const monacoRef = useRef<any>()

  useEffect(() => {
    if (monacoRef) {
      setTimeout(() => {
        setEditor(editor => {
          if (editor) return editor

          return monaco.editor.create(monacoRef.current!, {
            value: [
              'function x() {',
              '\tconsole.log("Hello world!");',
              '}',
            ].join('\n'),
            language: 'typescript',
          })
        })
      }, 1000)
    }

    return () => editor?.dispose()
  }, [monacoRef.current])

  return <div ref={monacoRef} className="h-[100%]"></div>
})
