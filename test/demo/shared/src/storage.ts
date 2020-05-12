/**
 * 存 localStorage
 * @param key key
 * @param value value
 * @public
 */
export function setStorageItem(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

/**
 * 取 localStorage
 * @param key key
 * @public
 */
export function getStorageItem(key: string) {
  try {
    return localStorage.getItem(key) || null
  } catch (error) {
    console.error(error)
    return null
  }
}

/**
 * 取 localStorage
 * @param key key
 * @public
 */
export function removeStorageItem(key: string) {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error(error)
  }
}

/**
 * ItemStorage
 */
export class ItemStorage<T = any> {
  public key: string = ''
  private cacheValue: T | null = null
  /**
   * 创建 ItemStorage
   * @param prefix 前缀
   * @param key 标识
   */
  constructor(prefix: string, key: string) {
    this.key = `${prefix}:${key}`
  }
  /**
   * 存入 localStorage
   * @param value
   */
  setItem(value: T) {
    this.cacheValue = value
    return setStorageItem(this.key, JSON.stringify({ value: value }))
  }
  /**
   * 取出 localStorage
   */
  getItem() {
    if (this.cacheValue) {
      return this.cacheValue
    }
    const refValueString = getStorageItem(this.key)
    const refValue = JSON.parse(refValueString || `{"value":null}`)
    return refValue.value as T | null
  }
  /**
   * 移除
   */
  removeItem() {
    removeStorageItem(this.key)
  }
}

/**
 * StorageTable 缓存
 */
export class TableStorage {
  data: Array<any>
  table: string
  /**
   * StorageTable
   * @param table 表名
   */
  constructor(table: string) {
    this.data = JSON.parse(getStorageItem(table) || '[]')
    this.table = table
  }
  /**
   * set
   * @param key 键
   * @param value 值
   * @public
   */
  set(key: string, value: any) {
    this.remove(key)
    const valueObj = {
      __id__: key,
      __object__: typeof value === 'object',
      value: value
    }
    this.data.push(valueObj)
    setStorageItem(this.table, JSON.stringify(this.data))
  }
  /**
   * key
   * @param key 键
   * @public
   */
  get(key: string) {
    const item = this.data.find(item => item.__id__ === key)
    if (item) {
      return item.value
    }
    return null
  }
  /**
   * remove
   * @param keys
   * @public
   */
  remove(...keys: string[]) {
    this.data = this.data.filter(item => keys.indexOf(item.__id__) === -1)
    setStorageItem(this.table, JSON.stringify(this.data))
  }
  /**
   * clear
   * @public
   */
  clear() {
    this.data = []
    setStorageItem(this.table, JSON.stringify([]))
  }
}
