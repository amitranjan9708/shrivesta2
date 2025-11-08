import React, { useEffect, useState } from "react";
import { apiService } from "../../services/api";

type SalesStats = {
  totalRevenue: number;
  totalUnitsSold: number;
  totalOrders: number;
};

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<SalesStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log("Fetching admin sales stats...");
        const res = await apiService.adminGetSalesStats();
        console.log("Admin sales stats response:", res);
        
        // API service now unwraps the response, so res.data should be the stats object directly
        if (res.success && res.data) {
          const statsData = res.data as SalesStats;
          if (statsData.totalRevenue !== undefined || statsData.totalOrders !== undefined || statsData.totalUnitsSold !== undefined) {
            console.log("Sales stats data:", statsData);
            setStats(statsData);
            setError("");
          } else {
            const errorMsg = "Invalid stats data structure";
            console.error("Error loading sales stats:", errorMsg, res);
            setError(errorMsg);
          }
        } else {
          const errorMsg = res.error || "Failed to load sales stats";
          console.error("Error loading sales stats:", errorMsg, res);
          setError(errorMsg);
        }
      } catch (e: any) {
        console.error("Exception fetching sales stats:", e);
        setError(e.message || "Failed to load sales stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-4">
        <h1 className="text-2xl font-semibold mb-6">Admin Dashboard</h1>
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <div className="text-red-800 font-semibold mb-2">Error loading sales statistics</div>
          <div className="text-red-600">{error}</div>
          <div className="text-sm text-red-500 mt-2">
            Please check the browser console for more details.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white shadow rounded p-4">
          <div className="text-gray-500 text-sm">Total Revenue</div>
          <div className="text-2xl font-bold">₹{stats?.totalRevenue.toFixed(2)}</div>
        </div>
        <div className="bg-white shadow rounded p-4">
          <div className="text-gray-500 text-sm">Total Orders</div>
          <div className="text-2xl font-bold">{stats?.totalOrders}</div>
        </div>
        <div className="bg-white shadow rounded p-4">
          <div className="text-gray-500 text-sm">Units Sold</div>
          <div className="text-2xl font-bold">{stats?.totalUnitsSold}</div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;


