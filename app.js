/* =========================================================================
   汉教云程 · 心途领航 官网交互
   原则：
   1) 所有内容在无 JS 时保持可读——本文件只做增强，不做渲染前置条件。
   2) prefers-reduced-motion: reduce 时关闭漂浮 / 虚线流动 / 数字滚动。
   3) 收入数字只在模块一地区面板出现一次，且常驻「参考范围 · 以实际岗位为准」。
   ========================================================================= */
(function () {
  'use strict';

  var mqReduce = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var reduceMotion = !!(mqReduce && mqReduce.matches);

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* =======================================================================
     0. Toast
     ======================================================================= */
  var toastStack = $('#toastStack');

  function toast(message, kind) {
    if (!toastStack) return;
    var el = document.createElement('div');
    el.className = 'toast' + (kind === 'warn' ? ' toast--warn' : '');
    el.setAttribute('role', 'status');

    var text = document.createElement('span');
    text.textContent = message;
    el.appendChild(text);

    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'toast__close';
    close.setAttribute('aria-label', '关闭提示');
    close.textContent = '\u00D7';
    close.addEventListener('click', function () { remove(); });
    el.appendChild(close);

    toastStack.appendChild(el);

    var timer = window.setTimeout(remove, 6000);
    function remove() {
      window.clearTimeout(timer);
      if (el.parentNode) el.parentNode.removeChild(el);
    }
  }

  /* =======================================================================
     1. 地区数据（模块一）
     收入数字全部来自机构资料整理，属 C 类「参考范围」，不接受无来源估算。
     ======================================================================= */
  var REGIONS = [
    {
      id: 'cn', name: '中国大陆', lp: 'b', x: 82.2, y: 27.8, hub: true,
      types: '线下机构中文教师、国际学校中文项目支持、企业定制培训讲师',
      modes: '线下全职 · 线下兼职',
      income: [{ v: '综合年薪 10–18 万元', s: '机构资料整理' }],
      note: '国内岗位以线下机构、国际学校与成人培训为主，通常需要坐班并配合周末排课。'
    },
    {
      id: 'us', name: '北美（美国）', lp: 't', x: 29.4, y: 27.2,
      types: '外籍学员汉语培训、IB 学校中文项目支持、跨境文化课程开发',
      modes: '线下全职 · 线上远程',
      income: [
        { v: '线下学校综合年薪 15–50 万元（欧美发达国家学校口径）', s: '机构资料整理' },
        { v: '线上授课时薪 350–550 元 / 小时', s: '机构资料整理' }
      ],
      note: '线下岗位通常由当地学校或学区直接签约；线上岗位多由平台或平台上的工作室签约。'
    },
    {
      id: 'ca', name: '加拿大', lp: 'l', x: 23.6, y: 21.1,
      types: '外籍学员汉语培训、跨境文化课程开发',
      modes: '线下全职 · 线上远程',
      income: [{ v: '线上授课时薪 310–360 元 / 小时', s: '机构资料整理' }],
      note: '岗位以线下学校与线上平台两类为主，具体签约主体以岗位方为准。'
    },
    {
      id: 'latam', name: '拉丁美洲', lp: 'r', x: 36.9, y: 62.8,
      types: '外籍学员汉语培训、跨境文化课程开发',
      modes: '线上远程 · 线上线下混合',
      income: [],
      note: '机构资料未提供该地区的收入参考区间，本页不使用估算数字填充。'
    },
    {
      id: 'eu', name: '欧洲（含法国、德国）', lp: 't', x: 50.6, y: 22.8,
      types: '外籍学员汉语培训、IB 学校中文项目支持、跨境文化课程开发',
      modes: '线下全职 · 线上远程',
      income: [
        { v: '线上授课时薪 470–630 元 / 小时（西欧口径）', s: '机构资料整理' },
        { v: '法国等地综合年薪折合人民币 40–60 万元', s: '机构资料整理' }
      ],
      note: '该区间为机构资料整理的宣传口径，属个别地区情况，不是普遍水平，也不构成收入承诺。'
    },
    {
      id: 'africa', name: '非洲', lp: 'r', x: 60.3, y: 50.6,
      types: '外籍学员汉语培训、企业定制培训（海外中资企业本土化方向）',
      modes: '线下全职 · 线上远程',
      income: [],
      note: '机构资料未提供该地区的收入参考区间。企业定制方向通常由中资企业或当地机构发起。'
    },
    {
      id: 'me', name: '中东（海湾地区）', lp: 'l', x: 65.3, y: 36.1,
      types: '外籍学员汉语培训、企业定制培训',
      modes: '线下全职 · 线上线下混合',
      income: [],
      note: '机构资料未提供该地区的收入参考区间。该类岗位常见要求为可长期驻外。'
    },
    {
      id: 'in', name: '南亚', lp: 't', x: 70.3, y: 39.4,
      types: '外籍学员汉语培训、HSK 专项教学',
      modes: '线上远程 · 线上线下混合',
      income: [],
      note: '机构资料未提供该地区的收入参考区间。'
    },
    {
      id: 'sea', name: '东南亚', lp: 'b', x: 77.8, y: 42.2,
      types: '外籍学员汉语培训、少儿中文教学、HSK 专项教学',
      modes: '线下全职 · 线上线下混合',
      income: [],
      note: '机构资料未提供该地区的收入参考区间。该区域线下学校岗位占比较高。'
    },
    {
      id: 'sg', name: '新加坡', lp: 'b', x: 78.9, y: 58,
      types: '外籍学员汉语培训、IB 学校中文项目支持',
      modes: '线下全职 · 线上线下混合',
      income: [{ v: '综合年薪折合人民币 40–60 万元', s: '机构资料整理' }],
      note: '该区间为机构资料整理的宣传口径，属个别地区情况，不是普遍水平，也不构成收入承诺。'
    },
    {
      id: 'kr', name: '日韩', lp: 'r', x: 88.6, y: 30.0,
      types: '外籍学员汉语培训、HSK 专项教学、少儿中文教学',
      modes: '线下全职 · 线上线下混合',
      income: [],
      note: '机构资料未提供该地区的收入参考区间。'
    },
    {
      id: 'au', name: '澳洲', lp: 'b', x: 91.9, y: 68.9,
      types: '外籍学员汉语培训、IB 学校中文项目支持',
      modes: '线下全职 · 线上远程',
      income: [{ v: '线上授课时薪 245–390 元 / 小时', s: '机构资料整理' }],
      note: '岗位以线下学校与线上平台两类为主，具体签约主体以岗位方为准。'
    },
    {
      id: 'online', name: '线上平台（跨时区）', lp: 'r', x: 43.1, y: 55.6,
      types: '线上一对一 / 小班汉语培训、跨境文化课程开发',
      modes: '线上远程（按课时结算）',
      income: [],
      note: '该节点不对应特定国家，指 100+ 大型线上教学平台的岗位形态；课时单价与结算规则由平台规定。'
    },
    {
      id: 'other', name: '其他地区（聚合）', lp: 'r', x: 8.3, y: 44.4,
      types: '外籍学员汉语培训、企业定制培训',
      modes: '以实际岗位为准',
      income: [],
      note: '未单独列出的国家和地区统一聚合到该节点，合计对应「85 个国家和地区」的可对接口径。'
    }
  ];

  var HUB = REGIONS.filter(function (r) { return r.hub; })[0] || REGIONS[0];

  // 地图上的短标签：只用于示意图，完整名称保留在地区面板、列表视图与 aria-label 中。
  // 目的：避免长标签（如「中东（海湾地区）」）在密集区域互相重叠。
  var SHORT_LABELS = {
    cn: '中国', us: '美国', ca: '加拿大', latam: '拉美', eu: '欧洲',
    africa: '非洲', me: '中东', in: '南亚', sea: '东南亚', sg: '新加坡',
    kr: '日韩', au: '澳洲', online: '线上', other: '其他'
  };

  function pctToSvg(x, y) { return { x: (x / 100) * 1000, y: (y / 100) * 500 }; }

  function arcPath(a, b) {
    var dx = b.x - a.x, dy = b.y - a.y;
    var len = Math.sqrt(dx * dx + dy * dy) || 1;
    var nx = -dy / len, ny = dx / len;
    var bow = len * 0.16;
    var cx = (a.x + b.x) / 2 + nx * bow;
    var cy = (a.y + b.y) / 2 + ny * bow;
    return 'M' + a.x.toFixed(1) + ' ' + a.y.toFixed(1) +
           ' Q' + cx.toFixed(1) + ' ' + cy.toFixed(1) +
           ' ' + b.x.toFixed(1) + ' ' + b.y.toFixed(1);
  }

  /* =======================================================================
     2. 首屏星图（装饰性，复用同一套节点坐标，不引入假点）
     ======================================================================= */
  function buildHeroViz() {
    var host = $('#heroNodes');
    if (!host) return;

    var svgNS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('class', 'link');
    svg.setAttribute('viewBox', '0 0 1000 500');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    var hubSvg = pctToSvg(HUB.x, HUB.y);
    REGIONS.forEach(function (r) {
      if (r.id === HUB.id) return;
      var p = document.createElementNS(svgNS, 'path');
      p.setAttribute('d', arcPath(hubSvg, pctToSvg(r.x, r.y)));
      svg.appendChild(p);
    });
    host.appendChild(svg);

    var frag = document.createDocumentFragment();
    REGIONS.forEach(function (r, i) {
      var dot = document.createElement('span');
      dot.className = 'node' + (r.hub ? ' node--hub' : '');
      dot.style.setProperty('--nx', r.x);
      dot.style.setProperty('--ny', r.y);
      if (!reduceMotion) {
        dot.style.animationDelay = (i * 90) + 'ms';
      }
      frag.appendChild(dot);

      var label = document.createElement('span');
      label.className = 'node-label' + (r.hub ? ' node-label--hub' : '');
      label.textContent = SHORT_LABELS[r.id] || r.name;
      label.style.setProperty('--nx', r.x);
      label.style.setProperty('--ny', r.y);
      frag.appendChild(label);
    });
    host.appendChild(frag);
  }

  /* =======================================================================
     3. 模块一 · 全球岗位地图
     ======================================================================= */
  var mapState = { current: REGIONS[0].id };

  function buildMap() {
    var arcsHost = $('#mapArcs');
    var nodesHost = $('#mapNodes');
    var listHost = $('#regionList');
    if (!arcsHost || !nodesHost || !listHost) return;

    var svgNS = 'http://www.w3.org/2000/svg';
    var hubSvg = pctToSvg(HUB.x, HUB.y);

    REGIONS.forEach(function (r) {
      // 航线
      var path = document.createElementNS(svgNS, 'path');
      path.setAttribute('d', arcPath(hubSvg, pctToSvg(r.x, r.y)));
      path.setAttribute('data-region', r.id);
      arcsHost.appendChild(path);

      // 地图节点（真实 button，键盘可达）
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'map-node';
      btn.setAttribute('data-region', r.id);
      if (r.hub) btn.setAttribute('data-hub', 'true');
      btn.setAttribute('data-lp', r.lp);
      btn.setAttribute('aria-pressed', 'false');
      btn.setAttribute('aria-label', r.name + '：查看岗位类型、工作方式与收入参考范围');
      btn.style.setProperty('--nx', r.x);
      btn.style.setProperty('--ny', r.y);

      var dot = document.createElement('span');
      dot.className = 'map-node__dot';
      dot.setAttribute('aria-hidden', 'true');
      btn.appendChild(dot);

      var lab = document.createElement('span');
      lab.className = 'map-node__label';
      lab.setAttribute('aria-hidden', 'true');
      lab.textContent = SHORT_LABELS[r.id] || r.name;
      btn.appendChild(lab);

      btn.addEventListener('click', function () { selectRegion(r.id, true); });
      nodesHost.appendChild(btn);

      // 列表视图（等价获取路径，SR 可读的 ul > li > button）
      var li = document.createElement('li');
      var lbtn = document.createElement('button');
      lbtn.type = 'button';
      lbtn.className = 'region-item';
      lbtn.setAttribute('data-region', r.id);
      lbtn.setAttribute('aria-pressed', 'false');

      var nm = document.createElement('span');
      nm.className = 'region-item__name';
      nm.textContent = r.name;
      var meta = document.createElement('span');
      meta.className = 'region-item__meta';
      meta.textContent = r.modes;

      lbtn.appendChild(nm);
      lbtn.appendChild(meta);
      lbtn.addEventListener('click', function () { selectRegion(r.id, true); });
      li.appendChild(lbtn);
      listHost.appendChild(li);
    });

    // SR 播报区
    var status = document.createElement('p');
    status.className = 'visually-hidden';
    status.id = 'mapStatus';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    nodesHost.parentNode.appendChild(status);

    renderRegion(REGIONS[0]);

    $('#mapHint').textContent =
      '本图列出 ' + REGIONS.length + ' 个节点（含「其他地区」聚合节点），合计对应 85 个国家和地区的可对接口径。' +
      '图中标签为简称示意，非地理精确制图；完整名称见列表视图与地区面板。';
  }

  function selectRegion(id, announce) {
    var region = REGIONS.filter(function (r) { return r.id === id; })[0];
    if (!region) return;
    mapState.current = id;
    renderRegion(region);
    if (announce) {
      var status = $('#mapStatus');
      if (status) {
        status.textContent = '已选择：' + region.name + '。岗位类型：' + region.types +
          '。工作方式：' + region.modes + '。收入为参考范围，以实际岗位为准。';
      }
    }
  }

  function renderRegion(region) {
    // 选中态（形状 + 描边，不只靠颜色）
    $$('.map-node').forEach(function (n) {
      n.setAttribute('aria-pressed', n.getAttribute('data-region') === region.id ? 'true' : 'false');
    });
    $$('.region-item').forEach(function (n) {
      n.setAttribute('aria-pressed', n.getAttribute('data-region') === region.id ? 'true' : 'false');
    });
    $$('#mapArcs path').forEach(function (p) {
      if (p.getAttribute('data-region') === region.id) p.classList.add('is-active');
      else p.classList.remove('is-active');
    });

    var title = $('#regionPanelTitle');
    var types = $('#panelTypes');
    var modes = $('#panelModes');
    var income = $('#panelIncome');
    var disclaimer = $('#panelDisclaimer');
    if (!title || !income) return;

    title.textContent = region.name;
    types.textContent = region.types;
    modes.textContent = region.modes;

    income.textContent = '';
    if (region.income.length) {
      region.income.forEach(function (item) {
        var li = document.createElement('li');
        var v = document.createElement('span');
        v.className = 'income-list__val';
        v.textContent = item.v;
        var s = document.createElement('span');
        s.className = 'income-list__src';
        s.textContent = '来源：' + item.s;
        li.appendChild(v);
        li.appendChild(s);
        income.appendChild(li);
      });
    } else {
      var li2 = document.createElement('li');
      var v2 = document.createElement('span');
      v2.className = 'income-list__val';
      v2.textContent = '该地区暂无公开参考区间';
      var s2 = document.createElement('span');
      s2.className = 'income-list__src';
      s2.textContent = '机构资料未提供，本页不使用估算数字填充';
      li2.appendChild(v2);
      li2.appendChild(s2);
      income.appendChild(li2);
    }

    if (disclaimer) {
      disclaimer.textContent = region.note + ' 本面板仅说明岗位去向与类型，不构成就业或收入承诺；具体签约主体以岗位方为准。';
    }
  }

  function initMapViews() {
    var mapBtn = $('#viewMapBtn');
    var listBtn = $('#viewListBtn');
    var stage = $('#mapStage');
    var listWrap = $('#regionListWrap');
    var toolbar = $('#mapToolbar');
    if (!mapBtn || !listBtn || !stage || !listWrap) return;

    // 视图切换依赖 JS，因此工具栏默认 hidden，由脚本开启
    if (toolbar) toolbar.hidden = false;

    function setView(view, announce) {
      var isMap = view === 'map';
      stage.hidden = !isMap;
      listWrap.hidden = isMap;
      mapBtn.setAttribute('aria-pressed', isMap ? 'true' : 'false');
      listBtn.setAttribute('aria-pressed', isMap ? 'false' : 'true');
      mapBtn.classList.toggle('is-active', isMap);
      listBtn.classList.toggle('is-active', !isMap);
      if (announce) toast(isMap ? '已切换到地图视图' : '已切换到列表视图');
    }

    mapBtn.addEventListener('click', function () { setView('map', true); });
    listBtn.addEventListener('click', function () { setView('list', true); });

    // 移动端默认列表视图（不依赖精细点按）
    var isNarrow = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
    setView(isNarrow ? 'list' : 'map', false);
  }

  /* =======================================================================
     4. 通用折叠组件（步骤 / 陪跑时间线）
     ======================================================================= */
  function initAccordion(listEl, itemSel, btnSel, panelSel, onOpen) {
    var list = $(listEl);
    if (!list) return;
    var items = $$(itemSel, list);
    if (!items.length) return;

    function setOpen(item, open) {
      var btn = $(btnSel, item);
      var panel = $(panelSel, item);
      if (!btn || !panel) return;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      panel.hidden = !open;
      item.classList.toggle('is-open', open);
    }

    items.forEach(function (item) {
      var btn = $(btnSel, item);
      if (!btn) return;
      btn.addEventListener('click', function () {
        var willOpen = btn.getAttribute('aria-expanded') !== 'true';
        setOpen(item, willOpen);
        if (willOpen && typeof onOpen === 'function') onOpen(item);
      });
    });

    // 方向键在轨道内移动焦点
    list.addEventListener('keydown', function (e) {
      var keys = ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
      if (keys.indexOf(e.key) === -1) return;
      var btns = items.map(function (it) { return $(btnSel, it); });
      var idx = btns.indexOf(document.activeElement);
      if (idx === -1) return;
      e.preventDefault();
      var next = idx;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (idx + 1) % btns.length;
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (idx - 1 + btns.length) % btns.length;
      if (e.key === 'Home') next = 0;
      if (e.key === 'End') next = btns.length - 1;
      btns[next].focus();
    });

    // 初始只保留 HTML 中标记为展开的一项
    items.forEach(function (item) {
      var btn = $(btnSel, item);
      setOpen(item, btn && btn.getAttribute('aria-expanded') === 'true');
    });
  }

  function initSteps() {
    var fill = $('#stepsTrackFill');
    var list = $('#stepsList');

    function syncRail(openItem) {
      var items = $$('.step', list);
      var total = items.length;
      var idx = items.indexOf(openItem);
      if (idx < 0) idx = 0;
      items.forEach(function (it) { it.classList.toggle('is-current', it === openItem); });
      if (fill) {
        fill.style.transform = 'scaleY(' + ((idx + 1) / total).toFixed(3) + ')';
      }
    }

    initAccordion('#stepsList', '.step', '.step__btn', '.step__panel', syncRail);
    var first = $('.step', list);
    if (first) syncRail(first);
  }

  function initTimeline() {
    initAccordion('#timeline', '.timeline__item', '.timeline__btn', '.timeline__panel');
  }

  /* =======================================================================
     5. 路径自测
     ======================================================================= */
  var OUTCOMES = {
    domestic: {
      label: '建议方向 01',
      title: '国内全职 · 线下机构 / 国际学校',
      lead: '你的时间投入与对稳定节奏的偏好，更匹配国内的线下教学岗位。这条路径的确定性最高，也最容易把教学能力沉淀下来。',
      why: [
        '可以投入整块时间，能配合机构的坐班与周末排课要求。',
        '更看重固定月薪与稳定节奏，而不是按课时波动的收入。',
        '目前主要用中文授课，短期内不需要跨语言教学环境的适应成本。'
      ],
      steps: [
        '先确认要考的证书体系（汉办 / IPA / ICA 属于不同发证主体），再决定培训方向。',
        '按「笔试准备 → 微格训练 → 面试」的顺序推进，重点补现代汉语与对外汉语技能教学。',
        '进入陪跑后优先做简历精修与线下试讲特训，把带班经验写清楚。'
      ],
      caution: '国内岗位对坐班与排课时段的要求较明确，谈薪时重点确认课时保底与寒暑假安排。'
    },
    online: {
      label: '建议方向 02',
      title: '线上兼职 · 按课时结算',
      lead: '你的时间比较碎片化，线上岗位可以用较低的时间门槛先跑起来——先有真实课时，再谈收入结构。',
      why: [
        '每周可投入 10–20 小时或时间不固定，适合按课时接单的结算方式。',
        '希望时间自由、多劳多得，不愿被固定班表绑定。',
        '线上教学对跨语言沟通的要求相对低，更容易从零起步。'
      ],
      steps: [
        '优先做试讲特训：线上试讲考察镜头感、互动节奏与时间控制，与线下差异很大。',
        '准备一版面向平台投递的简历与一段 60 秒自我介绍。',
        '上岗前把课时单价、结算周期、平台抽成规则逐条问清楚，再决定接哪一家。'
      ],
      caution: '线上岗位的收入随课时量波动，且平台规则可能调整。把「参考范围」当成上限预期会容易失望，建议先按最低课时量测算。'
    },
    oversea: {
      label: '建议方向 03',
      title: '海外岗位 · 线下全职',
      lead: '你的外语条件与出海意愿都具备基础，海外线下岗位是收入上限与职业经历都更有空间的一条路，但前置准备也最多。',
      why: [
        '愿意长期在海外生活，能接受跨文化环境与驻外工作节奏。',
        '外语可以支撑日常沟通甚至授课，具备跨语言教学的基础条件。',
        '更看重收入上限与海外经历，愿意用更长的准备周期换更大的空间。'
      ],
      steps: [
        '先确认目标国家 / 地区当前的岗位类型与签证、工作许可要求，这些往往比证书更卡人。',
        '把试讲与模拟面试练到能在全外语或双语环境下完成。',
        '谈薪阶段重点核对合同主体、币种与汇率承担、税费、住宿与续约条件，逐条写进合同。'
      ],
      caution: '海外岗位的国家差异极大，本页的收入区间仅为参考范围且来自机构资料整理，不是普遍水平。请以岗位方给出的合同条款为最终依据。'
    }
  };

  // 计分：每题的选项分别给三种路径加权
  var WEIGHTS = {
    q1: { full: { domestic: 2, oversea: 1 }, part: { online: 2, domestic: 1 }, online: { online: 2 } },
    q2: { oversea: { oversea: 3 }, online: { online: 2, domestic: 1 }, domestic: { domestic: 3 } },
    q3: { offline: { domestic: 2, oversea: 1 }, online: { online: 2 }, zero: { online: 1, domestic: 1 } },
    q4: { domestic: { domestic: 3 }, online: { online: 3 }, oversea: { oversea: 3 } },
    q5: { oversea: { oversea: 2, online: 1 }, online: { online: 2, domestic: 1 }, domestic: { domestic: 2 } }
  };

  var QUESTION_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5'];
  var ANSWER_HINTS = {
    domestic: '国内全职',
    online: '线上兼职',
    oversea: '海外岗位'
  };

  function initQuiz() {
    var form = $('#quizForm');
    var result = $('#quizResult');
    var reset = $('#quizReset');
    var progress = $('#quizProgress');
    if (!form || !result) return;

    var lastTrigger = null;

    form.addEventListener('change', updateProgress);

    function updateProgress() {
      var answered = QUESTION_KEYS.filter(function (k) {
        return form.querySelector('input[name="' + k + '"]:checked');
      }).length;
      if (progress) progress.textContent = '已作答 ' + answered + ' / ' + QUESTION_KEYS.length + ' 题';
      return answered;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var answers = {};
      var missing = null;

      QUESTION_KEYS.forEach(function (k) {
        var checked = form.querySelector('input[name="' + k + '"]:checked');
        if (!checked) {
          if (!missing) missing = k;
          return;
        }
        answers[k] = checked.value;
      });

      if (missing) {
        var fieldset = form.querySelector('fieldset[data-q="' + missing.replace('q', '') + '"]');
        toast('还有题目没有作答，请先完成第 ' + missing.replace('q', '') + ' 题。', 'warn');
        if (fieldset) {
          var firstRadio = fieldset.querySelector('input[type="radio"]');
          if (firstRadio) firstRadio.focus();
        }
        updateProgress();
        return;
      }

      var scores = { domestic: 0, online: 0, oversea: 0 };
      QUESTION_KEYS.forEach(function (k) {
        var w = WEIGHTS[k][answers[k]] || {};
        Object.keys(w).forEach(function (key) { scores[key] += w[key]; });
      });

      // 平局时以第 4 题（优先级偏好）为准
      var top = Object.keys(scores).sort(function (a, b) { return scores[b] - scores[a]; })[0];
      if (scores.domestic === scores.online || scores.online === scores.oversea || scores.domestic === scores.oversea) {
        if (scores[answers.q4] === scores[top]) top = answers.q4;
      }

      renderResult(top, scores);
      lastTrigger = document.activeElement;
    });

    function renderResult(key, scores) {
      var o = OUTCOMES[key];
      result.textContent = '';

      var label = document.createElement('p');
      label.className = 'result__label';
      label.textContent = o.label;

      var title = document.createElement('h3');
      title.className = 'result__title';
      title.textContent = o.title;

      var lead = document.createElement('p');
      lead.className = 'result__lead';
      lead.textContent = o.lead;

      result.appendChild(label);
      result.appendChild(title);
      result.appendChild(lead);

      // 得分分布
      var dl = document.createElement('dl');
      dl.className = 'result__scores';
      Object.keys(scores).forEach(function (k) {
        var wrap = document.createElement('div');
        wrap.className = 'result__score' + (k === key ? ' is-top' : '');
        var dt = document.createElement('dt');
        dt.textContent = ANSWER_HINTS[k];
        var dd = document.createElement('dd');
        dd.textContent = scores[k] + ' 分';
        wrap.appendChild(dt);
        wrap.appendChild(dd);
        dl.appendChild(wrap);
      });
      result.appendChild(dl);

      result.appendChild(buildBlock('为什么是这个方向', o.why, false));
      result.appendChild(buildBlock('建议的下一步', o.steps, false));
      result.appendChild(buildBlock('需要留意', [o.caution], true));

      var disclaimer = document.createElement('p');
      disclaimer.className = 'result__disclaimer';
      disclaimer.textContent = '建议仅供参考，实际以岗位要求与个人条件为准。本测验不构成就业建议、收入预测或通过承诺，也不收集、不上传你的作答内容。';
      result.appendChild(disclaimer);

      var actions = document.createElement('div');
      actions.className = 'result__actions';

      var a1 = document.createElement('a');
      a1.className = 'btn btn--ghost btn--ghostDark';
      a1.href = '#map';
      a1.textContent = '查看该方向的岗位参考';

      var a2 = document.createElement('button');
      a2.type = 'button';
      a2.className = 'btn btn--primary js-consult';
      a2.textContent = '报名咨询';

      actions.appendChild(a1);
      actions.appendChild(a2);
      result.appendChild(actions);

      result.hidden = false;
      bindConsultTriggers(result);
      result.focus();
      toast('已生成建议方向：' + o.title);
    }

    function buildBlock(heading, items, warn) {
      var block = document.createElement('div');
      block.className = 'result__block';
      var h = document.createElement('h4');
      h.textContent = heading;
      var ul = document.createElement('ul');
      ul.className = 'result__list' + (warn ? ' result__list--warn' : '');
      items.forEach(function (t) {
        var li = document.createElement('li');
        li.textContent = t;
        ul.appendChild(li);
      });
      block.appendChild(h);
      block.appendChild(ul);
      return block;
    }

    if (reset) {
      reset.addEventListener('click', function () {
        form.reset();
        result.hidden = true;
        result.textContent = '';
        updateProgress();
        toast('已清空作答，可以重新选择');
        var first = form.querySelector('input[type="radio"]');
        if (first) first.focus();
      });
    }

    updateProgress();
  }

  /* =======================================================================
     6. 咨询面板（模态）
     ======================================================================= */
  var CONSULT_TEXT = [
    '汉教云程 · 心途领航｜报名咨询准备清单',
    '',
    '1. 你要哪一种证书体系：国家汉办 / 语合中心、IPA、ICA 属于不同发证主体，培训与报考路径不同。',
    '2. 你每周可投入的学习与授课时间：决定国内全职、线上兼职还是海外岗位更适合你。',
    '3. 你的目标地区或授课形态：国内 / 线上远程 / 海外线下。',
    '4. 你想核对的承诺条款：零抽成、直签主体、薪资结算方式、换岗与退款规则。',
    '5. 你想索取的材料：合作协议授权清单、教材与题库出版信息、模拟面试次数与费用口径。',
    '',
    '说明：本页为演示版本，未接入真实表单与客服系统。'
  ].join('\n');

  var lastFocusBeforeModal = null;
  var openModalEl = null;

  function openModal(modalEl, trigger) {
    if (!modalEl) return;
    lastFocusBeforeModal = trigger || document.activeElement;
    openModalEl = modalEl;
    modalEl.hidden = false;
    document.body.style.overflow = 'hidden';
    var focusTarget = modalEl.querySelector('[data-autofocus]') || modalEl.querySelector('.modal__close');
    if (focusTarget) focusTarget.focus();
  }

  function closeModal(modalEl) {
    if (!modalEl || modalEl.hidden) return;
    modalEl.hidden = true;
    if (openModalEl === modalEl) openModalEl = null;
    document.body.style.overflow = '';
    if (lastFocusBeforeModal && typeof lastFocusBeforeModal.focus === 'function') {
      lastFocusBeforeModal.focus();
    }
  }

  function initModals() {
    $$('.modal').forEach(function (modalEl) {
      var dialog = modalEl.querySelector('.modal__dialog');

      $$('[data-close-modal]', modalEl).forEach(function (el) {
        el.addEventListener('click', function () { closeModal(modalEl); });
      });

      modalEl.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          e.preventDefault();
          closeModal(modalEl);
          return;
        }
        if (e.key !== 'Tab' || !dialog) return;
        var focusables = $$('a[href], button:not([disabled]), input, summary, [tabindex]:not([tabindex="-1"])', dialog)
          .filter(function (el) { return el.offsetParent !== null; });
        if (!focusables.length) return;
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      });
    });

    var copyBtn = $('#copyConsult');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        copyText(CONSULT_TEXT)
          .then(function () { toast('咨询清单已复制到剪贴板'); })
          .catch(function () { toast('当前浏览器限制了剪贴板访问，请手动选择文字复制。', 'warn'); });
      });
    }
  }

  /* =======================================================================
     6.1 在线咨询 · 演示聊天框
     固定脚本：只按 国家 → 年龄 → 国家 → 年龄…… 循环提问，不进入其他话题。
     不接后端、不写 localStorage / cookie、不上传任何用户输入。
     ======================================================================= */
  var CHAT_QUESTIONS = ['你来自哪个国家？', '你今年几岁？'];
  var chatState = { log: null, form: null, input: null, hint: null, asked: 0, current: CHAT_QUESTIONS[0] };

  function chatPush(kind, text) {
    if (!chatState.log) return;
    var row = document.createElement('div');
    row.className = 'chat__row chat__row--' + kind;
    var bubble = document.createElement('p');
    bubble.className = 'chat__bubble chat__bubble--' + kind;
    bubble.textContent = text;
    row.appendChild(bubble);
    chatState.log.appendChild(row);
    chatState.log.scrollTop = chatState.log.scrollHeight;
  }

  function chatSetHint(prefix) {
    if (!chatState.hint) return;
    chatState.hint.textContent = prefix + chatState.current;
  }

  function chatAsk(index) {
    chatState.current = CHAT_QUESTIONS[index % CHAT_QUESTIONS.length];
    chatPush('bot', chatState.current);
    chatSetHint('当前问题：');
  }

  // 每次打开聊天框都从第一个问题「你来自哪个国家？」重新开始
  function chatReset() {
    chatState.asked = 0;
    if (chatState.log) chatState.log.textContent = '';
    if (chatState.input) chatState.input.value = '';
    chatAsk(0);
  }

  function initChat() {
    chatState.log = $('#chatLog');
    chatState.form = $('#chatForm');
    chatState.input = $('#chatInput');
    chatState.hint = $('#chatHint');
    if (!chatState.form || !chatState.log) return;

    chatState.form.addEventListener('submit', function (e) {
      e.preventDefault();
      var value = (chatState.input.value || '').trim();
      if (!value) {
        // 空输入不算一次回答，仍停留在当前问题上
        chatSetHint('请先输入内容再发送 · 当前问题：');
        chatState.input.focus();
        return;
      }
      chatPush('user', value);
      chatState.input.value = '';
      chatState.asked += 1;
      // 无论用户输入什么，机器人都只推进到脚本里的下一个问题
      chatAsk(chatState.asked % CHAT_QUESTIONS.length);
      chatState.input.focus();
    });
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.top = '-1000px';
        document.body.appendChild(ta);
        ta.select();
        var ok = document.execCommand('copy');
        document.body.removeChild(ta);
        ok ? resolve() : reject(new Error('copy failed'));
      } catch (err) {
        reject(err);
      }
    });
  }

  function bindConsultTriggers(root) {
    $$('.js-consult', root || document).forEach(function (btn) {
      if (btn.dataset.consultBound === '1') return;
      btn.dataset.consultBound = '1';
      btn.addEventListener('click', function () {
        if (chatState.log === null) initChat();
        openModal($('#chatModal'), btn);
        chatReset();
      });
    });

    // 「咨询前准备清单」为二级面板：从聊天框进入时，焦点归还给打开聊天框的那个按钮
    $$('.js-checklist', root || document).forEach(function (btn) {
      if (btn.dataset.checklistBound === '1') return;
      btn.dataset.checklistBound = '1';
      btn.addEventListener('click', function () {
        var chatEl = $('#chatModal');
        var origin = btn;
        if (chatEl && !chatEl.hidden) {
          origin = lastFocusBeforeModal || btn;
          closeModal(chatEl);
        }
        openModal($('#consultModal'), origin);
      });
    });
  }

  /* =======================================================================
     7. 导航 / 滚动进度 / 滚动高亮
     ======================================================================= */
  function initNav() {
    var toggle = $('#navToggle');
    var nav = $('#siteNav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', open ? 'false' : 'true');
      nav.classList.toggle('is-open', !open);
    });

    $$('a', nav).forEach(function (a) {
      a.addEventListener('click', function () {
        toggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        toggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
        toggle.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900 && nav.classList.contains('is-open')) {
        toggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
      }
    });
  }

  function initScrollProgress() {
    var bar = $('#scrollProgress');
    if (!bar) return;
    var queued = false;

    function update() {
      queued = false;
      var doc = document.documentElement;
      var max = (doc.scrollHeight - window.innerHeight);
      var ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      bar.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';
    }

    function onScroll() {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(update);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }

  function initScrollSpy() {
    var links = $$('.site-nav__list a');
    if (!links.length || !('IntersectionObserver' in window)) return;

    var map = {};
    links.forEach(function (a) {
      var id = a.getAttribute('href').replace('#', '');
      var section = document.getElementById(id);
      if (section) map[id] = a;
    });

    var visible = {};
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        visible[entry.target.id] = entry.isIntersecting ? entry.intersectionRatio : 0;
      });
      var bestId = null;
      var bestRatio = 0;
      Object.keys(visible).forEach(function (id) {
        if (visible[id] > bestRatio) { bestRatio = visible[id]; bestId = id; }
      });
      links.forEach(function (a) { a.removeAttribute('aria-current'); });
      if (bestId && map[bestId]) map[bestId].setAttribute('aria-current', 'true');
    }, { rootMargin: '-25% 0px -60% 0px', threshold: [0, 0.15, 0.4, 0.75, 1] });

    Object.keys(map).forEach(function (id) {
      observer.observe(document.getElementById(id));
    });
  }

  /* =======================================================================
     8. 入场动效（只播一次，不依赖动画显示内容）
     ======================================================================= */
  function initReveal() {
    if (reduceMotion || !('IntersectionObserver' in window)) return;

    var singles = [
      '.band__head', '.business', '.canvas__foot', '.caliber',
      '.certs', '.team', '.cases', '.quiz', '.steps__legend',
      '.subblock', '.case-entry', '.reason', '.honors', '.consult-card'
    ];
    var groups = [
      '.metrics', '.business__list', '.coverage', '.trustrow',
      '.env-list', '.forms', '.outlook-list', '.ref-list', '.honor-grid', '.case-grid'
    ];

    var targets = [];
    singles.forEach(function (sel) {
      $$(sel).forEach(function (el) { el.classList.add('reveal'); targets.push(el); });
    });
    groups.forEach(function (sel) {
      $$(sel).forEach(function (el) { el.classList.add('reveal-group'); targets.push(el); });
    });
    if (!targets.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
        if (entry.target.classList.contains('reveal-group')) countUp(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

    targets.forEach(function (el) { observer.observe(el); });

    // 兜底：1.6s 后仍未触发的元素直接显示，避免任何情况下内容缺失
    window.setTimeout(function () {
      targets.forEach(function (el) {
        if (!el.classList.contains('is-in')) {
          el.classList.add('is-in');
          observer.unobserve(el);
        }
      });
    }, 1600);
  }

  function countUp(root) {
    if (reduceMotion) return;
    var nums = $$('.metrics__num[data-num]', root);
    nums.forEach(function (el) {
      var target = parseInt(el.getAttribute('data-num'), 10);
      var suffix = el.getAttribute('data-suffix') || '';
      if (isNaN(target)) return;

      var finalText = target + suffix;

      // 页面处于后台标签页时 rAF 不会触发，若此时开始动画，数字会永久停在 0。
      // 这类信任数字绝不能显示错误值，因此后台状态下直接落最终值。
      if (document.visibilityState === 'hidden') {
        el.textContent = finalText;
        return;
      }

      var done = false;
      function finish() {
        if (done) return;
        done = true;
        el.textContent = finalText;
      }

      var start = null;
      var duration = 700;
      function step(ts) {
        if (done) return;
        if (start === null) start = ts;
        var p = Math.min(1, (ts - start) / duration);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) window.requestAnimationFrame(step);
        else finish();
      }
      window.requestAnimationFrame(step);
      // 兜底：无论 rAF 是否被节流或中断，动画结束后都必须落到精确值
      window.setTimeout(finish, duration + 200);
    });
  }

  /* =======================================================================
     9. 启动
     ======================================================================= */
  function init() {
    buildHeroViz();
    buildMap();
    initMapViews();
    initSteps();
    initTimeline();
    initQuiz();
    initModals();
    initChat();
    initNav();
    initScrollProgress();
    initScrollSpy();
    initReveal();
    bindConsultTriggers(document);

    if (mqReduce && mqReduce.addEventListener) {
      mqReduce.addEventListener('change', function (e) {
        reduceMotion = e.matches;
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
