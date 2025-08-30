import { getPlantel } from "@/actions/getPlantel";
import Plantel from "./components/plantel";

export default async function PlantelPage() {
  const plantel = await getPlantel();

  return (
    <div className="md:mx-auto space-y-4">
      <div className="overflow-x-auto">
        <Plantel players={plantel} />
      </div>
    </div>
  );
}
