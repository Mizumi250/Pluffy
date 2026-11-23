using System.Text.Json.Nodes;
using Pluff.AspNet.Runtime;
var vectors = JsonNode.Parse(File.ReadAllText(args[0]))!.AsArray();
int bad = 0;
foreach (var item in vectors)
{
    var v = item!.AsObject();
    var input = v.TryGetPropertyValue("data", out var d) && d is JsonObject dobj ? (JsonObject)dobj.DeepClone() : new JsonObject();
    var exists = v.ContainsKey("value");
    JsonNode? value = null;
    if (exists) { value = v["value"]?.DeepClone(); input["field"] = value?.DeepClone(); }
    var errors = RuleEngine.ValidateField("field", input, exists, value, v["rule"]!.GetValue<string>());
    var passed = errors.Count == 0;
    if (passed != v["pass"]!.GetValue<bool>()) { bad++; Console.WriteLine($"MISMATCH rule={v["rule"]} value={(exists ? v["value"]?.ToJsonString() ?? "null" : "<missing>")} data={v["data"]?.ToJsonString()} expected pass={v["pass"]} got={string.Join("|", errors)}"); }
}
Console.WriteLine($"aspnet: {vectors.Count - bad}/{vectors.Count} vectors agree");
Environment.Exit(bad == 0 ? 0 : 1);
