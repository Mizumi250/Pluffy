// Lynx realtime poll: GET /api/<slug>/sse-poll/<public|private|presence>?after_id=N
//
// Same contract as Laravel's LynxSseBridgeController::poll(): 404 for an unknown channel type, 401 for
// private/presence without a user, public = channel_type 'public' or NULL, private/presence = exact
// match, ordered by id, 50 rows max, response { messages: [{ event, data }], last_id }.

const CHANNEL_TYPES = ['public', 'private', 'presence']

export async function pollBroadcastMessages(request: any, response: any, model: any, events: Record<string, string>, channelType: string) {
  if (!CHANNEL_TYPES.includes(channelType)) return response.json({ message: 'Not Found' }, 404)
  if (channelType !== 'public' && !(await request.authUser())) return response.json({ message: 'Unauthenticated.' }, 401)

  // PHP (int) cast semantics: junk or negative becomes 0
  const afterId = Math.max(Number.parseInt(String(request.query('after_id', 0)), 10) || 0, 0)

  let query = model.query()
  query = channelType === 'public'
    ? query.where((group: any) => group.where('channel_type', 'public').orWhere('channel_type', null))
    : query.where('channel_type', channelType)
  const rows = await query.where('id', '>', afterId).orderBy('id').limit(50).get()

  const data = rows.map((row: any) => row.toJSON())
  return response.json({
    messages: data.map((row: any) => ({ event: events[channelType] ?? null, data: row })),
    last_id: data.length ? Number(data[data.length - 1].id) : afterId,
  })
}
