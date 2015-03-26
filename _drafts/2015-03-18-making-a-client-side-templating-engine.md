---
  layout: post
  title: Making a Client Side Templating Engine
  tags:
    - JavaScript
    - Webapps
    - Templating
---

This is a follow up post to [Introduction To Client Side Templates](http://shiny.co.in/introduction-to-client-side-templates/). The previous article introduces client side templating and walks through some features that they generally have. This post is going to actually explain how client side templating works.

We are going to create a simple template engine from scratch.



## Building Our Template Engine

### Features

Now that we've established that we need to create a templating engine, let's quickly jot down what features it should provide

* It should [precompile](/introduction-to-client-side-templates/#precompilation). When fed a template string, it should process that and return a function that can be called multiple times to generate the output.
* It should not be a [logic less template](http://shiny.co.in/introduction-to-client-side-templates/#traditional-non-logic-less-templates-). It should be able to execute javascript code from within the template.
* **Bonus: ** Our templating engine should support [inheritance/partials](http://shiny.co.in/introduction-to-client-side-templates/#partials). 


### Setting Up the Test Driven Development Environment

I like TDD and it fits well here (as we know how a template engine is supposed to behave) so lets get started on the environment.

Create an HTML file first:

{% highlight html %}
<!DOCTYPE html>
<html>
<head>
  <title>A Client Side Templating Engine</title>
  <style type="text/css">
    * {
      font-family: monospace;
      font-size: 16px;
    }
    .pass {
      color: green;
      font-weight: bold;
    }
    .fail {
      color: red;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div id="result"></div>
</body>
<script type="text/javascript" src="main.js"></script>
</html>
{% endhighlight %}

And then the javascript file:

{% highlight js %}
(function () {

  var t = function (templateString, options) {
    return function() {};
  };

  var tests = [
    { template: '', data: {}, expected: '' },
    { template: 'Hello World!', data: {}, expected: 'Hello World!' }
  ];

  var resultHTML = ['<table border=1 width=100%>'];
  resultHTML.push('<tr><th>#</th><th>Input</th><th>Data</th><th>Expected Result</th><th>Actual Result</th><th>Status</th></tr>');

  tests.forEach(function (test, index) {
    var input = t(test.template);
    var output = input(test.data);
    var result = output == test.expected ? 'Pass' : 'Fail';

    resultHTML.push('<tr>');
    resultHTML.push('<td>' + index + '</td>');
    resultHTML.push('<td>"' + test.template + '"</td>');
    resultHTML.push('<td>' + JSON.stringify(test.data) + '</td>');
    resultHTML.push('<td><pre>"' + test.expected + '"</pre></td>');
    resultHTML.push('<td>' + output + '</td>');
    resultHTML.push('<td class=' + result.toLowerCase() + '><pre>' + result + '</pre></td>');
    resultHTML.push('</tr>');
  });

  resultHTML.push('</table>')

  document.getElementById('result').innerHTML = resultHTML.join('');

}());
{% endhighlight %}


The basic task of the engine is going to be to accept a string `s1` and return a function `f1`. 

Let's start with a couple of really simple test cases

1. If `s1` is "", then the output should be "".
2. If `s1` is "Hello World", the output should be "Hello World".

This is the result

<div id="result">
  <table class="pure-table pure-table-horizontal table-test-results" width="100%">
    <thead>
      <tr>
        <th>#</th>
        <th>Input</th>
        <th>Data</th>
        <th>Expected Result</th>
        <th>Actual Result</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>0</td>
        <td>""</td>
        <td>{}</td>
        <td>""</td>
        <td>undefined</td>
        <td class="fail">Fail</td>
      </tr>
      <tr>
        <td>1</td>
        <td>Hello World!</td>
        <td>{}</td>
        <td>"Hello World!"</td>
        <td>undefined</td>
        <td class="fail">Fail</td>
      </tr>
    </tbody>
  </table>
</div>


To start off, lets return the original string back.

{% highlight js %}
var t = function (templateString, options) {
  return function() {
    return templateString;
  };
};
{% endhighlight %}

<div id="result"><table class="pure-table pure-table-horizontal table-test-results" width="100%"><thead><tr><th>#</th><th>Input</th><th>Data</th><th>Expected Result</th><th>Actual Result</th><th>Status</th></tr></thead><tbody><tr><td>0</td><td>""</td><td>{}</td><td>""</td><td></td><td class="pass">Pass</td></tr><tr><td>1</td><td>"Hello World!"</td><td>{}</td><td>"Hello World!"</td><td>Hello World!</td><td class="pass">Pass</td></tr></tbody></table></div>


Now the fun part begins, let's add a couple more test cases.

<div id="result"><table class="pure-table pure-table-horizontal table-test-results" width="100%"><thead><tr><th>#</th><th>Input</th><th>Data</th><th>Expected Result</th><th>Actual Result</th><th>Status</th></tr></thead><tbody><tr><td>0</td><td>""</td><td>{}</td><td>""</td><td></td><td class="pass">Pass</td></tr><tr><td>1</td><td>"Hello World!"</td><td>{}</td><td>"Hello World!"</td><td>Hello World!</td><td class="pass">Pass</td></tr><tr><td>2</td><td>"Hello {{name}}!"</td><td>{}</td><td>"Hello !"</td><td>Hello {{name}}!</td><td class="fail">Fail</td></tr><tr><td>3</td><td>"Hello {{name}}!"</td><td>{"name":"Biswarup"}</td><td>"Hello Biswarup!"</td><td>Hello {{name}}!</td><td class="fail">Fail</td></tr><tr><td>4</td><td>"Hello {{name}}!"</td><td>{"age":26}</td><td>"Hello !"</td><td>Hello {{name}}!</td><td class="fail">Fail</td></tr></tbody></table></div>


Now we need to actually start replacing our placeholders. Let's start matching tokens and replacing them with the data thats provided. We'll be doing this in two steps:

* Parse the input string to figure out where the data insertion has to occur
* Replace the template tags with the incoming data

Let's start building up some regexes to match tokens.

{% highlight js %}
var t = function (templateString, options) {
  var tokenizer = /{{(.+)}}/;

  // A library of regular expressions our template
  // engine will support
  var expressions = {
    dataToken: {
      regexp: /\{\{(.*)\}\}/gm,
      type: 'data'
    }
  };

  // debugging
  console.log(expressions.dataToken.regexp.exec(templateString));

  return function (data) {
    var body = templateString;
    return templateString;
  };
};
{% endhighlight %}

And in the console we see

{% highlight js %}
["{{name}}", "name", index: 6, input: "Hello {{name}}!"]
["{{name}}", "name", index: 6, input: "Hello {{name}}!"]
["{{name}}", "name", index: 6, input: "Hello {{name}}!"]
{% endhighlight %}

OK, moving on.









<style type="text/css">
  .table-test-results {
    font-family: monospace;
    font-size: 16px;
  }
  .table-test-results .pass {
    color: green;
    font-weight: bold;
  }
  .table-test-results .fail {
    color: red;
    font-weight: bold;
  }
</style>