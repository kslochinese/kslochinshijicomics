(function (root) {
  "use strict";

  var naturalCollator = new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: "base"
  });

  var imageVersions = {
    "03.jpg": "20261104-small-caption",
    "04.jpg": "20261024-short-tail",
    "07.jpg": "20261104-frame-review",
    "08.jpg": "20261104-frame-review",
    "09.jpg": "20261104-frame-review",
    "10.jpg": "20261104-frame-review",
    "11.jpg": "20261104-frame-review",
    "12.jpg": "20261104-frame-review",
    "13.jpg": "20261104-frame-review",
    "14.jpg": "20261104-frame-review",
    "15.jpg": "20261104-frame-review",
    "16.jpg": "20261104-frame-review",
    "17.jpg": "20261104-frame-review",
    "18.jpg": "20261104-frame-review"
  };

  function naturalImageList(fileNames) {
    return fileNames.slice().sort(function (left, right) {
      return naturalCollator.compare(left, right);
    }).map(function (fileName) {
      var version = imageVersions[fileName];
      return "assets/comics/" + fileName + (version ? "?v=" + encodeURIComponent(version) : "");
    });
  }

  var stories = [
    {
      title: "完璧歸趙",
      slug: "wanbi",
      imageFiles: ["01.jpg", "02.jpg", "03.jpg", "04.jpg", "05.jpg", "06.jpg", "07.jpg", "08.jpg", "09.jpg", "10.jpg"],
      fullPageStart: 1,
      fullPageEnd: 10,
      fullPageRange: "全篇第 1–10 頁"
    },
    {
      title: "澠池之會",
      slug: "mianchi",
      imageFiles: ["11.jpg", "12.jpg", "13.jpg", "14.jpg"],
      fullPageStart: 11,
      fullPageEnd: 14,
      fullPageRange: "全篇第 11–14 頁"
    },
    {
      title: "負荊請罪",
      slug: "fujing",
      imageFiles: ["15.jpg", "16.jpg", "17.jpg", "18.jpg"],
      fullPageStart: 15,
      fullPageEnd: 18,
      fullPageRange: "全篇第 15–18 頁"
    }
  ].map(function (story) {
    return {
      title: story.title,
      slug: story.slug,
      images: naturalImageList(story.imageFiles),
      fullPageStart: story.fullPageStart,
      fullPageEnd: story.fullPageEnd,
      fullPageRange: story.fullPageRange
    };
  });

  root.COMIC_DATA = {
    author: "司馬遷",
    chapter: "廉頗藺相如列傳（節錄）",
    cover: "assets/cover.jpg",
    schoolCredit: "香港管理專業協會羅桂祥中學中國語文",
    stories: stories
  };
}(typeof window !== "undefined" ? window : globalThis));
