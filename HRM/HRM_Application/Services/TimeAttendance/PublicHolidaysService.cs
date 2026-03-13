using AutoMapper;
using HRM_Application.Commons.Pagination;
using HRM_Application.Contracts.Repositories;
using HRM_Application.Contracts.Services;
using HRM_Application.DTOs.PublicHoliday.Requests;
using HRM_Application.DTOs.PublicHoliday.Responses;
using HRM_Application.DTOs.Shift.Responses;
using HRM_Domain.Entities;
using HRM_Domain.Entities.TimeAttendance;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Application.Services.TimeAttendance
{
    public class PublicHolidaysService : IPublicHolidayService
    {
        private readonly IPublicHolidayRepository _repository;
        private readonly IMapper _mapper;
        public PublicHolidaysService(IPublicHolidayRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }
        public async Task CreateHolidayAsync(CreatePublicHolidayRequest request)
        {
            var shiftEntity = _mapper.Map<PublicHoliday>(request);
            await _repository.AddPublicHolidayAsync(shiftEntity);
        }

        public async Task DeleteHolidayAsync(int id)
        {
            var publicHoliday = await _repository.GetPublicHolidayByIdAsync(id);
            if (publicHoliday == null)
            {
                throw new KeyNotFoundException($"Không tìm thấy ngày lễ với ID: {id}");
            } else {
                await _repository.DeletePublicHolidayAsync(id);
            }
        }

        public async Task<PagedResponse<PublicHolidayResponse>> GetAllHolidaysAsync(PaginationFilter filter)
        {
            var shifts = await _repository.GetAllPublicHolidaysAsync(filter);
            var result = _mapper.Map<List<PublicHolidayResponse>>(shifts.Data);

            return new PagedResponse<PublicHolidayResponse>(
                result,
                shifts.PageNumber,
                shifts.PageSize,
                shifts.TotalRecords);
        }

        public async Task<PublicHolidayResponse> GetHolidayByIdAsync(int id)
        {
            var publicHoliday = await _repository.GetPublicHolidayByIdAsync(id);
            if (publicHoliday == null)
            {
                throw new KeyNotFoundException($"Không tìm thấy ngày lễ với ID: {id}");
            }
            return _mapper.Map<PublicHolidayResponse>(publicHoliday);
        }

        public async Task UpdateHolidayAsync(int id, UpdatePublicHolidayRequest request)
        {
            var publicHoliday = await _repository.GetPublicHolidayByIdAsync(id);
            if (publicHoliday == null)
            {
                throw new KeyNotFoundException($"Không tìm thấy ngày lễ với ID: {id}");
            }

            _mapper.Map(request, publicHoliday);

            await _repository.UpdatePublicHolidayAsync(publicHoliday);
        }
    }
}
