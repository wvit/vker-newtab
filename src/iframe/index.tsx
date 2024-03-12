window.addEventListener('message', e => {
  const { action, iframeContent, cssContent, forwardData } = e.data
  const iframe: any = document.querySelector('.iframe')

  if (action === 'iframeLoad') {
    /** 匹配并修改src地址 */
    const html = iframeContent.replace(
      /<script\s+[^>]*src\s*=\s*(['"])(.*?)\1[^>]*>/gi,
      (match, quote, src) => {
        if (src?.indexOf('/') === 0) {
          src = 'https://www.bing.com' + src
        }

        return `<script src="${src}">`
      }
    )

    iframe.srcdoc = html.replace(
      /(<head>)/i,
      `
 <script src='/iframe/script.js'></script>
 <style>
 ${cssContent}
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
