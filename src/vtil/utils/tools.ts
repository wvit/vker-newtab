/** 传入一个时间戳，返回一个日期字符串 */
export const getDate = ({ time, full, offsetOption = {} }) => {
  /** 生成一个日期对象 */
  const date = new Date(time)
  /** 数值如果小于10, 则补0 */
  const judge = (key, offset = 0) => {
    const value = date[key]() + (offsetOption[key] || 0) + offset
    return value < 10 ? `0${value}` : value
  }
  /** 生成 年-月-日 */
  const transfromDate1 = `${judge('getFullYear')}-${judge(
    'getMonth',
    1
  )}-${judge('getDate')}`
  /** 生成 年-月-日 时:分:秒 */
  const transfromDate2 = `${transfromDate1} ${judge('getHours')}:${judge(
    'getMinutes'
  )}:${judge('getSeconds')}`

  return full ? transfromDate2 : transfromDate1
}

/** 获取一个指定长度的数组 */
export const getArr = length => {
  return Array(length)
    .fill(null)
    .map((_, index) => index)
}

/** 获取数组中的随机项 */
export const getArrRandom = (arr: any[], length = 1) => {
  if (!arr?.length) return []
  return getArr(length).map(() => {
    return arr[Math.ceil(Math.random() * (arr.length - 1))]
  })
}

/** 获取一个指定范围的随机数 */
export const getRandom = (max: number, min = 0) => {
  return min + Math.ceil(Math.random() * (max - min))
}

/** 获取一个20位长度的随机id */
export const getId = () => {
  return Math.random().toString().slice(2) + getRandom(9999)
}

/** 睡眠定时器，一般用于防止触发机器人验证或等待节点加载 */
export const sleep = time => new Promise(resolve => setTimeout(resolve, time))

/** 定时检测器 */
export const inspectTimer = (
  callback: (count: number) => boolean,
  options?: { time: number; maxCount: number }
) => {
  const { time = 10, maxCount = 100 } = options || {}

  return new Promise<void>(resolve => {
    let count = 0

    const timer = setInterval(() => {
      const done = () => {
        clearInterval(timer)
        resolve()
      }

      count++
      try {
        if (callback(count) || count > maxCount) done()
      } catch (e) {
        done()
        console.error('inspectTimer 出错', e)
      }
    }, time)
  })
}

/** 转换 url query 参数 */
export const urlQuery = {
  /** 获取当前 url query数据 */
  getQuery: () => {
    const query = urlQuery.parse(location?.search) || {}
    return query
  },

  /** 将 url 中 query 参数提取出来 */
  parse: url => {
    const queryString = url.split('?')[1] || url.split('?')[0]

    return queryString.split('&').reduce((query, item) => {
      const [key, value] = item.split('=').map(decodeURIComponent)

      if (key) {
        query[key] = value
        return query
      }
    }, {})
  },

  /** 将对象拼接为 queryString */
  stringify: (query, url?) => {
    const queryString = Object.keys(query)
      .map(
        key => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`
      )
      .join('&')

    return url ? `${url}?${queryString}` : queryString
  },
}
