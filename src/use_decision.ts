import type { OptimizelyDecideOption, OptimizelyDecision } from "@optimizely/optimizely-sdk";
import { enums } from "@optimizely/optimizely-sdk";
import { inject, onMounted, onUnmounted, ref, type Ref } from "vue";
import type { OptimizelyWrapper } from "./optimizely_wrapper";

export function useDecision(flagKey: string, autoUpdate: boolean = true, decideOptions?: OptimizelyDecideOption[]): Ref<OptimizelyDecision | null> {
  const decision: Ref<OptimizelyDecision | null> = ref(null);
  const listenerId = ref(0);

  const optimizelyWrapper: OptimizelyWrapper | null = inject("optimizelyWrapper") || null;
  if (!optimizelyWrapper) {
    decision.value = null
    return decision;
  }

  if (autoUpdate) {
    onMounted(function() {
      const optimizely = optimizelyWrapper.getInstance();
      listenerId.value = optimizely!.notificationCenter.addNotificationListener(enums.NOTIFICATION_TYPES.OPTIMIZELY_CONFIG_UPDATE, function() {
        decision.value = optimizelyWrapper.decide(flagKey, decideOptions);
      });
      console.log("Added listener with id = " + listenerId);
    });

    onUnmounted(function() {
      const optimizely = optimizelyWrapper.getInstance();
      const listenerRemoved: boolean = optimizely!.notificationCenter.removeNotificationListener(listenerId.value);
      console.log("Removing listener with id = " + listenerId.value);
      console.log("Is removed successfully? " + listenerRemoved);
    })
  }

  decision.value = optimizelyWrapper?.decide(flagKey, decideOptions) || null;
  return decision;
}
