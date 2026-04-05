# SyncCategory

A category coming from the frontend\'s local storage.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**parent_id** | **string** |  | [optional] [default to undefined]
**name** | **string** |  | [default to undefined]
**category_type** | **string** |  | [default to undefined]
**icon_name** | **string** |  | [optional] [default to 'Savings']
**color** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { SyncCategory } from './api';

const instance: SyncCategory = {
    id,
    parent_id,
    name,
    category_type,
    icon_name,
    color,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
