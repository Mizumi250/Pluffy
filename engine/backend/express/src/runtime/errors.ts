// Exceptions that map to Laravel's default JSON error responses.
export class HttpException extends Error {
  constructor(public status: number, message = '', public headers: Record<string, string> = {}) { super(message) }
}
export class ValidationException extends Error {
  constructor(public errors: Record<string, string[]>) {
    super('The given data was invalid.')
  }
  static withMessages(errors: Record<string, string | string[]>) {
    const out: Record<string, string[]> = {}
    for (const [k, v] of Object.entries(errors)) out[k] = Array.isArray(v) ? v : [v]
    return new ValidationException(out)
  }
  summary(): string {
    const all = Object.values(this.errors).flat()
    const extra = all.length - 1
    return extra > 0 ? `${all[0]} (and ${extra} more error${extra > 1 ? 's' : ''})` : (all[0] ?? this.message)
  }
}
export class AuthenticationException extends Error { constructor() { super('Unauthenticated.') } }
export class AuthorizationException  extends Error { constructor(message = 'This action is unauthorized.') { super(message) } }
export class ModelNotFoundException  extends Error {
  constructor(public model: string, public ids: unknown[] = []) {
    super(`No query results for model [${model}]${ids.length ? ' ' + ids.join(', ') : ''}`)
  }
}
export const abort = (status: number, message = ''): never => { throw new HttpException(status, message) }
