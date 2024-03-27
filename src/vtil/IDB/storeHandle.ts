import type { Handle } from './handle'
import type {
  PagingValue,
  StoreAllValue,
  GetPageDataOptions,
  StoreHandles,
} from './interface'

export interface StoreHandle<T extends string[] = string[]> {
  /** 数据表可操作的方法 */
  storeHandles: StoreHandles<T[number]>
}

/** 数据表操作方法 */
export const storeHandle = () => {
  return (DBHandle: typeof Handle) => {
    return class extends DBHandle implements StoreHandle {
      /** 数据表可操作的方法 */
      get storeHandles() {
        const { storeNames } = this.getDb('options') || {}
        const handles = {} as StoreHandles

        storeNames?.forEach(name => {
          handles[name] = {
            create: data => this.createUpdate(name, data),
            update: data => this.createUpdate(name, data),

            batchCreate: data => this.batchCreateUpdate(name, data),
            batchUpdate: data => this.batchCreateUpdate(name, data),

            delete: id => this.delete(name, id),
            deleteAll: () => this.deleteAll(name),

            detail: id => this.getDetail(name, id),
            getPage: query => this.getPage(name, { query }),
            getAll: () => this.getAll(name),

            onChange: callback => this.onChange(name, callback),
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
                this.runChangeEvents(storeName, {
                  action: 'createUpdate',
                  changeData: data,
                })
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

        this.runChangeEvents(storeName, {
          action: 'batchCreateUpdate',
          changeData: data,
        })

        return true
      }

      /** 删除数据表中的数据 */
      async delete(storeName, id) {
        const store = await this.getObjectStore(storeName)

        await store.delete(id)
        this.runChangeEvents(storeName, { action: 'delete', changeData: id })

        return true
      }

      /** 删除数据表中的所有数据 */
      async deleteAll(storeName) {
        const store = await this.getObjectStore(storeName)

        await store.clear()
        this.runChangeEvents(storeName, { action: 'deleteAll' })

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
        const store = await this.getObjectStore(storeName)
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
        const store = await this.getObjectStore(storeName)
        const { pageNo, pageSize, keyword = '' } = query
        const [startPage, endPage] = [
          (pageNo - 1) * pageSize,
          pageNo * pageSize,
        ]
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
    } as typeof Handle
  }
}
