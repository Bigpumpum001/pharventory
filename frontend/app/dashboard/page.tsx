"use client";

import React, { useState, useMemo, useEffect } from "react";
import useMedicines from "@/hooks/useMedicines";
import useReceipts from "@/hooks/useReceipts";
import { useBatches } from "@/hooks/useBatches";
import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Package,
  AlertTriangle,
  Clock,
  DollarSign,
  ShoppingCart,
  Activity,
  Pill,
  X,
} from "lucide-react";
import Image from "next/image";

import { useMedicineStore } from "@/store/useMedicineStore";
import ChartBarMinimal from "./ChartBarMinimal";
import { toast } from "sonner";
type DateRange = "today" | "7days" | "30days" | "6months" | "1year";
type ExpiryRange = "1month" | "3months";

interface MedicineAlert {
  name: string;
  stock: number;
  status: string;
  id: number;
  genericName: string;
  price: number;
  totalStock: number;
}

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: "increase" | "decrease";
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  imagePath: string;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  changeType,
  icon,
  iconBg,
  iconColor,
  imagePath,
}) => {
  return (
    <Card className="flex justify-center bg-slate-800 border-3 border-slate-900 rounded-lg   transition-colors ">
      {/* border-slate-600/70 */}
      <CardContent className="">
        <div className="flex items-center justify-between gap-3 ">
          {/* ${iconBg} */}
          {/* <div
            className={`w-12 h-12  rounded-lg flex items-center justify-center`}
          >
            {icon}
          </div> */}
          <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0">
            <Image
              src={imagePath}
              alt={title + " image"}
              fill
              className="rounded-full object-contain"
              sizes="(max-width: 640px) 48px, 64px"
              onError={(e) => {
                e.currentTarget.src = "/images/logo/logo.png";
              }}
            />
          </div>
          <div className="">
            <CardTitle className=" sm:text-lg text-slate-300  mb-1 text-center">
              {title}
            </CardTitle>
            <p className={`sm:text-2xl font-bold text-white text-center`}>
              {value}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface AlertItemProps {
  title: string;
  subtitle: string;
  badge: string;
  badgeVariant: "destructive" | "secondary" | "default" | "outline";
  onClick?: () => void;
  onReorder?: () => void;
  showReorderButton?: boolean;
}

const AlertItem: React.FC<AlertItemProps> = ({
  title,
  subtitle,
  badge,
  badgeVariant,
  onClick,
  onReorder,
  showReorderButton = false,
}) => {
  const getBadgeColor = () => {
    if (badge === "Low") return "bg-yellow-300 text-black ";
    if (badge === "Critical") return "bg-red-600 text-slate-100";
    if (badge === "Expired" || badge === "Out Of Stock") return "bg-slate-300 text-slate-800";
    return "";
  };

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg bg-white/70 border border-blue-300/50 hover:bg-white transition-colors ${
        onClick ? "cursor-pointer" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-900">{title}</p>
        <p className="text-xs text-slate-600">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        <Badge
          variant={badgeVariant}
          className={`text-xs ${getBadgeColor()} rounded-sm`}
        >
          {badge}
        </Badge>
        {showReorderButton && (
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onReorder?.();
            }}
            className="h-7 px-2 text-xs border border-slate-300/70"
          >
            Reorder
          </Button>
        )}
      </div>
    </div>
  );
};
export default function Dashboard() {
  const [dateRange, setDateRange] = useState<DateRange>("7days");
  const [expiryRange, setExpiryRange] = useState<ExpiryRange>("1month");
  const [topSellingTab, setTopSellingTab] = useState<"quantity" | "revenue">(
    "quantity"
  );
  const { medicinesQuery } = useMedicines();
  const { receiptsQuery } = useReceipts();
  const { batchesQuery } = useBatches();
  const { selectedItems, addItem, removeItem } = useMedicineStore();

  const medicines = medicinesQuery.data ?? [];
  const receipts = receiptsQuery.data ?? [];
  const batches = batchesQuery.data ?? [];

  // Calculate metrics based on date range
  const filteredReceipts = useMemo(() => {
    const now = new Date();
    const filterDate = new Date();

    switch (dateRange) {
      case "today":
        filterDate.setHours(0, 0, 0, 0);
        break;
      case "7days":
        filterDate.setDate(now.getDate() - 7);
        break;
      case "30days":
        filterDate.setDate(now.getDate() - 30);
        break;
      case "6months":
        filterDate.setMonth(now.getMonth() - 6);
        break;
      case "1year":
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return receipts.filter((receipt) => {
      const receiptDate = new Date(receipt.createdAt);
      return receiptDate >= filterDate;
    });
  }, [receipts, dateRange]);

  // Calculate KPIs
  const todayRevenue = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return receipts
      .filter((receipt) => new Date(receipt.createdAt) >= today)
      .reduce((total, receipt) => {
        const receiptTotal = receipt.items.reduce(
          (sum, item) => sum + Number(item.price) * item.quantity,
          0
        );
        return total + receiptTotal;
      }, 0);
  }, [receipts]);

  // Calculate total revenue for filtered date range
  const totalRevenueByDateRange = useMemo(() => {
    return filteredReceipts.reduce((total, receipt) => {
      const receiptTotal = receipt.items.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0
      );
      return total + receiptTotal;
    }, 0);
  }, [filteredReceipts]);

  // Calculate total units sold for filtered date range
  const totalUnitsSoldByDateRange = useMemo(() => {
    return filteredReceipts.reduce((total, receipt) => {
      return (
        total + receipt.items.reduce((sum, item) => sum + item.quantity, 0)
      );
    }, 0);
  }, [filteredReceipts]);

  const totalStock = useMemo(() => {
    return medicines.reduce((sum, med) => sum + med.totalStock, 0);
  }, [medicines]);

  const criticalStockItems = useMemo(() => {
    return medicines.filter((med) => med.totalStock >= 1 && med.totalStock < 25)
      .length;
  }, [medicines]);

  const lowStockItems = useMemo(() => {
    return medicines.filter(
      (med) => med.totalStock >= 25 && med.totalStock < 100
    ).length;
  }, [medicines]);

  const outOfStockItems = useMemo(() => {
    return medicines.filter((med) => med.totalStock === 0).length;
  }, [medicines]);

  const expiredStockItems = useMemo(() => {
    const now = new Date();
    return batches.filter((batch) => {
      const expiryDate = new Date(batch.expiryDate);
      return expiryDate < now;
    }).length;
  }, [batches]);

  const expiringSoonItems = useMemo(() => {
    const daysFromNow = expiryRange === "1month" ? 30 : 90;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + daysFromNow);

    return batches.filter((batch) => {
      const expiryDate = new Date(batch.expiryDate);
      return expiryDate <= cutoffDate && expiryDate >= new Date();
    }).length;
  }, [batches, expiryRange]);

  // Top selling medicines - Fixed to use medicineId and medicineName directly from MedicineBatch
  const topSellingMedicines = useMemo(() => {
    const medicineSales = new Map<
      number,
      {
        name: string;
        quantity: number;
        revenue: number;
        imageUrl?: string;
      }
    >();

    filteredReceipts.forEach((receipt) => {
      receipt.items.forEach((item) => {
        // Access first medicineBatch from array
        const medicineBatchArray = item.medicineBatch;
        if (!medicineBatchArray || medicineBatchArray.length === 0) {
          return;
        }

        const medicineBatch = medicineBatchArray;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const medicineId = medicineBatch?.medicineId;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const medicineName = medicineBatch?.medicineName;

        if (medicineId && medicineName) {
          // Find the medicine data to get imageUrl
          const medicine = medicines.find((med) => med.id === medicineId);
          const current = medicineSales.get(medicineId) || {
            name: medicineName,
            quantity: 0,
            revenue: 0,
            imageUrl: medicine?.imageUrl,
          };
          current.quantity += item.quantity;
          current.revenue += Number(item.price) * item.quantity;
          medicineSales.set(medicineId, current);
        }
      });
    });

    return Array.from(medicineSales.values()).sort((a, b) =>
      topSellingTab === "quantity"
        ? b.quantity - a.quantity
        : b.revenue - a.revenue
    );
    // .slice(0, 5);
  }, [filteredReceipts, topSellingTab, medicines]);

  // useEffect(() => {
  //   console.log("topSellingMedicines", topSellingMedicines);
  // }, [topSellingMedicines]);

  // Low stock alerts
  const lowStockAlerts = useMemo(() => {
    return medicines
      .filter((med) => med.totalStock >= 25 && med.totalStock < 100)
      .sort((a, b) => a.totalStock - b.totalStock)

      .map((med) => ({
        name: med.name,
        stock: med.totalStock,
        isCritical: med.totalStock < 25,
        status:
          med.totalStock < 25
            ? "Critical"
            : med.totalStock < 100
            ? "Low"
            : "Normal",
        id: med.id,
        genericName: med.genericName || "",
        price: med.price || 0,
        totalStock: med.totalStock,
      }));
  }, [medicines]);

  // Critical stock alerts
  const criticalStockAlerts = useMemo(() => {
    return medicines
      .filter((med) => med.totalStock >= 1 && med.totalStock < 25)
      .sort((a, b) => a.totalStock - b.totalStock)

      .map((med) => ({
        name: med.name,
        stock: med.totalStock,
        isCritical: true,
        status: "Critical",
        id: med.id,
        genericName: med.genericName || "",
        price: med.price || 0,
        totalStock: med.totalStock,
      }));
  }, [medicines]);

  // Out of stock alerts
  const outOfStockAlerts = useMemo(() => {
    return medicines
      .filter((med) => med.totalStock === 0)
      .map((med) => ({
        name: med.name,
        stock: med.totalStock,
        isCritical: true,
        status: "Out Of Stock",
        id: med.id,
        genericName: med.genericName || "",
        price: med.price || 0,
        totalStock: med.totalStock,
      }));
  }, [medicines]);
  const expiredMedicines = useMemo(() => {
    return batches
      .filter((batch) => {
        const expiryDate = new Date(batch.expiryDate);
        return expiryDate < new Date();
      })
      .sort(
        (a, b) =>
          new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
      )

      .map((batch) => ({
        name: batch.medicineName || "Unknown",
        batchNumber: batch.batchNumber,
        expiryDate: batch.expiryDate,
        quantity: batch.quantity,
      }));
  }, [batches]);

  // Expiring medicines - Fixed with proper null checks
  const expiringMedicines = useMemo(() => {
    const daysFromNow = expiryRange === "1month" ? 30 : 90;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + daysFromNow);

    return batches
      .filter((batch) => {
        const expiryDate = new Date(batch.expiryDate);
        return expiryDate <= cutoffDate && expiryDate >= new Date();
      })
      .sort(
        (a, b) =>
          new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
      )

      .map((batch) => ({
        name: batch.medicineName || "Unknown",
        batchNumber: batch.batchNumber,
        expiryDate: batch.expiryDate,
        quantity: batch.quantity,
      }));
  }, [batches, expiryRange]);

  const salesTrendData = useMemo(() => {
    let days = 30;
    let dataPoints = 5;

    switch (dateRange) {
      case "today":
        days = 1;
        dataPoints = 1;
        break;
      case "7days":
        days = 7;
        dataPoints = 7;
        break;
      case "30days":
        days = 30;
        dataPoints = 10;
        break;
      case "6months":
        days = 180;
        dataPoints = 12;
        break;
      case "1year":
        days = 365;
        dataPoints = 12;
        break;
    }

    const data = [];

    for (let i = dataPoints - 1; i >= 0; i--) {
      let startDate, endDate;

      if (dateRange === "today") {
        // For today: calculate from 00:00 to 23:59 of current day
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
      } else if (dateRange === "7days") {
        // For 7 days: each data point represents exactly one day
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        endDate.setDate(endDate.getDate() - i);

        startDate = new Date(endDate);
        startDate.setHours(0, 0, 0, 0);
      } else {
        // For other ranges: use interval-based calculation
        const interval = Math.ceil(days / dataPoints);

        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        endDate.setDate(endDate.getDate() - i * interval);

        startDate = new Date(endDate);
        startDate.setHours(0, 0, 0, 0);
        startDate.setDate(startDate.getDate() - interval + 1);
      }

      const periodRevenue = receipts
        .filter((receipt) => {
          const receiptDate = new Date(receipt.createdAt);
          return receiptDate >= startDate && receiptDate <= endDate;
        })
        .reduce((sum, receipt) => {
          return (
            sum +
            receipt.items.reduce(
              (itemSum, item) => itemSum + Number(item.price) * item.quantity,
              0
            )
          );
        }, 0);

      data.push({
        date: endDate.toLocaleDateString("en-US", {
          month: "short",
          day:
            dateRange === "6months" || dateRange === "1year"
              ? undefined
              : "numeric",
        }),
        revenue: periodRevenue,
      });
    }
    return data;
  }, [receipts, dateRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
  };

  const handleReorder = (medicine: MedicineAlert) => {
    addItem({
      id: medicine.id,
      name: medicine.name,
      genericName: medicine.genericName,
      price: medicine.price,
      totalStock: medicine.totalStock,
    });
    toast.info(`Add ${medicine.name} to Reorder list.`, {
      style: {
        background: "#e6ebfa",
        color: "black",
        border: "1px solid #e6ebfa",
      },
    });
  };

  const chartData = salesTrendData.map((item) => ({
    month: item.date,
    revenue: item.revenue,
  }));

  return (
    <div className="p-8">
      <div className=" space-y-6">
        {/* KPI Overview Zone */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-6 gap-3">
          <KPICard
            title="Today's Revenue"
            value={formatCurrency(todayRevenue)}
            icon={<DollarSign className="w-12 h-12 text-emerald-500/90" />}
            iconBg="bg-emerald-100"
            iconColor="text-emerald-600"
            imagePath="/images/logo/revenue.jpg"
          />
          <KPICard
            title="Total Stock"
            value={totalStock.toLocaleString()}
            icon={<Pill className="w-12 h-12 text-sky-600" />}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
            imagePath="/images/logo/logo_med_only.jpg"
          />
          <KPICard
            title="Critical Stock"
            value={criticalStockItems}
            icon={<AlertTriangle className="w-12 h-12 text-rose-500/70" />}
            iconBg="bg-red-100"
            iconColor="text-red-600"
            imagePath="/images/logo/critical_stock.jpg"
          />
          <KPICard
            title="Low Stock"
            value={lowStockItems}
            icon={<AlertTriangle className="w-12 h-12 text-yellow-600/70" />}
            iconBg="bg-yellow-100"
            iconColor="text-yellow-600"
            imagePath="/images/logo/low_stock.jpg"
          />
          <KPICard
            title="Out Of Stock"
            value={outOfStockItems}
            icon={<Clock className="w-12 h-12 text-slate-500/70" />}
            iconBg="bg-gray-100"
            iconColor="text-gray-600"
            imagePath="/images/logo/out_of_stock.jpg"
          />
          <KPICard
            title="Expired Batches"
            value={expiredStockItems}
            icon={<Clock className="w-12 h-12 text-slate-500/70" />}
            iconBg="bg-gray-100"
            iconColor="text-gray-600"
            imagePath="/images/logo/expired_batches.jpg"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="w-full h-full rounded-sm bg-iceblue border-3 border-slate-700 pt-0">
            <div className="h-full flex flex-col">
              <CardHeader className="bg-slate-800 py-3 flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-slate-100" />
                  <p className="text-slate-100 font-semibold text-xl">
                    Sales Trend
                  </p>
                </CardTitle>
                <Select
                  value={dateRange}
                  onValueChange={(value: DateRange) => setDateRange(value)}
                >
                  <SelectTrigger className=" text-slate-900 bg-slate-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="7days">7 Days</SelectItem>
                    <SelectItem value="30days">30 Days</SelectItem>
                    <SelectItem value="6months">6 Months</SelectItem>
                    <SelectItem value="1year">1 Year</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1 flex items-center justify-center pt-10 xl:pt-0">
                  <ChartBarMinimal data={chartData} />
                </div>

                {/* Summary Stats Below Chart */}
                <div className="mt-4 pt-4 border-t border-slate-600/50">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center ">
                      <CardContent className="text-start text-slate-600">
                        <p className="text-xs sm:text-sm font-medium  mb-1">
                          Period Revenue
                        </p>
                        <p className="text-xl sm:text-2xl font-extrabold text-slate-900 ">
                          {formatCurrency(totalRevenueByDateRange)}
                        </p>
                      </CardContent>
                    </div>
                    <div className="text-center   border-white rounded-none">
                      <CardContent className="text-start">
                        <p className="text-xs sm:text-sm font-medium  mb-1 text-slate-600">
                          Total Units Sold
                        </p>
                        <p className="text-xl sm:text-2xl font-extrabold text-slate-900">
                          {totalUnitsSoldByDateRange.toLocaleString()}{" "}
                          {/* units */}
                        </p>
                      </CardContent>
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
          <div className="h-full w-full">
            {/* Recent Sales */}
            <Card className="h-full flex flex-col bg-iceblue border-3 border-slate-700 rounded-sm pt-0">
              <CardHeader className="bg-slate-800  py-3 flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="text-white" />
                  <p className="text-slate-100 font-semibold sm:text-xl">
                    Top Sales
                  </p>
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Select
                    value={topSellingTab}
                    onValueChange={(value: "quantity" | "revenue") =>
                      setTopSellingTab(value)
                    }
                  >
                    <SelectTrigger className=" text-slate-900 bg-slate-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quantity">By Units</SelectItem>
                      <SelectItem value="revenue">By Revenue</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={dateRange}
                    onValueChange={(value: DateRange) => setDateRange(value)}
                  >
                    <SelectTrigger className=" text-slate-900 bg-slate-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="7days">7 Days</SelectItem>
                      <SelectItem value="30days">30 Days</SelectItem>
                      <SelectItem value="6months">6 Months</SelectItem>
                      <SelectItem value="1year">1 Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-130 overflow-y-auto">
                  <div className="space-y-2">
                    {topSellingMedicines.slice(0, 10).map((medicine, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white/70  border border-blue-300/70 rounded-lg hover:bg-white transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 ">
                            <span className="text-sm font-semibold text-slate-900">
                              {index + 1}
                            </span>
                          </div>
                          {(() => {
                            const imageUrl = medicine.imageUrl || "";
                            const gcsUrl = imageUrl.startsWith(
                              "/images/medicine"
                            )
                              ? `https://storage.googleapis.com/pharventory-bucket${imageUrl}`
                              : imageUrl;

                            return gcsUrl ? (
                              <Image
                                src={gcsUrl}
                                alt={medicine.name}
                                width={200}
                                height={40}
                                className="w-10 h-10 rounded-md object-cover "
                                onError={(e) => {
                                  e.currentTarget.src = "/images/logo/logo.png";
                                }}
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center">
                                <Package className="w-5 h-5 text-slate-400" />
                              </div>
                            );
                          })()}
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {medicine.name}
                            </p>
                            <p className="text-xs text-slate-600">
                              {topSellingTab === "quantity"
                                ? `${formatCurrency(medicine.revenue)} revenue`
                                : `${medicine.quantity} units sold`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-emerald-500">
                            {topSellingTab === "quantity"
                              ? `${medicine.quantity} units`
                              : `${formatCurrency(medicine.revenue)}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {topSellingMedicines.length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-8">
                      No recent sales data
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        {/* Alerts Zone */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6  ">
          {/* Critical Stock Alerts */}
          <Card className="bg-iceblue border-3 rounded-sm border-slate-700 pt-0">
            <CardHeader className="bg-slate-800   py-3 flex items-center">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <p className="text-slate-100 font-semibold text-xl">
                  Critical Stock Alerts
                </p>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-64 overflow-y-auto">
              {criticalStockAlerts.length > 0 ? (
                criticalStockAlerts.map((medicine, index) => (
                  <AlertItem
                    key={index}
                    title={medicine.name}
                    subtitle={`Current stock: ${medicine.stock} units`}
                    badge="Critical"
                    badgeVariant="destructive"
                    showReorderButton={true}
                    onReorder={() => handleReorder(medicine)}
                  />
                ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">
                  No critical stock items
                </p>
              )}
            </CardContent>
          </Card>

          {/* Low Stock Alerts */}
          <Card className="bg-iceblue border-3 rounded-sm  border-slate-700 pt-0">
            <CardHeader className="bg-slate-800   py-3 flex items-center ">
              <CardTitle className="flex items-center gap-2  ">
                <AlertTriangle className=" text-yellow-600 " />
                <p className="text-slate-100   font-semibold text-xl ">
                  Low Stock Alerts{" "}
                </p>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-64 overflow-y-auto">
              {lowStockAlerts.filter((med) => med.stock > 25).length > 0 ? (
                lowStockAlerts
                  .filter((med) => med.stock > 25)
                  .map((medicine, index) => (
                    <AlertItem
                      key={index}
                      title={medicine.name}
                      subtitle={`Current stock: ${medicine.stock} units`}
                      badge="Low"
                      badgeVariant="secondary"
                      showReorderButton={true}
                      onReorder={() => handleReorder(medicine)}
                    />
                  ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">
                  No low stock items
                </p>
              )}
            </CardContent>
          </Card>

          {/* Expiring Medicines - Full Width */}
          <Card className="bg-iceblue border-3 rounded-sm border-slate-700 pt-0">
            <CardHeader className="bg-slate-800  py-3 flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-red-600" />
                <p className="text-slate-100 font-semibold text-xl">
                  Expiring Batches
                </p>
              </CardTitle>
              <Select
                value={expiryRange}
                onValueChange={(value: ExpiryRange) => setExpiryRange(value)}
              >
                <SelectTrigger className="h-5 py-0 w-[120px] bg-slate-100 ">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1month">In 1 month</SelectItem>
                  <SelectItem value="3months">In 3 months</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              {expiringMedicines.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {expiringMedicines.map((medicine, index) => (
                    <AlertItem
                      key={index}
                      title={medicine.name}
                      subtitle={`Batch ${medicine.batchNumber} • ${
                        medicine.quantity
                      } units • Expires ${formatDate(medicine.expiryDate)}`}
                      badge="Expiring"
                      badgeVariant="destructive"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-8">
                  No medicines expiring in the next{" "}
                  {expiryRange === "1month" ? "1 month" : "3 months"}
                </p>
              )}
            </CardContent>
          </Card>
          {/* Expired Batches */}
          <Card className="bg-iceblue border-3 rounded-sm border-slate-700 pt-0">
            <CardHeader className="bg-slate-800    py-3 flex items-center">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-500/70" />
                <p className="text-slate-100 font-semibold text-xl">
                  Expired Batches (Already expired)
                </p>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-64 overflow-y-auto">
              {expiredMedicines.length > 0 ? (
                expiredMedicines.map((medicine, index) => (
                  <AlertItem
                    key={index}
                    title={medicine.name}
                    subtitle={`Batch ${medicine.batchNumber} • ${
                      medicine.quantity
                    } units • Expired ${formatDate(medicine.expiryDate)}`}
                    badge="Expired"
                    badgeVariant="secondary"
                  />
                ))
              ) : (
                <p className="text-sm text-slate-100 text-center py-4">
                  No expired batches
                </p>
              )}
            </CardContent>
          </Card>
          {/* Out Of Stock */}
          <Card className="bg-iceblue border-3 rounded-sm border-slate-700 pt-0">
            <CardHeader className="bg-slate-800    py-3 flex items-center">
              <CardTitle className="flex items-center gap-2">
                <X className="w-5 h-5 text-red-600" />
                <p className="text-slate-100 font-semibold text-xl">
                   Out Of Stock
                </p>
              </CardTitle>
            </CardHeader>
             <CardContent className="space-y-3 max-h-64 overflow-y-auto">
              {outOfStockAlerts.length > 0 ? (
                outOfStockAlerts.map((medicine, index) => (
                  <AlertItem
                    key={index}
                    title={medicine.name}
                    subtitle={`Current stock: ${medicine.stock} units`}
                    badge="Out Of Stock"
                    badgeVariant="destructive"
                    showReorderButton={true}
                    onReorder={() => handleReorder(medicine)}
                  />
                ))
              ) : (
                <p className="text-sm text-slate-100 text-center py-4">
                  No out of stock items
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
