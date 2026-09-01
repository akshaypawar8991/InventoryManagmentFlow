namespace InventoryManagement.API.Models
{
    public class StockRequest
    {
        public int Id { get; set; }
        public Guid EmployeeId { get; set; }
        public int ItemId { get; set; }
        public int RequestedQty { get; set; }
        public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected, Assigned, OnHold
        public string Reason { get; set; } = string.Empty;
        public DateTime RequestDate { get; set; } = DateTime.Now;
        public Guid? ApprovedBy { get; set; }
        public DateTime? ApprovedDate { get; set; }
        public Guid? AssignedBy { get; set; }
        public DateTime? AssignedDate { get; set; }
    }
}