# Mobile Web Specialist Certification Course
---
#### _Three Stage Course Material Project - Restaurant Reviews_

# How to run the project:
### development version:
run `npm run start` and go to <a href="http://localhost:1234/index.html">http://localhost:1234/index.html</a>
### production version:
run `npm run serve` and go to <a href="http://localhost:8000">http://localhost:8000</a>

## Project Overview: Stage 1

For the **Restaurant Reviews** projects, you will incrementally convert a static webpage to a mobile-ready web application. In **Stage One**, you will take a static design that lacks accessibility and convert the design to be responsive on different sized displays and accessible for screen reader use. You will also add a service worker to begin the process of creating a seamless offline experience for your users.

### Specification

You have been provided the code for a restaurant reviews website. The code has a lot of issues. It’s barely usable on a desktop browser, much less a mobile device. It also doesn’t include any standard accessibility features, and it doesn’t work offline at all. Your job is to update the code to resolve these issues while still maintaining the included functionality. 

### Changes I've made:

+ add Mapbox token and remove no longer relevant code for google maps
+ format html files
+ add meta viewport tag and html language
+ fix headers hierarchy
+ add parcel bundler
+ changed leaflet to be a local dependency
+ fix normalize.css (add as a local dependency)
+ add postcss
+ make site responsive and pretty
+ add aria roles