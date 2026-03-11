const BRAND_COLOR = "#1a1a1a";
const BRAND_NAME = "Art Photo Studio";

function baseTemplate(content: string) {
  return `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head><meta charset="utf-8" /></head>
    <body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f4f4f5;direction:rtl;">
      <div style="max-width:560px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
        <div style="background:${BRAND_COLOR};padding:24px;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:20px;">${BRAND_NAME}</h1>
        </div>
        <div style="padding:32px 24px;">
          ${content}
        </div>
        <div style="padding:16px 24px;background:#fafafa;text-align:center;border-top:1px solid #e4e4e7;">
          <p style="margin:0;color:#71717a;font-size:12px;">© ${new Date().getFullYear()} ${BRAND_NAME}. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function verificationEmailTemplate(name: string, confirmUrl: string) {
  return baseTemplate(`
    <h2 style="margin:0 0 16px;color:#18181b;font-size:18px;">مرحبًا ${name}!</h2>
    <p style="color:#3f3f46;line-height:1.6;">شكرًا لإنشاء حسابك في ${BRAND_NAME}. يرجى تأكيد بريدك الإلكتروني بالضغط على الزر أدناه:</p>
    <div style="text-align:center;margin:24px 0;">
      <a href="${confirmUrl}" style="display:inline-block;background:${BRAND_COLOR};color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:bold;">تأكيد البريد الإلكتروني</a>
    </div>
    <p style="color:#71717a;font-size:13px;">إذا لم تقم بإنشاء هذا الحساب، يمكنك تجاهل هذا البريد.</p>
  `);
}

export function passwordResetEmailTemplate(name: string, resetUrl: string) {
  return baseTemplate(`
    <h2 style="margin:0 0 16px;color:#18181b;font-size:18px;">مرحبًا ${name}!</h2>
    <p style="color:#3f3f46;line-height:1.6;">تلقينا طلبًا لإعادة تعيين كلمة المرور الخاصة بحسابك. اضغط على الزر أدناه لتعيين كلمة مرور جديدة:</p>
    <div style="text-align:center;margin:24px 0;">
      <a href="${resetUrl}" style="display:inline-block;background:${BRAND_COLOR};color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:bold;">إعادة تعيين كلمة المرور</a>
    </div>
    <p style="color:#71717a;font-size:13px;">إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد. الرابط صالح لمدة ساعة واحدة فقط.</p>
  `);
}

export function bookingConfirmationTemplate(name: string, details: { service: string; date: string; time: string; photographer: string }) {
  return baseTemplate(`
    <h2 style="margin:0 0 16px;color:#18181b;font-size:18px;">تأكيد الحجز</h2>
    <p style="color:#3f3f46;line-height:1.6;">مرحبًا ${name}، تم تأكيد حجزك بنجاح!</p>
    <div style="background:#f4f4f5;border-radius:8px;padding:16px;margin:16px 0;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px 0;color:#71717a;">الخدمة:</td><td style="padding:8px 0;color:#18181b;font-weight:bold;">${details.service}</td></tr>
        <tr><td style="padding:8px 0;color:#71717a;">التاريخ:</td><td style="padding:8px 0;color:#18181b;font-weight:bold;">${details.date}</td></tr>
        <tr><td style="padding:8px 0;color:#71717a;">الوقت:</td><td style="padding:8px 0;color:#18181b;font-weight:bold;">${details.time}</td></tr>
        <tr><td style="padding:8px 0;color:#71717a;">المصور:</td><td style="padding:8px 0;color:#18181b;font-weight:bold;">${details.photographer}</td></tr>
      </table>
    </div>
    <p style="color:#71717a;font-size:13px;">يمكنك إدارة حجوزاتك من خلال لوحة التحكم في حسابك.</p>
  `);
}

export function contactReplyTemplate(name: string, originalMessage: string, reply: string) {
  return baseTemplate(`
    <h2 style="margin:0 0 16px;color:#18181b;font-size:18px;">رد على رسالتك</h2>
    <p style="color:#3f3f46;line-height:1.6;">مرحبًا ${name}، شكرًا لتواصلك معنا. إليك ردنا على رسالتك:</p>
    <div style="background:#f4f4f5;border-radius:8px;padding:16px;margin:16px 0;">
      <p style="color:#71717a;font-size:13px;margin:0 0 8px;">رسالتك:</p>
      <p style="color:#3f3f46;margin:0;">${originalMessage}</p>
    </div>
    <div style="background:#f0fdf4;border-radius:8px;padding:16px;margin:16px 0;">
      <p style="color:#166534;font-size:13px;margin:0 0 8px;">ردنا:</p>
      <p style="color:#166534;margin:0;">${reply}</p>
    </div>
  `);
}
