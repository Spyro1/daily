# SyncAccount

An account coming from the frontend\'s local storage.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**name** | **string** |  | [default to undefined]
**currency_code** | **string** |  | [default to undefined]
**icon_name** | **string** |  | [optional] [default to 'Savings']
**color** | **string** |  | [optional] [default to undefined]
**include_in_total** | **boolean** |  | [optional] [default to true]
**is_archived** | **boolean** |  | [optional] [default to false]

## Example

```typescript
import { SyncAccount } from './api';

const instance: SyncAccount = {
    id,
    name,
    currency_code,
    icon_name,
    color,
    include_in_total,
    is_archived,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
