import React, { useRef, useState, useEffect, memo } from 'react'
import { message, Tree } from 'antd'
import { Icon } from '@/components'
import { storeHandles } from '@/utils'
import type Monaco from 'monaco-editor'
import './index.less'

const { DirectoryTree } = Tree

export interface EditorProps {
  /** 监听编辑器保存 */
  onSave: (content: string) => void
}

export const Editor = memo((props: EditorProps) => {
  const { onSave } = props
  const [editor, setEditor] = useState<Monaco.editor.IStandaloneCodeEditor>()
  const [fileTree, setFileTree] = useState<any[]>([])
  const [messageApi, contextHolder] = message.useMessage({
    getContainer: () => monacoRef.current,
    prefixCls: 'editor-message',
    duration: 1,
  })
  const monacoRef = useRef<any>()

  /** 获取文件树数据 */
  const getFileTree = async () => {
    const { list } = await storeHandles.widget.getAll()
    const treeData = list.map(item => {
      const { name, id, codeData } = item
      const fileList = Object.keys(codeData).map(key => {
        return {
          key: `${id}-${key}`,
          title: `index.${key}`,
          editorCode: codeData[key],
          icon: () => {
            const iconProps = {
              css: { name: 'icon-css', className: 'size-5' },
              js: { name: 'icon-js', className: 'size-3' },
              ts: { name: 'icon-ts' },
            }[key]

            return iconProps && <Icon {...iconProps} />
          },
        }
      })

      return { title: name, key: id, children: fileList }
    })

    setFileTree(treeData)
  }

  /** 初始化编辑器配置 */
  const initEditor = () => {
    setEditor(state => {
      if (state || !monaco) return state
      const monacoEditor = monaco.editor.create(monacoRef.current!, {
        language: 'css',
        theme: 'vs-dark',
        tabSize: 2,
      })

      return monacoEditor
    })
  }

  /** 选中文件 */
  const selectFile = (_, e) => {
    const { editorCode } = e.node
    if (editorCode) editor?.setValue(editorCode)
  }

  /** 监听保存编辑器内容 */
  const editorSave = e => {
    const { ctrlKey, metaKey, key } = e
    /** 检查是否按下了 Command 键 或 Ctrl 键，并且按下 S 键 */
    if (!((ctrlKey || metaKey) && key === 's')) return

    e.preventDefault()
    messageApi.success('保存成功')
    onSave?.(editor?.getValue() || '')
  }

  useEffect(() => {
    if (monacoRef.current) setTimeout(initEditor, 500)
    return () => editor?.dispose()
  }, [monacoRef.current])

  useEffect(() => {
    getFileTree()
  }, [])

  return (
    <div className="h-[100%] flex editor-wrap">
      {contextHolder}
      <div className="w-[200px] flex-shrink-0">
        {!!fileTree.length && (
          <DirectoryTree
            defaultExpandAll
            treeData={fileTree}
            onSelect={selectFile}
          />
        )}
      </div>
      <div
        ref={monacoRef}
        className="h-[100%] w-[100%]"
        onKeyDown={editorSave}
      ></div>
    </div>
  )
})
