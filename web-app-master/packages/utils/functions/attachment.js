export const getReadableSize = (size_in_bytes) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  if (size_in_bytes === 0) {
    return 'N/A'
  }
  const i = parseInt(Math.floor(Math.log(size_in_bytes) / Math.log(1024)), 10)
  if (i === 0) {
    return `${size_in_bytes} ${sizes[i]})`
  }
  return `${(size_in_bytes / (1024 ** i)).toFixed(1)} ${sizes[i]}`
}
