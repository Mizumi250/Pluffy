/* @arkzen:meta
name: free-demo
version: 1.0.0
description: Free file blocks only — plain HTML, a package, and a stack file. No pages, no backend.
auth: false
*/

/* @arkzen:file:landing
path: index.html
*/
<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><title>free-demo</title></head>
  <body><h1>Written by @arkzen:file</h1></body>
</html>
/* @arkzen:file:landing:end */

/* @arkzen:file:lib
path: packages/my-lib/src/index.ts
*/
export const hello = (name: string) => `hello ${name}`
/* @arkzen:file:lib:end */

/* @arkzen:file:robots
path: {frontend}/public/robots.txt
*/
User-agent: *
Allow: /
/* @arkzen:file:robots:end */
