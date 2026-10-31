import type { Request } from './http'
import { AuthorizationException } from './errors'

/** $this->authorize('update', $model) equivalent. Policy methods receive (user | null, ...args). */
export async function authorize(request: Request, Policy: new () => any, ability: string, ...args: any[]): Promise<void> {
  const policy = new Policy()
  const fn = policy[ability]
  if (typeof fn !== 'function') throw new AuthorizationException()
  const ok = await fn.call(policy, request.user(), ...args)
  if (!ok) throw new AuthorizationException()
}
