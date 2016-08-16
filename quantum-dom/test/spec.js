var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
var dom = require('..')
var should = chai.should()
var Promise = require('bluebird')

describe('Element', function () {
  it('should get the right type', function () {
    dom.create('div').type.should.equal('div')
  })

  it('should set id correctly', function () {
    dom.create('div').id('lemon').attrs.id.should.equal('lemon')
  })

  it('id get the id correctly', function () {
    dom.create('div').id('lemon').id().should.equal('lemon')
  })

  it('should set the class correctly', function () {
    dom.create('div').class('onion').attrs['class'].should.equal('onion')
  })

  it('should get the class correctly', function () {
    dom.create('div').class('onion').class().should.equal('onion')
  })

  it('should stringify correctly', function () {
    dom.create('div').stringify().should.equal('<div></div>')
  })

  it('should stringify correctly with an attribute set', function () {
    dom.create('div').attr('test', 'thing').stringify().should.equal('<div test="thing"></div>')
  })

  it('should stringify correctly with multiple attributes set', function () {
    dom.create('div')
      .attr('test', 'thing')
      .attr('test2', 'thing2')
      .stringify().should.equal('<div test="thing" test2="thing2"></div>')
  })

  it('should stringify content correctly', function () {
    dom.create('div').id('outer')
      .add(dom.create('div').id('inner'))
      .stringify().should.equal('<div id="outer"><div id="inner"></div></div>')
  })

  it('should add arrays of content correctly', function () {
    dom.create('div').id('outer')
      .add([
        dom.create('div').id('inner-1'),
        dom.create('div').id('inner-2')
      ])
      .stringify().should.equal('<div id="outer"><div id="inner-1"></div><div id="inner-2"></div></div>')
  })

  it('should append arrays of content correctly', function () {
    const elements = [
      dom.create('div').id('inner-1'),
      dom.create('div').id('inner-2')
    ]
    const div = dom.create('div').id('outer')
    const res = div.append(elements)
    res.should.equal(elements)
    div.stringify().should.equal('<div id="outer"><div id="inner-1"></div><div id="inner-2"></div></div>')
  })

  it('should stringify text content correctly (escape html by default)', function () {
    dom.create('div').id('outer')
      .text('<cabbage>')
      .add(dom.create('div').id('inner'))
      .stringify().should.equal('<div id="outer">&lt;cabbage&gt;<div id="inner"></div></div>')
  })

  it("should stringify text content correctly (don't escape html when escape is set to false)", function () {
    dom.create('div').id('outer')
      .text('<cabbage>', {escape: false})
      .add(dom.create('div').id('inner'))
      .stringify().should.equal('<div id="outer"><cabbage><div id="inner"></div></div>')
  })

  it('should ignore undefined text arguments', function () {
    dom.create('div').text(undefined).content.should.eql([])
  })

  it('should remove an element from a parent correctly', function () {
    el1 = dom.create('div', 'pineapple')
    el2 = el1.append(dom.create('div', 'strawberry'))

    el1.removeChild(el2).should.equal(true)
    el1.content.length.should.equal(0)
  })

  it('should return false when trying to remove an element that is not a child from a parent', function () {
    el1 = dom.create('div', 'pineapple')
    el1.removeChild(dom.create('div', 'strawberry')).should.equal(false)
  })

  it('should remove itself correctly (with parent)', function () {
    el1 = dom.create('div', 'pineapple')
    el2 = el1.append(dom.create('div', 'strawberry'))

    el2.remove()
    el1.content.length.should.equal(0)
  })

  it('should remove itself correctly (with parent)', function () {
    chai.expect(function () {
      dom.create('div', 'pineapple').remove()
    }).to.not.throw()
  })

  it('classed should get existance of a single class correctly', function () {
    const el = dom.create('div')
    el.classed('satsuma').should.equal(false)
    el.class('satsuma').classed('satsuma').should.equal(true)
  })

  it('classed should add a class correctly', function () {
    const el = dom.create('div')
    el.classed('satsuma').should.equal(false)
    el.classed('satsuma', true).classed('satsuma').should.equal(true)
  })

  it('classed should add a class correctly to an existing class attribute', function () {
    const el = dom.create('div')
    el.class('banana')
    el.classed('satsuma', true).classed('banana satsuma').should.equal(true)
  })

  it('classed should remove a class correctly', function () {
    const el = dom.create('div')
    el.class('banana satsuma')
    el.classed('satsuma', false).class().should.equal('banana')
  })

  it('classed should be fine removing a class that doesnt exist', function () {
    const el = dom.create('div')
    el.class('banana satsuma')
    el.classed('lemon', false).class().should.equal('banana satsuma')
  })

  it('classed should not add a class twice', function () {
    const el = dom.create('div')
    el.class('banana satsuma')
    el.classed('satsuma', true).class().should.equal('banana satsuma')
  })

  it('classed should get existance of multiple classes correctly', function () {
    const el = dom.create('div').class('satsuma lemon')
    el.classed('satsuma').should.equal(true)
    el.classed('lemon').should.equal(true)
    el.classed('satsuma lemon').should.equal(true)
    el.classed('satsuma banana').should.equal(false)
    el.classed('satsuma banana lemon').should.equal(false)
  })

  it('classed should add multiple classes correctly', function () {
    const el = dom.create('div').class('satsuma lemon')
    el.classed('satsuma banana lemon', true).class().should.equal('satsuma lemon banana')
  })

  it('classed should remove multiple classes correctly', function () {
    const el = dom.create('div').class('satsuma lemon')
    el.classed('banana lemon', false).class().should.equal('satsuma')
  })

  it('add should ignore undefined content', function () {
    dom.create('div').add(undefined).content.should.eql([])
  })

  it('append should ignore undefined content', function () {
    dom.create('div').append(undefined).content.should.eql([])
  })

  it('should return an Element like Promise when a promise is passed into add', function () {
    dom.create('div')
      .add(Promise.resolve(dom.create('div')))
      .should.be.an.instanceof(Promise)

    dom.create('div')
      .add(Promise.resolve(dom.create('div')))
      .add(dom.create('div'))
      .should.be.an.instanceof(Promise)

    dom.create('div')
      .add(Promise.resolve(dom.create('div')))
      .append(dom.create('div'))
      .should.be.an.instanceof(Promise)

  })

  it('should return an Element like Promise when a promise is passed into append', function () {
    dom.create('div')
      .append(Promise.resolve(dom.create('div')))
      .should.be.an.instanceof(Promise)

    dom.create('div')
      .append(Promise.resolve(dom.create('div')))
      .add(dom.create('div'))
      .should.be.an.instanceof(Promise)

    dom.create('div')
      .append(Promise.resolve(dom.create('div')))
      .append(dom.create('div'))
      .should.be.an.instanceof(Promise)

  })

  it('should add an element to the end if addToEnd is true', function () {
    dom.create('div')
      .add(dom.create('span'), {addToEnd: true})
      .add(dom.create('div')).stringify()
      .should.equal('<div><div></div><span></span></div>')
  })

  it('should append an element to the end if addToEnd is true', function () {
    const div = dom.create('div')

    div.append(dom.create('span'), {addToEnd: true})
    div.append(dom.create('div'))
    div.stringify().should.equal('<div><div></div><span></span></div>')
  })

  it('should add elements to the end if addToEnd is true', function () {
    dom.create('div')
      .add([dom.create('span'), dom.create('img'), 'text'], {addToEnd: true})
      .add(dom.create('div')).stringify()
      .should.equal('<div><div></div><span></span><img></img>text</div>')
  })

  it('should append elements to the end if addToEnd is true', function () {
    const div = dom.create('div')

    div.append([dom.create('span'), dom.create('img'), 'text'], {addToEnd: true})
    div.append(dom.create('div'))
    div.stringify().should.equal('<div><div></div><span></span><img></img>text</div>')
  })

  it('should ignore undefined values in arrays passed to add', function () {
    dom.create('div')
      .add([dom.create('span'), undefined, dom.create('img')], {addToEnd: true})
      .add([dom.create('div'), undefined]).stringify()
      .should.equal('<div><div></div><span></span><img></img></div>')
  })

  it('should ignore undefined values in arrays passed to append', function () {
    const div = dom.create('div')

    div.append([dom.create('span'), undefined, dom.create('img')], {addToEnd: true})
    div.append([dom.create('div'), undefined])
    div.stringify().should.equal('<div><div></div><span></span><img></img></div>')
  })

})

describe('dom', function () {
  describe('randomId', () => {
    it('should return a 32 character string', function () {
      dom.randomId().should.be.a.string
      dom.randomId().length.should.equal(32)
    })

    it('should not return the same id when called twice', function () {
      dom.randomId().should.not.equal(dom.randomId())
    })
  })

  describe('all', () => {
    it('should return a promise if one of the entries is a promise', function () {
      dom.all([1, 2, 3, Promise.resolve(4)]).should.be.an.instanceof(Promise)
    })

    it('should return an array if none of the entries are a promise', function () {
      dom.all([1, 2, 3, 4]).should.be.an.instanceof(Array)
    })
  })

  describe('stringify', () => {
    it('should stringify an empty page', () => {
      return dom.stringify([]).should.eventually.eql({html: '<!DOCTYPE html>\n<html><head></head><body></body></html>'})
    })

    it('should stringify a page with body content', () => {
      return dom.stringify([
        dom.create('div')
      ]).should.eventually.eql({html: '<!DOCTYPE html>\n<html><head></head><body><div></div></body></html>'})
    })

    it('should stringify a page with head content', () => {
      return dom.stringify([
        dom.head(dom.create('title').text('title'))
      ]).should.eventually.eql({html: '<!DOCTYPE html>\n<html><head><title>title</title></head><body></body></html>'})
    })

    it('should deduplicate head elements with the same id', () => {
      return dom.stringify([
        dom.head(dom.create('title').text('title'), {id: 'title'}),
        dom.head(dom.create('title').text('title2'), {id: 'title'})
      ]).should.eventually.eql({html: '<!DOCTYPE html>\n<html><head><title>title2</title></head><body></body></html>'})
    })

    it('should stringify a page with assets (embedAssets: true)', () => {
      return dom.stringify([
        dom.asset({url: '/assets/site.js', file: __dirname + '/assets/test.js', shared: true}),
        dom.asset({url: '/assets/site.css', file: __dirname + '/assets/test.css', shared: true})
      ], {embedAssets: true}).should.eventually.eql({html: "<!DOCTYPE html>\n<html><head><style>.div{ color: red; }\n</style></head><body><script>console.log(window.querySelectorAll('div'))\n</script></body></html>"})
    })

    it('should stringify a page with assets (embedAssets: false)', () => {
      return dom.stringify([
        dom.asset({url: '/assets/site.js', file: 'src/assets/site.js', shared: true}),
        dom.asset({url: '/assets/site.css', file: 'src/assets/site.css', shared: true})
      ], {embedAssets: false}).should.eventually.eql({html: '<!DOCTYPE html>\n<html><head><link rel="stylesheet" href="/assets/site.css"></link></head><body><script src="/assets/site.js"></script></body></html>'})
    })

    it('should stringify a page with assets (embedAssets: false, assetPath: /resources)', () => {
      return dom.stringify([
        dom.asset({url: '/assets/site.js', file: 'src/assets/site.js', shared: true}),
        dom.asset({url: '/assets/site.css', file: 'src/assets/site.css', shared: true})
      ], {embedAssets: false, assetPath: '/resources'}).should.eventually.eql({html: '<!DOCTYPE html>\n<html><head><link rel="stylesheet" href="/resources/assets/site.css"></link></head><body><script src="/resources/assets/site.js"></script></body></html>'})
    })

    it('should modify the body class correctly', () => {
      return dom.stringify([
        dom.bodyClassed('my-class', true)
      ]).should.eventually.eql({html: '<!DOCTYPE html>\n<html><head></head><body class="my-class"></body></html>'})
    })
  })

  describe('escapeHTML', () => {
    it('should replace html entities', () => {
      dom.escapeHTML('<div>').should.equal('&lt;div&gt;')
    })
  })

  describe('textNode', () => {
    it('should escape html be default', () => {
      dom.textNode('<some text>').stringify().should.equal('&lt;some text&gt;')
    })

    it('should not escape if escape is set to false', () => {
      dom.textNode('some text', {escape: false}).stringify().should.equal('some text')
    })
  })

})
