import { createInstance, type Config } from "@optimizely/optimizely-sdk";
import type { App } from "vue";
import type { OptimizelyUserInfo } from "./optimizely_wrapper";
import { OptimizelyWrapper } from "./optimizely_wrapper";

export function registerOptimizely(
  app: App,
  userInfo: OptimizelyUserInfo,
  sdkOptions: Config,
) {
  const optimizely = createInstance(sdkOptions);
  const optimizelyWrapper = new OptimizelyWrapper(optimizely, userInfo.id, userInfo.attributes);
  app.provide("optimizelyWrapper", optimizelyWrapper);
  app.provide("optimizely", optimizely);
}

export { useDecision } from "./use_decision";
export { OptimizelyWrapper } from "./optimizely_wrapper";