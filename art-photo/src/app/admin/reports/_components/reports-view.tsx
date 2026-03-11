"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Download, FileText, FileSpreadsheet, TrendingUp, Users, DollarSign, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DailyRevenueItem {
  date: string;
  booking_revenue: number;
  order_revenue: number;
  total_revenue: number;
}

interface PhotographerPerf {
  photographer_id: string;
  full_name: string;
  total_bookings: number;
  completed_bookings: number;
  average_rating: number;
  total_revenue: number;
}

interface DashboardStats {
  total_revenue?: number;
  total_bookings?: number;
  total_orders?: number;
  active_photographers?: number;
  pending_bookings?: number;
  low_stock_count?: number;
}

interface Props {
  dailyRevenue: DailyRevenueItem[];
  photographerPerformance: PhotographerPerf[];
  dashboardStats: DashboardStats | null;
}

export function ReportsView({ dailyRevenue, photographerPerformance, dashboardStats }: Props) {
  const [exporting, setExporting] = useState(false);

  const stats = dashboardStats ?? {};

  const kpis = [
    { label: "إجمالي الإيرادات", value: `${Number(stats.total_revenue ?? 0).toFixed(0)} ر.ي`, icon: DollarSign },
    { label: "إجمالي الحجوزات", value: stats.total_bookings ?? 0, icon: CalendarDays },
    { label: "إجمالي الطلبات", value: stats.total_orders ?? 0, icon: TrendingUp },
    { label: "المصورون النشطون", value: stats.active_photographers ?? 0, icon: Users },
  ];

  async function exportPdf() {
    setExporting(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text("Art Photo Studio - Financial Report", 14, 22);

      doc.setFontSize(12);
      doc.text(`Total Revenue: ${Number(stats.total_revenue ?? 0).toFixed(2)} SAR`, 14, 40);
      doc.text(`Total Bookings: ${stats.total_bookings ?? 0}`, 14, 50);
      doc.text(`Total Orders: ${stats.total_orders ?? 0}`, 14, 60);

      doc.text("Daily Revenue (Last 30 days):", 14, 80);
      let y = 90;
      dailyRevenue.slice(0, 20).forEach((row) => {
        doc.text(`${row.date}: ${Number(row.total_revenue).toFixed(2)} SAR`, 14, y);
        y += 8;
      });

      doc.save("art-photo-report.pdf");
    } finally {
      setExporting(false);
    }
  }

  async function exportExcel() {
    setExporting(true);
    try {
      const XLSX = await import("xlsx");
      const wb = XLSX.utils.book_new();

      const revenueSheet = XLSX.utils.json_to_sheet(
        dailyRevenue.map((r) => ({
          Date: r.date,
          "Booking Revenue": Number(r.booking_revenue),
          "Order Revenue": Number(r.order_revenue),
          "Total Revenue": Number(r.total_revenue),
        }))
      );
      XLSX.utils.book_append_sheet(wb, revenueSheet, "Daily Revenue");

      const perfSheet = XLSX.utils.json_to_sheet(
        photographerPerformance.map((p) => ({
          Name: p.full_name,
          "Total Bookings": p.total_bookings,
          "Completed": p.completed_bookings,
          "Rating": Number(p.average_rating).toFixed(1),
          "Revenue": Number(p.total_revenue),
        }))
      );
      XLSX.utils.book_append_sheet(wb, perfSheet, "Photographer Performance");

      XLSX.writeFile(wb, "art-photo-report.xlsx");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex gap-2">
        <Button variant="outline" onClick={exportPdf} disabled={exporting}>
          <FileText className="h-4 w-4" />
          <span>تصدير PDF</span>
        </Button>
        <Button variant="outline" onClick={exportExcel} disabled={exporting}>
          <FileSpreadsheet className="h-4 w-4" />
          <span>تصدير Excel</span>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.label}</CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">الإيرادات اليومية (آخر 30 يوم)</CardTitle>
        </CardHeader>
        <CardContent>
          {dailyRevenue.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">لا توجد بيانات إيرادات</p>
          ) : (
            <div className="h-80" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[...dailyRevenue].reverse()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="booking_revenue" stroke="#8884d8" name="Bookings" />
                  <Line type="monotone" dataKey="order_revenue" stroke="#82ca9d" name="Orders" />
                  <Line type="monotone" dataKey="total_revenue" stroke="#ff7300" name="Total" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">أداء المصورين</CardTitle>
        </CardHeader>
        <CardContent>
          {photographerPerformance.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">لا توجد بيانات أداء</p>
          ) : (
            <>
              <div className="mb-6 h-64" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={photographerPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="full_name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="completed_bookings" fill="#8884d8" name="Completed" />
                    <Bar dataKey="total_bookings" fill="#82ca9d" name="Total" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2">
                {photographerPerformance.map((ph) => (
                  <div key={ph.photographer_id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-1">
                      <span className="font-medium">{ph.full_name}</span>
                      <div className="flex gap-3 text-xs text-muted-foreground">
                        <span>{ph.total_bookings} حجز</span>
                        <span>{ph.completed_bookings} مكتمل</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">⭐ {Number(ph.average_rating).toFixed(1)}</Badge>
                      <span className="font-bold text-primary">{Number(ph.total_revenue).toFixed(0)} ر.ي</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
