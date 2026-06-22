export function logger(req, res, next) {
  const horario = new Date().toISOString()
  console.log(`[${horario}] ${req.method} ${req.url}`)
  next()
}
