export function exportCsv(filename: string, rows: Array<Record<string, any>>) {
  if (!rows || rows.length === 0) return
  const header = Object.keys(rows[0])
  const csv = [header.join(',')].concat(rows.map(r => header.map(h => JSON.stringify(r[h] ?? '')).join(','))).join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
