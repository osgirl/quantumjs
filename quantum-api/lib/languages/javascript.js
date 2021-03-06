'use strict'

const path = require('path')
const dom = require('quantum-dom')
const type = require('../entity-transforms/components/type')
const header = require('../entity-transforms/builders/header')
const body = require('../entity-transforms/builders/body')
const item = require('../entity-transforms/builders/item')
const itemGroup = require('../entity-transforms/builders/item-group')

/*
  The assets that should be included on the page for this language
*/
const assets = [
  dom.asset({
    url: '/quantum-api-javascript.css',
    filename: path.join(__dirname, '../../assets/languages/quantum-api-javascript.css'),
    shared: true
  })
]

const description = body.description
const groups = body.groups
const extras = body.extras
const defaultValue = body.default
const prototypes = itemGroup('javascript', 'prototype', 'Prototypes')
const constructors = itemGroup('javascript', 'constructor', 'Constructors')
const objects = itemGroup('javascript', 'object', 'Objects')
const args = itemGroup('javascript', ['arg', 'arg?'], 'Arguments', { noSort: true })
const properties = itemGroup('javascript', ['property', 'property?'], 'Properties')
const methods = itemGroup('javascript', 'method', 'Methods')
const events = itemGroup('javascript', 'event', 'Events')
const functions = itemGroup('javascript', 'function', 'Functions')
const returns = itemGroup('javascript', 'returns', 'Returns')

function typeBuilder (typeLinks) {
  return (selection, transformer) => {
    return dom.create('span')
      .class('qm-api-type-standalone qm-code-font')
      .add(type(selection.cs(), typeLinks))
  }
}

function typeHeaderDetails (typeLinks) {
  return (selection, transformer) => {
    const name = selection.param(0)
    return dom.create('span')
      .class('qm-api-javascript-header-type')
      .attr('id', name ? name.toLowerCase() : undefined)
      .add(type(name, typeLinks))
  }
}

function propertyHeaderDetails (typeLinks) {
  return (selection, transformer) => {
    const name = selection.param(0)
    return dom.create('span')
      .class('qm-api-javascript-header-property')
      .attr('id', name ? name.toLowerCase() : undefined)
      .add(dom.create('span').class('qm-api-javascript-header-property-name').text(name || ''))
      .add(dom.create('span').class('qm-api-javascript-header-property-type').add(type(selection.param(1), typeLinks)))
  }
}

function objectHeaderDetails () {
  return (selection, transformer) => {
    const name = selection.param(0)
    return dom.create('span')
      .class('qm-api-javascript-header-object')
      .attr('id', name ? name.toLowerCase() : undefined)
      .add(dom.create('span').class('qm-api-javascript-header-object-name').text(name || ''))
  }
}

function functionHeaderParamDetails (selection, transformer, typeLinks) {
  const name = selection.param(0)
  const isOptional = selection.type()[selection.type().length - 1] === '?'
  return dom.create('span')
    .class('qm-api-javascript-header-function-arg')
    .classed('qm-api-optional', isOptional)
    .add(dom.create('span').class('qm-api-javascript-header-function-arg-name')
      .text(name || ''))
    .add(dom.create('span').class('qm-api-javascript-header-function-arg-type').add(type(selection.param(1), typeLinks)))
}

function functionSignature (selection, transformer, typeLinks) {
  const args = selection.selectAll(['arg', 'arg?']).map((param) => functionHeaderParamDetails(param, transformer, typeLinks))

  const returnsSelection = selection
    .selectAll('returns')
    .filter(sel => !sel.has('removed'))[0]

  const retns = returnsSelection ?
    dom.create('span')
      .class('qm-api-javascript-header-function-returns')
      .add(type(returnsSelection.ps(), typeLinks)) :
    undefined

  return [
    dom.create('span').class('qm-api-javascript-header-function-args').add(args),
    retns
  ]
}

function constructorHeaderDetails (typeLinks) {
  return (selection, transformer) => {
    const parentName = selection.parent().ps()
    const name = dom.create('span')
      .class('qm-api-javascript-header-constructor-name')
      .text(parentName)

    return dom.create('span')
      .class('qm-api-javascript-header-constructor-signature')
      .attr('id', parentName ? parentName.toLowerCase() : undefined)
      .add(name)
      .add(functionSignature(selection, transformer, typeLinks)[0])
  }
}
function functionHeaderDetails (typeLinks) {
  return (selection, transformer) => {
    const functionName = selection.type() === 'returns' && selection.params().length === 1 ? 'function' : selection.param(0)
    const name = dom.create('span')
      .class('qm-api-javascript-header-function-name')
      .text(selection.type() === 'constructor' ? 'constructor' : functionName)

    return dom.create('span')
      .class('qm-api-javascript-header-function-signature')
      .attr('id', functionName ? functionName.toLowerCase() : undefined)
      .add(name)
      .add(functionSignature(selection, transformer, typeLinks))
  }
}

function prototypeHeaderDetails (typeLinks) {
  return (selection, transformer) => {
    const name = selection.param(0)
    let details = dom.create('span')
      .class('qm-api-javascript-header-prototype')
      .attr('id', name ? name.toLowerCase() : undefined)
      .add(dom.create('span').class('qm-api-javascript-prototype-name').text(name || ''))

    const extendsEntities = selection.selectAll('extends')

    if (extendsEntities.length > 0) {
      details = details.add(dom.create('span').class('qm-api-javascript-prototype-extends').text('extends'))

      extendsEntities.forEach((ent) => {
        const extender = dom.create('span')
          .class('qm-api-javascript-prototype-extender')
          .add(type(ent.ps(), typeLinks))
        details = details.add(extender)
      })
    }

    return details
  }
}

function changelogHeader (typeLinks, changelogHeaders) {
  const entityTypes = Object.keys(changelogHeaders)
  return (selection, transformer) => {
    if (entityTypes.some(entityType => selection.has(entityType))) {
      let current = selection
      const sections = []
      while (entityTypes.some(entityType => current.has(entityType))) {
        current = current.select(entityTypes)

        const type = current.type()
        const baseType = type.replace('?', '')

        const headerTransformObj = changelogHeaders[type]

        let headerTransform = headerTransformObj.header
        if (headerTransformObj.renderAsOther) {
          const otherType = current.params()[1]
          headerTransform = headerTransformObj.renderAsOther[otherType] || headerTransform
        }

        const section = dom.create('span')
          .class(`qm-changelog-javascript-${baseType}`)
          .add(headerTransform(current, transformer))

        if (baseType === 'constructor') {
          sections.pop()
        }
        sections.push(section)
      }
      return dom.create('span')
        .class('qm-changelog-javascript-header')
        .add(sections)
    }
  }
}

module.exports = (options) => {
  const typeLinks = (options || {}).typeLinks || {}
  const propertyHeader = header('property', propertyHeaderDetails(typeLinks))
  const objectHeader = header('object', objectHeaderDetails(typeLinks))
  const prototypeHeader = header('prototype', prototypeHeaderDetails(typeLinks))
  const functionHeader = header('function', functionHeaderDetails(typeLinks))
  const constructorHeader = header('constructor', constructorHeaderDetails(typeLinks))
  const typeHeader = header('type', typeHeaderDetails(typeLinks))

  const typeHeaderBuilders = {
    constructor: constructorHeader,
    event: propertyHeader,
    function: functionHeader,
    method: functionHeader,
    object: objectHeader,
    arg: propertyHeader,
    property: propertyHeader,
    prototype: prototypeHeader,
    returns: typeHeader
  }

  const constructorBuilder = item({
    class: 'qm-api-javascript-constructor',
    header: typeHeaderBuilders.constructor,
    content: [ description, extras, args ]
  })

  const prototypeBuilder = item({
    class: 'qm-api-javascript-prototype',
    header: typeHeaderBuilders.prototype,
    content: [ description, extras, defaultValue, constructors, groups, properties, events, methods, functions ]
  })

  const functionBuilder = item({
    class: 'qm-api-javascript-function',
    header: typeHeaderBuilders.function,
    content: [ description, extras, defaultValue, args, groups, events, returns ]
  })

  const objectBuilder = item({
    class: 'qm-api-javascript-object',
    header: typeHeaderBuilders.object,
    content: [ description, extras, defaultValue, groups, properties, events, prototypes, functions ]
  })

  const methodBuilder = item({
    class: 'qm-api-javascript-method',
    header: typeHeaderBuilders.method,
    content: [ description, extras, defaultValue, args, groups, events, returns ]
  })

  const propertyBuilder = item({
    class: 'qm-api-javascript-property',
    header: typeHeaderBuilders.property,
    content: [ description, extras, defaultValue ],
    renderAsOther: { Function: functionBuilder, Object: objectBuilder }
  })

  const argBuilder = item({
    class: 'qm-api-javascript-arg',
    header: typeHeaderBuilders.arg,
    content: [ description, extras, defaultValue ],
    renderAsOther: { Function: functionBuilder, Object: objectBuilder }
  })

  const eventBuilder = item({
    class: 'qm-api-javascript-event',
    header: typeHeaderBuilders.event,
    content: [ description, extras, defaultValue ],
    renderAsOther: { Function: functionBuilder, Object: objectBuilder }
  })

  const returnsBuilder = item({
    class: 'qm-api-javascript-returns',
    header: typeHeaderBuilders.returns,
    content: [ description, extras ],
    renderAsOther: { Function: functionBuilder, Object: objectBuilder }
  })

  const changelogHeaderTransforms = {
    'object': {
      header: typeHeaderBuilders.object
    },
    'prototype': {
      header: typeHeaderBuilders['prototype']
    },
    'constructor': {
      header: typeHeaderBuilders['constructor']
    },
    'function': {
      header: typeHeaderBuilders['function']
    },
    'arg': {
      header: typeHeaderBuilders.arg,
      renderAsOther: { Function: typeHeaderBuilders['function'], Object: typeHeaderBuilders.object }
    },
    'arg?': {
      header: typeHeaderBuilders.arg,
      renderAsOther: { Function: typeHeaderBuilders['function'], Object: typeHeaderBuilders.object }
    },
    'method': {
      header: typeHeaderBuilders.method
    },
    'event': {
      header: typeHeaderBuilders.event,
      renderAsOther: { Function: typeHeaderBuilders['function'], Object: typeHeaderBuilders.object }
    },
    'property': {
      header: typeHeaderBuilders.property,
      renderAsOther: { Function: typeHeaderBuilders['function'], Object: typeHeaderBuilders.object }
    },
    'property?': {
      header: typeHeaderBuilders.property,
      renderAsOther: { Function: typeHeaderBuilders['function'], Object: typeHeaderBuilders.object }
    }
  }

  return {
    assets,
    name: 'javascript',
    entityTransforms: {
      'type': typeBuilder(typeLinks),
      'prototype': prototypeBuilder,
      'object': objectBuilder,
      'method': methodBuilder,
      'function': functionBuilder,
      'constructor': constructorBuilder,
      'arg': argBuilder,
      'arg?': argBuilder,
      'property': propertyBuilder,
      'property?': propertyBuilder,
      'event': eventBuilder,
      'returns': returnsBuilder
    },
    changelog: {
      entityTypes: Object.keys(changelogHeaderTransforms),
      createHeaderDom: changelogHeader(typeLinks, changelogHeaderTransforms)
    }
  }
}

module.exports.prototypes = prototypes
module.exports.constructors = constructors
module.exports.objects = objects
module.exports.args = args
module.exports.properties = properties
module.exports.methods = methods
module.exports.events = events
module.exports.functions = functions
module.exports.returns = returns
