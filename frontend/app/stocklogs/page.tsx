"use client";

import { useMemo } from "react";
import useStockLogs from "@/hooks/useStockLogs";
import { useStockLogStore } from "@/store";

import { DataTable } from "./table/data-table";
import { columns } from "./table/columns";
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
    <Card className="bg-slate-800 border-3 border-slate-900 rounded-lg">
      <CardContent className="">
        <CardTitle className=" sm:text-lg text-slate-300 mb-1">{title}</CardTitle>
        <p className={`sm:text-3xl font-semibold  ${textColor}`}>{value}</p>
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
      log.action.includes("ADJUST")
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
      <div className=" space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
