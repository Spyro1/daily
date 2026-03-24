# RootApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**readMainGet**](#readmainget) | **GET** / | Read Main|

# **readMainGet**
> any readMainGet()


### Example

```typescript
import {
    RootApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RootApi(configuration);

const { status, data } = await apiInstance.readMainGet();
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

