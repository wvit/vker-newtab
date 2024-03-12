/** 存放当前正在进行中的 xhr 请求 */
const xhrSendMap = {}

/** 判断是否输出调试信息 */
const logger = (options, ...otherParams) => {
  if (options?.log) console.log(...otherParams)
}

/** 拦截并修改 XMLHttpRequest */
const xhrModify = options => {
  const xhrOpen = XMLHttpRequest.prototype.open

  XMLHttpRequest.prototype.open = function (method, url, ...params) {
    if (
      url.indexOf('chrome-extension://kpgohkejeinlkekmbdmgeplmbjfmmgmp') === 0
    ) {
      url = url.replace(
        'chrome-extension://kpgohkejeinlkekmbdmgeplmbjfmmgmp',
        'https://www.bing.com'
      )
    } else if (url.indexOf('/') === 0) {
      url = 'https://www.bing.com' + url
    }

    this.method = method
    this.url = url

    logger(options, 'xhr-open:', method, url)
    xhrOpen.call(this, method, url, ...params)
  }

  XMLHttpRequest.prototype.send = function (data) {
    const xhrSendKey = Math.random().toString().slice(2)
    const postData = {
      action: 'xhrSend',
      xhrSendKey,
      method: this.method || 'GET',
      url: this.url,
      headers: this.getAllResponseHeaders() || {},
      body: data,
    }

    xhrSendMap[xhrSendKey] = this
    window.top.postMessage(postData, '*')
    logger(options, 'xhr-send:', postData)
  }
}

/** 拦截并修改 appendChild() */
const appendChildModify = options => {
  const originalAppendChild = Element.prototype.appendChild

  Element.prototype.appendChild = function (node) {
    if (node?.tagName?.toLowerCase() === 'script') {
      if (
        node.src?.indexOf(
          'chrome-extension://kpgohkejeinlkekmbdmgeplmbjfmmgmp'
        ) === 0
      ) {
        node.src = node.src.replace(
          'chrome-extension://kpgohkejeinlkekmbdmgeplmbjfmmgmp',
          'https://www.bing.com'
        )
      }

      logger(options, 'appendChild-script:', src)
    }

    return originalAppendChild.apply(this, arguments)
  }
}

/** 拦截并修改 setAttribute() */
const setAttributeModify = options => {
  const originalSetAttribute = Element.prototype.setAttribute

  Element.prototype.setAttribute = function (name, value) {
    if (
      this.tagName.toLowerCase() === 'script' &&
      name.toLowerCase() === 'src'
    ) {
      if (value.indexOf('/') === 0) {
        value = 'https://www.bing.com' + value
      } else if (value.indexOf('about://') === 0) {
        value = value.replace('about://', 'https://')
      }

      logger(options, 'setAttribute-src:', value)
      originalSetAttribute.call(this, name, value)
    } else {
      originalSetAttribute.apply(this, arguments)
    }
  }
}

/** 拦截并修改 new Image() */
const newImageModify = options => {
  const OriginalImage = window.Image

  window.Image = function () {
    const img = new OriginalImage()
    const originalSrcSetter = Object.getOwnPropertyDescriptor(
      HTMLImageElement.prototype,
      'src'
    ).set
    const originalSrcGetter = Object.getOwnPropertyDescriptor(
      HTMLImageElement.prototype,
      'src'
    ).get

    Object.defineProperty(img, 'src', {
      set: function (src) {
        if (src.indexOf('/') === 0) {
          src = 'https://www.bing.com' + src
        }

        logger(options, 'setImage-src:', src)
        originalSrcSetter.call(this, src)
      },

      get: function () {
        return originalSrcGetter.call(this)
      },
    })

    return img
  }
}

/** 拦截并修改 document.createElement() */
const createElementModify = options => {
  const originalCreateElement = document.createElement

  document.createElement = function (tagName) {
    if (tagName.toLowerCase() === 'script') {
      const scriptElement = originalCreateElement.call(document, tagName)
      const originalSrcSetter = Object.getOwnPropertyDescriptor(
        HTMLScriptElement.prototype,
        'src'
      ).set

      const originalSrcGetter = Object.getOwnPropertyDescriptor(
        HTMLScriptElement.prototype,
        'src'
      ).get

      Object.defineProperty(scriptElement, 'src', {
        set: function (src) {
          if (src?.indexOf('/') === 0) {
            src = 'https://www.bing.com' + src
          }

          logger(options, 'createElement-src:', src)
          originalSrcSetter.call(this, src)
        },

        get: function () {
          return originalSrcGetter.call(this)
        },
      })

      return scriptElement
    }

    return originalCreateElement.call(document, tagName)
  }
}

/** 监听 postMessage 事件 */
const onWindowMessage = options => {
  window.addEventListener('message', e => {
    const { action, xhrSendKey, responseText, headers, status, statusText } =
      e.data

    if (action === 'xhrResponse') {
      const xhr = xhrSendMap[xhrSendKey]
      if (!xhr) return

      Object.defineProperty(xhr, 'readyState', {
        writable: true,
      })
      Object.defineProperty(xhr, 'responseText', {
        writable: true,
      })
      Object.defineProperty(xhr, 'statusText', {
        writable: true,
      })
      Object.defineProperty(xhr, 'status', {
        writable: true,
      })
      Object.defineProperty(xhr, 'getResponseHeader', {
        writable: true,
      })

      xhr.readyState = 4
      xhr.responseText = responseText
      xhr.statusText = statusText
      xhr.status = status
      xhr.getResponseHeader = key => (key ? headers[key] : headers)

      xhr.dispatchEvent(new Event('readystatechange', { bubbles: false }))
      xhr.dispatchEvent(new Event('loadend', { bubbles: false }))

      logger(options, 'message-xhrResponse:', xhr)
      delete xhrSendMap[xhrSendKey]
    }
  })
}

/** 拦截器配置 */
const intercept = [
  {
    run: true,
    log: false,
    handle: xhrModify,
  },
  {
    run: false,
    log: false,
    handle: appendChildModify,
  },
  {
    run: true,
    log: false,
    handle: setAttributeModify,
  },
  {
    run: true,
    log: false,
    handle: newImageModify,
  },
  {
    run: true,
    log: false,
    handle: createElementModify,
  },
  {
    run: true,
    log: false,
    handle: onWindowMessage,
  },
]

intercept.forEach(item => {
  const { run, log, handle } = item
  if (run) handle({ log })
})
