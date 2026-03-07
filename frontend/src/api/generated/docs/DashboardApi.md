# DashboardApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getDashboardApiV1Get**](#getdashboardapiv1get) | **GET** /api/v1 | Get Dashboard|

# **getDashboardApiV1Get**
> any getDashboardApiV1Get()


### Example

```typescript
import {
    DashboardApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DashboardApi(configuration);

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

