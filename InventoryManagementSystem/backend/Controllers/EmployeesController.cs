using InventoryManagement.API.Data;
using InventoryManagement.API.DTOs;
using InventoryManagement.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InventoryManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmployeesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EmployeesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var employees = await _context.Employees
                .Select(e => new { e.Id, e.Name, e.Email, e.Role, e.EmpCode, e.ManagerId })
                .ToListAsync();

            return Ok(employees);
        }

        [HttpGet("managers")]
        public async Task<IActionResult> GetManagers()
        {
            var managers = await _context.Employees
                .Where(e => e.Role == "Manager")
                .Select(e => new { e.Id, e.Name })
                .ToListAsync();

            return Ok(managers);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateEmployeeDto dto)
        {
            var existing = await _context.Employees.FirstOrDefaultAsync(e => e.Email == dto.Email);
            if (existing != null)
                return BadRequest("Email already exists.");

            var employee = new Employee
            {
                Name = dto.Name,
                Email = dto.Email,
                Role = dto.Role,
                EmpCode = dto.EmpCode,
                ManagerId = dto.Role == "Employee" ? dto.ManagerId : null,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
            };

            _context.Employees.Add(employee);
            await _context.SaveChangesAsync();

            return Ok(new { employee.Id, employee.Name, employee.Email, employee.Role, employee.EmpCode });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, UpdateEmployeeDto dto)
        {
            var employee = await _context.Employees.FindAsync(id);
            if (employee == null) return NotFound();

            employee.Name = dto.Name;
            employee.Email = dto.Email;
            employee.Role = dto.Role;
            employee.EmpCode = dto.EmpCode;
            employee.ManagerId = dto.Role == "Employee" ? dto.ManagerId : null;

            await _context.SaveChangesAsync();
            return Ok(employee);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var employee = await _context.Employees.FindAsync(id);
            if (employee == null) return NotFound();

            _context.Employees.Remove(employee);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Employee deleted" });
        }
    }
}