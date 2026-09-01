using InventoryManagement.API.Data;
using InventoryManagement.API.DTOs;
using InventoryManagement.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InventoryManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StockRequestsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public StockRequestsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var requests = await (from r in _context.StockRequests
                                  join e in _context.Employees on r.EmployeeId equals e.Id
                                  join i in _context.Items on r.ItemId equals i.Id
                                  orderby r.RequestDate descending
                                  select new
                                  {
                                      r.Id,
                                      r.EmployeeId,
                                      EmployeeName = e.Name,
                                      r.ItemId,
                                      ItemName = i.Name,
                                      r.RequestedQty,
                                      AvailableStock = i.Stock,
                                      r.Status,
                                      r.Reason,
                                      r.RequestDate,
                                      r.ApprovedBy,
                                      r.ApprovedDate
                                  }).ToListAsync();

            return Ok(requests);
        }

        [HttpGet("employee/{employeeId}")]
        public async Task<IActionResult> GetByEmployee(Guid employeeId)
        {
            var requests = await (from r in _context.StockRequests
                                  join i in _context.Items on r.ItemId equals i.Id
                                  where r.EmployeeId == employeeId
                                  orderby r.RequestDate descending
                                  select new
                                  {
                                      r.Id,
                                      r.ItemId,
                                      ItemName = i.Name,
                                      r.RequestedQty,
                                      AvailableStock = i.Stock,
                                      r.Status,
                                      r.Reason,
                                      r.RequestDate
                                  }).ToListAsync();

            return Ok(requests);
        }

        [HttpGet("pending")]
        public async Task<IActionResult> GetPending()
        {
            var requests = await (from r in _context.StockRequests
                                  join e in _context.Employees on r.EmployeeId equals e.Id
                                  join i in _context.Items on r.ItemId equals i.Id
                                  where r.Status == "Pending"
                                  orderby r.RequestDate descending
                                  select new
                                  {
                                      r.Id,
                                      r.EmployeeId,
                                      EmployeeName = e.Name,
                                      r.ItemId,
                                      ItemName = i.Name,
                                      r.RequestedQty,
                                      AvailableStock = i.Stock,
                                      r.Status,
                                      r.Reason,
                                      r.RequestDate
                                  }).ToListAsync();

            return Ok(requests);
        }

        [HttpGet("approved")]
        public async Task<IActionResult> GetApprovedForAssignment()
        {
            var requests = await (from r in _context.StockRequests
                                  join e in _context.Employees on r.EmployeeId equals e.Id
                                  join i in _context.Items on r.ItemId equals i.Id
                                  where r.Status == "Approved" || r.Status == "OnHold"
                                  orderby r.RequestDate
                                  select new
                                  {
                                      r.Id,
                                      r.EmployeeId,
                                      EmployeeName = e.Name,
                                      r.ItemId,
                                      ItemName = i.Name,
                                      r.RequestedQty,
                                      AvailableStock = i.Stock,
                                      r.Status,
                                      r.Reason,
                                      r.RequestDate,
                                      r.ApprovedDate
                                  }).ToListAsync();

            return Ok(requests);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateStockRequestDto dto)
        {
            var item = await _context.Items.FindAsync(dto.ItemId);
            if (item == null) return NotFound("Item not found.");

            var request = new StockRequest
            {
                EmployeeId = dto.EmployeeId,
                ItemId = dto.ItemId,
                RequestedQty = dto.RequestedQty,
                Reason = dto.Reason,
                Status = "Pending",
                RequestDate = DateTime.Now
            };

            _context.StockRequests.Add(request);

            _context.AuditLogs.Add(new AuditLog
            {
                Action = "New Request",
                PerformedBy = dto.EmployeeId.ToString(),
                Detail = $"{item.Name} x{dto.RequestedQty}",
                Timestamp = DateTime.Now
            });

            await _context.SaveChangesAsync();
            return Ok(request);
        }

        [HttpPost("bulk")]
        public async Task<IActionResult> CreateBulk(CreateBulkStockRequestDto dto)
        {
            var createdRequests = new List<StockRequest>();

            foreach (var itemDto in dto.Items)
            {
                var item = await _context.Items.FindAsync(itemDto.ItemId);
                if (item == null) continue;

                var request = new StockRequest
                {
                    EmployeeId = dto.EmployeeId,
                    ItemId = itemDto.ItemId,
                    RequestedQty = itemDto.RequestedQty,
                    Reason = itemDto.Reason,
                    Status = "Pending",
                    RequestDate = DateTime.Now
                };

                _context.StockRequests.Add(request);
                createdRequests.Add(request);

                _context.AuditLogs.Add(new AuditLog
                {
                    Action = "New Request",
                    PerformedBy = dto.EmployeeId.ToString(),
                    Detail = $"{item.Name} x{itemDto.RequestedQty}",
                    Timestamp = DateTime.Now
                });
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = $"{createdRequests.Count} requests submitted", requests = createdRequests });
        }

        [HttpPut("{id}/approve")]
        public async Task<IActionResult> Approve(int id, ReviewRequestDto dto)
        {
            var request = await _context.StockRequests.FindAsync(id);
            if (request == null) return NotFound("Request not found.");
            if (request.Status != "Pending") return BadRequest("Request already reviewed.");

            var item = await _context.Items.FindAsync(request.ItemId);
            if (item == null) return NotFound("Item not found.");

            request.Status = "Approved";
            request.ApprovedBy = dto.ReviewedBy;
            request.ApprovedDate = DateTime.Now;

            _context.AuditLogs.Add(new AuditLog
            {
                Action = "Request Approved",
                PerformedBy = dto.ReviewedBy.ToString(),
                Detail = $"{item.Name} x{request.RequestedQty} — awaiting assignment",
                Timestamp = DateTime.Now
            });

            await _context.SaveChangesAsync();
            return Ok(request);
        }

        [HttpPut("{id}/reject")]
        public async Task<IActionResult> Reject(int id, ReviewRequestDto dto)
        {
            var request = await _context.StockRequests.FindAsync(id);
            if (request == null) return NotFound("Request not found.");
            if (request.Status != "Pending") return BadRequest("Request already reviewed.");

            var item = await _context.Items.FindAsync(request.ItemId);

            request.Status = "Rejected";
            request.ApprovedBy = dto.ReviewedBy;
            request.ApprovedDate = DateTime.Now;

            _context.AuditLogs.Add(new AuditLog
            {
                Action = "Request Rejected",
                PerformedBy = dto.ReviewedBy.ToString(),
                Detail = $"{item?.Name} x{request.RequestedQty}",
                Timestamp = DateTime.Now
            });

            await _context.SaveChangesAsync();
            return Ok(request);
        }

        [HttpPut("{id}/assign")]
        public async Task<IActionResult> Assign(int id, AssignRequestDto dto)
        {
            var request = await _context.StockRequests.FindAsync(id);
            if (request == null) return NotFound("Request not found.");
            if (request.Status != "Approved" && request.Status != "OnHold")
                return BadRequest("Request must be Approved or OnHold to assign.");

            var item = await _context.Items.FindAsync(request.ItemId);
            if (item == null) return NotFound("Item not found.");

            if (item.Stock < request.RequestedQty)
                return BadRequest("Not enough stock to assign. Consider putting this on hold.");

            item.Stock -= request.RequestedQty;
            request.Status = "Assigned";
            request.AssignedBy = dto.AssignedBy;
            request.AssignedDate = DateTime.Now;

            _context.AuditLogs.Add(new AuditLog
            {
                Action = "Item Assigned",
                PerformedBy = dto.AssignedBy.ToString(),
                Detail = $"{item.Name} x{request.RequestedQty} issued to employee",
                Timestamp = DateTime.Now
            });

            await _context.SaveChangesAsync();
            return Ok(request);
        }

        [HttpPut("{id}/hold")]
        public async Task<IActionResult> Hold(int id, AssignRequestDto dto)
        {
            var request = await _context.StockRequests.FindAsync(id);
            if (request == null) return NotFound("Request not found.");
            if (request.Status != "Approved") return BadRequest("Only Approved requests can be put on hold.");

            var item = await _context.Items.FindAsync(request.ItemId);

            request.Status = "OnHold";

            _context.AuditLogs.Add(new AuditLog
            {
                Action = "Request On Hold",
                PerformedBy = dto.AssignedBy.ToString(),
                Detail = $"{item?.Name} x{request.RequestedQty} — insufficient stock",
                Timestamp = DateTime.Now
            });

            await _context.SaveChangesAsync();
            return Ok(request);
        }
    }
}