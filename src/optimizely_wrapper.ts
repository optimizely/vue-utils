import type {
  Client,
  OptimizelyDecideOption,
  OptimizelyDecision,
  OptimizelyUserContext,
  UserAttributes
} from "@optimizely/optimizely-sdk";

export type OptimizelyUserInfo = {
  id: string | null;
  attributes?: UserAttributes;
}

export class OptimizelyWrapper {
  private optimizely: Client | null;
  private user: OptimizelyUserInfo;
  private userContext!: OptimizelyUserContext;
  private nextUpdateListenerId: number = 1;
  private userUpdateListeners: Map<string, Function> = new Map();

  constructor(optimizely: Client | null, userId: string | null, userAttributes?: UserAttributes) {
    this.optimizely = optimizely;
    this.user = {
      id: userId,
      attributes: userAttributes,
    }    
  }

  public getInstance(): Client | null {
    return this.optimizely;
  }

  public getUser(): OptimizelyUserInfo {
    return this.user
  }

  private getUserContext(): OptimizelyUserContext | null {
    if (!this.optimizely || !this.user.id) {
      return null;
    }

    if (!this.userContext) {
      this.userContext = this.optimizely.createUserContext(this.user.id, this.user.attributes)!;
    }

    return this.userContext;
  }

  public decide(flagKey: string, options?: OptimizelyDecideOption[]): OptimizelyDecision {
    if (!this.optimizely) {
      return this.generateNullDecisionObject(flagKey);
    }
    return this.getUserContext()!.decide(flagKey, options);
  }

  private generateNullDecisionObject(flagKey: string) : OptimizelyDecision {
    return {
      enabled: false,
      flagKey: flagKey,
      ruleKey: null,
      variationKey: null,
      userContext:this.userContext!,
      variables: {},
      reasons: [],
    }
  }

  public setUser(userInfo: OptimizelyUserInfo) {
    if (userInfo.id) {
      this.user.id = userInfo.id;
      this.user.attributes = userInfo.attributes;
      this.userContext = this.optimizely!.createUserContext(this.user.id, this.user.attributes)!;
      this.userUpdateListeners.forEach((callback) => {
        callback(this.user);
      });
    }
  }

  public registerUserUpdateListener(callback: Function): string {
    this.userUpdateListeners.set(this.nextUpdateListenerId.toString(), callback);
    const listenerKey: string = this.nextUpdateListenerId.toString();
    this.nextUpdateListenerId ++;
    return listenerKey;
  }

  public unregisterUserUpdateListener(key: string) {
    return this.userUpdateListeners.delete(key);
  }
}
