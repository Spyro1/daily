# SyncApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**syncPushApiV1SyncPushPost**](#syncpushapiv1syncpushpost) | **POST** /api/v1/sync/push | Sync Push|

# **syncPushApiV1SyncPushPost**
> SyncPushResponse syncPushApiV1SyncPushPost(syncPushRequest)

Receive locally-stored accounts, categories, and transactions from the frontend and persist them under the current authenticated user.  This is intended as a one-time bulk upload right after the user signs in via Google for the first time.  Rows whose ``id`` already exist are silently skipped (idempotent).

### Example

```typescript
import {
    SyncApi,
    Configuration,
    SyncPushRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new SyncApi(configuration);

let syncPushRequest: SyncPushRequest; //
let accessToken: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.syncPushApiV1SyncPushPost(
    syncPushRequest,
    accessToken
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **syncPushRequest** | **SyncPushRequest**|  | |
| **accessToken** | [**string**] |  | (optional) defaults to undefined|


### Return type

**SyncPushResponse**

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

