namespace HRM_Domain.Enums
{
    public enum ExplanationStatus
    {
        PendingManager = 1, // Đang chờ Quản lý duyệt
        PendingHR = 2,      // Quản lý đã duyệt -> Đang chờ HR chốt
        Approved = 3,       // Đã duyệt (Cập nhật công thành công)
        Rejected = 4        // Bị từ chối (Bởi Manager hoặc HR)
    }
}