using AutoMapper;
using HRM_Application.Commons.Pagination;
using HRM_Application.Contracts.Repositories;
using HRM_Application.Contracts.Services;
using HRM_Application.DTOs.PublicHoliday.Responses;
using HRM_Application.DTOs.Shift.Requests;
using HRM_Application.DTOs.Shift.Responses;
using HRM_Domain.Entities.TimeAttendance;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.Services.TimeAttendance
{
    public class ShiftService : IShiftService
    {
        private readonly IShiftRepository _repository;
        private readonly IMapper _mapper;
        public ShiftService(IShiftRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }
        public async Task CreateShiftAsync(CreateShiftRequest request)
        {
            var shiftEntity = _mapper.Map<ShiftConfig>(request);
            await _repository.AddShiftAsync(shiftEntity);
        }

        public async Task DeleteShiftAsync(int id)
        {
            var shiftEntity = await _repository.GetShiftByIdAsync(id);
            if (shiftEntity == null)
            {
                throw new KeyNotFoundException($"Không tìm thấy Ca làm việc với ID: {id}");
            }
            else
            {
                await _repository.DeleteShiftAsync(id);
            }
        }

        public async Task<PagedResponse<ShiftResponse>> GetAllShiftsAsync(PaginationFilter filter)
        {
            var shifts = await _repository.GetAllShiftsAsync(filter);
            var result = _mapper.Map<List<ShiftResponse>>(shifts.Data);

            return new PagedResponse<ShiftResponse>(
                result,
                shifts.PageNumber,
                shifts.PageSize,
                shifts.TotalRecords);
        }

        public async Task<ShiftResponse?> GetShiftByIdAsync(int id)
        {
            var shiftEntity = await _repository.GetShiftByIdAsync(id);
            if (shiftEntity == null)
            {
                throw new KeyNotFoundException($"Không tìm thấy Ca làm việc với ID: {id}");
            }
            return _mapper.Map<ShiftResponse>(shiftEntity);
        }

        public async Task UpdateShiftAsync(int id, CreateShiftRequest request)
        {
            var shiftEntity = await _repository.GetShiftByIdAsync(id);
            if (shiftEntity == null)
            {
                throw new KeyNotFoundException($"Không tìm thấy ngày Ca làm việc với ID: {id}");
            }

            _mapper.Map(request, shiftEntity);

            await _repository.UpdateShiftAsync(shiftEntity);
        }
    }
}
