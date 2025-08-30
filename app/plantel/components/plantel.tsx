"use client";

import { Player } from "@/lib/types";
import { useState } from "react";

const POSICION_ORDER: Record<string, number> = {
  ARQ: 1,
  DEF: 2,
  LAT: 3,
  MED: 4,
  DEL: 5,
};

export default function Plantel({ players }: { players: Player[] }) {
  const [sortKey, setSortKey] = useState<keyof Player>("posicion");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const headers: (keyof Player)[] = [
    "nombre",
    "posicion",
    "edad",
    "partidos",
    "goles",
    "asistencias",
    "goles_concedidos",
    "valla_invicta",
    "amarillas",
    "rojas",
  ];

  const handleSort = (key: keyof Player) => {
    if (key === sortKey) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const sortedPlayers = players.sort((a, b) => {
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
    <table className="shadow-md rounded-md text-sm w-full">
      <thead className="bg-white text-gray-700">
        <tr>
          {headers.map((header) => (
            <th
              key={header}
              scope="col"
              aria-sort={
                sortKey === header
                  ? sortOrder === "asc"
                    ? "ascending"
                    : "descending"
                  : "none"
              }
              onClick={() => handleSort(header)}
              className="px-2 py-2 capitalize cursor-pointer select-none hover:bg-gray-200 transition font-medium"
            >
              {header.replace("_", " ")}
              <span aria-hidden="true">
                {sortKey === header ? (sortOrder === "asc" ? " ↑" : " ↓") : " "}
              </span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedPlayers.map((player, index) => (
          <tr
            key={player.nombre}
            className={index % 2 === 0 ? "bg-black/70" : "bg-black/80"}
          >
            {headers.map((key) => (
              <td key={key} className="px-2 py-2">
                {player[key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
