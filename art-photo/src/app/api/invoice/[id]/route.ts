import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: invoiceNumber } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { data: invoice } = await supabase
    .from("invoices")
    .select("*, order:orders(*, items:order_items(*, product:products(name)))")
    .eq("invoice_number", invoiceNumber)
    .single();

  if (!invoice) {
    return NextResponse.json({ error: "الفاتورة غير موجودة" }, { status: 404 });
  }

  const isOwner = invoice.client_id === user.id;
  const isAdmin = user.app_metadata?.user_role === "admin";
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const order = invoice.order as {
    items: { quantity: number; unit_price: number; product: { name: string } | null }[];
  } | null;

  const itemsHtml = (order?.items ?? [])
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px;border:1px solid #ddd">${item.product?.name ?? "-"}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:center">${item.quantity}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:left">${Number(item.unit_price).toFixed(2)} ر.ي</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:left">${(item.quantity * Number(item.unit_price)).toFixed(2)} ر.ي</td>
        </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>فاتورة ${invoice.invoice_number}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #333; }
    .header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 40px; }
    .brand { font-size: 24px; font-weight: bold; color: #1a1a2e; }
    .invoice-info { text-align: left; }
    .invoice-info p { margin: 4px 0; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #1a1a2e; color: white; padding: 10px 8px; text-align: right; }
    .totals { margin-top: 20px; text-align: left; }
    .totals p { margin: 4px 0; font-size: 14px; }
    .totals .total { font-size: 20px; font-weight: bold; color: #1a1a2e; }
    .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #888; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">Art Photo Studio</div>
      <p style="font-size:14px;color:#666">استوديو التصوير الفني</p>
    </div>
    <div class="invoice-info">
      <p><strong>رقم الفاتورة:</strong> ${invoice.invoice_number}</p>
      <p><strong>التاريخ:</strong> ${new Date(invoice.created_at).toLocaleDateString("ar-SA")}</p>
      <p><strong>طريقة الدفع:</strong> ${invoice.payment_method === "card" ? "بطاقة ائتمان" : "نقدًا"}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>المنتج</th>
        <th style="text-align:center">الكمية</th>
        <th style="text-align:left">سعر الوحدة</th>
        <th style="text-align:left">الإجمالي</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml}
    </tbody>
  </table>

  <div class="totals">
    <p>المجموع الفرعي: ${Number(invoice.amount).toFixed(2)} ر.ي</p>
    <p>ضريبة القيمة المضافة (15%): ${Number(invoice.tax_amount).toFixed(2)} ر.ي</p>
    <p class="total">الإجمالي: ${Number(invoice.total_amount).toFixed(2)} ر.ي</p>
  </div>

  <div class="footer">
    <p>شكرًا لتعاملكم مع Art Photo Studio</p>
    <p>هذه فاتورة إلكترونية صادرة من النظام</p>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
