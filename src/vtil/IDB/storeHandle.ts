import { getDate } from '../utils'
import type {
  PagingValue,
  StoreAllValue,
  StoreHandleOptions,
  GetPageDataOptions,
  StoreHandles,
} from './interface'

/** 数据表操作方法 */
export class StoreHandle<T extends string[]> {
  constructor(options: StoreHandleOptions<T>) {
    this.options = options || {}
  }

  /** 实例化参数 */
  options = {} as StoreHandleOptions<T>

  /** 获取数据表可操作的方法 */
  get storeHandles() {
    const { storeNames } = this.options.db?.options || {}
    const handles = {} as StoreHandles.Handles<T[number]>

    storeNames?.forEach(key => {
      handles[key] = {
        add: data => this.createData(key, data),
        delete: id => this.deleteData(key, id),
        clear: () => this.deleteData(key),
        edit: data => this.createData(key, data),
        getPage: query => this.getPageData(key, { query }),
        getAll: () => this.getStoreAllData(key),
      }
    })

    return handles
  }

  /** 向数据表新增数据，如果数据id存在，就更改数据 */
  async createData(storeName, data) {
    const store = await this.getObjectStore(storeName)
    const addData = Array.isArray(data) ? data.pop() : data
    const findData = store.get(addData.id)

    return new Promise<boolean>(resolve => {
      findData.onsuccess = () => {
        let request = null as unknown as IDBRequest<IDBValidKey>

        if (findData.result) {
          request = store.put({ ...findData.result, ...addData })
        } else {
          request = store.add(this.getCreateData(addData))
        }

        request.onsuccess = () => {
          if (data.length) this.createData(storeName, data)
          resolve(true)
        }
      }
    })
  }

  /** 删除数据表中的数据 */
  async deleteData(storeName, id?) {
    const store: IDBObjectStore = await this.getObjectStore(storeName)
    await (id ? store.delete(id) : store.clear())
    return true
  }

  /** 获取所有数据 */
  async getStoreAllData(storeName) {
    const store: IDBObjectStore = await this.getObjectStore(storeName)
    const data: StoreAllValue = { total: 0, list: [] }

    return await new Promise<StoreAllValue>(resolve => {
      store.getAll().onsuccess = e => {
        const { result } = e.target as IDBRequest
        data.total = result.length
        data.list = result
        resolve(data)
      }
    })
  }

  /** 获取分页数据 */
  async getPageData(storeName, options: GetPageDataOptions) {
    const { query, indexName = 'keyword', direction = 'prev' } = options
    const store: IDBObjectStore = await this.getObjectStore(storeName)
    const { pageNo, pageSize, keyword = '' } = query
    const [startPage, endPage] = [(pageNo - 1) * pageSize, pageNo * pageSize]
    const data: PagingValue = { pages: 0, total: 0, list: [] }
    let advanced = false
    let index = 0

    await new Promise<void>(resolve => {
      store.count().onsuccess = e => {
        const { result } = e.target as IDBRequest
        data.pages = Math.ceil(result / pageSize)
        data.total = result
        resolve()
      }
    })

    return new Promise<PagingValue>(resolve => {
      const queryStore = indexName === null ? store : store.index(indexName)

      /** 分页数据只能通过 游标 的方法获取 */
      queryStore.openCursor(null, direction).onsuccess = e => {
        const { result } = e.target as IDBRequest

        if (!advanced && startPage) {
          advanced = true
          result.advance(startPage)
        } else if (index < endPage && result) {
          const { value, key } = result
          if (`${key}`.indexOf(keyword) !== -1) {
            index++
            data.list.push(value)
          }
          result.continue()
        } else {
          resolve(data)
        }
      }
    })
  }

  /** 新建数据添加公共字段 */
  getCreateData(data) {
    const id = Date.now()
    return {
      id: id.toString(),
      createDate: getDate({ time: id, full: true }),
      ...data,
    }
  }

  /** 检查数据表是否准备完毕 */
  async inspectStoreMounted() {
    return new Promise<void>(resolve => {
      const inspectTimer = setInterval(() => {
        const { options, dataBase } = this.options?.db || {}

        /** 判断数据表是否都已经创建完毕 */
        if (options?.storeNames.length !== dataBase?.objectStoreNames.length) {
          return
        }
        clearInterval(inspectTimer)
        resolve()
      }, 5)
    })
  }

  /** 获取数据表对象容器 */
  async getObjectStore(storeName) {
    await this.inspectStoreMounted()
    const { dataBase } = this.options?.db || {}
    return dataBase.transaction([storeName], 'readwrite').objectStore(storeName)
  }
}
