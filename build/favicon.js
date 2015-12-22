var path = require('path')

var files = [
  'apple-touch-icon-57x57.png',
  'apple-touch-icon-60x60.png',
  'apple-touch-icon-72x72.png',
  'apple-touch-icon-76x76.png',
  'apple-touch-icon-114x114.png',
  'apple-touch-icon-120x120.png',
  'apple-touch-icon-144x144.png',
  'apple-touch-icon-152x152.png',
  'apple-touch-icon-180x180.png',
  'apple-touch-startup-image-320x460.png',
  'apple-touch-startup-image-640x920.png',
  'apple-touch-startup-image-640x1096.png',
  'apple-touch-startup-image-748x1024.png',
  'apple-touch-startup-image-750x1294.png',
  'apple-touch-startup-image-768x1004.png',
  'apple-touch-startup-image-1182x2208.png',
  'apple-touch-startup-image-1242x2148.png',
  'apple-touch-startup-image-1496x2048.png',
  'apple-touch-startup-image-1536x2008.png',
  'favicon-16x16.png',
  'favicon-32x32.png',
  'favicon-96x96.png',
  'favicon-230x230.png',
  'favicon.ico',
  'manifest.json',
  'mstile-144x144.png',
  'open-graph.png',
  'yandex-browser-manifest.json'
]

module.exports = function (dir) {
  var favicons = {}
  files.forEach(function (file) {
    favicons['favicon/' + file] = {
      filepath: path.join(dir, file),
      allowEmbed: false
    }
  })
  return favicons
}
