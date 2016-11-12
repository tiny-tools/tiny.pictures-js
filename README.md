# tiny.pictures-sdk-js
JavaScript SDK for [tiny.pictures](https://tiny.pictures/)

## Browser
### Installation
Use our CDN.
```
  ...
  <script src="https://tiny.pictures/tiny.pictures.min.js">
</body>
</html>
```
### Usage
All functions are available in the global `tiny.pictures` object.
#### Example
```
tiny.pictures.url('http://your.domain/path/to/image.jpg', {width: 200})
// 'https://tiny.pictures/api/path/to/image.jpg?protocol=http&hostname=your.domain&width=200'
```

## NodeJS
### Installation
```
npm install tiny.pictures-sdk-js
```
### Usage
Just `require` the package.
#### Example
```
var tinyPictures = require('tiny.pictures-sdk-js')
tinyPictures.url('http://your.domain/path/to/image.jpg', {width: 200})
// 'https://tiny.pictures/api/path/to/image.jpg?protocol=http&hostname=your.domain&width=200'
```
