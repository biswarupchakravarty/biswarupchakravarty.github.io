---
layout: post
title: "ElasticSearch + Ghost: Part III"
tags:
  - Elastic Search
  - Ghost Blog
  - JavaScript
---

This is the third part of the series explaining how to integrate Elastic Search with your self hosted Ghost blog. Make sure to have read parts [one](/elastic-search-ghost-part-i/) and [two](/elastic-search-ghost-part-ii/) first!

## Introduction

Up until the previous part, we've covered the basics of Elastic Search and we've modified the Ghost server to create an API that will return all of our posts in the JSON format. We've also created a script that will call this API and index all of the posts into Elastic Search.

In this part, we are going to create the API on the server that will execute the actual search. This API will receive the search query, proxy it through to Elastic Search and then send out the results.

To be able to see the results, we'll add a simple page to Ghost that will just display the output of the query.

## Creating the Search API

Let's break it down:

1.  Create the Elastic Search query and test it out.
2.  Create the route for our API.
3.  Fill in the handler for out newly created route.
4.  Create the search results page.
5.  Test it all out.

### Creating the Elastic Search Query

Elastic Search has an amazing [Query DSL](http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/query-dsl.html). For now, we'll be using a [wildcard](http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/query-dsl-wildcard-query.html) [query](http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/query-dsl-queries.html) along with [highlighting](http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/search-request-highlighting.html) and [suggestions](http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/search-suggesters.html#search-suggesters) and will be returning specific [fields](http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/search-request-fields.html#search-request-fields). I strongly recommend you go through the docs and try out the queries against your local installation of Elastic Search. I use the Chrome extension [Postman](https://chrome.google.com/webstore/detail/postman-rest-client/fdmmgilgnpjigdojojpjoooidkmcomcm) for testing.

Let's jump right in!

This is what the query looks like:

{% highlight json %}
{
  "fields": ["slug", "title", "tags", "updated_at"],
  "query": {
    "wildcard": {
      "_all": {
        "wildcard": "query_text*"
      }
    }
  },
  "highlight": {
    "fields": {
      "title": {},
      "tags": {},
      "content": {}
    }
  },
  "suggest": {
    "suggestions": {
      "text": "query_text",
      "term": {
        "field": "_all",
        "suggest_mode": "always"
      }
    }
  }
}
{% endhighlight %}

**Note:** Replace `query_text` with your query.

Go ahead, test it out via your REST client of choice! Here's a screenshot of a search for &#8216;blog':

![Our First Query](/assets/images/es_query_blog_o.jpg)

And this is the suggestor in action! I searched with the text &#8216;blogg'

![Suggestions](/assets/images/es_query_blogg_o.jpg)

All done! Let's move on!

### Creating the Route

We've already created routes before, so this should be familiar. Open up `core/server/routes/frontend.js` and add the following line to it:

{% highlight js %}
server.get('/search/', frontend.search_results);
{% endhighlight %}

### Creating the handler

Open up the file `core/server/controllers/frontend.js` and create a method `search_results` to test communication with Elastic Search. The method should go something like this:

{% highlight js %}
"search_results": function (req, res, next) {

  // Build up the search request
  var request_data = {
    "fields": ["slug", "title", "tags", "updated_at"],
    "query": {
      "wildcard": {
        "_all": {
          "wildcard": req.query.q + "*"
        }
      }
    },
    "highlight": {
      "fields": {
        "title": {},
        "tags": {},
        "content": {}
      }
    },
    "suggest": {
      "suggestions": {
        "text": req.query.q,
        "term": {
          "field": "_all",
          "suggest_mode": "always"
        }
      }
    }
  };

  // create the elastic search request
  request_data = JSON.stringify(request_data);
  var esRequest = require('http').request({
    host: 'localhost',
    path: '/posts/_search',
    port: 9200,
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': request_data.length
    }
  }, function (esRes) {
    var result = '';
    esRes.on('data', function (chunk) {
      result += chunk;
    });
    esRes.on('end', function () {
      var response = JSON.parse(result);

      // render the results
      res.render('results', {
        results: response,
        resultsJSON: JSON.stringify(response, null, 2),
        query: req.query.q
      });
    });
  });

  // search!
  esRequest.write(request_data);
  esRequest.end();
},
{% endhighlight %}

Here's whats happening: we set up the page to work off a GET request to the URL `/search/?q=[search_string]`. As you can see, there's a call to `results`. We'll be creating this next.

### Create the Test Page

Alright, we're almost there. The simplest way to test out our search API would be to render the response from ElasticSearch on to an empty page.

Create `results.hbs` in the folder `/content/themes/[your theme]/`. Here, `[your theme]` is your currently selected theme. Ghost comes with Casper as the default theme.

We are going to keep the contents of results.hbs as simple as possible, all we need is to be able to test out the search response.

{% assign b = '{' %}
{% assign c = '}' %}
{% highlight html %}
{{b}}{{b}}!< default{{c}}{{c}}
<h1>{{b}}{{b}}query{{c}}{{c}}</h1>  
<pre><code{{b}}{{b}}resultsJSON{{c}}{{c}}</code></pre>
{% endhighlight %}

<small>the `{{!< default}}` means that this partial inherits from default.hbs, so should will still look like a part of your site.</small>

Alright, we're done! Restart your server and you should be good to go!

### Testing it all out!

Ok, we're almost there. Testing it is easy: simply navigate to `[your site url]/search/?q=blog` and you should be greeted with the search results!

![Search Results JSON](/assets/images/search_results_json_o.jpg)

Go ahead, clean up your results page!

![A simple search results page](/assets/images/Screen_Shot_2014_04_22_at_12_55_02_am_o.jpg)

![When no search results are found](/assets/images/Screen_Shot_2014_04_22_at_12_54_23_am_o.jpg)

## Summary

We've finally managed to (in a somewhat hackish manner) integrate ElasticSearch into our Ghost blog!

## Next Steps

Now that the basic integration is done I can think of quite a few changes that can/should be made to clean up the code and enhance the search feature:

1.  The bulk indexing of all posts should occur automatically whenever a post is created/modified/deleted.
2.  The `/search` handler in the controller should return JSON results when an AJAX call is made instead of a non-AJAX call. This feature could be extended to build up an auto-suggester and/or an entirely AJAX powered search.
3.  Refactor the code in the frontend controller!! I do not think the Ghost creators of the platform will be pleased at the way the code is currently written! ![:P](http://shiny.co.in/wp-includes/images/smilies/icon_razz.gif)
4.  [Open Search](http://www.opensearch.org/Home) integration!

* * *

Thoughts? Rants? Advice?