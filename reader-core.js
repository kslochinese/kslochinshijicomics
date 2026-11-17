(function (root, factory) {
  "use strict";
  var api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.ReaderCore = api;
  }
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function storiesOf(data) {
    return data && Array.isArray(data.stories) ? data.stories : [];
  }

  function pageCount(story) {
    return story && Array.isArray(story.images) ? story.images.length : 0;
  }

  function naturalSort(items) {
    var collator = new Intl.Collator(undefined, {
      numeric: true,
      sensitivity: "base"
    });
    return (Array.isArray(items) ? items : []).slice().sort(function (left, right) {
      return collator.compare(String(left), String(right));
    });
  }

  function getStoryIndex(data, slug) {
    var stories = storiesOf(data);
    for (var index = 0; index < stories.length; index += 1) {
      if (stories[index] && stories[index].slug === slug) {
        return index;
      }
    }
    return -1;
  }

  function getStory(data, slug) {
    var index = getStoryIndex(data, slug);
    return index === -1 ? null : storiesOf(data)[index];
  }

  function clampPage(value, total) {
    if (!Number.isFinite(total) || total < 1) {
      return 0;
    }
    var numeric = typeof value === "number" ? value : Number.parseInt(String(value), 10);
    if (!Number.isFinite(numeric) || numeric < 1) {
      return 1;
    }
    numeric = Math.floor(numeric);
    return Math.min(numeric, total);
  }

  function homeState() {
    return { view: "home" };
  }

  function readerState(data, slug, requestedPage) {
    var story = getStory(data, slug);
    var total = pageCount(story);
    if (!story || total < 1) {
      return homeState();
    }
    return {
      view: "reader",
      storySlug: story.slug,
      page: clampPage(requestedPage, total)
    };
  }

  function startReading(data) {
    var first = storiesOf(data)[0];
    return first ? readerState(data, first.slug, 1) : homeState();
  }

  function isReaderState(data, state) {
    return Boolean(state && state.view === "reader" && getStory(data, state.storySlug));
  }

  function changePage(data, state, amount) {
    if (!isReaderState(data, state)) {
      return homeState();
    }
    var story = getStory(data, state.storySlug);
    var current = clampPage(state.page, pageCount(story));
    var step = Number.isFinite(amount) ? Math.trunc(amount) : 0;
    return readerState(data, story.slug, clampPage(current + step, pageCount(story)));
  }

  function isLastPage(data, state) {
    if (!isReaderState(data, state)) {
      return false;
    }
    var story = getStory(data, state.storySlug);
    return clampPage(state.page, pageCount(story)) === pageCount(story);
  }

  function nextStory(data, state) {
    if (!isReaderState(data, state) || !isLastPage(data, state)) {
      return null;
    }
    var currentIndex = getStoryIndex(data, state.storySlug);
    var following = storiesOf(data)[currentIndex + 1];
    return following ? readerState(data, following.slug, 1) : null;
  }

  function decodeSegment(segment) {
    try {
      return decodeURIComponent(segment);
    } catch (error) {
      return "";
    }
  }

  function parseHash(hash, data) {
    var value = typeof hash === "string" ? hash : "";
    var route = value.replace(/^#/, "");
    if (!route || route === "/") {
      return homeState();
    }

    var segments = route.split("/").filter(function (segment) {
      return segment.length > 0;
    }).map(decodeSegment);

    if (segments.length !== 3 || segments[0] !== "read") {
      return homeState();
    }
    return readerState(data, segments[1], segments[2]);
  }

  function hashFor(state) {
    if (!state || state.view !== "reader") {
      return "#";
    }
    return "#/read/" + encodeURIComponent(state.storySlug) + "/" + String(state.page);
  }

  return {
    naturalSort: naturalSort,
    getStory: getStory,
    getStoryIndex: getStoryIndex,
    pageCount: pageCount,
    homeState: homeState,
    readerState: readerState,
    startReading: startReading,
    changePage: changePage,
    isLastPage: isLastPage,
    nextStory: nextStory,
    parseHash: parseHash,
    hashFor: hashFor
  };
}));
