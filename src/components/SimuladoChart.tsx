"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export type SimuladoPonto = { data: string; pct: number; nome: string };

export function SimuladoChart({ pontos }: { pontos: SimuladoPonto[] }) {
  if (pontos.length < 2) {
    return (
      <p className="text-sm text-neutral-500">
        Registre ao menos dois simulados para ver a evolução do seu aproveitamento.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={pontos} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
        <CartesianGrid stroke="#262626" vertical={false} />
        <XAxis
          dataKey="data"
          tick={{ fill: "#a3a3a3", fontSize: 11 }}
          axisLine={{ stroke: "#404040" }}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: "#a3a3a3", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={32}
        />
        <Tooltip
          contentStyle={{
            background: "#171717",
            border: "1px solid #404040",
            borderRadius: 8,
            fontSize: 12,
          }}
          labelStyle={{ color: "#e5e5e5" }}
          formatter={(value, _name, item) => [
            `${value}%`,
            (item?.payload as SimuladoPonto | undefined)?.nome ?? "Aproveitamento",
          ]}
        />
        <Line
          type="monotone"
          dataKey="pct"
          stroke="#e11d48"
          strokeWidth={2}
          dot={{ r: 4, fill: "#e11d48", strokeWidth: 0 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
