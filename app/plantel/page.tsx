import { getPlantel } from "@/actions/getPlantel";
import Plantel from "./components/plantel";

export default async function PlantelPage() {
  const plantel = await getPlantel();

  return (
    <>
      <h2 className="text-2xl font-semibold">Plantel temporada 2025</h2>
      <div className="md:mx-auto space-y-4">
        <div className="overflow-x-auto">
          <Plantel players={plantel} />
        </div>
      </div>
    </>
  );
}
