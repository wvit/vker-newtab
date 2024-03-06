/** 参考： https://github.com/microsoft/monaco-editor/blob/21007360cad28648bdf46282a2592cb47c3a7a6f/samples/browser-esm-vite-react/src/components/Editor.tsx */
import React, { useRef, useState, useEffect, memo } from 'react'
import ts from 'typescript'
import type Monaco from 'monaco-editor'

export const Editor = memo(() => {
  const [editor, setEditor] = useState<Monaco.editor.IStandaloneCodeEditor>()
  const monacoRef = useRef<any>()

  useEffect(() => {
    if (monacoRef) {
      setTimeout(() => {
        setEditor(editor => {
          if (editor) return editor

          const code = `
          function greeter(name?: string) {
            return "Hello, " + name;
          }
          const user = "TypeScript";
          console.log(greeter(user));
        `
          const result = ts.transpileModule(code, {
            compilerOptions: { module: ts.ModuleKind.None },
          })

          return monaco.editor.create(monacoRef.current!, {
            value: result.outputText,
            language: 'typescript',
            theme: 'vs-dark',
          })
        })
      }, 100)
    }

    return () => editor?.dispose()
  }, [monacoRef.current])

  return <div ref={monacoRef} className="h-[100%]"></div>
})
