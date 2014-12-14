<h1>rjax</h1>

<p>Useful ajax wrapper designed for REST calls</p>

<h3>Setup</h3>
<p>Simply include Rjax into your head tag</p>
<pre>&lt;script src='/path/rjax1.0.js'&gt;&lt;/script&gt;</pre>

<h3>Sending a request</h3>
<p>Sending a request is simple:</p>
<pre>
  Rjax.send("GET", "http://myrestapi", null, function(response){
    // Response handler
  });
</pre>
<p><code>send</code> returns a handle to the request.</p>

<h5>POST</h5>
<p>POST data can be provided as an object or as a string:</p>
<pre>
  Rjax.send("POST", "http://myrestapi", {
    "arg1": "value1",
    "arg2": "value2",
  });
</pre>

<h5>Options</h5>
<p>Extra options can be provided:</p>
<pre>
  Rjax.send("POST", "http://myrestapi", {
    "arg1": "value1",
    "arg2": "value2",
  }, function(){
    // Response handler
  }, {
    "timeout": timeout, // A timeout is milliseconds before the request is cancelled
    "reference": object // A custom reference to be passed to the response handler
  });
</pre>
<p>All options are <code>null</code> by default. You can set the default options globally after Rjax is included:</p>
<pre>
  Rjax.defaultOptions.timeout = 1000; // Set global default timeout to 1 second
</pre>

<h3>Responding to a request</h3>
The respond handler offers some variables for use:
<pre>
  function responseHandler(body, code, headers, options){
    // Do stuff here
  }
  
  Rjax.send("POST", "http://myrestapi", null, responseHandler);
</pre>
<p>The body returned is a type sensitive to the <code>Content-type</code> of the response:</p>
<ul>
  <li><code>text/xml</code> - XMLDocument</li>
  <li><code>text/json</code> - object</li>
  <li><code>text/html</code> - DOMElement</li>
</ul>
<p>If the response <code>Content-type</code> is <code>text/html</code>, then all <code>&lt;script&gt;</code> tags will be explicitly executed on response. This means functions declared in the response will become available for use.

<h3>Syncing requests</h3>
<p>It can be useful to know when all Rjax requests have made it home:</p>
<pre>
  Rjax.sync(function(){
    // All Rjax requests have returned; do something important
  });
</pre>

<h3>Cancel a request</h3>
<p>Cancelling a request is simple. Use the handle return from the <code>send</code> function:</p>
<code>Rjax.cancel(handle);</code>

<h3>License</h3>
<p>Copyright © 2014 - Jackson Capper<br/>
<a href='https://github.com/jacksoncapper/rjax' target='_blank'>https://github.com/jacksoncapper/rjax</a></p>
<p>Permission is granted to any person obtaining a copy of this software including the rights to use, copy, and modify subject to that this license is included in all copies or substantial portions of the software. This software is provided without warranty of any kind. The author or copyright holder cannot be liable for any damages arising from the use of this software.</p>
