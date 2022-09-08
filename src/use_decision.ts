import type { OptimizelyDecideOption, OptimizelyDecision } from "@optimizely/optimizely-sdk";
import { enums } from "@optimizely/optimizely-sdk";
import { inject, onMounted, ref, type Ref } from "vue";
import type { OptimizelyWrapper } from "./optimizely_wrapper";

export function useDecision(flagKey: string, autoUpdate: boolean = true, decideOptions?: OptimizelyDecideOption[]): Ref<OptimizelyDecision | null> {
  const decision: Ref<OptimizelyDecision | null> = ref(null);

  const optimizelyWrapper: OptimizelyWrapper | null = inject("optimizelyWrapper") || null;
  if (!optimizelyWrapper) {
    decision.value = null
    return decision;
  }

  if (autoUpdate) {
    onMounted(function() {
      const optimizely = optimizelyWrapper.getInstance();
      optimizely?.notificationCenter.addNotificationListener(enums.NOTIFICATION_TYPES.OPTIMIZELY_CONFIG_UPDATE, function() {
        decision.value = optimizelyWrapper.decide(flagKey, decideOptions);
      })
    });
  }

  decision.value = optimizelyWrapper?.decide(flagKey, decideOptions) || null;
  return decision;
}
