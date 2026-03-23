// Fetches and displays the HD profile picture for an Instagram user
(async function() {

  var existing = document.getElementById('_osint_win');
  if (existing) existing.remove();

  var pathParts = window.location.pathname.split('/').filter(Boolean);
  var username = null;
  if (window.location.hostname.indexOf('instagram.com') !== -1 && pathParts.length > 0 &&
      pathParts[0] !== 'p' && pathParts[0] !== 'reel' &&
      pathParts[0] !== 'stories' && pathParts[0] !== 'explore') {
    username = pathParts[0];
  }

  var uid = null;
  var src = document.documentElement.innerHTML;
  var m = src.match(/"profilePage_(\d+)"/) || src.match(/"user_id":"(\d+)"/) || src.match(/"pk":"(\d+)"/);
  if (m) uid = m[1];

  var win = document.createElement('div');
  win.id = '_osint_win';
  win.style.cssText = [
    'position:fixed','top:48px','right:48px','width:420px','max-height:80vh',
    'background:#0a0a0a','border:1px solid #222','color:#eee',
    'font-family:"SF Mono","Cascadia Mono","Fira Mono",Consolas,monospace',
    'font-size:12px','z-index:2147483647','display:flex','flex-direction:column',
    'box-shadow:0 0 0 1px #000'
  ].join(';');

  var bar = document.createElement('div');
  bar.style.cssText = [
    'display:flex','align-items:center','justify-content:space-between',
    'padding:8px 12px','background:#000','border-bottom:1px solid #222',
    'cursor:grab','user-select:none','-webkit-user-select:none'
  ].join(';');

  var titleEl = document.createElement('span');
  titleEl.textContent = 'HD PROFILE PIC';
  titleEl.style.cssText = 'font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#777';

  var closeBtn = document.createElement('button');
  closeBtn.textContent = '\u00d7';
  closeBtn.style.cssText = 'background:none;border:none;color:#777;font-size:18px;cursor:pointer;padding:0;line-height:1;font-family:inherit';
  closeBtn.onmouseover = function() { closeBtn.style.color = '#fff'; };
  closeBtn.onmouseout = function() { closeBtn.style.color = '#777'; };
  closeBtn.onclick = function() { win.remove(); };
  bar.appendChild(titleEl);
  bar.appendChild(closeBtn);

  var body = document.createElement('div');
  body.style.cssText = 'overflow-y:auto;padding:12px';

  var actions = document.createElement('div');
  actions.style.cssText = 'display:flex;gap:8px;padding:12px;border-top:1px solid #222';

  win.appendChild(bar);
  win.appendChild(body);
  win.appendChild(actions);

  var dx=0,dy=0,sx=0,sy=0;
  bar.onmousedown = function(e) {
    e.preventDefault(); sx=e.clientX; sy=e.clientY; bar.style.cursor='grabbing';
    document.onmousemove = function(e) {
      dx=sx-e.clientX; dy=sy-e.clientY; sx=e.clientX; sy=e.clientY;
      win.style.top=(win.offsetTop-dy)+'px'; win.style.left=(win.offsetLeft-dx)+'px'; win.style.right='auto';
    };
    document.onmouseup = function() { document.onmousemove=null; document.onmouseup=null; bar.style.cursor='grab'; };
  };
  document.body.appendChild(win);

  function addRow(label, value) {
    var row = document.createElement('div');
    row.style.cssText = 'padding:6px 0;border-bottom:1px solid #222;display:flex;gap:8px';
    var lbl = document.createElement('span');
    lbl.textContent = label;
    lbl.style.cssText = 'color:#777;min-width:60px;flex-shrink:0';
    var val = document.createElement('span');
    val.textContent = value;
    val.style.cssText = 'color:#fff;font-weight:700;word-break:break-all';
    row.appendChild(lbl);
    row.appendChild(val);
    body.appendChild(row);
    return val;
  }

  if (!username) {
    addRow('Error', 'Navigate to an Instagram profile first.');
    return;
  }

  addRow('User', '@' + username);
  if (uid) addRow('ID', uid);

  var statusRow = document.createElement('div');
  statusRow.style.cssText = 'padding:8px 0;color:#777;font-size:11px';
  statusRow.textContent = 'Fetching HD profile picture...';
  body.appendChild(statusRow);

  var hdUrl = null;
  var scripts = document.querySelectorAll('script[type="application/json"]');
  for (var i = 0; i < scripts.length; i++) {
    try {
      var text = scripts[i].textContent;
      if (text.indexOf('hd_profile_pic_url_info') === -1) continue;
      var match = text.match(/"hd_profile_pic_url_info":\{"url":"([^"]+)"/);
      if (match) {
        hdUrl = match[1].replace(/\\u0026/g, '&').replace(/\\\//g, '/');
        statusRow.textContent = 'Found in page data (no API call needed)';
        break;
      }
    } catch(e) {}
  }

  if (!hdUrl && uid) {
    try {
      statusRow.textContent = 'Calling GraphQL API...';
      var csrf = document.cookie.match(/csrftoken=([^;]+)/);
      if (!csrf) { statusRow.textContent = 'Error: no CSRF token found'; return; }
      var res = await fetch('/graphql/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-IG-App-ID': '1217981644879628',
          'X-CSRFToken': csrf[1]
        },
        body: 'fb_api_caller_class=RelayModern&fb_api_req_friendly_name=PolarisProfilePageContentQuery&variables=' +
          encodeURIComponent(JSON.stringify({
            enable_integrity_filters: true,
            id: uid,
            render_surface: "PROFILE",
            __relay_internal__pv__PolarisCannesGuardianExperienceEnabledrelayprovider: true,
            __relay_internal__pv__PolarisCASB976ProfileEnabledrelayprovider: false,
            __relay_internal__pv__PolarisWebSchoolsEnabledrelayprovider: false,
            __relay_internal__pv__PolarisRepostsConsumptionEnabledrelayprovider: false
          })) + '&doc_id=34272012165747896'
      });
      var d = await res.json();
      if (d.data && d.data.user && d.data.user.hd_profile_pic_url_info) {
        hdUrl = d.data.user.hd_profile_pic_url_info.url;
        if (!uid) uid = d.data.user.id;
        statusRow.textContent = 'Fetched via GraphQL API';
        if (d.data.user.full_name) addRow('Name', d.data.user.full_name);
      } else {
        statusRow.textContent = 'Error: ' + JSON.stringify(d).substring(0, 200);
      }
    } catch(e) {
      statusRow.textContent = 'Error: ' + e.message;
    }
  }

  if (!hdUrl) {
    statusRow.textContent = statusRow.textContent || 'Could not find HD profile picture.';
    return;
  }

  var preview = document.createElement('div');
  preview.style.cssText = 'padding:12px 0;text-align:center';
  var img = document.createElement('img');
  img.src = hdUrl;
  img.style.cssText = 'max-width:100%;border-radius:50%;border:2px solid #222';
  img.onerror = function() { img.style.borderRadius = '0'; img.alt = 'Failed to load'; };
  preview.appendChild(img);
  body.appendChild(preview);

  var urlRow = document.createElement('div');
  urlRow.style.cssText = 'padding:8px 0;word-break:break-all;color:#555;font-size:10px;line-height:1.4';
  urlRow.textContent = hdUrl;
  body.appendChild(urlRow);

  var openBtn = document.createElement('button');
  openBtn.textContent = 'Open Full Size';
  openBtn.style.cssText = 'flex:1;background:#fff;color:#000;border:none;padding:6px 0;font-family:inherit;font-size:11px;font-weight:700;cursor:pointer';
  openBtn.onmouseover = function() { openBtn.style.opacity = '0.7'; };
  openBtn.onmouseout = function() { openBtn.style.opacity = '1'; };
  openBtn.onclick = function() { window.open(hdUrl, '_blank'); };
  actions.appendChild(openBtn);

  var copyBtn = document.createElement('button');
  copyBtn.textContent = 'Copy URL';
  copyBtn.style.cssText = 'flex:1;background:none;color:#fff;border:1px solid #333;padding:6px 0;font-family:inherit;font-size:11px;font-weight:700;cursor:pointer';
  copyBtn.onmouseover = function() { copyBtn.style.borderColor = '#555'; };
  copyBtn.onmouseout = function() { copyBtn.style.borderColor = '#333'; };
  copyBtn.onclick = function() {
    navigator.clipboard.writeText(hdUrl).then(function() {
      copyBtn.textContent = 'Copied!';
      setTimeout(function() { copyBtn.textContent = 'Copy URL'; }, 1500);
    });
  };
  actions.appendChild(copyBtn);

  var dlBtn = document.createElement('button');
  dlBtn.textContent = 'Download';
  dlBtn.style.cssText = 'flex:1;background:none;color:#fff;border:1px solid #333;padding:6px 0;font-family:inherit;font-size:11px;font-weight:700;cursor:pointer';
  dlBtn.onmouseover = function() { dlBtn.style.borderColor = '#555'; };
  dlBtn.onmouseout = function() { dlBtn.style.borderColor = '#333'; };
  dlBtn.onclick = function() {
    var a = document.createElement('a');
    a.href = hdUrl;
    a.download = (username || 'profile') + '_hd.jpg';
    a.click();
  };
  actions.appendChild(dlBtn);

})();
