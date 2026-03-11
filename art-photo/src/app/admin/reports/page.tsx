import type { Metadata } from "next";
import { getDailyRevenue, getPhotographerPerformance, getDashboardStats } from "@/actions/admin-reports";
import { ReportsView } from "./_components/reports-view";

export const metadata: Metadata = {
  title: "التقارير والإحصائيات",
};

export default async function ReportsPage() {
  const [dailyRevenue, photographerPerformance, dashboardStats] = await Promise.all([
    getDailyRevenue(),
    getPhotographerPerformance(),
    getDashboardStats(),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">التقارير والإحصائيات</h1>
      <ReportsView
        dailyRevenue={dailyRevenue}
        photographerPerformance={photographerPerformance}
        dashboardStats={dashboardStats}
      />
    </div>
  );
}
