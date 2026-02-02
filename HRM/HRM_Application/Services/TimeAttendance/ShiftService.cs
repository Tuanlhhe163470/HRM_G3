using AutoMapper;
using HRM_Application.Contracts.Repositories;
using HRM_Application.Contracts.Services;
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

        public Task<bool> DeleteShiftAsync(int id)
        {
            throw new NotImplementedException();
        }

        public async Task<List<ShiftResponse>> GetAllShiftsAsync()
        {
            var shifts = await _repository.GetAllShiftsAsync();
            var result = _mapper.Map<List<ShiftResponse>>(shifts);

            return result;
        }

        public Task<ShiftResponse?> GetShiftByIdAsync(int id)
        {
            throw new NotImplementedException();
        }

        public Task<ShiftResponse?> UpdateShiftAsync(int id, CreateShiftRequest request)
        {
            throw new NotImplementedException();
        }
    }
}
