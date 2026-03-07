# V1Api

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getDashboardApiV1Get**](#getdashboardapiv1get) | **GET** /api/v1 | Get Dashboard|
|[**googleLoginApiV1GoogleLoginGet**](#googleloginapiv1googleloginget) | **GET** /api/v1/google/login | Google Login|
|[**loginForAccessTokenApiV1OauthTokenPost**](#loginforaccesstokenapiv1oauthtokenpost) | **POST** /api/v1/oauth/token | Login For Access Token|
|[**logoutApiV1OauthLogoutPost**](#logoutapiv1oauthlogoutpost) | **POST** /api/v1/oauth/logout | Logout|
|[**oauthCallbackApiV1OauthCallbackGet**](#oauthcallbackapiv1oauthcallbackget) | **GET** /api/v1/oauth/callback | Oauth Callback|

# **getDashboardApiV1Get**
> any getDashboardApiV1Get()


### Example

```typescript
import {
    V1Api,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new V1Api(configuration);

const { status, data } = await apiInstance.getDashboardApiV1Get();
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

# **loginForAccessTokenApiV1OauthTokenPost**
> any loginForAccessTokenApiV1OauthTokenPost()


### Example

```typescript
import {
    V1Api,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new V1Api(configuration);

let refreshToken: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.loginForAccessTokenApiV1OauthTokenPost(
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

