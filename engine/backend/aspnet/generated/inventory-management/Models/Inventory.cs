namespace Pluff.AspNet.Generated.InventoryManagement.Models;

public sealed class Inventory
{
    public long? Id { get; init; }
    public required string Name { get; init; }
    public required string Sku { get; init; }
    public long Quantity { get; init; }
    public decimal Price { get; init; }
    public string? Category { get; init; }
    public string? Description { get; init; }
}
