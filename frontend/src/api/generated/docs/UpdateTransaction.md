# UpdateTransaction


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**amount** | [**Amount2**](Amount2.md) |  | [optional] [default to undefined]
**transaction_type** | [**TransactionType**](TransactionType.md) |  | [optional] [default to undefined]
**occurred_at** | **string** |  | [optional] [default to undefined]
**category_id** | **string** |  | [optional] [default to undefined]
**source_account_id** | **string** |  | [optional] [default to undefined]
**destination_account_id** | **string** |  | [optional] [default to undefined]
**target_amount** | [**TargetAmount**](TargetAmount.md) |  | [optional] [default to undefined]
**note** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { UpdateTransaction } from './api';

const instance: UpdateTransaction = {
    amount,
    transaction_type,
    occurred_at,
    category_id,
    source_account_id,
    destination_account_id,
    target_amount,
    note,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
