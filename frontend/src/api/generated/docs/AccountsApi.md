# AccountsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createMyNewAccountApiV1AccountsPost**](#createmynewaccountapiv1accountspost) | **POST** /api/v1/accounts | Create My New Account|
|[**deleteMyAccountApiV1AccountsAccountIdDelete**](#deletemyaccountapiv1accountsaccountiddelete) | **DELETE** /api/v1/accounts/{account_id} | Delete My Account|
|[**getMyAccountApiV1AccountsAccountIdGet**](#getmyaccountapiv1accountsaccountidget) | **GET** /api/v1/accounts/{account_id} | Get My Account|
|[**getMyAccountsApiV1AccountsGet**](#getmyaccountsapiv1accountsget) | **GET** /api/v1/accounts | Get My Accounts|
|[**updateMyAccountApiV1AccountsAccountIdPatch**](#updatemyaccountapiv1accountsaccountidpatch) | **PATCH** /api/v1/accounts/{account_id} | Update My Account|

# **createMyNewAccountApiV1AccountsPost**
> any createMyNewAccountApiV1AccountsPost(createAccount)


### Example

```typescript
import {
    AccountsApi,
    Configuration,
    CreateAccount
} from './api';

const configuration = new Configuration();
const apiInstance = new AccountsApi(configuration);

let createAccount: CreateAccount; //
let accessToken: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.createMyNewAccountApiV1AccountsPost(
    createAccount,
    accessToken
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createAccount** | **CreateAccount**|  | |
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

# **deleteMyAccountApiV1AccountsAccountIdDelete**
> deleteMyAccountApiV1AccountsAccountIdDelete()


### Example

```typescript
import {
    AccountsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AccountsApi(configuration);

let accountId: string; // (default to undefined)
let accessToken: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.deleteMyAccountApiV1AccountsAccountIdDelete(
    accountId,
    accessToken
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **accountId** | [**string**] |  | defaults to undefined|
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

# **getMyAccountApiV1AccountsAccountIdGet**
> AccountIndex getMyAccountApiV1AccountsAccountIdGet()


### Example

```typescript
import {
    AccountsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AccountsApi(configuration);

let accountId: string; // (default to undefined)
let accessToken: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.getMyAccountApiV1AccountsAccountIdGet(
    accountId,
    accessToken
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **accountId** | [**string**] |  | defaults to undefined|
| **accessToken** | [**string**] |  | (optional) defaults to undefined|


### Return type

**AccountIndex**

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

# **getMyAccountsApiV1AccountsGet**
> Array<AccountIndex> getMyAccountsApiV1AccountsGet()


### Example

```typescript
import {
    AccountsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AccountsApi(configuration);

let accessToken: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.getMyAccountsApiV1AccountsGet(
    accessToken
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **accessToken** | [**string**] |  | (optional) defaults to undefined|


### Return type

**Array<AccountIndex>**

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

# **updateMyAccountApiV1AccountsAccountIdPatch**
> any updateMyAccountApiV1AccountsAccountIdPatch(updateAccount)


### Example

```typescript
import {
    AccountsApi,
    Configuration,
    UpdateAccount
} from './api';

const configuration = new Configuration();
const apiInstance = new AccountsApi(configuration);

let accountId: string; // (default to undefined)
let updateAccount: UpdateAccount; //
let accessToken: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.updateMyAccountApiV1AccountsAccountIdPatch(
    accountId,
    updateAccount,
    accessToken
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateAccount** | **UpdateAccount**|  | |
| **accountId** | [**string**] |  | defaults to undefined|
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
|**200** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

