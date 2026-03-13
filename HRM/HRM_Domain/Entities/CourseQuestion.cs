using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRM_Domain.Entities
{
    public class CourseQuestion
    {
        [Key]
        public int QuestionID { get; set; }

        public int CourseID { get; set; }
        [ForeignKey("CourseID")]
        public virtual TrainingCourse? TrainingCourse { get; set; }

        [StringLength(500)]
        public string QuestionText { get; set; } = string.Empty;

        [StringLength(200)]
        public string OptionA { get; set; } = string.Empty;
        [StringLength(200)]
        public string OptionB { get; set; } = string.Empty;
        [StringLength(200)]
        public string OptionC { get; set; } = string.Empty;
        [StringLength(200)]
        public string OptionD { get; set; } = string.Empty;

        [StringLength(1)]
        public string CorrectOption { get; set; } = "A";
    }
}
