# DashboardApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getMyDashboardApiV1DashboardGet**](#getmydashboardapiv1dashboardget) | **GET** /api/v1/dashboard | Get My Dashboard|

# **getMyDashboardApiV1DashboardGet**
> DashboardIndex getMyDashboardApiV1DashboardGet()


### Example

```typescript
import {
    DashboardApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DashboardApi(configuration);

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

