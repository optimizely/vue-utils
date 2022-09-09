import type { OptimizelyDecideOption, OptimizelyDecision } from "@optimizely/optimizely-sdk";
import { enums } from "@optimizely/optimizely-sdk";
import { inject, onMounted, onUnmounted, ref, type Ref } from "vue";
import type { OptimizelyWrapper } from "./optimizely_wrapper";

export function useDecision(flagKey: string, autoUpdate: boolean = true, decideOptions?: OptimizelyDecideOption[]): Ref<OptimizelyDecision> {
  const decision: Ref<OptimizelyDecision> = ref({
    flagKey,
    variationKey: null,
    variables: {},
    reasons: [],
    ruleKey: null,
    enabled: false,
    userContext: null!,
  });
  const listenerId = ref(0);
  const userUpdateListenerId = ref("");

  const optimizelyWrapper: OptimizelyWrapper | null = inject("optimizelyWrapper") || null;
  if (!optimizelyWrapper) {    
    return decision;
  }

  function updateDecision() {
    decision.value = optimizelyWrapper!.decide(flagKey, decideOptions);
  }

  if (autoUpdate) {
    onMounted(function() {
      const optimizely = optimizelyWrapper.getInstance();
      listenerId.value = optimizely!.notificationCenter.addNotificationListener(enums.NOTIFICATION_TYPES.OPTIMIZELY_CONFIG_UPDATE, updateDecision);
      userUpdateListenerId.value = optimizelyWrapper.registerUserUpdateListener(updateDecision);
    });

    onUnmounted(function() {
      const optimizely = optimizelyWrapper.getInstance();
      optimizely!.notificationCenter.removeNotificationListener(listenerId.value);
      optimizelyWrapper.unregisterUserUpdateListener(userUpdateListenerId.value);
    })
  }

  decision.value = optimizelyWrapper?.decide(flagKey, decideOptions) || null;
  return decision;
}
