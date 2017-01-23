const chai = require('chai')
const quantum = require('quantum-js')
const dom = require('quantum-dom')
const notice = require('../../../lib/entity-transforms/builders/notice')

const should = chai.should()

describe('notice-builder', () => {
  it('should render nothing if there is no notice', () => {
    const selection = quantum.select({
      type: '',
      params: [],
      content: []
    })

    should.not.exist(notice()(selection))
  })

  it('should render nothing if there is no content in the notice', () => {
    const selection = quantum.select({
      type: '',
      params: [],
      content: [
        {type: 'removed', params: [], content: []}
      ]
    })

    should.not.exist(notice('removed', 'Removed')(selection))
  })

  it('should render a notice', () => {
    const selection = quantum.select({
      type: '',
      params: [],
      content: [
        {type: 'removed', params: [], content: ['Hi']}
      ]
    })

    function transformer (selection) {
      return selection
    }

    notice('removed', 'Removed')(selection, transformer).should.eql(
      dom.create('div').class('qm-api-notice qm-api-notice-removed')
        .add(dom.create('div').class('qm-api-notice-header').add('Removed'))
        .add(dom.create('div').class('qm-api-notice-body').add('Hi'))
    )
  })
})
