using HRM_Application.Commons.Pagination;
using Microsoft.EntityFrameworkCore;

namespace HRM_Infrastructure.Extensions
{
    public static class PaginationExtensions
    {
        public static async Task<PagedResponse<T>> ToPagedListAsync<T>(
            this IQueryable<T> source,
            int pageNumber,
            int pageSize)
        {
            var count = await source.CountAsync();
            var items = await source
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PagedResponse<T>(items, pageNumber, pageSize, count);
        }
    }
}