# CreateTransaction


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**amount** | [**Amount**](Amount.md) |  | [default to undefined]
**transaction_type** | [**TransactionType**](TransactionType.md) |  | [default to undefined]
**category_id** | **string** |  | [default to undefined]
**date** | **string** |  | [default to undefined]
**source_account_id** | **string** |  | [optional] [default to undefined]
**destination_account_id** | **string** |  | [optional] [default to undefined]
**target_amount** | [**TargetAmount**](TargetAmount.md) |  | [optional] [default to undefined]
**note** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { CreateTransaction } from './api';

const instance: CreateTransaction = {
    amount,
    transaction_type,
    category_id,
    date,
    source_account_id,
    destination_account_id,
    target_amount,
    note,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
