using Pluff.AspNet.Engine;

namespace Pluff.AspNet.Runtime;

/// <summary>
/// Runs console commands that declare a cron `schedule:` (the Laravel scheduler equivalent).
/// Ticks once a second and fires each matching command at most once per minute, in-process.
/// </summary>
public sealed class CommandScheduler : BackgroundService
{
    private readonly BackendEngine _engine;

    public CommandScheduler(BackendEngine engine) => _engine = engine;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var lastMinute = DateTimeOffset.MinValue;
        using var timer = new PeriodicTimer(TimeSpan.FromSeconds(1));
        try
        {
            do
            {
                var now = DateTimeOffset.Now;
                var minute = new DateTimeOffset(now.Year, now.Month, now.Day, now.Hour, now.Minute, 0, now.Offset);
                if (minute == lastMinute) continue;
                lastMinute = minute;
                try
                {
                    _engine.RunScheduledConsoles(minute);
                }
                catch (Exception exception)
                {
                    Console.Error.WriteLine($"[ASP.NET scheduler] {exception}");
                }
            }
            while (await timer.WaitForNextTickAsync(stoppingToken));
        }
        catch (OperationCanceledException)
        {
            // shutting down
        }
    }
}
