# SyncTransaction

A transaction coming from the frontend\'s local storage.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**source_account_id** | **string** |  | [optional] [default to undefined]
**destination_account_id** | **string** |  | [optional] [default to undefined]
**category_id** | **string** |  | [optional] [default to undefined]
**transaction_type** | **string** |  | [default to undefined]
**amount** | [**Amount1**](Amount1.md) |  | [default to undefined]
**target_amount** | [**TargetAmount**](TargetAmount.md) |  | [optional] [default to undefined]
**occurred_at** | **string** |  | [default to undefined]
**note** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { SyncTransaction } from './api';

const instance: SyncTransaction = {
    id,
    source_account_id,
    destination_account_id,
    category_id,
    transaction_type,
    amount,
    target_amount,
    occurred_at,
    note,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
