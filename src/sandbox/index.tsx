import qs from 'qs'

/** 当前沙盒环境需要用到的变量数据 */
const sandboxData = {
  /** 沙盒需要执行的代码 */
  codeData: { css: '', js: '' },
  /** 当前链接上携带的参数 */
  urlQuery: qs.parse(location.search.slice(1)),
}

window.addEventListener('message', e => {
  const { action, forwardData, responseData, codeData: codeContent } = e.data
  const iframe: any = document.querySelector('.iframe')
  const { codeData, urlQuery } = sandboxData

  if (action === 'loadSandbox') {
    sandboxData.codeData = codeContent
    window.top?.postMessage(
      {
        action: 'request',
        requestData: {
          method: 'GET',
          url: urlQuery?.url,
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
        (match, quote, src) => {
          if (src?.indexOf('/') === 0) {
            src = urlQuery?.domain + src
          }

          return `<script src="${src}">`
        }
      )
      .replace(
        /background-image:\s*url\((['"]?)(.*?)\1\)/gi,
        (match, quote, url) => {
          if (url?.indexOf('/') === 0) {
            url = urlQuery?.domain + url
          }

          return `background-image: url(${url})`
        }
      )
      .replace(
        /(<head>)/i,
        `
<script> 
  const sandboxData = {
    urlQuery: ${JSON.stringify(urlQuery)},
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
