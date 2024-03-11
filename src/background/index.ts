chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === 'getXhr') {
    sendResponse({ XHR: XMLHttpRequest })
  }
})

// chrome.runtime.onInstalled.addListener(() => {
//   chrome.declarativeNetRequest.updateDynamicRules({
//     addRules: [
//       {
//         id: 1001,
//         priority: 1,
//         action: {
//           type: 'redirect',
//           redirect: {
//             url: 'https://www.bing.com',
//           },
//         },
//         condition: {
//           urlFilter: 'http://127.0.0.1:8080',
//           resourceTypes: [
//             'csp_report',
//             'font',
//             'image',
//             'main_frame',
//             'media',
//             'object',
//             'other',
//             'ping',
//             'script',
//             'stylesheet',
//             'sub_frame',

//           ],
//         },
//       },
//     ],
//     removeRuleIds: [1001],
//   })
// })

// chrome.webRequest.onBeforeRequest.addListener(
//   function (details) {
//     // 判断请求类型
//     if (details.url.indexOf('http://127.0.0.1:8080') === 0) {
//       console.log(
//         1111,
//         details.url.replace('http://127.0.0.1:8080', 'https://www.bing.com')
//       )
//       return {
//         redirectUrl: details.url.replace(
//           'http://127.0.0.1:8080',
//           'https://www.bing.com'
//         ),
//       }
//     }
//   },
//   {
//     // 指定拦截的请求类型
//     types: ['xmlhttprequest', 'script', 'stylesheet', 'image', 'font'],
//     urls: ['<all_urls>'],
//   }
// )

// if (false) {
//   const proxyConfig = {
//     mode: 'pac_script',
//     pacScript: {
//       data: `
//       function FindProxyForURL(url, host) {
//         return 'PROXY 127.0.0.1:443';
//       }
//       `,
//     },
//   }

//   chrome.proxy.settings.set({ value: proxyConfig, scope: 'regular' }, () => {
//     console.log('代理成功')
//   })

//   chrome.proxy.settings.get({ incognito: false }, details => {
//     console.log(111111, details)
//   })
// } else {
//   chrome.proxy.settings.clear({ scope: 'regular' }, () => {
//     console.log('清理成功')
//   })
// }
