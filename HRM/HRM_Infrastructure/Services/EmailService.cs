using HRM_Application.Contracts.Services;
using Microsoft.Extensions.Configuration;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;

namespace HRM_Infrastructure.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            var host = _config["EmailSettings:Host"];
            var port = int.Parse(_config["EmailSettings:Port"] ?? "587");
            var sender = _config["EmailSettings:Sender"];
            var password = _config["EmailSettings:Password"];

            using (var client = new SmtpClient(host, port))
            {
                client.EnableSsl = true;
                client.UseDefaultCredentials = false; // Phải đặt trước Credentials

                // Đảm bảo không có khoảng trắng thừa trong password/sender
                client.Credentials = new NetworkCredential(sender.Trim(), password.Trim());

                var mailMessage = new MailMessage
                {
                    // Quan trọng: Tên hiển thị giúp email ít bị vào spam hơn
                    From = new MailAddress(sender, "HRM System Notification"),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true
                };
                mailMessage.To.Add(toEmail);

                // Sử dụng SendMailAsync và đảm bảo task hoàn thành
                await client.SendMailAsync(mailMessage);
            }
        }
    }
}