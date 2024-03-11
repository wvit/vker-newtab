/** 拦截 XMLHttpRequest */
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

  console.log('xhr-open', method, url)

  xhrOpen.call(this, method, url, ...params)
}

/** 拦截 appendChild */
// const originalAppendChild = Element.prototype.appendChild

// Element.prototype.appendChild = function (newNode) {
//   if (newNode?.tagName?.toLowerCase() === 'script') {
//     if (
//       newNode.src?.indexOf(
//         'chrome-extension://kpgohkejeinlkekmbdmgeplmbjfmmgmp'
//       ) === 0
//     ) {
//       newNode.src = newNode.src.replace(
//         'chrome-extension://kpgohkejeinlkekmbdmgeplmbjfmmgmp',
//         'https://www.bing.com'
//       )
//     }

//     console.log('script-src', newNode.src)
//   }

//   return originalAppendChild.apply(this, arguments)
// }

/** 拦截 setAttribute */
const originalSetAttribute = Element.prototype.setAttribute

Element.prototype.setAttribute = function (name, value) {
  if (this.tagName.toLowerCase() === 'script' && name.toLowerCase() === 'src') {
    if (value.indexOf('/') === 0) {
      value = 'https://www.bing.com' + value
    } else if (value.indexOf('about://') === 0) {
      value = value.replace('about://', 'https://')
    }

    console.log('setAttribute-src', value)

    originalSetAttribute.call(this, name, value)
  } else {
    originalSetAttribute.apply(this, arguments)
  }
}

/** 拦截 new Image() */
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
    set: function (newSrc) {
      if (newSrc.indexOf('/') === 0) {
        newSrc = 'https://www.bing.com' + newSrc
      }

      console.log('new-Image', newSrc)

      originalSrcSetter.call(this, newSrc)
    },

    get: function () {
      return originalSrcGetter.call(this)
    },
  })

  return img
}

/** 拦截 document.createElement('script') */
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
      set: function (newSrc) {
        if (newSrc?.indexOf('/') === 0) {
          newSrc = 'https://www.bing.com' + newSrc
        }

        console.log(`createElement('script').set`, newSrc)
        originalSrcSetter.call(this, newSrc)
      },

      get: function () {
        return originalSrcGetter.call(this)
      },
    })

    return scriptElement
  }

  return originalCreateElement.call(document, tagName)
}
