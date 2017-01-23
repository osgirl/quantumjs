'use strict'

const dom = require('quantum-dom')

/* Creates a new notice builder */
module.exports = function createNoticeBuilder (type, title) {
  return (selection, transforms) => {
    if (selection.has(type)) {
      const notice = selection.select(type)

      if (notice.hasContent()) {
        return dom.create('div').class('qm-api-notice qm-api-notice-' + type)
          .add(dom.create('div').class('qm-api-notice-header').text(title))
          .add(dom.create('div').class('qm-api-notice-body')
            .add(notice
              .filter(t => t.type !== 'issue')
              .transform(transforms))
        )
      }
    }
  }
}
