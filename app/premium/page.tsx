import { PremiumBook } from "../../components/premium/PremiumBook";
import { sokolovDemoBook } from "../../lib/premium/sokolov-demo";

export default function PremiumPage() {
  return <PremiumBook book={sokolovDemoBook} />;
}
