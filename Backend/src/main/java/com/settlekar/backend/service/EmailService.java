package com.settlekar.backend.service;


import com.settlekar.backend.util.Constants;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.email.from:noreply@securestarter.com}")
    private String fromEmail;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    /**
     * Send verification email to new user (BLOCKING)
     */
    public void sendVerificationEmail(String toEmail, String token) {
        try {
            String verificationUrl = frontendUrl + "/verify-email?token=" + token;

            String subject = Constants.VERIFICATION_EMAIL_SUBJECT;
            String body = buildVerificationEmailBody(verificationUrl);

            sendEmail(toEmail, subject, body);
            log.info("Verification email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send verification email to: {}", toEmail, e);
            // Don't throw exception - email failure shouldn't stop signup
        }
    }

    /**
     * Send password reset email (BLOCKING)
     */
    public void sendPasswordResetEmail(String toEmail, String token) {
        try {
            String resetUrl = frontendUrl + "/reset-password?token=" + token;

            String subject = Constants.PASSWORD_RESET_EMAIL_SUBJECT;
            String body = buildPasswordResetEmailBody(resetUrl);

            sendEmail(toEmail, subject, body);
            log.info("Password reset email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send password reset email to: {}", toEmail, e);
        }
    }

    /**
     * Send welcome email after successful verification (BLOCKING)
     */
    public void sendWelcomeEmail(String toEmail, String firstName) {
        try {
            String subject = "Welcome to SettleKar!";
            String body = buildWelcomeEmailBody(firstName);

            sendEmail(toEmail, subject, body);
            log.info("Welcome email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send welcome email to: {}", toEmail, e);
        }
    }

    public void sendSettlementConfirmationEmail(String toEmail, String fromName, String toName,
                                                 java.math.BigDecimal amount, String groupName) {
        try {
            String subject = "Settlement Confirmed - SettleKar";
            String content = """
                    <div style="text-align:center;margin-bottom:20px;">
                    <div style="display:inline-block;background-color:#1E2D45;border-radius:50%%;width:56px;height:56px;line-height:56px;font-size:28px;text-align:center;">&#9989;</div>
                    </div>
                    <h2 style="margin:0 0 8px;color:#F1F5F9;font-size:22px;font-weight:700;text-align:center;">Settlement Confirmed</h2>
                    <p style="margin:0 0 24px;color:#94A3B8;font-size:14px;text-align:center;">A payment has been recorded in your group.</p>
                    <table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#1E2D45;border-radius:8px;border:1px solid rgba(255,255,255,0.07);margin-bottom:24px;">
                    <tr><td style="padding:20px;">
                    <table width="100%%" cellpadding="0" cellspacing="0">
                    <tr>
                    <td style="padding:8px 0;color:#64748B;font-size:13px;">Group</td>
                    <td style="padding:8px 0;color:#F1F5F9;font-size:14px;text-align:right;font-weight:600;">%s</td>
                    </tr>
                    <tr>
                    <td style="padding:8px 0;color:#64748B;font-size:13px;">Paid By</td>
                    <td style="padding:8px 0;color:#F1F5F9;font-size:14px;text-align:right;">%s</td>
                    </tr>
                    <tr>
                    <td style="padding:8px 0;color:#64748B;font-size:13px;">Paid To</td>
                    <td style="padding:8px 0;color:#F1F5F9;font-size:14px;text-align:right;">%s</td>
                    </tr>
                    <tr>
                    <td colspan="2" style="padding:12px 0 0;border-top:1px solid rgba(255,255,255,0.07);"></td>
                    </tr>
                    <tr>
                    <td style="padding:4px 0;color:#64748B;font-size:13px;">Amount</td>
                    <td style="padding:4px 0;color:#22C55E;font-size:20px;text-align:right;font-weight:700;">&#8377; %s</td>
                    </tr>
                    </table>
                    </td></tr>
                    </table>
                    <p style="margin:0;color:#94A3B8;font-size:13px;text-align:center;">This settlement has been recorded and balances have been updated.</p>
                    """.formatted(groupName, fromName, toName, amount.toPlainString());

            sendEmail(toEmail, subject, wrapInEmailTemplate(content));
            log.info("Settlement confirmation email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send settlement confirmation email to: {}", toEmail, e);
        }
    }

    public void sendPaymentReminderEmail(String toEmail, String creditorName,
                                          java.math.BigDecimal amount, String groupName, String reminderType) {
        try {
            String subject = "Payment Reminder - SettleKar";
            boolean isGentle = "GENTLE".equals(reminderType);

            String accentColor = isGentle ? "#2563EB" : "#EF4444";
            String iconBg = isGentle ? "#1E2D45" : "#2D1A1A";
            String icon = isGentle ? "&#128276;" : "&#9888;";
            String heading = isGentle ? "Friendly Reminder" : "Payment Overdue";
            String message = isGentle
                    ? "Just a gentle nudge — you have a pending balance to settle."
                    : "This is a formal reminder regarding an outstanding payment that requires your attention.";

            String content = """
                    <div style="text-align:center;margin-bottom:20px;">
                    <div style="display:inline-block;background-color:%s;border-radius:50%%;width:56px;height:56px;line-height:56px;font-size:24px;text-align:center;">%s</div>
                    </div>
                    <h2 style="margin:0 0 8px;color:#F1F5F9;font-size:22px;font-weight:700;text-align:center;">%s</h2>
                    <p style="margin:0 0 24px;color:#94A3B8;font-size:14px;text-align:center;">%s</p>
                    <table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#1E2D45;border-radius:8px;border:1px solid rgba(255,255,255,0.07);margin-bottom:24px;">
                    <tr><td style="padding:20px;">
                    <table width="100%%" cellpadding="0" cellspacing="0">
                    <tr>
                    <td style="padding:8px 0;color:#64748B;font-size:13px;">Group</td>
                    <td style="padding:8px 0;color:#F1F5F9;font-size:14px;text-align:right;font-weight:600;">%s</td>
                    </tr>
                    <tr>
                    <td style="padding:8px 0;color:#64748B;font-size:13px;">Owed To</td>
                    <td style="padding:8px 0;color:#F1F5F9;font-size:14px;text-align:right;">%s</td>
                    </tr>
                    <tr>
                    <td colspan="2" style="padding:12px 0 0;border-top:1px solid rgba(255,255,255,0.07);"></td>
                    </tr>
                    <tr>
                    <td style="padding:4px 0;color:#64748B;font-size:13px;">Amount Due</td>
                    <td style="padding:4px 0;color:%s;font-size:20px;text-align:right;font-weight:700;">&#8377; %s</td>
                    </tr>
                    </table>
                    </td></tr>
                    </table>
                    <p style="margin:0;color:#94A3B8;font-size:13px;text-align:center;">Please settle this amount at your earliest convenience.</p>
                    """.formatted(iconBg, icon, heading, message, groupName, creditorName, accentColor, amount.toPlainString());

            sendEmail(toEmail, subject, wrapInEmailTemplate(content));
            log.info("Payment reminder email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send payment reminder email to: {}", toEmail, e);
        }
    }

    public void sendMonthlySettlementSummaryEmail(String toEmail, String firstName,
                                                    String groupName, String summary) {
        try {
            String subject = "Monthly Settlement Summary - SettleKar";
            String displayName = firstName != null ? firstName : "";
            String dashboardUrl = frontendUrl;

            String content = """
                    <div style="text-align:center;margin-bottom:20px;">
                    <div style="display:inline-block;background-color:#1E2D45;border-radius:50%%;width:56px;height:56px;line-height:56px;font-size:28px;text-align:center;">&#128202;</div>
                    </div>
                    <h2 style="margin:0 0 8px;color:#F1F5F9;font-size:22px;font-weight:700;text-align:center;">Monthly Summary</h2>
                    <p style="margin:0 0 24px;color:#94A3B8;font-size:14px;text-align:center;">Hi %s, here is your monthly settlement overview for <strong style="color:#F1F5F9;">%s</strong>.</p>
                    <table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#1E2D45;border-radius:8px;border:1px solid rgba(255,255,255,0.07);margin-bottom:24px;">
                    <tr><td style="padding:20px;">
                    <pre style="margin:0;color:#F1F5F9;font-size:13px;font-family:'Segoe UI',Roboto,sans-serif;white-space:pre-wrap;line-height:1.6;">%s</pre>
                    </td></tr>
                    </table>
                    <div style="text-align:center;">
                    <a href="%s" style="display:inline-block;background:#2563EB;color:#FFFFFF;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;">View Dashboard</a>
                    </div>
                    """.formatted(displayName, groupName, summary, dashboardUrl);

            sendEmail(toEmail, subject, wrapInEmailTemplate(content));
            log.info("Monthly summary email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send monthly summary email to: {}", toEmail, e);
        }
    }

    /**
     * Generic email sending method using MimeMessage for HTML support
     */
    private void sendEmail(String to, String subject, String body) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true); // true = isHtml
            mailSender.send(mimeMessage);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }

    /**
     * Build verification email body
     */
    private String buildVerificationEmailBody(String verificationUrl) {
        String content = """
                <div style="text-align:center;margin-bottom:20px;">
                <div style="display:inline-block;background-color:#1E2D45;border-radius:50%%;width:56px;height:56px;line-height:56px;font-size:28px;text-align:center;">&#9993;</div>
                </div>
                <h2 style="margin:0 0 8px;color:#F1F5F9;font-size:22px;font-weight:700;text-align:center;">Verify Your Email</h2>
                <p style="margin:0 0 24px;color:#94A3B8;font-size:14px;text-align:center;">Thank you for registering with SettleKar! Please confirm your email address to get started.</p>
                <div style="text-align:center;margin-bottom:24px;">
                <a href="%s" style="display:inline-block;background:#2563EB;color:#FFFFFF;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;">Verify Email</a>
                </div>
                <p style="margin:0 0 8px;color:#64748B;font-size:12px;text-align:center;">This link expires in 24 hours.</p>
                <p style="margin:0;color:#64748B;font-size:12px;text-align:center;">If you didn't create an account, please ignore this email.</p>
                """.formatted(verificationUrl);
        return wrapInEmailTemplate(content);
    }

    /**
     * Build password reset email body
     */
    private String buildPasswordResetEmailBody(String resetUrl) {
        String content = """
                <div style="text-align:center;margin-bottom:20px;">
                <div style="display:inline-block;background-color:#1E2D45;border-radius:50%%;width:56px;height:56px;line-height:56px;font-size:28px;text-align:center;">&#128274;</div>
                </div>
                <h2 style="margin:0 0 8px;color:#F1F5F9;font-size:22px;font-weight:700;text-align:center;">Reset Your Password</h2>
                <p style="margin:0 0 24px;color:#94A3B8;font-size:14px;text-align:center;">We received a request to reset your password for your SettleKar account.</p>
                <div style="text-align:center;margin-bottom:24px;">
                <a href="%s" style="display:inline-block;background:#2563EB;color:#FFFFFF;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;">Reset Password</a>
                </div>
                <p style="margin:0 0 8px;color:#64748B;font-size:12px;text-align:center;">This link expires in 1 hour.</p>
                <p style="margin:0;color:#64748B;font-size:12px;text-align:center;">If you didn't request a password reset, please ignore this email.</p>
                """.formatted(resetUrl);
        return wrapInEmailTemplate(content);
    }

    /**
     * Build welcome email body
     */
    private String buildWelcomeEmailBody(String firstName) {
        String displayName = firstName != null ? firstName : "";
        String content = """
                <div style="text-align:center;margin-bottom:20px;">
                <div style="display:inline-block;background-color:#1E2D45;border-radius:50%%;width:56px;height:56px;line-height:56px;font-size:28px;text-align:center;">&#127881;</div>
                </div>
                <h2 style="margin:0 0 8px;color:#F1F5F9;font-size:22px;font-weight:700;text-align:center;">Welcome to SettleKar, %s!</h2>
                <p style="margin:0 0 24px;color:#94A3B8;font-size:14px;text-align:center;">Your email has been verified and your account is now active. Here is what you can do:</p>
                <table width="100%%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr><td style="padding:8px 0;">
                <table cellpadding="0" cellspacing="0"><tr>
                <td style="color:#22C55E;font-size:16px;padding-right:12px;vertical-align:top;">&#10003;</td>
                <td style="color:#F1F5F9;font-size:14px;">Create groups and add friends</td>
                </tr></table>
                </td></tr>
                <tr><td style="padding:8px 0;">
                <table cellpadding="0" cellspacing="0"><tr>
                <td style="color:#22C55E;font-size:16px;padding-right:12px;vertical-align:top;">&#10003;</td>
                <td style="color:#F1F5F9;font-size:14px;">Track and split expenses effortlessly</td>
                </tr></table>
                </td></tr>
                <tr><td style="padding:8px 0;">
                <table cellpadding="0" cellspacing="0"><tr>
                <td style="color:#22C55E;font-size:16px;padding-right:12px;vertical-align:top;">&#10003;</td>
                <td style="color:#F1F5F9;font-size:14px;">Settle balances with one click</td>
                </tr></table>
                </td></tr>
                </table>
                <div style="text-align:center;">
                <a href="%s" style="display:inline-block;background:#2563EB;color:#FFFFFF;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;">Go to Dashboard</a>
                </div>
                """.formatted(displayName, frontendUrl);
        return wrapInEmailTemplate(content);
    }

    /**
     * Wraps content in the standard SettleKar email template shell
     */
    private String wrapInEmailTemplate(String content) {
        return """
                <!DOCTYPE html>
                <html>
                <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
                <body style="margin:0;padding:0;background-color:#0D1117;font-family:'Segoe UI',Roboto,sans-serif;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0D1117;padding:40px 20px;">
                <tr><td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color:#1A2235;border-radius:12px;border:1px solid rgba(255,255,255,0.07);overflow:hidden;">
                <!-- Header -->
                <tr><td style="background-color:#131929;padding:24px 32px;text-align:center;">
                <h1 style="margin:0;color:#F1F5F9;font-size:24px;font-weight:700;">SettleKar</h1>
                <p style="margin:4px 0 0;color:#64748B;font-size:12px;">Smart Expense Splitting & Settlement</p>
                </td></tr>
                <!-- Content -->
                <tr><td style="padding:32px;">
                {{CONTENT}}
                </td></tr>
                <!-- Footer -->
                <tr><td style="background-color:#131929;padding:20px 32px;text-align:center;">
                <p style="margin:0;color:#64748B;font-size:12px;">SettleKar Team | Expense Management Made Easy</p>
                </td></tr>
                </table>
                </td></tr>
                </table>
                </body>
                </html>
                """.replace("{{CONTENT}}", content);
    }
}
