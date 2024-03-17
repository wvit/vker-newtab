import { getDate, getId, inspectTimer } from '../utils'
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

  /** 监听数据发生改变的事件 */
  changeEvents = [] as { id: string; callback: (e: any) => any }[]

  /** 获取数据表可操作的方法 */
  get storeHandles() {
    const { storeNames } = this.getDb('options') || {}
    const handles = {} as StoreHandles.Handles<T[number]>

    storeNames?.forEach(key => {
      handles[key] = {
        create: data => this.createUpdate(key, data),
        update: data => this.createUpdate(key, data),

        batchCreate: data => this.batchCreateUpdate(key, data),
        batchUpdate: data => this.batchCreateUpdate(key, data),

        delete: id => this.delete(key, id),
        deleteAll: () => this.deleteAll(key),

        detail: id => this.getDetail(key, id),
        getPage: query => this.getPage(key, { query }),
        getAll: () => this.getAll(key),

        onChange: callback => {
          const event = { id: getId(), callback }
          this.changeEvents.push(event)
          return {
            ...event,
            remove: () => this.removeChangeEvent(event.id),
          }
        },
      }
    })

    return handles
  }

  /** 向数据表新增数据，如果数据id存在，就更改数据 */
  async createUpdate(storeName, data, batchCall?) {
    const store = await this.getObjectStore(storeName)
    const findData = store.get(data.id)

    return new Promise<boolean>(resolve => {
      findData.onsuccess = () => {
        let request = null as unknown as IDBRequest<IDBValidKey>

        if (findData.result) {
          request = store.put({ ...findData.result, ...data })
        } else {
          request = store.add(this.getCreateData(data))
        }

        request.onsuccess = () => {
          if (!batchCall) {
            this.runChangeEvents({ action: 'createUpdate', changeData: data })
          }
          resolve(true)
        }
      }
    })
  }

  /** 批量新建或更新数据 */
  async batchCreateUpdate(storeName, data) {
    for (const item of data) {
      await this.createUpdate(storeName, item, true)
    }
    this.runChangeEvents({ action: 'batchCreateUpdate', changeData: data })

    return true
  }

  /** 删除数据表中的数据 */
  async delete(storeName, id) {
    const store: IDBObjectStore = await this.getObjectStore(storeName)

    await store.delete(id)
    this.runChangeEvents({ action: 'delete', changeData: id })

    return true
  }

  /** 删除数据表中的所有数据 */
  async deleteAll(storeName) {
    const store: IDBObjectStore = await this.getObjectStore(storeName)

    await store.clear()
    this.runChangeEvents({ action: 'deleteAll' })

    return true
  }

  /** 获取数据项详情数据 */
  async getDetail(storeName, id?) {
    const store = await this.getObjectStore(storeName)
    const findData = store.get(id)

    return new Promise<any>(resolve => {
      findData.onsuccess = () => {
        resolve(findData.result || null)
      }
    })
  }

  /** 获取所有数据 */
  async getAll(storeName) {
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
  async getPage(storeName, options: GetPageDataOptions) {
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

  /** 移除 change 事件监听 */
  removeChangeEvent(id) {
    const findIndex = this.changeEvents.findIndex(item => item.id === id)
    this.changeEvents.splice(findIndex, 1)
  }

  /** 运行已监听的 change 事件 */
  runChangeEvents(eventData: { action: string; changeData?: any }) {
    this.changeEvents.forEach(item => {
      const { id, callback } = item
      callback?.({ id, ...eventData })
    })
  }

  /** 新建数据添加公共字段 */
  getCreateData(data) {
    return {
      id: getId(),
      createDate: getDate({ time: Date.now(), full: true }),
      ...data,
    }
  }

  /** 获取当前已创建的数据库属性值 */
  getDb<T extends keyof typeof this.options.db>(key: T | T[]) {
    if (typeof key === 'string') {
      return this.options?.db?.[key]
    } else {
      return key.map(this.getDb.bind(this))
    }
  }

  /** 获取数据表对象容器 */
  async getObjectStore(storeName) {
    /** 等待检查数据表是否都准备完毕 */
    await inspectTimer(() => {
      const [options, dbResult] = this.getDb(['options', 'dbResult'])
      return options?.storeNames?.length === dbResult?.objectStoreNames?.length
    })

    /** 等待检查是否没有正在进行中的事务 */
    await inspectTimer(() => {
      return !this.getDb('dbRequest')?.transaction?.mode
    })

    return this.getDb('dbResult')
      .transaction([storeName], 'readwrite')
      .objectStore(storeName) as IDBObjectStore
  }
}
