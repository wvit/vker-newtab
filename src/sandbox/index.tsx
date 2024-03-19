import { urlQuery } from '@/utils'

/** 当前沙盒环境需要用到的变量数据 */
const sandboxData = {
  /** 沙盒需要执行的代码 */
  codeData: { css: '', js: '' },
  /** 当前链接上携带的参数 */
  query: urlQuery.getQuery(),
}

/** 替换url地址 */
const replaceUrl = url => {
  if (!url) return url
  const { query } = sandboxData

  if (url.indexOf(query?.extensionId) === 0) {
    url = url.replace(query?.extensionId, query?.domain)
  } else if (url.indexOf('//') === 0) {
    url = url.replace(/^\/\//, query?.protocol)
  } else if (url.indexOf('/') === 0) {
    url = query?.domain + url
  } else if (url.indexOf('about://') === 0) {
    url = url.replace('about://', query?.protocol)
  }

  return url
}

window.addEventListener('message', e => {
  const { action, forwardData, responseData, codeData: codeContent } = e.data
  const iframe: any = document.querySelector('.iframe')
  const { codeData, query } = sandboxData

  if (action === 'loadSandbox') {
    sandboxData.codeData = codeContent
    window.top?.postMessage(
      {
        action: 'httpRequest',
        sandboxId: query?.sandboxId,
        requestData: {
          method: 'GET',
          url: query?.url,
        },
        callbackData: { action: 'loadSandboxResponse' },
      },
      '*'
    )
  } else if (action === 'loadSandboxResponse') {
    const { responseText } = responseData || {}

    iframe.srcdoc = responseText
      .replace(
        /<script\s+[^>]*src\s*=\s*(['"])(.*?)\1[^>]*>/gi,
        (_, __, src) => {
          return `<script src="${replaceUrl(src)}">`
        }
      )
      .replace(/background-image:\s*url\((['"]?)(.*?)\1\)/gi, (_, __, url) => {
        return `background-image: url(${replaceUrl(url)})`
      })
      .replace(/(action|href|src)="([^"]*)"/gi, (_, attrName, attrValue) => {
        return `${attrName}="${replaceUrl(attrValue)}"`
      })
      .replace(
        /(<head>)/i,
        `
<script> 
  const sandboxData = {
    query: ${JSON.stringify(query)},
  }
</script>

<script src='/sandbox/script.js'></script>

<style>
  ${codeData?.css}
</style>

<script>
document.addEventListener('DOMContentLoaded', ()=> {
  
})
 </script>
      $1`
      )
  } else if (action === 'forward') {
    iframe.contentWindow.postMessage(forwardData, '*')
  }
})
