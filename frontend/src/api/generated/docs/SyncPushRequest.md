# SyncPushRequest

One-time bulk upload of locally-stored data after the user authenticates via Google.  The frontend sends everything from IndexedDB; the backend persists it under the authenticated user\'s id.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**accounts** | [**Array&lt;SyncAccount&gt;**](SyncAccount.md) |  | [optional] [default to undefined]
**categories** | [**Array&lt;SyncCategory&gt;**](SyncCategory.md) |  | [optional] [default to undefined]
**transactions** | [**Array&lt;SyncTransaction&gt;**](SyncTransaction.md) |  | [optional] [default to undefined]

## Example

```typescript
import { SyncPushRequest } from './api';

const instance: SyncPushRequest = {
    accounts,
    categories,
    transactions,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
