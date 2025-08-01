"use client";

import { useState } from "react";
import { PLANTEL, Player } from "@/data/plantel";

const POSICION_ORDER: Record<string, number> = {
  ARQ: 1,
  DEF: 2,
  LAT: 3,
  MED: 4,
  DEL: 5,
};

export default function PlantelPage() {
  const headers: (keyof Player)[] = [
    "nombre",
    "posicion",
    "edad",
    "partidos",
    "goles",
    "asistencias",
    "goles_concedidos",
    "valla_invicta",
    "amarrillas",
    "rojas",
  ];

  const [sortKey, setSortKey] = useState<keyof Player>("posicion");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const handleSort = (key: keyof Player) => {
    if (key === sortKey) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const sortedPlayers = [...PLANTEL].sort((a, b) => {
    let aVal: string | number = a[sortKey];
    let bVal: string | number = b[sortKey];

    if (sortKey === "posicion") {
      aVal = POSICION_ORDER[a.posicion] || 999;
      bVal = POSICION_ORDER[b.posicion] || 999;
    } else {
      aVal = isNaN(Number(aVal)) ? aVal : Number(aVal);
      bVal = isNaN(Number(bVal)) ? bVal : Number(bVal);
    }

    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div className="md:mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Plantel temporada 2025</h1>
      <div className="overflow-x-auto">
        <table className="shadow-md rounded-md text-sm">
          <thead className="bg-white text-gray-700">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  onClick={() => handleSort(header)}
                  className="px-4 py-2 capitalize cursor-pointer select-none hover:bg-gray-200 transition w-32 text-center"
                >
                  {header.replace("_", " ")}
                  {sortKey === header ? (sortOrder === "asc" ? "↑" : "↓") : " "}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((player, index) => (
              <tr
                key={player.nombre + index}
                className={
                  index % 2 === 0
                    ? "bg-black/70 backdrop-blur-sm"
                    : "bg-black/80 backdrop-blur-sm"
                }
              >
                {headers.map((key) => (
                  <td key={key} className="px-4 py-2">
                    {player[key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
