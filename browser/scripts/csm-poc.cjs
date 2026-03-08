/**
 * POC: Netflix Viewing History × Common Sense Media Ratings
 *
 * 1. Navigate to Netflix viewing activity, scrape recent titles
 * 2. For each title, search commonsensemedia.org/search/{title}
 * 3. Navigate to the first matching review page
 * 4. Extract age rating, content descriptors, and parent summary from JSON-LD + DOM
 * 5. Print a comparison table
 */
const WebSocket = require('ws');
const fs = require('fs');

const MAX_TITLES = 10;

async function connectTab() {
  const targets = await fetch('http://127.0.0.1:9222/json').then(r => r.json());
  let target = targets.find(t => t.url.includes('netflix.com') || t.url.includes('commonsensemedia'));
  if (!target) target = targets.find(t => t.url.includes('phosra://'));
  if (!target) target = targets.find(t => t.type === 'page' && !t.url.includes('renderer'));
  if (!target) throw new Error('No usable tab');

  return new Promise((resolve, reject) => {
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    let id = 1;

    function send(method, params) {
      return new Promise((res, rej) => {
        const msgId = id++;
        const timeout = setTimeout(() => rej(new Error(`Timeout: ${method}`)), 30000);
        function handler(data) {
          const msg = JSON.parse(data.toString());
          if (msg.id === msgId) {
            clearTimeout(timeout);
            ws.off('message', handler);
            if (msg.error) rej(new Error(msg.error.message));
            else res(msg.result);
          }
        }
        ws.on('message', handler);
        ws.send(JSON.stringify({ id: msgId, method, params: params || {} }));
      });
    }

    function evaluate(expr) {
      return send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    }
    function navigate(url) { return send('Page.navigate', { url }); }
    function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

    ws.on('open', () => resolve({ ws, send, evaluate, navigate, sleep }));
    ws.on('error', reject);
  });
}

async function scrapeViewingHistory(ctx) {
  const { evaluate, navigate, sleep } = ctx;

  console.log('Navigating to Netflix viewing activity...');
  await navigate('https://www.netflix.com/viewingactivity');
  await sleep(4000);

  const result = await evaluate(`(function(){
    var rows = document.querySelectorAll('.retableRow, .viewing-activity-row, li.retableRow');
    var titles = [];
    var seen = new Set();
    rows.forEach(function(row) {
      var titleEl = row.querySelector('.col.title a, .title a');
      var dateEl = row.querySelector('.col.date, .date');
      if (titleEl) {
        var rawTitle = (titleEl.textContent || '').trim();
        var showName = rawTitle.split(':')[0].trim();
        if (showName && !seen.has(showName)) {
          seen.add(showName);
          titles.push({ fullTitle: rawTitle, showName: showName, date: dateEl ? dateEl.textContent.trim() : '' });
        }
      }
    });
    return JSON.stringify(titles);
  })()`);

  return JSON.parse(result.result.value);
}

async function searchCSM(ctx, title) {
  const { evaluate, navigate, sleep } = ctx;

  // CSM search: /search/{keyword} (not query param)
  const searchUrl = 'https://www.commonsensemedia.org/search/' + encodeURIComponent(title);
  await navigate(searchUrl);
  await sleep(3500);

  const result = await evaluate(`(function(){
    // Find review links (CSM uses /tv-reviews/, /movie-reviews/, etc.)
    var links = [];
    document.querySelectorAll('a[href]').forEach(function(a) {
      var href = a.getAttribute('href') || '';
      if (href.match(/^\\/(tv|movie|app|game|book|website|youtube|podcast)-reviews\\/[a-z0-9-]+/) &&
          !links.some(function(l) { return l.href === href; })) {
        var text = (a.textContent || '').trim();
        if (text && text !== 'See full review' && text.length > 1) {
          links.push({ href: href, text: text.substring(0, 80) });
        }
      }
    });
    return JSON.stringify(links.slice(0, 5));
  })()`);

  return JSON.parse(result.result.value);
}

async function scrapeCSMReview(ctx, path) {
  const { evaluate, navigate, sleep } = ctx;

  const url = 'https://www.commonsensemedia.org' + path;
  await navigate(url);
  await sleep(3000);

  const result = await evaluate(`(function(){
    var r = { url: location.href };

    // 1. JSON-LD structured data (best source)
    var ldScripts = document.querySelectorAll('script[type="application/ld+json"]');
    ldScripts.forEach(function(s) {
      try {
        var data = JSON.parse(s.textContent);
        var graph = data['@graph'] || [data];
        graph.forEach(function(item) {
          if (item['@type'] === 'Review') {
            r.csmTitle = item.name || '';
            r.ageRange = item.typicalAgeRange || '';
            r.isFamilyFriendly = item.isFamilyFriendly || '';
            r.qualityRating = item.reviewRating ? item.reviewRating.ratingValue : '';
            r.reviewSummary = (item.description || '').substring(0, 200);
            r.reviewBody = (item.reviewBody || '').substring(0, 500);
            r.mediaType = item.itemReviewed ? item.itemReviewed['@type'] : '';
            r.datePublished = item.datePublished || '';
          }
        });
      } catch(e) {}
    });

    // 2. DOM fallbacks
    // Age from rating badge
    var ageBadge = document.querySelector('.rating__age');
    if (ageBadge) r.ageBadge = ageBadge.textContent.trim();

    // "Parents Need to Know" section
    var headings = document.querySelectorAll('h2, h3, h4');
    for (var i = 0; i < headings.length; i++) {
      if ((headings[i].textContent || '').toLowerCase().includes('parents need to know')) {
        var next = headings[i].nextElementSibling;
        if (next) r.parentSummary = next.textContent.trim().substring(0, 300);
        break;
      }
    }

    // Content descriptors
    r.descriptors = [];
    document.querySelectorAll('.rating__label').forEach(function(label) {
      var parent = label.closest('[class*="rating"]') || label.parentElement;
      var score = parent ? parent.querySelector('.rating__score, .rating__teaser-short') : null;
      r.descriptors.push({
        category: label.textContent.trim(),
        level: score ? score.textContent.trim() : ''
      });
    });

    return JSON.stringify(r);
  })()`);

  return JSON.parse(result.result.value);
}

function fuzzyMatch(netflixTitle, csmTitle) {
  const a = netflixTitle.toLowerCase().replace(/[^a-z0-9]/g, '');
  const b = csmTitle.toLowerCase().replace(/[^a-z0-9]/g, '');
  return a.includes(b) || b.includes(a) || a === b;
}

async function run() {
  const ctx = await connectTab();

  try {
    // Step 1: Get Netflix viewing history
    const titles = await scrapeViewingHistory(ctx);
    console.log(`Found ${titles.length} unique shows/movies in viewing history`);

    const toCheck = titles.slice(0, MAX_TITLES);
    console.log(`Checking first ${toCheck.length} against Common Sense Media...\n`);

    const results = [];

    for (let i = 0; i < toCheck.length; i++) {
      const title = toCheck[i];
      console.log(`[${i + 1}/${toCheck.length}] "${title.showName}"...`);

      try {
        // Search CSM
        const searchResults = await searchCSM(ctx, title.showName);

        if (searchResults.length === 0) {
          console.log(`   Not found on CSM`);
          results.push({ netflixTitle: title.showName, fullTitle: title.fullTitle, watchedDate: title.date, found: false });
          continue;
        }

        // Pick best match (fuzzy match on title)
        let best = searchResults[0];
        for (const sr of searchResults) {
          if (fuzzyMatch(title.showName, sr.text)) {
            best = sr;
            break;
          }
        }

        console.log(`   Found: ${best.text} (${best.href})`);

        // Scrape the review page
        const review = await scrapeCSMReview(ctx, best.href);

        const age = review.ageRange || review.ageBadge || 'N/A';
        console.log(`   CSM: age ${age} | Quality: ${review.qualityRating || '?'}/5 | ${review.mediaType || ''}`);

        results.push({
          netflixTitle: title.showName,
          fullTitle: title.fullTitle,
          watchedDate: title.date,
          found: true,
          csmTitle: review.csmTitle || best.text,
          csmUrl: review.url,
          csmAge: age,
          csmQuality: review.qualityRating || '',
          csmMediaType: review.mediaType || '',
          csmFamilyFriendly: review.isFamilyFriendly || '',
          csmReviewSummary: review.reviewSummary || '',
          csmParentSummary: review.parentSummary || '',
          csmDescriptors: review.descriptors || [],
          csmReviewBody: review.reviewBody || '',
        });

      } catch (err) {
        console.log(`   Error: ${err.message}`);
        results.push({ netflixTitle: title.showName, fullTitle: title.fullTitle, watchedDate: title.date, found: false, error: err.message });
      }
    }

    // Print results
    console.log('\n' + '='.repeat(90));
    console.log('  NETFLIX VIEWING HISTORY x COMMON SENSE MEDIA RATINGS');
    console.log('='.repeat(90));

    for (const r of results) {
      console.log(`\n  ${r.netflixTitle}` + (r.watchedDate ? `  (watched ${r.watchedDate})` : ''));
      if (!r.found) {
        console.log(`    CSM: Not found`);
        continue;
      }
      console.log(`    CSM Age: ${r.csmAge}  |  Quality: ${r.csmQuality}/5  |  Type: ${r.csmMediaType}  |  Family Friendly: ${r.csmFamilyFriendly}`);
      if (r.csmParentSummary) {
        console.log(`    Parents: ${r.csmParentSummary.substring(0, 120)}...`);
      }
      if (r.csmDescriptors && r.csmDescriptors.length > 0) {
        const desc = r.csmDescriptors
          .filter(d => d.level && d.level !== 'Not present')
          .map(d => `${d.category}: ${d.level}`)
          .join('  |  ');
        if (desc) console.log(`    Content: ${desc}`);
      }
    }

    console.log('\n' + '='.repeat(90));
    const matched = results.filter(r => r.found);
    console.log(`\nMatched: ${matched.length}/${results.length} titles`);

    // Save full results
    fs.writeFileSync('scripts/csm-poc-results.json', JSON.stringify(results, null, 2));
    console.log('Full results: scripts/csm-poc-results.json');

  } catch (err) {
    console.error('Fatal:', err.message);
  } finally {
    ctx.ws.close();
  }
}

run();
