"use client";

import { useMemo } from "react";
import useStockLogs from "@/hooks/useStockLogs";
import { useStockLogStore } from "@/store";

import { DataTable } from "../../components/features/stocklogs/table/data-table";
import { columns } from "../../components/features/stocklogs/table/columns";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

interface SummaryCardProps {
  title: string;
  value: string | number;
  textColor: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  textColor,
}) => {
  return (
    <Card className="rounded-lg border-3 border-slate-900 bg-slate-800">
      <CardContent className="">
        <CardTitle className="mb-1 text-slate-300 sm:text-lg">
          {title}
        </CardTitle>
        <p className={`font-semibold sm:text-3xl ${textColor}`}>{value}</p>
      </CardContent>
    </Card>
  );
};

function StockLogs() {
  const { stockLogsQuery } = useStockLogs();
  const logs = stockLogsQuery.data ?? [];

  const { search, setSearch } = useStockLogStore();

  const summary = useMemo(() => {
    const totalIn = logs
      .filter((log) => log.action.includes("IN"))
      .reduce((sum, log) => sum + log.quantityChange, 0);
    const totalOut = logs
      .filter((log) => log.action.includes("OUT"))
      .reduce((sum, log) => sum + log.quantityChange, 0);
    const adjustments = logs.filter((log) =>
      log.action.includes("ADJUST"),
    ).length;

    return {
      totalLogs: logs.length,
      totalIn,
      totalOut,
      adjustments,
    };
  }, [logs]);

  return (
    <div className="p-8">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <SummaryCard
            title="Total Logs"
            value={summary.totalLogs}
            textColor="text-slate-100"
          />
          <SummaryCard
            title="Total Stock In"
            value={`+ ${summary.totalIn.toLocaleString()} pcs`}
            textColor="text-emerald-400"
          />
          <SummaryCard
            title="Total Stock Out"
            value={`- ${summary.totalOut.toLocaleString()} pcs`}
            textColor="text-rose-500"
          />
          <SummaryCard
            title="Adjustments"
            value={summary.adjustments}
            textColor="text-amber-500"
          />
        </div>

        <DataTable
          columns={columns}
          data={logs}
          globalFilter={search}
          onGlobalFilterChange={setSearch}
        />
      </div>
    </div>
  );
}

export default StockLogs;
