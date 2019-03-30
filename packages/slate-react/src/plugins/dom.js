import { IS_ANDROID } from 'slate-dev-environment'
import AndroidPlugin from './android'
import AfterPlugin from './after'
import BeforePlugin from './before'
import CompositionPlugin from './composition'

/**
 * A plugin that adds the browser-specific logic to the editor.
 *
 * @param {Object} options
 * @return {Object}
 */

function DOMPlugin(options = {}) {
  const { plugins = [] } = options
  // Add Android specific handling separately before it gets to the other
  // plugins because it is specific (other browser don't need it) and finicky
  // (it has to come before other plugins to work).
  const compositionPlugin = CompositionPlugin()
  const beforeBeforePlugins = IS_ANDROID ? [AndroidPlugin()] : []
  const beforePlugin = BeforePlugin()
  const afterPlugin = AfterPlugin()
  return [
    compositionPlugin,
    ...beforeBeforePlugins,
    beforePlugin,
    ...plugins,
    afterPlugin,
  ]
}

/**
 * Export.
 *
 * @type {Function}
 */

export default DOMPlugin