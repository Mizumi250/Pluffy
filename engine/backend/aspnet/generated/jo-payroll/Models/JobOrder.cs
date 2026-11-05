namespace Pluff.AspNet.Generated.JoPayroll.Models;

public sealed class JobOrder
{
    public long? Id { get; init; }
    public long JorNumber { get; init; }
    public required string NameOfJo { get; init; }
    public required string JobTitle { get; init; }
    public required string Funding { get; init; }
    public decimal BasicPay { get; init; }
    public required string DisbursementType { get; init; }
    public string? JorPyrlGroup { get; init; }
    public string? HdmfNo { get; init; }
    public string? CashCard { get; init; }
    public string? CashCardNumber { get; init; }
    public string? SssNumber { get; init; }
    public decimal? SssAmount { get; init; }
    public decimal? CalamityLoan { get; init; }
    public decimal? HdmfMpl { get; init; }
    public decimal? HdmfPremium { get; init; }
    public string? LastName { get; init; }
    public string? FirstName { get; init; }
    public string? MiddleName { get; init; }
    public global::System.DateOnly? AppointmentDate { get; init; }
    public long? AppointmentOrder { get; init; }
    public required string Status { get; init; }
}
