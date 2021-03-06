'use strict'

const body = require('./entity-transforms/builders/body')
const javascript = require('./languages/javascript')
const css = require('./languages/css')
const quantum = require('./languages/quantum')

function defaultIssueUrl () {
  return undefined
}

const defaultOptions = {
  // Defines what the default api looks like
  apiBuilders: [
    body.description,
    body.extras,
    body.groups,
    javascript.properties,
    javascript.prototypes,
    javascript.objects,
    javascript.functions,
    javascript.events,
    css.classes,
    quantum.entities
  ],
  processChangelogs: true,
  targetVersions: undefined,
  languages: [
    javascript(),
    css()
  ],
  changelogReverseVisibleList: false,
  changelogGroupByApi: false,
  issueUrl: defaultIssueUrl
}

function resolveOption (options, name) {
  return (options && options.hasOwnProperty(name)) ? options[name] : defaultOptions[name]
}

/*
  Resolves the options passed in to make sure every option is set to something
  sensible.
*/
function resolve (options) {
  return {
    apiBuilders: resolveOption(options, 'apiBuilders'),
    languages: resolveOption(options, 'languages'),
    targetVersions: resolveOption(options, 'targetVersions'),
    issueUrl: resolveOption(options, 'issueUrl'),
    processChangelogs: resolveOption(options, 'processChangelogs'),
    changelogReverseVisibleList: resolveOption(options, 'changelogReverseVisibleList'),
    changelogGroupByApi: resolveOption(options, 'changelogGroupByApi')
  }
}

module.exports = {
  resolve,
  defaultIssueUrl
}
