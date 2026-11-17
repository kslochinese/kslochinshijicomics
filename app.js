(function () {
  "use strict";

  var app = document.getElementById("app");
  var data = window.COMIC_DATA;
  var core = window.ReaderCore;
  var renderToken = 0;

  if (!app || !data || !core) {
    if (app) {
      app.innerHTML = "<section class=\"empty-state\" role=\"alert\"><h1>無法載入閱讀內容</h1><p>請確認 data.js 與 reader-core.js 位於同一資料夾，然後重新開啟本頁。</p></section>";
    }
    return;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'\"]/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        "\"": "&quot;"
      }[character];
    });
  }

  function schoolFooter() {
    return "<footer class=\"school-credit\" aria-label=\"學校科目標示\">" + escapeHtml(data.schoolCredit || "") + "</footer>";
  }

  function currentState() {
    return core.parseHash(window.location.hash, data);
  }

  function goTo(state) {
    var hash = core.hashFor(state);
    if (window.location.hash === hash || (hash === "#" && window.location.hash === "")) {
      return;
    }
    window.location.hash = hash;
  }

  function goHome() {
    goTo(core.homeState());
  }

  function renderHome() {
    var storyItems = data.stories.map(function (story) {
      var total = core.pageCount(story);
      return "<li>" +
        "<button class=\"story-link\" type=\"button\" data-action=\"open-story\" data-slug=\"" + escapeHtml(story.slug) + "\" aria-label=\"閱讀「" + escapeHtml(story.title) + "」\">" +
          "<span><span class=\"story-link-title\">" + escapeHtml(story.title) + "</span><small class=\"story-range\">" + escapeHtml(story.fullPageRange) + "</small></span>" +
          "<span class=\"story-link-meta\">" + total + " 頁</span>" +
        "</button>" +
      "</li>";
    }).join("");

    app.innerHTML = "<section class=\"home-view\" aria-label=\"漫畫目錄\">" +
      "<header class=\"home-heading\">" +
        "<p class=\"site-kicker\">史傳漫畫</p>" +
        "<h1 class=\"home-title\">" + escapeHtml(data.chapter) + "</h1>" +
        "<p class=\"author-line\">作者：" + escapeHtml(data.author) + "</p>" +
      "</header>" +
      "<div class=\"home-layout\">" +
        "<div class=\"home-copy\">" +
          "<p class=\"home-intro\">選擇一個故事閱讀，或從第一段開始。</p>" +
          "<button class=\"primary-action\" type=\"button\" data-action=\"start-reading\">開始閱讀</button>" +
          "<nav aria-label=\"故事目錄\"><h2 class=\"story-list-title\">目錄</h2><ol class=\"story-list\">" + storyItems + "</ol></nav>" +
        "</div>" +
        "<aside class=\"cover-panel\" aria-label=\"篇章封面\">" +
          "<img class=\"cover-image\" data-cover-image src=\"" + escapeHtml(data.cover) + "\" alt=\"《" + escapeHtml(data.chapter) + "》封面\">" +
          "<p class=\"asset-error\" data-cover-error role=\"alert\" hidden>封面圖片無法載入；仍可從目錄開始閱讀。</p>" +
        "</aside>" +
      "</div>" +
      "<section class=\"reading-help\" aria-label=\"閱讀說明\"><h2>閱讀說明</h2><p>點擊『上一頁』或『下一頁』翻閱漫畫；電腦亦可使用鍵盤的 ← → 方向鍵。點擊『目錄』可選擇其他故事。</p></section>" +
      schoolFooter() +
    "</section>";

    bindCoverError();
  }

  function controlsFor(state, story, total) {
    var atFirst = state.page === 1;
    var atLast = state.page === total;
    var previous = "<button class=\"secondary\" type=\"button\" data-action=\"previous\"" + (atFirst ? " disabled" : "") + ">上一頁</button>";
    var indicator = "<p class=\"page-indicator\" aria-live=\"polite\">第 " + state.page + " 頁／共 " + total + " 頁</p>";

    if (!atLast) {
      return "<nav class=\"reader-controls\" aria-label=\"翻頁控制\">" + indicator + previous + "<button class=\"secondary\" type=\"button\" data-action=\"directory\">目錄</button><button type=\"button\" data-action=\"next\">下一頁</button></nav>";
    }

    var following = core.nextStory(data, state);
    var finish = following
      ? "<section class=\"story-finish\" aria-label=\"故事完成\"><p>此段讀畢</p><div class=\"finish-actions\"><button type=\"button\" data-action=\"next-story\">下一個故事</button><button class=\"secondary\" type=\"button\" data-action=\"directory\">返回目錄</button></div></section>"
      : "<section class=\"story-finish\" aria-label=\"全文完成\"><p>全文完</p><div class=\"finish-actions\"><button class=\"secondary\" type=\"button\" data-action=\"directory\">返回目錄</button></div></section>";

    return "<nav class=\"reader-controls reader-controls--last\" aria-label=\"翻頁控制\">" + indicator + previous + "</nav>" + finish;
  }

  function renderReader(state) {
    var story = core.getStory(data, state.storySlug);
    if (!story) {
      renderHome();
      return;
    }
    var total = core.pageCount(story);
    var imageSource = story.images[state.page - 1];
    var token = String(++renderToken);

    app.innerHTML = "<article class=\"reader-view\" data-render-token=\"" + token + "\" aria-label=\"漫畫閱讀\">" +
      "<header class=\"reader-header\">" +
        "<p class=\"reader-kicker\">" + escapeHtml(data.chapter) + "</p>" +
        "<h1 class=\"reader-title\">" + escapeHtml(story.title) + "</h1>" +
      "</header>" +
      "<div id=\"comic-top\" class=\"comic-stage\">" +
        "<figure class=\"comic-figure\">" +
          "<img class=\"comic-image\" width=\"1280\" height=\"1920\" data-comic-image data-original-src=\"" + escapeHtml(imageSource) + "\" src=\"" + escapeHtml(imageSource) + "\" alt=\"《" + escapeHtml(data.chapter) + "》〈" + escapeHtml(story.title) + "〉第 " + state.page + " 頁，共 " + total + " 頁\">" +
        "</figure>" +
        "<section class=\"asset-error reader-image-error\" data-reader-error role=\"alert\" hidden><span>漫畫圖片無法載入。請確認圖片檔位於 assets/comics/，然後重新載入。</span><br><button class=\"quiet\" type=\"button\" data-action=\"retry-image\">重新載入圖片</button></section>" +
      "</div>" +
      controlsFor(state, story, total) +
      schoolFooter() +
    "</article>";

    bindComicImageError(token);
    scrollToComicTop();
  }

  function isCurrentToken(token) {
    var view = app.querySelector("[data-render-token]");
    return Boolean(view && view.getAttribute("data-render-token") === token);
  }

  function bindCoverError() {
    var image = app.querySelector("[data-cover-image]");
    var message = app.querySelector("[data-cover-error]");
    if (!image || !message) {
      return;
    }
    image.addEventListener("error", function () {
      message.hidden = false;
      image.hidden = true;
    });
    image.addEventListener("load", function () {
      message.hidden = true;
      image.hidden = false;
    });
    if (image.complete && image.naturalWidth === 0) {
      message.hidden = false;
      image.hidden = true;
    }
  }

  function bindComicImageError(token) {
    var image = app.querySelector("[data-comic-image]");
    var message = app.querySelector("[data-reader-error]");
    if (!image || !message) {
      return;
    }
    image.addEventListener("error", function () {
      if (isCurrentToken(token)) {
        message.hidden = false;
        image.hidden = true;
      }
    });
    image.addEventListener("load", function () {
      if (isCurrentToken(token)) {
        message.hidden = true;
        image.hidden = false;
        scrollToComicTop();
      }
    });
    if (image.complete && image.naturalWidth === 0 && isCurrentToken(token)) {
      message.hidden = false;
      image.hidden = true;
    }
  }

  function retryImage() {
    var image = app.querySelector("[data-comic-image]");
    var message = app.querySelector("[data-reader-error]");
    if (!image) {
      return;
    }
    var original = image.getAttribute("data-original-src");
    if (!original) {
      return;
    }
    if (message) {
      message.hidden = true;
    }
    image.hidden = false;
    image.src = original + (original.indexOf("?") === -1 ? "?reload=" : "&reload=") + Date.now();
  }

  function scrollToComicTop() {
    window.requestAnimationFrame(function () {
      var target = document.getElementById("comic-top");
      if (target) {
        window.scrollTo({ top: Math.max(0, target.getBoundingClientRect().top + window.scrollY - 16), left: 0, behavior: "auto" });
      }
    });
  }

  function render() {
    var state = currentState();
    if (state.view === "reader") {
      renderReader(state);
    } else {
      renderHome();
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }

  app.addEventListener("click", function (event) {
    var control = event.target.closest("[data-action]");
    if (!control || control.disabled) {
      return;
    }
    var action = control.getAttribute("data-action");
    var state = currentState();

    if (action === "start-reading") {
      goTo(core.startReading(data));
    } else if (action === "open-story") {
      goTo(core.readerState(data, control.getAttribute("data-slug"), 1));
    } else if (action === "previous") {
      goTo(core.changePage(data, state, -1));
    } else if (action === "next") {
      goTo(core.changePage(data, state, 1));
    } else if (action === "next-story") {
      var following = core.nextStory(data, state);
      if (following) {
        goTo(following);
      }
    } else if (action === "directory") {
      goHome();
    } else if (action === "retry-image") {
      retryImage();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.repeat || event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
      return;
    }
    var target = event.target;
    if (target && (target.isContentEditable || target.closest("input, textarea, select, [contenteditable=\"true\"]"))) {
      return;
    }
    var state = currentState();
    if (state.view !== "reader") {
      return;
    }
    event.preventDefault();
    goTo(core.changePage(data, state, event.key === "ArrowLeft" ? -1 : 1));
  });

  window.addEventListener("hashchange", render);
  render();
}());
