var Rjax = {};
Rjax._threads = [];

Rjax.base64 = function(input){
    var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;

    var utftext = "";
	input = input.replace(/\r\n/g,"\n");
    for(var n = 0; n < input.length; n++){
        var c = input.charCodeAt(n);
        if(c < 128)
            utftext += String.fromCharCode(c);
        else if((c > 127) && (c < 2048)){
            utftext += String.fromCharCode((c >> 6) | 192);
            utftext += String.fromCharCode((c & 63) | 128);
        }
        else{
            utftext += String.fromCharCode((c >> 12) | 224);
            utftext += String.fromCharCode(((c >> 6) & 63) | 128);
            utftext += String.fromCharCode((c & 63) | 128);
        }
    }
	input = utftext;

    while(i < input.length){
        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
            enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
            enc4 = 64;
        }

        output = output +
        keyStr.charAt(enc1) + keyStr.charAt(enc2) +
        keyStr.charAt(enc3) + keyStr.charAt(enc4);
    }

    return output;
};
Rjax.unbase64 = function(data){
    var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
     var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
       ac = 0,
       dec = '',
       tmp_arr = [];

     if (!data) {
       return data;
     }

     data += '';

     do { // unpack four hexets into three octets using index points in b64
       h1 = b64.indexOf(data.charAt(i++));
       h2 = b64.indexOf(data.charAt(i++));
       h3 = b64.indexOf(data.charAt(i++));
       h4 = b64.indexOf(data.charAt(i++));

       bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;

       o1 = bits >> 16 & 0xff;
       o2 = bits >> 8 & 0xff;
       o3 = bits & 0xff;

       if (h3 == 64) {
         tmp_arr[ac++] = String.fromCharCode(o1);
       } else if (h4 == 64) {
         tmp_arr[ac++] = String.fromCharCode(o1, o2);
       } else {
         tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
       }
     } while (i < data.length);

     dec = tmp_arr.join('');

     return dec.replace(/\0+$/, '');
};

Rjax.defaultOptions = {
	reference: null,
	timeout: null
};

Rjax.send = function(method, url, headers, body, response, options){
	function extractDomain(url){var a = document.createElement('a'); a.href = url; return a.hostname;}

	options = options != null ? options : {};
	for(var name in Rjax.defaultOptions)
		options[name] = options[name] != null ? options[name] : Rjax.defaultOptions[name];
	
	if(url === null)
		url = location.href
	else if(url[0] == "?")
		url = location.href + url;
	else if(url[0] == "/")
		url = extractDomain(location.href) + url;
	if(url.indexOf("http://") < 0 && url.indexOf("https://") < 0)
		url = "http://" + url;
	
	if(XMLHttpRequest !== undefined)
		var ajax = new XMLHttpRequest();
	else if(extractDomain(url) == extractDomain(location.href))
		var ajax = new XDomainRequest();
	else
		var ajax = new ActiveXObject("Microsoft.XMLHTTP");

	ajax.open(method, url, true);
	
	if(headers != null)
		for(var headerName in headers)
			ajax.setRequestHeader(headerName, headers[headerName]);
	
	if(typeof(body) == "string")
		var body = body;
	else if(typeof(body) == "object")
		if(window.FormData !== undefined){
			var form = new FormData();
			for(var name in body)
				form.append(name, body[name]);
			body = form;
		}
		else{
			var body = "";
			for(var postName in body)
				body += (body != "" ? "&" : "") + encodeURIComponent(postName) + "=" + encodeURIComponent(body[postName]);
		}
	
	if(options.timeout != null)
		ajax.timeoutX = setTimeout(function(){
			Rjax.cancel(ajax);
			if(response != null)
				response(null, "timeout", null);
		}, options.timeout);
	
	ajax.onreadystatechange = function(){
		if(ajax.readyState != 4 && ajax.readyState != "complete")
			return;
		
		clearTimeout(ajax.timeoutX);
		
		var code = ajax.status;
		var headers = ajax.getAllResponseHeaders();
		var contentType = ajax.getResponseHeader("content-type").split("/")[1].split(";")[0];
		var body = ajax.responseText;
	
		Rjax._threads.splice(Rjax._threads.indexOf(ajax), 1);
		Rjax._callSync();
	
		if(response != null){
			if(body != null && body != "")
				if(contentType == "xml")
					var body = ajax.responseXML.documentElement;
				else if(contentType == "json")
					var body = eval("(" + body + ")");
				else if(contentType == "html"){
					while(body.indexOf("<script") > -1 || body.indexOf("</script") > -1){
						var s = body.indexOf("<script");
						var s_e = body.indexOf(">", s);
						var e = body.indexOf("</script", s);
						var e_e = body.indexOf(">", e);
						var script = body.substring(s_e + 1, e);
						if(window.execScript){
							if(script != "")
								window.execScript(script);
						}
						else
							window.eval.call(window, script);
						body = body.substring(0, s) + body.substring(e_e + 1);
					}
					var html = document.createElement("div");
					html.innerHTML = body;
					var body = html;
				}
			response(body, code, headers, options);
		}
	};
	if(XMLHttpRequest === undefined && ajax instanceof XDomainRequest){
		ajax.onload = ajax.onreadystatechange;
		ajax.onreadystatechange = null;
		delete ajax.onreadystatechange;
	}

	ajax.send(body);

	Rjax._threads[Rjax._threads.length] = ajax;
	
	return ajax;
};

Rjax.cancel = function(ajax){
	clearTimeout(ajax.timeoutX);
	ajax.abort();
};

Rjax._syncDones = [];
Rjax._callSync = function(){
	if(Rjax._threads.length > 0)
		return;
	for(var i = 0; i < Rjax._syncDones.length; i++){
		Rjax._syncDones[0]();
		Rjax._syncDones.splice(0, 1);
	}
};
Rjax.sync = function(done){
	Rjax._syncDones[Rjax._syncDones.length] = done;
	Rjax._callSync();
};
