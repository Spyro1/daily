# OauthApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getAccessTokenStringApiV1OauthTokenGet**](#getaccesstokenstringapiv1oauthtokenget) | **GET** /api/v1/oauth/token | Get Access Token String|
|[**googleLoginApiV1GoogleLoginGet**](#googleloginapiv1googleloginget) | **GET** /api/v1/google/login | Google Login|
|[**logoutApiV1OauthLogoutPost**](#logoutapiv1oauthlogoutpost) | **POST** /api/v1/oauth/logout | Logout|
|[**oauthCallbackApiV1OauthCallbackGet**](#oauthcallbackapiv1oauthcallbackget) | **GET** /api/v1/oauth/callback | Oauth Callback|
|[**refreshAccessTokenApiV1OauthRefreshPost**](#refreshaccesstokenapiv1oauthrefreshpost) | **POST** /api/v1/oauth/refresh | Refresh Access Token|
|[**validateAccessTokenApiV1OauthValidatePost**](#validateaccesstokenapiv1oauthvalidatepost) | **POST** /api/v1/oauth/validate | Validate Access Token|

# **getAccessTokenStringApiV1OauthTokenGet**
> string getAccessTokenStringApiV1OauthTokenGet()


### Example

```typescript
import {
    OauthApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OauthApi(configuration);

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

# **googleLoginApiV1GoogleLoginGet**
> any googleLoginApiV1GoogleLoginGet()


### Example

```typescript
import {
    OauthApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OauthApi(configuration);

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
    OauthApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OauthApi(configuration);

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
    OauthApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OauthApi(configuration);

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
> ResponseMessage refreshAccessTokenApiV1OauthRefreshPost()


### Example

```typescript
import {
    OauthApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OauthApi(configuration);

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

**ResponseMessage**

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

# **validateAccessTokenApiV1OauthValidatePost**
> ResponseMessage validateAccessTokenApiV1OauthValidatePost()


### Example

```typescript
import {
    OauthApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OauthApi(configuration);

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

**ResponseMessage**

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

