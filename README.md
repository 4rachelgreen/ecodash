# EcoDash

A web application for the EVI change detection algorithm of SERVIR-Mekong using
Google Earth Engine and App Engine. The application itself can be found at
[http://ecodash.appspot.com](http://ecodash.appspot.com). The Python
and JavaScript client libraries for calling the Earth Engine API can be found
[here](https://github.com/google/earthengine-api). More information about Google
Earth Engine is listed [here](https://developers.google.com/earth-engine).

![Screenshot](static/images/screenshot.png)

## Installation

1. Clone this repository
2. Install Python 2.7
3. Install these Python libs:
   * ee
   * httplib2
   * oauth2client
4. Install the [Google Cloud SDK for Python](https://cloud.google.com/appengine/docs/python/download)
5. Install Java Development Kit 1.8+
6. Install [Boot](http://boot-clj.com)

## Running

1. First, you need to build ecodash.js from the Clojurescript files in cljs:
    $ cd cljs
    $ boot prod

2. Now return to the toplevel directory and launch the Google App Engine development server:
    $ cd ..
    $ dev_appserver.py .

3. Your application is now live at: http://localhost:8080
