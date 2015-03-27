---
layout: post
title: "ElasticSearch + Ghost: Part II"
tags:
  - Elastic Search
  - Ghost Blog
  - JavaScript
---

This is the second part of the series explaining how to get up and running with elastic search and integrate it into your ( self hosted ) Ghost blog. Make sure you&#8217;ve read the [first part!](/elastic-search-ghost-part-i/)

## Introduction

In the previous part, we set up Elastic Search on our AWS instance. We went over the basics of indices and types, and saw how data is stored, retrieved, searched and deleted in Elastic Search.

In this part, we are going to modify the Ghost blogging server itself and create a way for us to get the content of all the posts out programmatically. We will do this to be able to index (save) the posts into Elastic Search. Instead of doing all the indexing manually, we will create a simple Node.js program that will do it for us.

## Modifying the Ghost Blogging Server

Alright, we are going to add 2 additional APIs to the Ghost web-server:

1.  An API that will simply return a list of all the posts in JSON format. This will be used to feed data into Elastic Search. Let&#8217;s call this the `all_posts` API.
2.  An API that will be used to actually perform the searching. This will primarily be a proxy API and simply connect the client (browser) with Elastic Search. Let&#8217;s call this the `search` API.

The `all_posts` API will only be used internally, i.e. only from the machine that hosts the Ghost blog. Nothing special needs to be done as AWS does not allow access on all ports by default (IIRC it only allows on access on ports 22, 80 and 443).

### Routes and Controllers

#### Routes

Most server side web application frameworks like Rails, Express and even client side MVC frameworks like Backbone.js, Ember.js have a concept of routes. Routes are like rules that dictate what should happen when particular URLs (or URL patterns) are hit. Generally routes specify the URL pattern (via regex) and the controller/method that is supposed to process the request.

For the Ghost server, the routes reside under `core/server/routes`. There are 3 routes files:

<dl>
<dt>`admin.js`</dt>
<dd>This contains the routes for the admin side of things (signin, signup, reset/change password, creating content, the editor, blog settings). Effectively all URLs that reside under `/ghost/` are listed here.</dd>
<dt>`api.js`</dt>
<dd>This contains the routes for all the URLs that are used by the Ghost blog API to work with posts, settings, users, tags, notifications and the import/export of your data.</dd>
<dt>`frontend.js`</dt>
<dd>Aha! This is where the routes for the RSS feed and the routes for the Ghost blog are mentioned (there are only 3 main routes: the `/rss/` URL, the URLs for the posts and the home page route.</dd>
</dl>

#### Controllers

Controllers are tasked with actually processing the request and generating the response that is send to the browser. The controller generally interacts with the models and then renders one or more views to be presented to the user.

Ghost keeps the controllers under `core/server/controllers/` directory. There are 2 controllers:

<dl>
<dt>`admin.js`</dt>
<dd>This controller deals with all the tasks that are performed by the blog administrator</dd>
<dt>`frontend.js`</dt>
<dd>This is the controller that handles the URLs defined in the routes file `/core/server/routes/frontend.js` i.e. showing the homepage, showing the posts and the RSS feed.</dd>
</dl>

### The `All Posts` API

As mentioned earlier The `all_posts` API will be used to fetch all our posts in the JSON format. There are 2 steps to adding a new API.

#### 1. Creating the Route

Let&#8217;s register a new route for our API. SSH into your server and navigate to `/var/www/core/server/routes/` and open `frontend.js`. This is what the file should look like:

{% highlight js %}
var frontend = require('../controllers/frontend');

module.exports = function (server) {
  /*jslint regexp: true */
  // ### Frontend routes
  server.get('/rss/', frontend.rss);
  server.get('/rss/:page/', frontend.rss);
  server.get('/page/:page/', frontend.homepage);
  // Only capture the :slug part of the URL
  // This regex will always have two capturing groups,
  // one for date, and one for the slug.
  // Examples:
  //  Given `/plain-slug/` the req.params would be [undefined, 'plain-slug']
  //  Given `/2012/12/24/plain-slug/` the req.params would be ['2012/12/24/', 'plain-slug']
  //  Given `/plain-slug/edit/` the req.params would be [undefined, 'plain-slug', 'edit']
  server.get(/^\\/([0-9]{4}\\/[0-9]{2}\\/[0-9]{2}\\/)?([^\\/.]*)\\/$/, frontend.single);
  server.get(/^\\/([0-9]{4}\\/[0-9]{2}\\/[0-9]{2}\\/)?([^\\/.]*)\\/edit\\/$/, frontend.edit);
  server.get('/', frontend.homepage);
{% endhighlight %}

The format used to define routes here is `server.HTTP_METHOD( REGULAR_EXPRESSION , CONTROLLER_METHOD )`.

Lets add our own route:

{% highlight js %}
server.get('/all_posts/', frontend.all_posts);
{% endhighlight %}

**Note:** The frontend controller does not yet contain a definition for the function `all_posts`. Do not restart your server just yet as the route is not functional yet and the server will not start (you might get an `Possibly unhandled Error: .get() requires callback functions but got a [object Undefined]` error)

#### 2. Creating the Route Handler in the Controller

Time to define the `all_posts` function that we mentioned in the routes file. Navigate to `/var/www/core/server/controllers/` and open up `frontend.js`. Add in the function to the `frontendControllers` object, like so:

{% highlight js %}

frontendControllers = {

  // function definitions snipped

  "all_posts": function (req, res) {
    api.posts.browse({
      page: 1,
      limit: 1000
    }).then(function (posts) {
      if (!posts || posts.length == 0) {
        res.end("[]");
      } else {
        var output = [];
        posts.posts.forEach(function (p) {
                console.log(p.status)
                output.push({
                    title: p.title,
                    content: p.markdown,
                    slug: p.slug,
                    tags: p.tags.map(function (tag) { return tag.name; }),
                    updated_at: new Date(p.updated_at)
                });
            });
        res.end(JSON.stringify(output));
      }
    });
  },

  // function definitions snipped

};
{% endhighlight %}

This function will fetch all your posts (actually the first 1000 posts), extract the title, content and the URL slug from each, and finally return an array containing the extracted posts. An empty array will be returned if nothing&#8217;s found.

Restart your Ghost server to test out the new route. Navigate to `/all_posts/` via your web browser. You should get something like:

{% highlight json %}
[{
  "title": "Some thoughts about stuff",
  "content": "Readymade bitters authentic before they sold out tofu.",
  "slug": "some-thoughts-about-stuff"
  }, {
  "title": "something",
  "content": "Some blog post!",
  "slug": "something"
  }, {
  "title": "Welcome to Ghost",
  "content": "You're live! Nice. [[...]] Have fun - and let us know what you think :)",
  "slug": "welcome-to-ghost"
  }]
{% endhighlight %}

Pat yourself on the back! You&#8217;ve successfully extended the Ghost blogging platform and added new functionality into it!

## Indexing Posts into ElasticSearch

OK, we&#8217;re almost there. Lets create a very basic (and hack-ish) Node.js script that is going to pull data from our `all_posts` API and dump it into ElasticSearch via the [Bulk API](http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/docs-bulk.html).

### Create the Mass Indexer Script

Create a new file in your home directory called `mass_indexer.js`.

{% highlight bash %}
cd ~
touch mass_indexer.js
{% endhighlight %}

We&#8217;ll use the [Request](https://github.com/mikeal/request) Library to manage our HTTP for us.

{% highlight bash %}
npm install request
{% endhighlight %}

Now open the `mass_indexer.js` file for editing

{% highlight bash %}
vi mass_indexer.js
{% endhighlight %}

Copy-paste the following code in the file and save+quit vi (`:wq!`).

{% highlight js %}
var httpRequest = require('request'),
  getMetaForPosts = function (posts) {
    var requestString = '',
      meta;
    posts.forEach(function (post) {
      meta = {
        create: {
          _index: "posts",
          _type: "post",
          id: ~~(Math.random() * 1000)
        }
      };
      requestString += JSON.stringify(meta) + '\
      ' + JSON.stringify(post) + '\
';
    });
    return requestString;
  }, validate = function (err, response, body) {
    if (err) throw err;
    if (response.statusCode != 200) throw body;
  };

// callback hell!!
httpRequest({
  uri: 'http://localhost:9200'
  }, function (err, response, body) {
  validate(err, response, body);
  console.log("Elastic Search running, deleting posts index...");
  httpRequest.del({
    uri: 'http://localhost:9200/posts/'
  }, function (err, response, body) {
    validate(err, response, body)
    console.log("Deleted index successfully, recreating 'posts' index...");
    httpRequest.put({
      uri: 'http://localhost:9200/posts/'
    }, function (err, response, body) {
      validate(err, response, body);
      console.log("Fetching posts...");
      httpRequest({
        uri: 'http://127.0.0.1:2368/all_posts/'
      }, function (err, response, body) {
        validate(err, response, body);
        var posts = JSON.parse(body);
        if (!posts) throw new Error("Could not fetch posts!");
        console.log("Fetched " + posts.length + " posts, Bulk Indexing posts...");
        httpRequest.post({
          uri: 'http://localhost:9200/posts/post/_bulk',
          body: getMetaForPosts(posts)
        }, function (err, response, body) {
          validate(err, response, body);
          console.log("Done indexing")
        });
      });
    });
  });
});
{% endhighlight %}

<small>(Yes, this needs to be fixed and yes, it looks like an 8 year old wrote it!)</small>

### Index All The Posts!

{% highlight bash %}
node ~/mass_indexer.js
{% endhighlight %}

**Congratulations!**

You&#8217;ve managed to index all your posts into Elastic Search!

## Summary

In this post, we&#8217;ve created a route under `/all_posts/` and written a controller method to get all our blog posts out of Ghost. We&#8217;ve also created a script that will call this API and re-index all of this data into Elastic Search.

* * *

### Coming Up

In the next post, we&#8217;ll create another new API in our installation of Ghost that will actually execute searches on Elastic Search and return the results.

We should probably figure out a way to hook in the indexing script into the Ghost server itself so that it automatically gets triggered whenever a blog post is edited or created.