---
layout: post
title: "Elastic Search + Ghost: Part I"
tags:
  - Elastic Search
  - Ghost Blog
  - JavaScript
---

This is the first part of a series of posts detailing how to set up [ElasticSearch](http://www.elasticsearch.org/) and integrate it into your Ghost blog. The aim of this series is to have search as a core feature of your blog.

## Introduction

Before we begin, please ensure that

*   you have (SSH) access to the server that is running your Ghost blog.
*   you have the required permissions to be able to edit the Ghost source code and restart the server.
*   you have root access on the server where you want to install Elastic Search (I&#8217;ve installed it on the same machine that hosts the blog)

Elastic Search is an amazing distributed, real-time search platform and is incredible at indexing a large amount to data and performing searches across it really, really fast. It&#8217;s built on top of [Apache Lucene](http://lucene.apache.org/core/) and is really good at full text searching as well. Data is stored in the JSON format and is retrieved via a RESTful query language. You can find the official documentation [here](http://www.elasticsearch.org/guide/en/elasticsearch/guide/current/index.html).

## Installing Elastic Search

I&#8217;ll be installing Elastic Search on an ubuntu 12.04 on an AWS micro instance (which also runs this blog). Installing Elastic Search is fairly simple, just follow these steps:

{% highlight bash %}
cd ~
sudo apt-get update
sudo apt-get install openjdk-7-jre-headless -y

wget https://download.elasticsearch.org/elasticsearch/elasticsearch/elasticsearch-1.0.1.deb
sudo dpkg -i elasticsearch-1.0.1.deb

sudo service elasticsearch start
{% endhighlight %}

OK, so now you should have Elastic Search up and running on your machine. To check, send a cURL to localhost:9200. You should get back something like this:

{% highlight js %}
  {
    "status": 200,
    "name": "Bevatron",
    "version": {
        "number": "1.0.1",
        "build_hash": "5c03841c42b",
        "build_timestamp": "2014-02-25T15:52:53Z",
        "build_snapshot": false,
        "lucene_version": "4.6"
    },
    "tagline": "You Know, for Search"
  }
{% endhighlight %}

Your `name` will be different (Awesome, isn&#8217;t it?!).

## Working with Elastic Search

Before we enter/update (index) data in elastic search, we need to know what an Index is and what a Type is.

> An index is like a ‘database’ in a relational database. It has a mapping which defines multiple types.
> 
> An index is a logical namespace which maps to one or more primary shards and can have zero or more replica shards.

To stay focused, I&#8217;ll not be getting into what an index and a type are, you can read up on that [here.](http://www.elasticsearch.org/blog/what-is-an-elasticsearch-index/) As a gross simplification, consider an index to be the equivalent of a relational database and a type to the be equivalent of a table in that database.

#### Entering Data

Alright lets put in some sample data. I&#8217;m using a Chrome extension called [Postman](https://chrome.google.com/webstore/detail/postman-rest-client/fdmmgilgnpjigdojojpjoooidkmcomcm?utm_source=chrome-ntp-icon) to make http calls.

To enter data, you need to send a `PUT` request to `http://localhost:9200///id`. If the index and the type do not exist, they will be created on the fly.

![Creating a document](/assets/images/es_i/Screen_Shot_2014_03_24_at_1_32_18_am_o.jpg)

The `"ok": true` indicates that all went well and the document was created with `"id": 1`. The index `posts` and the type `post` both were created on-the-fly while creating this document. Elastic Search also figured out the default schema ([mapping](http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/mapping.html)) for the type `post`.

#### Retrieving Data

Lets retrieve the document we created in the previous step. Documents are retrieved via `GET` requests. The URL is: `http://localhost:9200////`.

![Fetching a document](/assets/images/es_i/Screen_Shot_2014_03_24_at_1_41_15_am_o.jpg)

#### Searching

The simplest way to search is via a query string parameter to the specific index or the type.

Searching for the word &#8220;mango&#8221; in all types under the index `food`:

`http://localhost:9200/food/_search?q=mango`

Searching for the word &#8220;mango&#8221;in the type `fruits` in the index `food`:

`http://localhost:9200/food/fruits/_search?q=mango`

Lets search for our document:

![Searching](/assets/images/es_i/Screen_Shot_2014_03_24_at_1_48_34_am_o.jpg)

Lets search for something that doesn&#8217;t exist:

![Searching](/assets/images/es_i/Screen_Shot_2014_03_24_at_1_49_31_am_o.jpg)

**Note:** Appending `pretty=true` to the query string makes Elastic Search pretty-print the output.

#### Deleting

Deletes are done via the `DELETE` verb.

`DELETE` `http://localhost:9200/posts/post/1` will delete the post with `id` 1.

`DELETE` `http://localhost:9200/posts/post` will delete everything under the type `post`

`DELETE` `http://localhost:9200/posts` will delete everything under the index `posts`.

![Deleting](/assets/images/es_i/Screen_Shot_2014_03_24_at_1_59_48_am_o.jpg)

## Next Steps

So we have set up Elastic Search and have covered how to perform basic CRUD. In the next chapter, we&#8217;ll extract data from the Ghost blog and index all of it into Elastic Search.

Keep commenting!