# TransactionsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createMyNewTransactionApiV1TransactionsPost**](#createmynewtransactionapiv1transactionspost) | **POST** /api/v1/transactions | Create My New Transaction|
|[**deleteMyTransactionApiV1TransactionsTransactionIdDelete**](#deletemytransactionapiv1transactionstransactioniddelete) | **DELETE** /api/v1/transactions/{transaction_id} | Delete My Transaction|
|[**getMyTransactionApiV1TransactionsTransactionIdGet**](#getmytransactionapiv1transactionstransactionidget) | **GET** /api/v1/transactions/{transaction_id} | Get My Transaction|
|[**getMyTransactionsApiV1TransactionsGet**](#getmytransactionsapiv1transactionsget) | **GET** /api/v1/transactions | Get My Transactions|
|[**updateMyTransactionApiV1TransactionsTransactionIdPatch**](#updatemytransactionapiv1transactionstransactionidpatch) | **PATCH** /api/v1/transactions/{transaction_id} | Update My Transaction|

# **createMyNewTransactionApiV1TransactionsPost**
> any createMyNewTransactionApiV1TransactionsPost(createTransaction)


### Example

```typescript
import {
    TransactionsApi,
    Configuration,
    CreateTransaction
} from './api';

const configuration = new Configuration();
const apiInstance = new TransactionsApi(configuration);

let createTransaction: CreateTransaction; //
let accessToken: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.createMyNewTransactionApiV1TransactionsPost(
    createTransaction,
    accessToken
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createTransaction** | **CreateTransaction**|  | |
| **accessToken** | [**string**] |  | (optional) defaults to undefined|


### Return type

**any**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteMyTransactionApiV1TransactionsTransactionIdDelete**
> deleteMyTransactionApiV1TransactionsTransactionIdDelete()


### Example

```typescript
import {
    TransactionsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TransactionsApi(configuration);

let transactionId: string; // (default to undefined)
let accessToken: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.deleteMyTransactionApiV1TransactionsTransactionIdDelete(
    transactionId,
    accessToken
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **transactionId** | [**string**] |  | defaults to undefined|
| **accessToken** | [**string**] |  | (optional) defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**204** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMyTransactionApiV1TransactionsTransactionIdGet**
> TransactionIndex getMyTransactionApiV1TransactionsTransactionIdGet()


### Example

```typescript
import {
    TransactionsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TransactionsApi(configuration);

let transactionId: string; // (default to undefined)
let accessToken: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.getMyTransactionApiV1TransactionsTransactionIdGet(
    transactionId,
    accessToken
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **transactionId** | [**string**] |  | defaults to undefined|
| **accessToken** | [**string**] |  | (optional) defaults to undefined|


### Return type

**TransactionIndex**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMyTransactionsApiV1TransactionsGet**
> TransactionListResponse getMyTransactionsApiV1TransactionsGet()


### Example

```typescript
import {
    TransactionsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TransactionsApi(configuration);

let dateFrom: string; //Start date for transaction filtering (ISO 8601 format) (optional) (default to undefined)
let dateTo: string; //End date for transaction filtering (ISO 8601 format) (optional) (default to undefined)
let categoryId: string; //Filter by category ID (optional) (default to undefined)
let accountId: string; //Filter by source or destination account ID (optional) (default to undefined)
let transactionType: TransactionType; //Filter by transaction type (income, expense, transfer) (optional) (default to undefined)
let skip: number; //Number of records to skip (pagination) (optional) (default to 0)
let limit: number; //Number of records to return (pagination) (optional) (default to 100)
let accessToken: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.getMyTransactionsApiV1TransactionsGet(
    dateFrom,
    dateTo,
    categoryId,
    accountId,
    transactionType,
    skip,
    limit,
    accessToken
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **dateFrom** | [**string**] | Start date for transaction filtering (ISO 8601 format) | (optional) defaults to undefined|
| **dateTo** | [**string**] | End date for transaction filtering (ISO 8601 format) | (optional) defaults to undefined|
| **categoryId** | [**string**] | Filter by category ID | (optional) defaults to undefined|
| **accountId** | [**string**] | Filter by source or destination account ID | (optional) defaults to undefined|
| **transactionType** | **TransactionType** | Filter by transaction type (income, expense, transfer) | (optional) defaults to undefined|
| **skip** | [**number**] | Number of records to skip (pagination) | (optional) defaults to 0|
| **limit** | [**number**] | Number of records to return (pagination) | (optional) defaults to 100|
| **accessToken** | [**string**] |  | (optional) defaults to undefined|


### Return type

**TransactionListResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateMyTransactionApiV1TransactionsTransactionIdPatch**
> TransactionIndex updateMyTransactionApiV1TransactionsTransactionIdPatch(updateTransaction)


### Example

```typescript
import {
    TransactionsApi,
    Configuration,
    UpdateTransaction
} from './api';

const configuration = new Configuration();
const apiInstance = new TransactionsApi(configuration);

let transactionId: string; // (default to undefined)
let updateTransaction: UpdateTransaction; //
let accessToken: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.updateMyTransactionApiV1TransactionsTransactionIdPatch(
    transactionId,
    updateTransaction,
    accessToken
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateTransaction** | **UpdateTransaction**|  | |
| **transactionId** | [**string**] |  | defaults to undefined|
| **accessToken** | [**string**] |  | (optional) defaults to undefined|


### Return type

**TransactionIndex**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

