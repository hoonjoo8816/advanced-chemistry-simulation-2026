/**
 * 고급화학 작품 갤러리 공용 좋아요 API
 * Google Apps Script 프로젝트의 Code.gs에 전체 내용을 붙여 넣어 사용합니다.
 */

const WORK_IDS = [
  "arrhenius-rate",
  "sequential-reaction",
  "ideal-gas-pv",
  "vsepr-3d",
  "nernst-cell",
  "bond-length",
  "hess-law",
  "lennard-jones",
  "henry-law",
  "nonideal-solution",
  "vsepr-angle",
  "arrhenius-plot",
  "reaction-order",
  "vsepr-geometry",
  "real-gas",
  "graham-effusion",
  "radioactive-decay",
  "faraday-electrolysis",
  "bohr-spectrum",
  "corrosion-ecl",
  "limiting-reagent"
];

function doGet(event) {
  const params = event && event.parameter ? event.parameter : {};
  const callback = safeCallback_(params.callback);
  let payload;

  try {
    payload = params.action === "like" ? addLike_(params.slug) : getCounts_();
  } catch (error) {
    payload = { ok: false, error: "요청을 처리하지 못했습니다." };
  }

  return ContentService
    .createTextOutput(callback + "(" + JSON.stringify(payload) + ");")
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function getCounts_() {
  const properties = PropertiesService.getScriptProperties();
  const stored = JSON.parse(properties.getProperty("likeCounts") || "{}");
  const counts = {};
  WORK_IDS.forEach(function (slug) {
    counts[slug] = Number(stored[slug] || 0);
  });
  return { ok: true, counts: counts };
}

function addLike_(slug) {
  if (WORK_IDS.indexOf(slug) === -1) {
    return { ok: false, error: "등록되지 않은 작품입니다." };
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const properties = PropertiesService.getScriptProperties();
    const stored = JSON.parse(properties.getProperty("likeCounts") || "{}");
    stored[slug] = Number(stored[slug] || 0) + 1;
    properties.setProperty("likeCounts", JSON.stringify(stored));
    return { ok: true, slug: slug, count: stored[slug] };
  } finally {
    lock.releaseLock();
  }
}

function safeCallback_(value) {
  const callback = String(value || "callback");
  return /^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callback) ? callback : "callback";
}
