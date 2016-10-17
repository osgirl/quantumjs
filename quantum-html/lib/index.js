'use strict'

const path = require('path')
const unique = require('array-unique')
const Promise = require('bluebird')
const merge = require('merge')
const quantum = require('quantum-js')
const dom = require('quantum-dom')

function setupElement (type, selection, transform, parsePs) {
  const element = dom.create(type)
  const classId = selection.ps()

  if (selection.has('id')) {
    element.id(selection.select('id').ps())
  } else if (parsePs) {
    const match = classId.match(/#[^\.#]+/)
    if (match) {
      const id = match.map(d => d.substring(1))[0]
      element.id(id)
    }
  }

  if (selection.has('class')) {
    element.class(selection.select('class').ps())
  } else if (parsePs) {
    const match = classId.match(/(\.[^\.#]+)/g)
    if (match) {
      const cls = unique(match.map(d => d.substring(1))).join(' ')
      element.class(cls)
    }
  }

  selection.selectAll('attr').forEach((attr) => element.attr(attr.ps(), attr.cs()))
  return element.add(selection
    .filter((entity) => {
      return entity.type !== 'attr' && entity.type !== 'class' && entity.type !== 'id'
    })
    .transform(transform))
}

function elementTransform (type) {
  return (selection, transform) => {
    return setupElement(type, selection, transform, true)
  }
}

function bodyClassed (selection, transform) {
  return dom.bodyClassed(selection.ps(), selection.cs() !== 'false')
}

function title (selection, transform) {
  return dom.head(dom.create('title').text(selection.ps()), {id: 'title'})
}

function head (selection, transform) {
  const content = selection.transform(transform)
  if (content.then) {
    return content.then((elements) => {
      return elements.filter(d => d).map(e => dom.head(e))
    })
  } else {
    return content.filter(d => d).map(e => dom.head(e))
  }
}

function html (selection, transform) {
  return dom.textNode(selection.cs(), {escape: false})
}

function script (selection, transform) {
  return dom.create('script').attr('src', selection.ps())
}

function stylesheet (selection, transform) {
  return dom.head(dom.create('link')
    .attr('href', selection.ps())
    .attr('rel', 'stylesheet'))
}

function hyperlink (selection, transform) {
  return setupElement('a', selection, transform, false)
    .attr('href', selection.ps())
}

function js (selection, transforms) {
  return dom.create('script').text(selection.cs(), {escape: false})
}

function css (selection, transforms) {
  return dom.head(dom.create('style').text(selection.cs(), {escape: false}))
}

function transforms (options) {
  // No options at the moment - this is just future proofing
  return Object.freeze({
    bodyClassed: bodyClassed,
    title: title,
    head: head,
    html: html,
    script: script,
    stylesheet: stylesheet,
    hyperlink: hyperlink,
    js: js,
    css: css,
    link: elementTransform('link'),
    meta: elementTransform('meta'),
    a: elementTransform('a'),
    b: elementTransform('b'),
    br: elementTransform('br'),
    button: elementTransform('button'),
    div: elementTransform('div'),
    form: elementTransform('form'),
    h1: elementTransform('h1'),
    h2: elementTransform('h2'),
    h3: elementTransform('h3'),
    h4: elementTransform('h4'),
    h5: elementTransform('h5'),
    h6: elementTransform('h6'),
    hr: elementTransform('hr'),
    i: elementTransform('i'),
    img: elementTransform('img'),
    input: elementTransform('input'),
    label: elementTransform('label'),
    li: elementTransform('li'),
    ol: elementTransform('ol'),
    option: elementTransform('option'),
    p: elementTransform('p'),
    pre: elementTransform('pre'),
    select: elementTransform('select'),
    span: elementTransform('span'),
    style: elementTransform('style'),
    table: elementTransform('table'),
    tbody: elementTransform('tbody'),
    td: elementTransform('td'),
    textarea: elementTransform('textarea'),
    th: elementTransform('th'),
    thead: elementTransform('thead'),
    tr: elementTransform('tr'),
    ul: elementTransform('ul'),
    vr: elementTransform('vr')
  })
}

// flattens out namespaced renderers into a single object
function prepareTransforms (transforms, namespace, target) {
  const resolvedNamespace = namespace || ''
  const resolvedTarget = target || {}
  for (const d in transforms) {
    if (typeof (transforms[d]) === 'function') {
      resolvedTarget[resolvedNamespace + d] = transforms[d]
      resolvedTarget[d] = transforms[d]
    } else {
      prepareTransforms(transforms[d], resolvedNamespace + d + '.', resolvedTarget)
    }
  }

  return resolvedTarget
}

// the default transform just makes a text node
function standardDefaultTransform (selection) {
  return quantum.select.isSelection(selection) ? selection.cs() : selection
}

/*
  Returns the transform function that converts parsed quantum source to virtual dom.
*/
function pageTransform (options) {
  const opts = options || {}

  const meta = opts.meta // gets passed through to all transforms (mainly useful for custom transforms - should never be used in libraries)
  const defaultTransform = opts.defaultTransform || standardDefaultTransform
  const entityTransforms = opts.transforms || transforms()
  const includeCommonMetaTags = opts.includeCommonMetaTags !== false
  const transformMap = prepareTransforms(entityTransforms)

  const commonMetaTags = [
    dom.head(dom.create('meta').attr('name', 'viewport').attr('content', 'width=device-width, initial-scale=1'))
  ]

  // renders an selection by looking at its type and selecting the transform from the list
  function transformer (selection) {
    const type = quantum.select.isSelection(selection) ? selection.type() : undefined
    const entityTransform = transformMap[type] || defaultTransform
    return entityTransform(selection, transformer, meta) // bootstrap to itself to  make the transformer accessible to children
  }

  // the page transform function that turns parsed content into html content
  return (page) => {
    return Promise.resolve(quantum.select(page.content).transform(transformer))
      .then((elements) => {
        const completeElements = includeCommonMetaTags ? elements.concat(commonMetaTags) : elements
        return page.clone({
          content: new HTMLPage(completeElements)
        })
      })
  }
}

function HTMLPage (elements) {
  this.elements = elements
}

HTMLPage.prototype.stringify = function (options) {
  return dom.stringify(this.elements, {
    embedAssets: options ? options.embedAssets : true,
    assetPath: options ? options.assetPath : undefined
  })
}

function stringify (opts) {
  const options = merge({
    embedAssets: true,
    assetPath: undefined
  }, opts)

  return (page) => {
    return Promise.props({
      file: page.file.withExtension('.html'),
      content: page.content.stringify(options).then(x => x.html)
    })
      .then((changes) => page.clone(changes))
  }
}

function paragraphTransform (selection, transform) {
  const paragraphs = [
    dom.asset({
      url: '/assets/quantum-html.css',
      file: path.join(__dirname, '../assets/quantum-html.css'),
      shared: true
    })
  ]

  let currentParagraph = undefined

  selection.content().forEach((e) => {
    if (e === '') {
      if (currentParagraph) {
        paragraphs.push(currentParagraph)
        currentParagraph = undefined
      }
    } else {
      if (!currentParagraph) {
        currentParagraph = dom.create('div').class('qm-html-paragraph')
      }

      if (quantum.select.isEntity(e)) {
        currentParagraph = currentParagraph
          .add(transform(quantum.select(e)))
          .add(dom.textNode(' '))
      } else {
        currentParagraph = currentParagraph
          .add(dom.textNode(e + ' '))
      }
    }
  })

  if (currentParagraph) {
    paragraphs.push(currentParagraph)
    currentParagraph = undefined
  }

  return paragraphs
}

// renames name.html to name/index.html and leaves index.html as it is
function htmlRenamer () {
  return (page) => {
    const filenameWithoutExtension = path.basename(page.file.dest).replace('.html', '')
    const rootPath = path.dirname(page.file.dest)
    return page.clone({
      file: page.file.clone({
        dest: filenameWithoutExtension === 'index' ? page.file.dest : path.join(rootPath, filenameWithoutExtension, 'index.html')
      })
    })
  }
}

module.exports = pageTransform
module.exports.transforms = transforms

module.exports.HTMLPage = HTMLPage
module.exports.prepareTransforms = prepareTransforms
module.exports.stringify = stringify
module.exports.paragraphTransform = paragraphTransform
module.exports.htmlRenamer = htmlRenamer
