# Vue Utilities for Optimizely Javascript SDK

Optimizely [Javascript SDK](https://github.com/optimizely/javascript-sdk/tree/master/packages/optimizely-sdk) is fully compatible with Vue JS. This set of utilities provide a light weight wrapper over Javascript SDK to enhance its functionality.

1. It Initializes the Optimizely Instance at App level and makes it available for all the child components for easy use.
2. It provides memoization of user id and attributes throughout the applicaiton lifecycle.
3. It provides a composable / hook `useDecision` to conveniently get decision inside any component based on memoized user id and attributes.
4. `useDecision` is dynamically updated whenever the datafile changes and an update is pushed to the SDK.

## Installation

This package is not available on npm yet so it needs to be installed directly from Github Repo.

```bash
npm install https://github.com/optimizely/vue-utils.git
```

Note: This package uses `@optimizely/optimizely-sdk` as a peer dependency which means user has to install the regular Javascript SDK separately.


## Register Optimizely Instance with Vue App

Vue JS has a root App object which is created using `creatApp` function. This package provides a `registerOptimizely` function which takes `app` as an argument along with `userId`, `attributes` and other optimizely sdk options, creates an optimizely instance and registers that with the given Vue App using `Providers`. This makes the `OptimizelyWrapper` available to all the child components for convenient access along with user information.

```typescript
import { registerOptimizely } from "@optimizely/vue-utils";

const app = createApp(App);

registerOptimizely(
  app,
  { 
    id: "<USER_ID>",
    attributes: "<OPTIONAL_USER_ATTRIBUTES>"
  },
  {
    sdkKey: "<-SDK_KEY->",
    // <-- Any other javascript optimizley sdk options such as datafile, datafileOptions etc -->
  }
)
```


## useDecision Composable / Hook

The previous step will initialize and make optimizely sdk instance available for all the components along with user information. Any child component can use `useDecision` to get the decision. `useDecision` is auto updatable by default. This means if `autoUpdate` datafile option is true and you make any changes to the optimizley project, `useDecision` will re-evaluate and it will automatically re-render the component.

```typescript
<script setup lang="ts">
  import { useDecision } from "@optimizely/vue-utils";

  const decision = useDecision("cool-home-page");
</script>

<template>
  <div>
    <p v-if="decision.enabled">The Awesome Feature is Enabled!</p>        
  </div>
</template>
```

The resulting `decision` object can be used in the template to conditionally render elements. This object will automatically update if the project settings are modified in `app.optimizley.com`.


## Changing the user

The user is memoized at initialization time. If it needs to be changed later, it can be done by accessing `setUser` method on `OptimizelyWrapper`. `OptimizelyWrapper` can be accessed in any component by calling `getOptimizelyWrapper` method.

```typescript
<script setup lang="ts">
  import { getOptimizelyWrapper } from "@optimizely/vue-utils";  

  const optimizelyWrapper = getOptimizelyWrapper();
  optimizelyWrapper.setUser({ id: "newUser" });
</script>
```

Calling `setUser` will autoupdate and re-evaluate all the `useDecision` hooks throughout the Application.


## Access the plain javascript sdk Client

If a user needs access to the regular Optimizely Client instance provided by the original javascript SDK, It can be done by calling `getOptimizelyClient` method.

```typescript
<script setup lang="ts">
  import { getOptimizelyClient } from "@optimizely/vue-utils";
  
  const optimizelyClient = getOptimizelyClient();  
  const userContext = optimizelyClient.createUserContext("customUser");
  const decision = userContext.decide("some-flag");
</script>
```

The `decision` object in this scenario is not auto updatable because its using the regular javascript SDK user context and client.
