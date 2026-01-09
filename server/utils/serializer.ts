
export function serializeData(data: any): any {
  if (data === null || data === undefined) return data
  
  // BigInt handling
  if (typeof data === 'bigint') return data.toString()
  
  // Date conversion
  if (data instanceof Date) return data.toISOString()
  
  // Recursion
  if (Array.isArray(data)) {
    return data.map(item => serializeData(item))
  }
  
  if (typeof data === 'object') {
    return Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, serializeData(v)])
    )
  }
  
  return data
}
