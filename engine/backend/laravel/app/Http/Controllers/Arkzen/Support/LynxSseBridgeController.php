<?php

// ============================================================
// ARKZEN ENGINE — SHARED LYNX SSE BRIDGE v1.0 (hand-written)
//
// One copy of the polling/streaming logic, reused by every
// generated SseController. SseBridgeBuilder.php (Phase 9 of the
// build pipeline) emits a small subclass per tatemono that fills
// in $model / $eventNameMap / $channelTypeColumn — see
// app/Arkzen/Builders/SseBridgeBuilder.php.
//
// Do NOT put per-tatemono logic here. If a tatemono needs custom
// filtering, override resolveChannelQuery() in its generated
// subclass instead of editing this file.
//
// Why this exists: Lynx has no WebSocket support, only
// EventSource/SSE and streaming fetch() (lynxjs.org/guide/
// interaction/networking). Reverb only speaks Pusher-over-
// WebSocket, so Lynx can't talk to it directly the way web/Expo
// do. This bridge polls the model's table and re-emits new rows
// as SSE frames shaped like the matching Reverb broadcast.
// ============================================================

namespace App\Http\Controllers\Arkzen\Support;

use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

abstract class LynxSseBridgeController extends Controller
{
    /** Fully-qualified Eloquent model class to poll. */
    protected string $model;

    /** ['public' => 'slug.event-name', 'private' => '...', 'presence' => '...'] */
    protected array $eventNameMap;

    /** Column used to distinguish channel type rows. Override if schema differs. */
    protected string $channelTypeColumn = 'channel_type';

    private const POLL_INTERVAL_US   = 1_000_000; // 1s
    private const MAX_STREAM_SECONDS = 55;

    public function stream(Request $request, string $channelType): StreamedResponse
    {
        if (!in_array($channelType, ['public', 'private', 'presence'], true)) {
            abort(404);
        }

        if ($channelType !== 'public' && !$request->user()) {
            abort(401);
        }

        $lastId = (int) ($request->header('Last-Event-ID') ?? $request->query('after_id', 0));

        $response = new StreamedResponse(function () use ($request, $channelType, $lastId) {
            $startedAt = microtime(true);
            $cursorId  = $lastId;

            echo ": connected\n\n";
            flush();

            while (true) {
                if (connection_aborted()) {
                    break;
                }

                $newRows = $this->resolveChannelQuery($request, $channelType)
                    ->where('id', '>', $cursorId)
                    ->orderBy('id')
                    ->get();

                foreach ($newRows as $row) {
                    $cursorId = $row->id;

                    $payload = json_encode([
                        'event' => $this->eventNameMap[$channelType] ?? null,
                        'data'  => $row->toArray(),
                    ]);

                    echo "id: {$row->id}\n";
                    echo "event: message\n";
                    echo "data: {$payload}\n\n";
                }

                if (!empty($newRows)) {
                    flush();
                }

                if (microtime(true) - $startedAt > self::MAX_STREAM_SECONDS) {
                    break; // EventSource auto-reconnects on close
                }

                usleep(self::POLL_INTERVAL_US);
            }
        });

        $response->headers->set('Content-Type', 'text/event-stream');
        $response->headers->set('Cache-Control', 'no-cache');
        $response->headers->set('X-Accel-Buffering', 'no');
        $response->headers->set('Connection', 'keep-alive');

        return $response;
    }

    /**
     * One-shot JSON poll — safe fallback for runtimes that can't
     * reliably stream a fetch() response body (Lynx's main-thread
     * fetch streaming support is unconfirmed; this only depends on
     * a plain request/response cycle, identical to every other
     * arkzenFetch call already proven to work in the app).
     *
     * GET /api/{slug}/sse-poll/{channelType}?after_id=N
     * → { messages: [...], last_id: N }
     */
    public function poll(Request $request, string $channelType)
    {
        if (!in_array($channelType, ['public', 'private', 'presence'], true)) {
            abort(404);
        }

        if ($channelType !== 'public' && !$request->user()) {
            abort(401);
        }

        $afterId = (int) $request->query('after_id', 0);

        $rows = $this->resolveChannelQuery($request, $channelType)
            ->where('id', '>', $afterId)
            ->orderBy('id')
            ->limit(50)
            ->get();

        $lastId = $rows->isEmpty() ? $afterId : (int) $rows->last()->id;

        return response()->json([
            'messages' => $rows->map(fn ($row) => [
                'event' => $this->eventNameMap[$channelType] ?? null,
                'data'  => $row->toArray(),
            ])->values(),
            'last_id' => $lastId,
        ]);
    }

    /**
     * Default channel filter: public = column is 'public' or null,
     * private/presence = exact column match. Override in a generated
     * subclass if a tatemono's schema differs.
     */
    protected function resolveChannelQuery(Request $request, string $channelType): Builder
    {
        $col = $this->channelTypeColumn;

        return $this->model::query()->where(function (Builder $q) use ($col, $channelType) {
            if ($channelType === 'public') {
                $q->where($col, 'public')->orWhereNull($col);
            } else {
                $q->where($col, $channelType);
            }
        });
    }
}
