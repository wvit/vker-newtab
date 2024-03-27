import { urlQuery, Action, Message } from '@/utils'

/** 当前小部件的配置数据 */
const widgetData = {
  /** 沙盒需要执行的代码 */
  codeData: { css: '', js: '' },
  /** 当前链接上携带的参数 */
  query: urlQuery.getQuery(),
}

/** 替换url地址 */
const replaceUrl = url => {
  if (!url) return url
  const { query } = widgetData

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

/** 监听通知加载 sandbox  */
Message.window.on(Action.Window.LoadSandbox, e => {
  const { codeData, sandboxData } = e.data
  const { query } = widgetData
  const iframe: any = document.querySelector('.iframe')

  widgetData.codeData = codeData

  if (sandboxData.type === 'custom') {
    iframe.srcdoc = `
${codeData?.['page.html']}

<style>
  ${codeData?.['page.css']}
</style>

<script>
  ${codeData?.['page.js']}
</script>
`
  } else if (sandboxData.type === 'iframe') {
    Message.window.send(window.top!, {
      action: Action.Window.HttpRequest,
      sandboxId: query?.sandboxId,
      requestData: { method: 'GET', url: query?.url },
      callbackData: { action: Action.Window.LoadIframeResponse },
    })
  }
})

/** 监听加载 iframe 响应内容  */
Message.window.on(Action.Window.LoadIframeResponse, e => {
  const { responseText } = e.data.responseData || {}
  const { codeData, query } = widgetData
  const iframe: any = document.querySelector('.iframe')

  iframe.srcdoc = responseText
    .replace(/<script\s+[^>]*src\s*=\s*(['"])(.*?)\1[^>]*>/gi, (_, __, src) => {
      return `<script src="${replaceUrl(src)}">`
    })
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
const widgetData = {
  query: ${JSON.stringify(query)},
  Action: ${JSON.stringify(Action)},
}
</script>

<script src='/sandbox/script.js'></script>

<style>
${codeData?.['content.css']}
</style>

<script>
${codeData?.['content.js']}
</script>
    $1`
    )
})

/** 监听向 子iframe 的转发事件 */
Message.window.on(Action.Window.Forward, e => {
  const iframe: any = document.querySelector('.iframe')

  Message.window.send(iframe.contentWindow, e.data.forwardData)
})
