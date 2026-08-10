import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { 
  getMarketInsightQuery, 
  getAIUsageStatsQuery,
  generateMarketInsightMutation 
} from "@/services/ai-analysis.functions";
import type { MarketInsight } from "@/types/ai";

export function useMarketInsight(
  type: MarketInsight['type'], 
  scope: 'national' | 'state' | 'city', 
  slug?: string
) {
  const fetchInsight = useServerFn(getMarketInsightQuery);
  return useQuery({
    queryKey: ['market-insight', type, scope, slug],
    queryFn: () => fetchInsight({ data: { type, scope, slug } })
  });
}


export function useGenerateMarketInsight() {
  const generateInsight = useServerFn(generateMarketInsightMutation);
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { type: MarketInsight['type'], scope: 'national' | 'state' | 'city', slug?: string }) => 
      generateInsight({ data }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['market-insight', variables.type, variables.scope, variables.slug]
      });
      queryClient.invalidateQueries({ queryKey: ['ai-usage-stats'] });
    }
  });
}

export function useAIUsageStats() {
  const fetchStats = useServerFn(getAIUsageStatsQuery);
  return useQuery({
    queryKey: ['ai-usage-stats'],
    queryFn: () => fetchStats()
  });
}
