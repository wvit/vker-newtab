window.addEventListener('message', e => {
  if (e.source !== window.parent) return
  const { action, content } = e.data

  if (action === 'html') {
    const iframe: any = document.querySelector('.iframe')
    const html = content.replace(
      /<script\s+[^>]*src\s*=\s*(['"])(.*?)\1[^>]*>/gi,
      (match, quote, src) => {
        // 这里可以对匹配到的 src 属性进行处理，例如添加前缀或者修改路径
        const newSrc = 'https://www.bing.com' + src
        // 返回替换后的 <script> 标签
        return `<script src="${newSrc}">`
      }
    )

    // iframe.srcdoc = html.replace(/(<head>)/i, `<script>${global_iframeScript}</script>$1`)
    iframe.srcdoc = html.replace(
      /(<head>)/i,
      `<script src='/iframe/script.js'></script>$1`
    )

    return
    iframe.addEventListener('load', () => {
      const iframeDocument = iframe.contentWindow.document

      // const xhrSend = iframe.contentWindow.XMLHttpRequest.prototype.send
      // const xhrOpen = xhr.prototype.open
      // const xhrSend = window.top.XMLHttpRequest.prototype.send

      // iframe.contentWindow.XMLHttpRequest.prototype.send = async function (
      //   ...params
      // ) {
      //   console.log('xhr-send', ...params)

      //   xhrSend.call(this, ...params)
      // }

      const observer = new MutationObserver(function (mutationsList) {
        // 遍历每一个变动
        mutationsList.forEach(function (mutation) {
          // 检查是否是子节点的变化
          if (mutation.type === 'childList') {
            // 遍历新增的子节点
            mutation.addedNodes.forEach(function (node: any) {
              console.log(1111111, node)
              // 检查是否是 script 标签，并且是否有 src 属性
              if (
                node.tagName === 'SCRIPT' &&
                node?.src?.indexOf(
                  'chrome-extension://kpgohkejeinlkekmbdmgeplmbjfmmgmp'
                ) === 0
              ) {
                const scriptTag = iframeDocument.createElement('script')
                scriptTag.src = node.src.replace(
                  'chrome-extension://kpgohkejeinlkekmbdmgeplmbjfmmgmp',
                  'https://www.bing.com'
                )
                iframeDocument.body.appendChild(scriptTag)

                console.log('New script loaded:', node.src)
              }
            })
          }
        })
      })

      // 开始观察 body 元素的子节点变化
      observer.observe(iframeDocument.body, {
        childList: true,
        subtree: true,
      })

      // iframeDocument.querySelectorAll('script').forEach(item => {
      // console.log(111111, item.src)
      // item.addEventListener('error', () => {
      //   console.log(item.src)
      //   // 在这里执行加载失败时的操作
      // })
      // })

      // iframeDocument.querySelectorAll('script').forEach(item => {
      //   item.src = item.src.replace(
      //     'http://127.0.0.1:8080',
      //     'https://www.bing.com'
      //   )
      //   console.log(item.src)
      // })
    })
  }
})
