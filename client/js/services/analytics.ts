const Pages = {
  INDEX: '/',
};

const EventCategories = {
  CONTROLS: 'controls',
  VIEWER: 'viewer',
};

const EventActions = {
  CLICK: 'click',
  HOVER: 'hover',
  SELECTED: 'selected',
  UPDATE: 'update'
};

const EventLabels = {
  SOURCE_INPUT: 'source-input',
  SOURCE_TOOLTIP: 'source-tooltip',
  UPDATE_BUTTON: 'update-button',
  SHARE_BUTTON: 'share-button',
  ALBUM_SOURCES: 'album-sources',
};

const Dimensions = {
  SOURCES: 'dimension0',
  SOURCE_ONE: 'dimension1',
  SOURCE_TWO: 'dimension2',
};

export {
  Pages,
  EventCategories,
  EventActions,
  EventLabels,
  Dimensions
}

export default {

  /**
   * Tracks a page view.
   *
   * @param {string} path - The path of the current URL. Prefixed with '/'
   */
  trackPageView(path) {
    window['ga']('send', {
      hitType: 'pageview',
      page: path
    });
  },

  /**
   * Tracks an event or interaction on the page.
   *
   * @param {string} category - The type of thing interacted with. (eg. Video)
   * @param {string} action - The type of interaction. (eg. play)
   * @param {string?} label - Typically a subcategory.
   * @param {number?} value - A useful and unique identification of the thing interacted with.
   * @param {Object<string, *>?} dimensions - A key-value map of dimension parameters.
   */
  trackEvent({ category, action, label, value, dimensions }: { category, action, label?, value?, dimensions? }) {
    let event = Object.assign({
      hitType: 'event'
    }, {
      eventCategory: category,
      eventAction: action,
      eventLabel: label,
      eventValue: value
    }, dimensions);
    window['ga']('send', event);
  }
}