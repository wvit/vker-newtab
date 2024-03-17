chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    if (details.url.indexOf('vker-desktop-proxy') !== -1) {
      chrome.proxy.settings.set(
        {
          value: {
            mode: 'pac_script',
            pacScript: {
              data: `
                  function FindProxyForURL(url, host) {
                    if (url.indexOf('www.baidu.com') !== -1) {
                      return 'PROXY 127.0.0.1:7000';
                    }
  
                    return 'DIRECT';
                  }
                `,
            },
          },
          scope: 'regular',
        },
        () => {
          setTimeout(() => {
            chrome.proxy.settings.clear({ scope: 'regular' })
          }, 200)
        }
      )
    }
  },
  {
    types: ['sub_frame'],
    urls: ['<all_urls>'],
  }
)

// chrome.webRequest.onHeadersReceived.addListener(
//   function (details) {
//     if (details.url.indexOf('vker-desktop-proxy') !== -1) {
//       chrome.proxy.settings.clear({ scope: 'regular' })
//     }
//   },
//   {
//     types: ['sub_frame'],
//     urls: ['<all_urls>'],
//   }
// )
