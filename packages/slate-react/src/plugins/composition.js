import Debug from 'debug'
import Hotkeys from 'slate-hotkeys'

/**
 * Debug.
 *
 * @type {Function}
 */

const debug = Debug('slate:plugin')

function CompositionPlugin() {
  let compositionCount = 0
  let isComposing = false

  /**
   * The before plugin queries.
   *
   * @type {Object}
   */

  const queries = {
    isComposing: () => isComposing,
  }

  /**
   * On composition end.
   *
   * @param {Event} event
   * @param {Editor} editor
   * @param {Function} next
   */

  function onCompositionEnd(event, editor, next) {
    const n = compositionCount

    // The `count` check here ensures that if another composition starts
    // before the timeout has closed out this one, we will abort unsetting the
    // `isComposing` flag, since a composition is still in affect.
    window.requestAnimationFrame(() => {
      if (compositionCount > n) return
      isComposing = false
    })

    debug('onCompositionEnd', { event })
    next()
  }

  /**
   * On composition start.
   *
   * @param {Event} event
   * @param {Editor} editor
   * @param {Function} next
   */

  function onCompositionStart(event, editor, next) {
    isComposing = true
    compositionCount++

    const { value } = editor
    const { selection } = value

    if (!selection.isCollapsed) {
      // https://github.com/ianstormtaylor/slate/issues/1879
      // When composition starts and the current selection is not collapsed, the
      // second composition key-down would drop the text wrapping <spans> which
      // resulted on crash in content.updateSelection after composition ends
      // (because it cannot find <span> nodes in DOM). This is a workaround that
      // erases selection as soon as composition starts and preventing <spans>
      // to be dropped.
      editor.delete()
    }

    debug('onCompositionStart', { event })
    next()
  }

  /**
   * On input.
   *
   * @param {Event} event
   * @param {Editor} editor
   * @param {Function} next
   */

  function onInput(event, editor, next) {
    if (isComposing) return
    next()
  }

  /**
   * On key down.
   *
   * @param {Event} event
   * @param {Editor} editor
   * @param {Function} next
   */

  function onKeyDown(event, editor, next) {
    // When composing, we need to prevent all hotkeys from executing while
    // typing. However, certain characters also move the selection before
    // we're able to handle it, so prevent their default behavior.
    if (isComposing) {
      if (Hotkeys.isCompose(event)) event.preventDefault()
      return
    }

    next()
  }

  /**
   * On select.
   *
   * @param {Event} event
   * @param {Editor} editor
   * @param {Function} next
   */

  function onSelect(event, editor, next) {
    if (isComposing) return
    next()
  }

  /**
   * Return the plugin.
   *
   * @type {Object}
   */

  return {
    onCompositionEnd,
    onCompositionStart,
    onInput,
    onKeyDown,
    onSelect,
    queries,
  }
}

/**
 * Export.
 *
 * @type {Function}
 */

export default CompositionPlugin
