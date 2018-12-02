# Ajax

Simple, cross-browser compatible library for making AJAX calls. This library is a simple wrapper around the native XMLHTTPRequest API. Ajax works similarly to `jQuery.ajax()`, with some major differences. This library does not support Promise-style chaining or jsonp.

### Usage

```js
'use strict';

// Syntax
// ajax(options);

// Simple example
ajax({
    url: '/path/to/some/url',

    // Default request type
    method: 'GET',

    // Response MIME type
    // If set to 'json', will automatically parsed,
    // other data types need to be parsed manually
    dataType: 'json',

    // Data object will be serialized and URL encoded by default
    // This can be changed via the contentType option
    data: { foo: 'bar' },

    // Success handler
    success: (response) => {
        // Handle response
        console.log(response);
    },

    // Error handler
    error: (xhr, statusCode, err) => {
        // Handle error
        console.error(statusCode, err);
    }
});
```

### Options

| Option | Value(s) | Purpose                 |
| ------ | -------- | ----------------------- |
| url    | `String` | The URL for the request |
| method | `String` | The request type, defaults to `GET` |
| dataType | `String` | The expected response type, defaults to empty string (equivalent to 'text').<br><br>Used to set the `xhr.responseType` value. Only accepts the following: '', 'text', 'arrayBuffer', 'blob', 'document', 'json' |
| data | `Object` | The data to be sent with the request.<br><br>If data is an object and `options.method` is `'GET'` or `'HEAD'`, then it is serialized and URL encoded and concatenated on to the end of the request URL, if `options.data` is a string then it is concatenated to the end of the URL.<br><br>If `options.method` is anything other than `'GET'` or `'HEAD'`, then it is sent as the `body` content for the request. <br><br>As a convenience, if `options.contentType` is overridden to a string containing `application/json`, and `options.data` is an object, then it is first serialized using `JSON.stringify` |
| contentType | `String` | The value for the `Content-Type` HTTP header. Defaults to 'application/x-www-form-urlencoded; charset=UTF-8'. If set to a string containing 'application/json' and `optiosn.data` is an object, the data will be serialized and sent as the request body |
| headers | `Object` | An object containing HTTP headers to be sent with the request. For the `Content-Type` header, use `options.contentType`.
| success | `function(response){ }` | Success handler, accepts a single argument which is the response body. If `options.dataType` is 'json', the response will first be parsed using `JSON.parse` |
| error | `function(xhr, statusCode, errText){ }` | Error handler, accepts 3 arguments. The XHR object itself, the returned status code from the HTTP response, and the error text from the response |
| async | `Boolean` | Defaults to `true`, set to `false` for synchronous requests |
| withCredentials | `Boolean` | Defaults to `false`. Set to `true` to set the XHR.withCredentials option to `true`, this will cause the browser to send any relevant cookies along with the request |
