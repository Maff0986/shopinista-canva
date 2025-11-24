(function () {
  'use strict';
  function makeMockCanva() {
    return {
      isCanva: false,
      intents: {
        edit_design: {
          render: function(cb) {
            console.log('[Mock Canva] edit_design.render invoked');
            setTimeout(function(){ cb({
              editor: { notify: function(m){ console.log('[Mock editor.notify]', m); } },
              design: { insertText: async function(opts){ console.log('[Mock design.insertText]', opts); } }
            }); }, 600);
          }
        }
      },
      on: function(){},
      registerAppInterface: function(obj){ console.log('[Mock registerAppInterface]', obj); }
    };
  }

  var canva = (typeof window.canva !== 'undefined' && window.canva) ? window.canva : makeMockCanva();

  function renderShell(statusText) {
    var root = document.getElementById('root') || document.getElementById('app') || document.body;
    root.innerHTML = ''
      + '<div style=\"max-width:900px;margin:28px auto;padding:20px;background:#fff;border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,0.06);font-family:system-ui,Segoe UI,Roboto,Arial\">'
      + '<h2 style=\"margin:0 0 6px\">🛋️ Shopinista Canva Integration</h2>'
      + '<div style=\"color:#6b7280;margin-bottom:12px\">Modo: <strong>'+statusText+'</strong></div>'
      + '<div style=\"display:flex;gap:8px;margin-bottom:10px\">'
      + '<input id=\"feedUrl\" placeholder=\"URL CSV/JSON feed\" style=\"flex:1;padding:10px;border-radius:8px;border:1px solid #e5e7eb\" />'
      + '<input id=\"imageUrl\" placeholder=\"URL imagen\" style=\"width:320px;padding:10px;border-radius:8px;border:1px solid #e5e7eb\" />'
      + '</div>'
      + '<div style=\"display:flex;gap:8px;margin-bottom:12px\">'
      + '<input id=\"templateId\" placeholder=\"ID plantilla Canva (opcional)\" style=\"flex:1;padding:10px;border-radius:8px;border:1px solid #e5e7eb\" />'
      + '<button id=\"generateBtn\" style=\"padding:10px 14px;border-radius:8px;background:#0b74ff;color:#fff;border:none;cursor:pointer\">Generar preview</button>'
      + '<button id=\"importBtn\" style=\"padding:10px 14px;border-radius:8px;background:#111827;color:#fff;border:none;cursor:pointer\">Importar a Canva</button>'
      + '</div>'
      + '<div id=\"status\" style=\"color:#374151\">Estado: idle</div>'
      + '<div id=\"preview\" style=\"margin-top:12px\"></div>'
      + '<small style=\"display:block;margin-top:14px;color:#9ca3af\">Desarrollado por Shopinista</small>'
      + '</div>';
  }

  function updateStatus(msg){ var s = document.getElementById('status'); if(s) s.innerText = 'Estado: '+msg; }

  function safeParseFirstJson(arrOrObj){
    if (!arrOrObj) return null;
    if (Array.isArray(arrOrObj)) return arrOrObj[0] || null;
    return arrOrObj;
  }

  async function loadFeed(feedUrl){
    if (!feedUrl) throw new Error('No feed URL');
    if (feedUrl.endsWith('.csv')) {
      var res = await fetch(feedUrl);
      var txt = await res.text();
      var lines = txt.split(/\\r?\\n/).filter(Boolean);
      var headers = lines[0].split(',');
      var first = lines[1] ? lines[1].split(',') : [];
      var obj = {};
      headers.forEach(function(h,i){ obj[h.trim()] = (first[i]||'').trim() });
      return obj;
    }
    var r = await fetch(feedUrl);
    var j = await r.json();
    return safeParseFirstJson(j);
  }

  async function registerEditDesignHandler() {
    try {
      // Preferred modern API: registerAppInterface or intents.edit_design.render
      if (canva && canva.registerAppInterface) {
        canva.registerAppInterface({
          edit_design: {
            render: async function(ctx) {
              console.log('[Canva] edit_design.render invoked', ctx);
              if (ctx && ctx.editor && typeof ctx.editor.notify === 'function') {
                ctx.editor.notify('Shopinista: importando recursos al diseño...');
              }
              try {
                if (ctx && ctx.design && typeof ctx.design.insertText === 'function') {
                  await ctx.design.insertText({ content: 'Producto Shopinista', fontSize: 22 });
                }
              } catch(e){ console.warn(e); }
              return { ok: true };
            }
          }
        });
        return true;
      }
      if (canva && canva.intents && canva.intents.edit_design && typeof canva.intents.edit_design.render === 'function') {
        canva.intents.edit_design.render(async function(ctx){ 
          console.log('[Canva legacy] edit_design.render', ctx);
          if (ctx && ctx.editor && typeof ctx.editor.notify === 'function') ctx.editor.notify('Shopinista (legacy): acción recibida');
          return { ok: true };
        });
        return true;
      }
      console.warn('No se detectó forma conocida para registrar edit_design');
      return false;
    } catch (err) {
      console.error('Error registrando edit_design:', err);
      return false;
    }
  }

  (async function main(){
    renderShell('iniciando...');
    var ok = await registerEditDesignHandler();
    renderShell(ok ? ( (canva.isCanva) ? 'Canva (sandbox)' : 'Local (mock)') : 'Modo limitado');

    document.getElementById('generateBtn').onclick = async function(){
      var feed = document.getElementById('feedUrl').value.trim();
      updateStatus('generando...');
      var preview = document.getElementById('preview'); preview.innerHTML = '';
      try {
        var p = await loadFeed(feed);
        preview.innerHTML = '<div><div><strong>Nombre:</strong> '+(p?.name||p?.title||'—')+'</div><div><strong>Precio:</strong> '+(p?.price||'—')+'</div>' + (p?.image?('<div style=\"margin-top:8px\"><img src=\"'+p.image+'\" style=\"max-width:260px;border-radius:6px\"/></div>'):'') + '</div>';
        updateStatus('feed leído (vista previa)');
      } catch(e){
        updateStatus('error -> '+(e.message||e));
      }
    };

    document.getElementById('importBtn').onclick = function(){
      if (!canva || !canva.registerAppInterface) {
        alert('Importar a Canva: abrir Preview en Canva Developer y usar el intent edit_design.render.');
        return;
      }
      updateStatus('en Canva, la importación ocurre dentro del render() del intent.');
    };
    // expose debug
    window.__shopinista = { canva: canva };
  })();

})();