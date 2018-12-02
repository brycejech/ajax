'use strict';

var ajax = (function(){

    // List of available xhr objects
    var factories = [
        function () { return new XMLHttpRequest() },
        function () { return new ActiveXObject('Msxml3.XMLHTTP') },
        function () { return new ActiveXObject('Msxml2.XMLHTTP.6.0') },
        function () { return new ActiveXObject('Msxml2.XMLHTTP.3.0') },
        function () { return new ActiveXObject('Msxml2.XMLHTTP') },
        function () { return new ActiveXObject('Microsoft.XMLHTTP') }
    ];


    return function ajax(opts){
        // Options must be an object
        if(!opts || _type(opts) != 'object'){
            throw new Error('Options must be an object');
        }

        // Get our xhr object for the current platform
        var xhr = _getRequestObject();
        if(!xhr){
            throw new Error('Ajax not supported!');
        }

        // Override the server response mime type if available
        // Prevents XML parsing error on response
        if(xhr.overrideMimeType) xhr.overrideMimeType('text/plain');

        // Set the withCredentials xhr flag
        xhr.withCredentials = opts.withCredentials || false;

        // Set up xhr options and open
        var method  = (opts.method) ? opts.method.toUpperCase() : 'GET',
            isAsync = (opts.hasOwnProperty('async') && typeof(opts.async) == 'boolean') ? opts.async : true;

        var url  = opts.url,
            data = opts.data,
            contentType = opts.contentType || 'application/x-www-form-urlencoded; charset=UTF-8';


        if(method === 'GET' || method === 'HEAD'){

            if(data){
                // Prepare data object
                if(_type(data) === 'object'){
                    data = _parameterize(data);
                    url += '?' + data;
                }
                // Assume user has prepared
                else{
                    url += data;
                }
            }
        }
        else{ // POST, PUT, PATCH, DELETE, ETC

            // Ensure data is serialized if sending form data

            // URL Encoded
            if(contentType.indexOf('x-www-form-urlencoded') !== -1){
                if(typeof data === 'object'){
                    data = _parameterize(data);
                }
            }
            // JSON Encoded
            else if(contentType.indexOf('application/json') !== -1){
                if(typeof data === 'object'){
                    data = JSON.stringify(data);
                }
            }
        }

        xhr.open(method, url, isAsync, opts.username, opts.password);

        xhr.setRequestHeader('Content-Type', contentType);

        if(isAsync){
            // Set the responseType if provided, defaults to '' which will cause
            // browser to parse response as DOMString.
            // Attempting to set responseType for synchronous requests will throw
            // an InvalidAccessError
            // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType
            var supportedTypes = [ '', 'text', 'arrayBuffer', 'blob', 'document', 'json' ];
            var dataType = '';
            if(opts.hasOwnProperty('dataType')){
                if(supportedTypes.indexOf(opts.dataType) !== -1) dataType = opts.dataType;
            }
            xhr.responseType = dataType;
        }

        // Pass along any supplied headers
        if(opts.headers){
            if(_type(opts.headers) !== 'object'){
                throw new Error('Headers option must be an object');
            }
            for(var header in opts.headers){
                xhr.setRequestHeader(header, opts.headers[header]);
            }
        }

        xhr.onreadystatechange = function(){
            // Return if not ready
            if(xhr.readyState != 4) return;

            // Handle errors
            if(xhr.status >= 400){
                _type(opts.error) === 'function' && (opts.error(xhr, xhr.status, xhr.statusText));
                return;
            }

            // Handle success
            // Use xhr.response instead of xhr.responseText
            // When using xhr.response, the type varies depending on xhr.responseType set by user.
            // xhr.responseText is not available if xhr.responseType is anything other than '', 'document', or 'moz-chunked-text'.
            // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/response
            var res = xhr.response;

            if(opts.dataType){
                // Determine if response needs to be parsed and act accordingly
                if(_type(res) === 'string'){
                    var t = opts.dataType.toLowerCase();

                    switch(t){
                        case 'json':
                            res = JSON.parse(res);
                            break;
                        default:
                            break;
                    }
                }
            }

            // Call the success handler
            _type(opts.success) === 'function' && (opts.success(res));
        }

        // Send the request
        xhr.send(data);
    }

    // Helper fn to get appropriate xhr object
    function _getRequestObject(){
        var xmlhttp = false;

        for(var i = 0, len = factories.length; i < len; i++){
            try{
                xmlhttp = factories[i]();
            }
            catch(e){
                continue;
            }
            break;
        }
        return xmlhttp;
    }

    // Helper fn for type checking
    function _type(thing){
        return Object.prototype.toString.call(thing).match(/\[object (.*)\]/)[1].toLowerCase();
    }

    function _parameterize(o){
        if(typeof o === 'string') return o;

        var queryStringParts = [];

        for(var key in o){
            var str = encodeURIComponent(key) + '=' + encodeURIComponent(o[key]);
            queryStringParts.push(str);
        }

        if(queryStringParts.length){
            return queryStringParts.join('&');
        }
        return '';
    }

})();
