using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Domain.Entities
{
    public class CourseMaterial
    {
        [Key]
        public int MaterialID { get; set; }

        public int CourseID { get; set; }
        [ForeignKey("CourseID")]
        public virtual TrainingCourse? TrainingCourse { get; set; }

        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [StringLength(10)]
        public string Type { get; set; } = "Video";

        [StringLength(500)]
        public string FileUrl { get; set; } = string.Empty;

        public int OrderIndex { get; set; }
    }
}
