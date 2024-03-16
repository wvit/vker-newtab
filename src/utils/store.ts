import { StoreHandle, IDB } from '@/vtil'

/** 实例化数据库 */
const db = new IDB({
  name: 'vker-newtab',
  storeNames: ['layouts'] as const,
})

/** 生成数据表的操作方法 */
export const { storeHandles } = new StoreHandle({ db })
