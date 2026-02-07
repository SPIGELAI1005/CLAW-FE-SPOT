import { RecipeDetailClient } from "./RecipeDetailClient";

export default function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <RecipeDetailClient params={params} />;
}
