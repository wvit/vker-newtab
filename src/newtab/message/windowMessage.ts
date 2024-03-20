import axios from 'axios'
import { Dom } from '@/utils'

window.addEventListener('message', async e => {
  const { action, forward, sandboxId, requestData, callbackData } = e.data

  if (action === 'httpRequest') {
    const { method, url, headers: requestHeader, body } = requestData || {}
    const res = await axios({
      method,
      url,
      headers: requestHeader,
      data: body,
      withCredentials: true,
    })
    const { data, status, statusText, headers } = res
    const jsonType = headers['content-type']?.includes('application/json;')
    const resultData = {
      ...callbackData,
      responseData: {
        status,
        statusText,
        headers,
        responseText: jsonType ? JSON.stringify(data) : data,
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