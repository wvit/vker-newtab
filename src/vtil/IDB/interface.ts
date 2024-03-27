import type { IDB } from './index'

/** 实例化IDB配置 */
export interface IDBOptions<T extends string[], K extends string[]> {
  /** 数据库名称 */
  name: string
  /** 需要创建的数据表 */
  storeNames: T
  /** 需要创建的对象存储器 */
  objectNames: K
}

/** 实例化数据表操作方法参数 */
export interface DBHandleOptions<T extends string[], K extends string[]> {
  /** 数据库实例 */
  db: IDB<T, K>
}

/** 公共操作方法 */
export type CommonHandles = {
  /** 监听数据发生变化 */
  onChange: <T extends (changeData: any) => void>(
    callback: T
  ) => {
    id: string
    callback: T
    remove: () => void
  }
}

/** 数据表提供的增删改查方法 */
export type StoreHandles<T extends string = string> = Record<
  T,
  {
    /** 添加数据 */
    create: (data: any) => Promise<boolean>
    /** 更新数据 */
    update: (data: any) => Promise<boolean>

    /** 批量添加数据 */
    batchCreate: (data: any[]) => Promise<boolean>
    /** 批量更新数据 */
    batchUpdate: (data: any[]) => Promise<boolean>

    /** 删除数据 */
    delete: (id: string) => Promise<boolean>
    /** 删除所有数据 */
    deleteAll: () => Promise<boolean>

    /** 获取数据详情 */
    detail: (id: string) => Promise<any>
    /** 获取查询条件的分页数据 */
    getPage: (query: Query) => Promise<PagingValue>
    /** 获取查询条件的所有数据 */
    getAll: () => Promise<StoreAllValue>
  } & CommonHandles
>

/** 数据对象提供的操作方法 */
export type ObjectHandles<T extends string = string> = Record<
  T,
  {
    /** 获取对象字段值 */
    get: <K extends string | string[]>(
      key?: K
    ) => Promise<Record<K[number], any>>
    /** 设置对象字段值 */
    set: (data: Record<string, any>) => Promise<boolean>
  } & CommonHandles
>

/** 查询 */
export interface Query {
  /** 页码 */
  pageNo: number
  /** 分页数量 */
  pageSize: number
  /** 搜索关键字 */
  keyword?: string
}

/** 查询的分页数据结果 */
export interface PagingValue<Item = any> {
  /** 总页数 */
  pages: number
  /** 总数 */
  total: number
  /** 查询到的分页结果 */
  list: Item[]
}

/** 所有数据 */
export interface StoreAllValue<Item = any> {
  /** 总数 */
  total: number
  /** 所有数据 */
  list: Item[]
}

/** 新建数据表 */
export interface CreateStoreData {
  /** 数据表名称 */
  storeName: string
  /** 数据表名称 */
  options?: IDBObjectStoreParameters
  /** 索引配置 */
  indexs?: {
    /** 索引名称 */
    indexName: string
    /** 索引对应字段 */
    fieldName: string | string[]
    /** 其他参数 */
    params?: IDBIndexParameters
  }[]
}

/** 删除数据表 */
export interface DeleteStoreData {
  /** 数据表名称 */
  storeName: string
}

/** 获取分页数据，option入参类型 */
export interface GetPageDataOptions {
  /** 查询条件 */
  query: Query
  /** 索引名称 */
  indexName?: null | string
  /** 数据排序 */
  direction?: IDBCursorDirection
}
