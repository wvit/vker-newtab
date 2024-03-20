import { Dom } from '@/utils'

window.addEventListener('message', async e => {
  const { action, forward, sandboxId, requestData, callbackData } = e.data

  if (action === 'httpRequest') {
    const { method, url, headers: requestHeaders, body } = requestData || {}
    const res = await fetch(url, {
      method,
      body,
      headers: requestHeaders,
    })
    const { status, statusText, headers } = res
    const responseHeaders = Array.from(headers.keys()).reduce((prev, key) => {
      return { ...prev, [key]: headers.get(key) }
    }, {})

    const resultData = {
      ...callbackData,
      responseData: {
        status,
        statusText,
        responseText: await res.text(),
        headers: responseHeaders,
      },
    }

    Dom.query(`#${sandboxId}`).contentWindow.postMessage(
      forward
        ? {
            action: 'forward',
            forwardData: resultData,
          }
        : { ...resultData },
      '*'
    )
  }
})
