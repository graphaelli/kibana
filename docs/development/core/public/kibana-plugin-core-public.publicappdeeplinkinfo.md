<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [kibana-plugin-core-public](./kibana-plugin-core-public.md) &gt; [PublicAppDeepLinkInfo](./kibana-plugin-core-public.publicappdeeplinkinfo.md)

## PublicAppDeepLinkInfo type

Public information about a registered app's [deepLinks](./kibana-plugin-core-public.appdeeplink.md)

<b>Signature:</b>

```typescript
export declare type PublicAppDeepLinkInfo = Omit<AppDeepLink, 'deepLinks' | 'keywords' | 'navLinkStatus'> & {
    deepLinks: PublicAppDeepLinkInfo[];
    keywords: string[];
    navLinkStatus: AppNavLinkStatus;
};
```
