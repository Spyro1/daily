# TransactionIndex


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**amount** | **string** |  | [default to undefined]
**transaction_type** | [**TransactionType**](TransactionType.md) |  | [default to undefined]
**category** | [**CategoryBrief**](CategoryBrief.md) |  | [default to undefined]
**occurred_at** | **string** |  | [default to undefined]
**source_account** | [**AccountBrief**](AccountBrief.md) |  | [default to undefined]
**destination_account** | [**AccountBrief**](AccountBrief.md) |  | [default to undefined]
**target_amount** | **string** |  | [default to undefined]
**note** | **string** |  | [default to undefined]

## Example

```typescript
import { TransactionIndex } from './api';

const instance: TransactionIndex = {
    id,
    amount,
    transaction_type,
    category,
    occurred_at,
    source_account,
    destination_account,
    target_amount,
    note,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
