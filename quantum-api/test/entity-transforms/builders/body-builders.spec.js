const chai = require('chai')
const quantum = require('quantum-js')
const dom = require('quantum-dom')
const html = require('quantum-html')
const body = require('../../../lib/entity-transforms/builders/body')

const should = chai.should()

describe('body-builders', () => {
  describe('description', () => {
    it('should create a basic block using only the text content', () => {
      const selection = quantum.select({
        type: 'function',
        params: [],
        content: [
          'Some text only content',
          'That spans multiple lines'
        ]
      })

      function transforms () {}

      body.description(selection, transforms).should.eql(
        dom.create('div')
          .class('qm-api-description')
          .text('Some text only content\nThat spans multiple lines')
      )
    })

    it('should create a paragraph block when a @description section is found', () => {
      const descriptionBlock = {
        type: 'description',
        params: [],
        content: [
          'Some text only content',
          'That spans multiple lines'
        ]
      }

      const selection = quantum.select({
        type: 'function',
        params: [],
        content: [
          descriptionBlock
        ]
      })

      function transforms () {}

      body.description(selection, transforms).should.eql(
        dom.create('div')
          .class('qm-api-description')
          .add(html.paragraphTransform(quantum.select(descriptionBlock, transforms)))
      )
    })
  })

  describe('default', () => {
    it('should create a default value section if a @default entity exists', () => {
      const selection = quantum.select({
        type: 'function',
        params: [],
        content: [
          {
            type: 'default',
            params: [],
            content: [
              'True'
            ]
          }
        ]
      })

      function transforms (selection) {
        return selection.cs ? selection.cs() : selection
      }

      body.default(selection, transforms).should.eql(
        dom.create('div').class('qm-api-default')
          .add(dom.create('span').class('qm-api-default-key').text('Default: '))
          .add(dom.create('span').class('qm-api-default-value').text('True'))
      )
    })
  })

  it('should return undefined if no @default entity exists', () => {
    const selection = quantum.select({
      type: 'function',
      params: [],
      content: []
    })

    function transforms () {}

    should.not.exist(body.default(selection, transforms))
  })

  describe('extras', () => {
    it('should create a default value section if an @extra entity exists', () => {
      const extra1 = {
        type: 'extra',
        params: [],
        content: [
          'Extra content 1'
        ]
      }

      const extra2 = {
        type: 'extra',
        params: [],
        content: [
          'Extra content 2'
        ]
      }

      const selection = quantum.select({
        type: 'function',
        params: [],
        content: [
          extra1,
          extra2
        ]
      })

      function transforms () {}

      body.extras(selection, transforms).should.eql(
        dom.create('div').class('qm-api-extras')
          .add(dom.create('div').class('qm-api-extra').add(html.paragraphTransform(quantum.select(extra1), transforms)))
          .add(dom.create('div').class('qm-api-extra').add(html.paragraphTransform(quantum.select(extra2), transforms)))
      )
    })
  })

  it('should return undefined if no @extra entity exists', () => {
    const selection = quantum.select({
      type: 'function',
      params: [],
      content: []
    })

    function transforms () {}

    should.not.exist(body.extras(selection, transforms))
  })

  describe('groups', () => {
    it('should create a default value section if a @group entity exists', () => {
      const group1 = {
        type: 'group',
        params: ['Group 1'],
        content: [
          'Group description 1'
        ]
      }

      const group2 = {
        type: 'group',
        params: ['Group 2'],
        content: [
          'Group description 2'
        ]
      }

      const selection = quantum.select({
        type: 'function',
        params: [],
        content: [
          group1,
          group2
        ]
      })

      function transforms (selection) {
        return dom.create('span').text(selection.cs())
      }

      return body.groups(selection, transforms).should.eql(
        dom.create('div').class('qm-api-groups')
          .add(dom.create('div').class('qm-api-group')
            .add(dom.create('h2').text('Group 1'))
            .add(dom.create('div').class('qm-api-group-content')
              .add(body.description(quantum.select(group1), transforms))))
          .add(dom.create('div').class('qm-api-group')
            .add(dom.create('h2').text('Group 2'))
            .add(dom.create('div').class('qm-api-group-content')
              .add(body.description(quantum.select(group2), transforms))))
      )
    })
  })

  it('should handle description sections', () => {
    const group1 = {
      type: 'group',
      params: ['Group 1'],
      content: [
        {
          type: 'description',
          params: [],
          content: ['Group description 1']
        }
      ]
    }

    const group2 = {
      type: 'group',
      params: ['Group 2'],
      content: [
        {
          type: 'description',
          params: [],
          content: ['Group description 2']
        }
      ]
    }

    const selection = quantum.select({
      type: 'function',
      params: [],
      content: [
        group1,
        group2
      ]
    })

    function transforms () {}

    return body.groups(selection, transforms).should.eql(
      dom.create('div').class('qm-api-groups')
        .add(dom.create('div').class('qm-api-group')
          .add(dom.create('h2').text('Group 1'))
          .add(dom.create('div').class('qm-api-group-content')
            .add(body.description(quantum.select(group1), transforms))))
        .add(dom.create('div').class('qm-api-group')
          .add(dom.create('h2').text('Group 2'))
          .add(dom.create('div').class('qm-api-group-content')
            .add(body.description(quantum.select(group2), transforms))))
    )
  })

  it('should return undefined if no @group entity exists', () => {
    const selection = quantum.select({
      type: 'function',
      params: [],
      content: []
    })

    function transforms () {}

    should.not.exist(body.groups(selection, transforms))
  })
})