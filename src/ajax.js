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
    function _getType(thing){
        if(typeof thing === 'undefined'){
            return 'undefined';
        }
        else if(typeof thing === 'number'){
            if(isNaN(thing)){
                return 'NaN';
            }
            return 'number';
        }
        return Object.prototype.toString.call(thing).match(/\[\w+\s(\w+)]/)[1].toLowerCase();
    }


    return function ajax(opts){
        // Options must be an object
        if(!opts || _getType(opts) != 'object'){
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
        var method      = (opts.method) ? opts.method.toUpperCase() : 'GET',
            isAsync     = (opts.async) ? opts.async : true;

        xhr.open(method, opts.url, isAsync, opts.username, opts.password);

        // Set content type if we are working with form data
        if(opts.data){
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        }

        // Pass along any supplied headers
        if(opts.headers){
            if(_getType(opts.headers) !== 'object'){
                throw new Error('Headers must be of type array');
            }
            for(header in opts.headers){
                xhr.setRequestHeader(header, opts.headers[header]);
            }
        }

        xhr.onreadystatechange = function(){
            // Return if not ready
            if(xhr.readyState != 4) return;

            // Handle errors
            if(xhr.status >= 400){
                console.log(xhr);
                opts.err(xhr, xhr.status, xhr.statusText);
                return;
            }

            // Handle success
            var res = xhr.responseText;
            if(opts.dataType){
                var t = opts.dataType.toLowerCase();

                switch(t){
                    case 'json':
                        res = JSON.parse(res);
                        break;
                }
            }
            opts.success(res);

        }

        // Send the request
        xhr.send(opts.data);
    }

})();
