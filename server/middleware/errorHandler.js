export function errorHandler(err, req, res, next) {
  console.error(`[${req.method} ${req.url}] ${err.message}`)

  if (err.code === '23503') {
    return res.status(409).json({
      error: 'Nao foi possivel remover este registro porque ele esta sendo usado por outro',
    })
  }

  if (
    err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY' ||
    (err.code === 'SQLITE_CONSTRAINT' && err.message.includes('FOREIGN KEY'))
  ) {
    return res.status(409).json({
      error: 'Nao foi possivel remover este registro porque ele esta sendo usado por outro',
    })
  }

  if (err.code === '23505') {
    return res.status(409).json({
      error: 'Ja existe um registro com esse valor unico',
    })
  }

  if (
    err.code === 'SQLITE_CONSTRAINT_UNIQUE' ||
    (err.code === 'SQLITE_CONSTRAINT' && err.message.includes('UNIQUE'))
  ) {
    return res.status(409).json({
      error: 'Ja existe um registro com esse valor unico',
    })
  }

  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor',
  })
}
