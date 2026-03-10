# V1Api

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createMyNewAccountApiV1AccountsPost**](#createmynewaccountapiv1accountspost) | **POST** /api/v1/accounts | Create My New Account|
|[**deleteMyAccountApiV1AccountsAccountIdDelete**](#deletemyaccountapiv1accountsaccountiddelete) | **DELETE** /api/v1/accounts/{account_id} | Delete My Account|
|[**getAccessTokenStringApiV1OauthTokenGet**](#getaccesstokenstringapiv1oauthtokenget) | **GET** /api/v1/oauth/token | Get Access Token String|
|[**getMyAccountApiV1AccountsAccountIdGet**](#getmyaccountapiv1accountsaccountidget) | **GET** /api/v1/accounts/{account_id} | Get My Account|
|[**getMyAccountsApiV1AccountsGet**](#getmyaccountsapiv1accountsget) | **GET** /api/v1/accounts | Get My Accounts|
|[**getMyDashboardApiV1DashboardGet**](#getmydashboardapiv1dashboardget) | **GET** /api/v1/dashboard | Get My Dashboard|
|[**googleLoginApiV1GoogleLoginGet**](#googleloginapiv1googleloginget) | **GET** /api/v1/google/login | Google Login|
|[**logoutApiV1OauthLogoutPost**](#logoutapiv1oauthlogoutpost) | **POST** /api/v1/oauth/logout | Logout|
|[**oauthCallbackApiV1OauthCallbackGet**](#oauthcallbackapiv1oauthcallbackget) | **GET** /api/v1/oauth/callback | Oauth Callback|
|[**refreshAccessTokenApiV1OauthRefreshPost**](#refreshaccesstokenapiv1oauthrefreshpost) | **POST** /api/v1/oauth/refresh | Refresh Access Token|
|[**updateMyAccountApiV1AccountsAccountIdPatch**](#updatemyaccountapiv1accountsaccountidpatch) | **PATCH** /api/v1/accounts/{account_id} | Update My Account|
|[**validateAccessTokenApiV1OauthValidatePost**](#validateaccesstokenapiv1oauthvalidatepost) | **POST** /api/v1/oauth/validate | Validate Access Token|

# **createMyNewAccountApiV1AccountsPost**
> any createMyNewAccountApiV1AccountsPost(createAccount)


### Example

```typescript
import {
    V1Api,
    Configuration,
    CreateAccount
} from './api';

const configuration = new Configuration();
const apiInstance = new V1Api(configuration);

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
    V1Api,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new V1Api(configuration);

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

# **getAccessTokenStringApiV1OauthTokenGet**
> string getAccessTokenStringApiV1OauthTokenGet()


### Example

```typescript
import {
    V1Api,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new V1Api(configuration);

let accessToken: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.getAccessTokenStringApiV1OauthTokenGet(
    accessToken
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **accessToken** | [**string**] |  | (optional) defaults to undefined|


### Return type

**string**

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

# **getMyAccountApiV1AccountsAccountIdGet**
> AccountIndex getMyAccountApiV1AccountsAccountIdGet()


### Example

```typescript
import {
    V1Api,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new V1Api(configuration);

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
    V1Api,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new V1Api(configuration);

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

# **getMyDashboardApiV1DashboardGet**
> DashboardIndex getMyDashboardApiV1DashboardGet()


### Example

```typescript
import {
    V1Api,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new V1Api(configuration);

let accessToken: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.getMyDashboardApiV1DashboardGet(
    accessToken
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **accessToken** | [**string**] |  | (optional) defaults to undefined|


### Return type

**DashboardIndex**

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

# **googleLoginApiV1GoogleLoginGet**
> any googleLoginApiV1GoogleLoginGet()


### Example

```typescript
import {
    V1Api,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new V1Api(configuration);

const { status, data } = await apiInstance.googleLoginApiV1GoogleLoginGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**any**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **logoutApiV1OauthLogoutPost**
> logoutApiV1OauthLogoutPost()


### Example

```typescript
import {
    V1Api,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new V1Api(configuration);

const { status, data } = await apiInstance.logoutApiV1OauthLogoutPost();
```

### Parameters
This endpoint does not have any parameters.


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**204** | Successful Response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **oauthCallbackApiV1OauthCallbackGet**
> any oauthCallbackApiV1OauthCallbackGet()


### Example

```typescript
import {
    V1Api,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new V1Api(configuration);

let code: string; // (default to undefined)
let state: string; // (default to undefined)

const { status, data } = await apiInstance.oauthCallbackApiV1OauthCallbackGet(
    code,
    state
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **code** | [**string**] |  | defaults to undefined|
| **state** | [**string**] |  | defaults to undefined|


### Return type

**any**

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

# **refreshAccessTokenApiV1OauthRefreshPost**
> any refreshAccessTokenApiV1OauthRefreshPost()


### Example

```typescript
import {
    V1Api,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new V1Api(configuration);

let refreshToken: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.refreshAccessTokenApiV1OauthRefreshPost(
    refreshToken
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **refreshToken** | [**string**] |  | (optional) defaults to undefined|


### Return type

**any**

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
    V1Api,
    Configuration,
    UpdateAccount
} from './api';

const configuration = new Configuration();
const apiInstance = new V1Api(configuration);

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

# **validateAccessTokenApiV1OauthValidatePost**
> any validateAccessTokenApiV1OauthValidatePost()


### Example

```typescript
import {
    V1Api,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new V1Api(configuration);

let accessToken: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.validateAccessTokenApiV1OauthValidatePost(
    accessToken
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **accessToken** | [**string**] |  | (optional) defaults to undefined|


### Return type

**any**

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

