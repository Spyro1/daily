# CategoriesApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createMyNewCategoryApiV1CategoriesPost**](#createmynewcategoryapiv1categoriespost) | **POST** /api/v1/categories | Create My New Category|
|[**deleteMyCategoryApiV1CategoriesCategoryIdDelete**](#deletemycategoryapiv1categoriescategoryiddelete) | **DELETE** /api/v1/categories/{category_id} | Delete My Category|
|[**getMyCategoriesApiV1CategoriesGet**](#getmycategoriesapiv1categoriesget) | **GET** /api/v1/categories | Get My Categories|
|[**getMyCategoryApiV1CategoriesCategoryIdGet**](#getmycategoryapiv1categoriescategoryidget) | **GET** /api/v1/categories/{category_id} | Get My Category|
|[**updateMyCategoryApiV1CategoriesCategoryIdPatch**](#updatemycategoryapiv1categoriescategoryidpatch) | **PATCH** /api/v1/categories/{category_id} | Update My Category|

# **createMyNewCategoryApiV1CategoriesPost**
> any createMyNewCategoryApiV1CategoriesPost(createCategory)


### Example

```typescript
import {
    CategoriesApi,
    Configuration,
    CreateCategory
} from './api';

const configuration = new Configuration();
const apiInstance = new CategoriesApi(configuration);

let createCategory: CreateCategory; //
let accessToken: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.createMyNewCategoryApiV1CategoriesPost(
    createCategory,
    accessToken
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createCategory** | **CreateCategory**|  | |
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

# **deleteMyCategoryApiV1CategoriesCategoryIdDelete**
> deleteMyCategoryApiV1CategoriesCategoryIdDelete()


### Example

```typescript
import {
    CategoriesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CategoriesApi(configuration);

let categoryId: string; // (default to undefined)
let accessToken: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.deleteMyCategoryApiV1CategoriesCategoryIdDelete(
    categoryId,
    accessToken
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **categoryId** | [**string**] |  | defaults to undefined|
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

# **getMyCategoriesApiV1CategoriesGet**
> Array<CategoryIndex> getMyCategoriesApiV1CategoriesGet()


### Example

```typescript
import {
    CategoriesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CategoriesApi(configuration);

let accessToken: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.getMyCategoriesApiV1CategoriesGet(
    accessToken
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **accessToken** | [**string**] |  | (optional) defaults to undefined|


### Return type

**Array<CategoryIndex>**

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

# **getMyCategoryApiV1CategoriesCategoryIdGet**
> CategoryIndex getMyCategoryApiV1CategoriesCategoryIdGet()


### Example

```typescript
import {
    CategoriesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CategoriesApi(configuration);

let categoryId: string; // (default to undefined)
let accessToken: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.getMyCategoryApiV1CategoriesCategoryIdGet(
    categoryId,
    accessToken
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **categoryId** | [**string**] |  | defaults to undefined|
| **accessToken** | [**string**] |  | (optional) defaults to undefined|


### Return type

**CategoryIndex**

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

# **updateMyCategoryApiV1CategoriesCategoryIdPatch**
> CategoryIndex updateMyCategoryApiV1CategoriesCategoryIdPatch(updateCategory)


### Example

```typescript
import {
    CategoriesApi,
    Configuration,
    UpdateCategory
} from './api';

const configuration = new Configuration();
const apiInstance = new CategoriesApi(configuration);

let categoryId: string; // (default to undefined)
let updateCategory: UpdateCategory; //
let accessToken: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.updateMyCategoryApiV1CategoriesCategoryIdPatch(
    categoryId,
    updateCategory,
    accessToken
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateCategory** | **UpdateCategory**|  | |
| **categoryId** | [**string**] |  | defaults to undefined|
| **accessToken** | [**string**] |  | (optional) defaults to undefined|


### Return type

**CategoryIndex**

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

