// @ts-nocheck

;(() => {
  /** 父级向当前沙盒环境注入的变量 */
  const { query } = sandboxData || {}

  /** 存放当前正在进行中的 xhr 请求 */
  const xhrSendMap = {}

  /** 判断是否输出调试信息 */
  const logger = (options, ...otherParams) => {
    if (options?.log) console.log(...otherParams)
  }

  /** 替换url地址 */
  const replaceUrl = url => {
    if (!url) return url

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

  /** 拦截并修改 XMLHttpRequest */
  const xhrModify = options => {
    const xhrOpen = XMLHttpRequest.prototype.open
    const xhrSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader

    XMLHttpRequest.prototype.setRequestHeader = function (header, value) {
      this.requestHeaders = { ...this.requestHeaders, [header]: value }
      return xhrSetRequestHeader.call(this, header, value)
    }

    XMLHttpRequest.prototype.open = function (method, url, ...params) {
      url = replaceUrl(url)
      this.method = method
      this.url = url

      logger(options, 'xhr-open:', method, url)
      xhrOpen.call(this, method, url, ...params)
    }

    XMLHttpRequest.prototype.send = function (data) {
      const xhrSendKey = Math.random().toString().slice(2)
      const postData = {
        action: 'httpRequest',
        forward: true,
        sandboxId: query?.sandboxId,
        requestData: {
          method: this.method || 'GET',
          url: this.url,
          headers: this.requestHeaders,
          body: data,
        },
        callbackData: {
          action: 'httpResponse',
          xhrSendKey,
        },
      }

      xhrSendMap[xhrSendKey] = this
      window.top?.postMessage(postData, '*')
      logger(options, 'xhr-send:', postData)
    }
  }

  /** 拦截并修改 appendChild() */
  const appendChildModify = options => {
    const originalAppendChild = Element.prototype.appendChild

    Element.prototype.appendChild = function (node) {
      if (node?.tagName?.toLowerCase() === 'script') {
        node.src = replaceUrl(node.src)

        logger(options, 'appendChild-script:', node.src)
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
        value = replaceUrl(value)

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
          src = replaceUrl(src)

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
            src = replaceUrl(src)

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
      const { action, xhrSendKey, responseData } = e.data

      if (action === 'httpResponse') {
        const { responseText, headers, status, statusText } = responseData || {}
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
})()
