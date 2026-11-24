using System.Globalization;

namespace Pluff.AspNet.Runtime;

/// <summary>
/// Five-field cron matching (minute hour day-of-month month day-of-week) with lists, ranges and steps.
/// Port of the Go engine's cronMatches (queue.go) so every backend reads schedules the same way.
/// </summary>
public static class CronSchedule
{
    private static readonly int[] Minimums = { 0, 0, 1, 1, 0 };
    private static readonly int[] Maximums = { 59, 23, 31, 12, 6 };

    public static bool Matches(string expression, DateTimeOffset now)
    {
        var fields = expression.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries);
        if (fields.Length != 5) return false;
        var values = new[] { now.Minute, now.Hour, now.Day, now.Month, (int)now.DayOfWeek };
        for (var index = 0; index < 5; index++)
        {
            if (!FieldMatches(fields[index], values[index], Minimums[index], Maximums[index])) return false;
        }
        return true;
    }

    private static bool FieldMatches(string expression, int value, int minimum, int maximum)
    {
        foreach (var part in expression.Split(','))
        {
            var stepParts = part.Split('/');
            var step = 1;
            if (stepParts.Length == 2)
            {
                if (!int.TryParse(stepParts[1], NumberStyles.None, CultureInfo.InvariantCulture, out step) || step < 1) continue;
            }
            else if (stepParts.Length != 1)
            {
                continue;
            }

            int from = minimum, to = maximum;
            if (stepParts[0] == "*")
            {
                // whole range
            }
            else if (stepParts[0].Contains('-'))
            {
                var bounds = stepParts[0].Split('-');
                if (bounds.Length != 2
                    || !int.TryParse(bounds[0], NumberStyles.None, CultureInfo.InvariantCulture, out from)
                    || !int.TryParse(bounds[1], NumberStyles.None, CultureInfo.InvariantCulture, out to)) continue;
            }
            else
            {
                if (!int.TryParse(stepParts[0], NumberStyles.None, CultureInfo.InvariantCulture, out from)) continue;
                to = from;
            }

            if (from < minimum || to > maximum || from > to || value < from || value > to) continue;
            if ((value - from) % step == 0) return true;
        }
        return false;
    }
}
