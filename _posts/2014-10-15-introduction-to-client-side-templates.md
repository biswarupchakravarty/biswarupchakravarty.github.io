---
layout: post
title: Introduction To Client Side Templates
excerpt: "This post is hopefully going to answer the following questions:

&#8226; When should I use client side templating?
&#8226; What are the basic types of client side templating engines?
&#8226; What are the features that I should be on the lookout for when picking out a templating engine?"

tags:
  - JavaScript
  - Webapps
  - Templating
---

This post is hopefully going to answer the following questions:

*   When should I use client side templating?
*   What are the basic types of client side templating engines?
*   What are the features that I should be on the lookout for when picking out a templating engine?

<small>Why? Because I recently saw the most god-awful template written by a friend of mine. And when I quizzed him on the abomination, his answers scared me.</small>

<!--more-->

## Why Client-Side Templating

Web applications are getting more and more structured (and complicated) now-a-days, with most applications enforcing a separation between the data and the presentation layer. Simply rendering a JSP/ASPX/ERB on the server and spitting it out is no longer going to cut it. Each screen in a modern webapp is generally comprised of many different sections, with each section representing different data (aka views).

There are many reasons to use client side templating, some factors to take into account are:

*   A screen is composed of different sections viz. some are static and some have to be periodically refreshed from the server.
*   Different sections refresh at different rates : ex. an activity feed refreshes much faster than your main timeline.
*   The same data (models) may have different presentations at the same time, for example, fresher news stories may be rendered in a more attention grabbing manner as compared to older ones.
*   Your server is simply a [REST interface](http://en.wikipedia.org/wiki/Representational_state_transfer) and not a full fledged web-server or you are interfacing with someone else's APIs (ex twitter et al)

In most of the above scenarios, it is not going to be advisable to generate HTML on the server (and in some cases, its going to be impossible to do so) and serve it to the client. This is where client side templating steps in.

## What is Client-Side Templating?

As the name suggests, client side templating means evaluating templates in the browser (via Javascript) as opposed to evaluating them on the server. There are plenty of templating engines out there, both traditional and logic-less flavors.

### Traditional (Non Logic Less Templates)

These templates allow the programmer to mix in a ton of logic, be it presentation logic or business logic, into the template. A simple example is the underscore templating engine, available with the popular (and awesome!) [underscore.js](http://underscorejs.org/) library.

Consider an example (using underscore's template engine) wherein you have to display the current day (which can be computed programmatically) and the current user's name (which will have to be provided to the template externally):

_HTML_

{% highlight html %}
<script id="tmplCurrentDay" type="text/x-template">
  <% var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']; %>
  <% var currentDay = days[(new Date()).getDay()]; %>
  Hello <%= name %>, today is <%= currentDay %>!
</script>
{% endhighlight %}

_JavaScript_

{% highlight js %}
var template = _.template(document.getElementById('tmplCurrentDay').innerHTML);
var content = template({ name: 'John Doe'}).trim();
alert(content);
{% endhighlight %}

As you can see, we have js logic embedded right in the template. In a situation like this, it might work out to be in our favor but more often than not, templates are much larger and turn out to be a mess of logic ( in javascript ) and template code ( pseudo html ).

### Logic Less Templates

Logic less templates, as the name suggests, do not support arbitrary code evaluation in them. In most cases they only allow `if` statements and `for` loops. Some allow for evaluating external functions and there are others still that allow registering helper methods with the templating engine itself that are globally accessible from any template (imagine a globally available `currentUser()` function which when evaluated returns the current user's name).

Let's take up the same example, but with Mustache this time.

_HTML_

{% highlight html %}
<script id="tmplCurrentDay" type="text/x-template">
  <% var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']; %>
  <% var currentDay = days[(new Date()).getDay()]; %>
  Hello <%= name %>, today is <%= currentDay %>!
</script>
{% endhighlight %}

_JavaScript_

{% highlight js %}
var template = document.getElementById('tmplCurrentDay').innerHTML.trim();
var data = {
  name: 'Biswarup',
  currentDay: function () {
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[(new Date()).getDay()];
  }
};
var content = Mustache.render(template, data);
alert(content);
{% endhighlight %}

Notice the ridiculously clean separation between presentation and data? It might look like overkill for something this small, but imagine a much bigger view (maybe a dashboard?). The spagetti of business logic code and UI code in the same file gets to be an absolute nightmare very, very fast. That is where logic-less templates shine.

## Features (or stuff you may want to make a note of)

### Precompilation

In most modern templating engines, the template is first precompiled into a function when it's initialized or when it's evaluated for the first time. Subsequent calls can skip the parsing and tokenization stages and are evaluated much quicker.

Another advantage that comes from this is that the precompilation step can actually be performed on the server itself. This significantly speeds up the rendering on the client. [Handlebars](http://handlebarsjs.com/) on Node.js and [Hogan.js](http://twitter.github.io/hogan.js/) are examples of popular templating engines that precompile client templates on the server.

### HTML Escaping
{% assign b = '{' %}
Since the most common use-case of templates is to generate client side HTML (well, duh!), most have inbuilt methods to escape HTML before evaluation is completed. Conventionally they are differentiated based on the escape sequence used, ex. underscore uses `<%=` for unescaped and `<%-` for HTML escaped, and Mustache uses `{{b}}{{b}}` for escaped and `{{b}}{{b}}{{b}}` for the raw, unescaped form.

### Partials

If you're thinking of building out a larger application, you might want a template to inherit another one; or you may want a larger template to be composed of smaller templates. In the templating world, the smaller templates are called _partials_. Many libraries have good support for partials, including [dustjs](http://akdubya.github.io/dustjs/) and Mustache.js.

### Scoping &amp; Context

If your data models are going to be large objects with deep structure, then it may be in your favor to check out how the templating engine provides scope and what is the context in which the template is evaluated. ex., most templating engines will walk up the object chain in order to find the required property and only return an empty string if it doesn't find the required property in any of the parent objects.

Consider the model:

_JavaScript_

{% highlight js %}
var person = {
  "name": "Biswarup",
  "age": 26,
  "addresses": [{
    "name": "Home",
    "line1": "[[ snip ]]"
  }, {
    "name": "Office",
    "line1": "[[ snip ]]"
  }]
}
{% endhighlight %}

If you're iterating inside the `addresses` property and are rendering all the addresses, then the second object's `name` **will** show up as `'Biswarup'` (and not an empty string). Now this may or may not be a good thing, but you need to be aware of this before you've made your choice.

### Blocks (Inline Partials)

Blocks are a powerful (and I personally find them very useful) feature of certain template libraries like [Jade](http://jade-lang.com/). If you're familiar with Ruby on Rails, imagine blocks to be somewhat similar to `content_for` blocks, but they can be overriden **or** appended/prepended to by any other partials that reference the template. They're very useful on the server. OOTH, for client side templates, not having blocks is generally not a blocker.

### Comments

Comments are also supported by most templating libraries and most of them strip out the comments from the output while evaluation. Some support only single line comments while others support multi-line comments as well.

### Remote Loading

Certain libraries (ex., Dust) support remote loading of templates from the server, without the programmer explicitly having to write the boilerplate to fire off an AJAX call, validate the response and precompile and register the template. Again, this is something that is more of a nice-to-have and generally not really a must-have.

## Conclusion &#8211; Making the Decision

In my experience, non logic less templates may seen more enticing (they're easier to prototype with) but I've generally gravitated towards the logic less templates (primarily Mustache). More than your choice of templating engine, it'll be the practices you follow that will determine whether going with client side templating turns out to be a win for you or not.

<small>Note: if you (or your teammates) are not comfortable with client side templating in general or have just transitioned from, say, JSPs or ASPX, then I suggest you pick logic-less templates. It becomes mighty easy to shoot oneself in the foot with a more powerful engine.</small>

Coming Soon: Best Practices with Client Side Templates