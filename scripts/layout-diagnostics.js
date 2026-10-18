// Read geometry only: never include chat text, wallpaper URLs or stored user data.
(() => {
  const geometryProperties = ['position','display','box-sizing','width','height','min-height','max-height','top','bottom','left','right','margin-top','margin-bottom','padding-top','padding-bottom','overflow-x','overflow-y','transform','zoom','contain','background-color','background-size','background-position','z-index','opacity','visibility'];
  const round = value => Math.round(value * 100) / 100;
  const rect = element => {
    const r = element.getBoundingClientRect();
    return Object.fromEntries(['top','bottom','left','right','width','height'].map(key => [key, round(r[key])]));
  };
  function inspect(element, pseudo) {
    if (!element) return null;
    const style = getComputedStyle(element, pseudo);
    return {
      ...(pseudo ? {} : {rect:rect(element),clientHeight:element.clientHeight,scrollHeight:element.scrollHeight,scrollTop:element.scrollTop}),
      css:Object.fromEntries(geometryProperties.map(key => [key,style.getPropertyValue(key)])),hasBackgroundImage:style.backgroundImage !== 'none'
    };
  }
  function collect() {
    const root = document.documentElement, viewport = window.visualViewport;
    const probes = {};
    for (const height of ['100vh','100dvh','100svh','100lvh']) {
      const element = document.createElement('div');
      element.style.cssText = `position:fixed;top:0;left:0;width:0;height:${height};min-height:0;max-height:none;margin:0;padding:0;border:0;visibility:hidden;pointer-events:none;`;
      document.body.append(element);
      try { probes[height] = rect(element).height; } finally { element.remove(); }
    }
    const inset = document.createElement('div');
    inset.style.cssText = 'position:fixed;inset:0;margin:0;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);visibility:hidden;pointer-events:none;';
    document.body.append(inset);
    let safeArea, fixedInsets;
    try {
      const style = getComputedStyle(inset);
      safeArea = Object.fromEntries(['top','right','bottom','left'].map(side => [side,style.getPropertyValue(`padding-${side}`)]));
      fixedInsets = rect(inset);
    } finally { inset.remove(); }
    const rootStyle = getComputedStyle(root);
    const variables = Object.fromEntries(['--app-viewport-height','--app-viewport-top','--app-viewport-bottom','--app-wallpaper-height','--app-safe-top','--app-safe-bottom','--app-bottom-gap'].map(key => [key,rootStyle.getPropertyValue(key).trim()]));
    const elements = Object.fromEntries(['html','body','.phone','#conversation','.bottom','#settingsScreen','#featureScreen','.iris-guide-fab'].map(selector => [selector,inspect(document.querySelector(selector))]));
    const geometryOverrides = [];
    for (const id of ['iris-beautify-online','iris-beautify-offline','iris-beautify-forum']) {
      const sheet = document.getElementById(id)?.sheet;
      const visit = rules => {
        for (const rule of rules || []) {
          if (rule.cssRules) visit(rule.cssRules);
          if (!rule.selectorText || !rule.style) continue;
          const properties = Object.fromEntries(geometryProperties.filter(key => rule.style.getPropertyValue(key)).map(key => [key,rule.style.getPropertyValue(key)]));
          if (Object.keys(properties).length) geometryOverrides.push({source:id,selector:rule.selectorText,properties});
        }
      };
      try { visit(sheet?.cssRules); } catch { geometryOverrides.push({source:id,unreadable:true}); }
    }
    return {
      schema:1,codeVersion:window.IRIS_CODE_VERSION || null,
      requestedRelease:/^\d+(?:\.\d+){1,2}$/.test(window.IRIS_RELEASE || '') ? window.IRIS_RELEASE : null,
      userAgent:navigator.userAgent,standalone:matchMedia('(display-mode: standalone)').matches || navigator.standalone === true,
      standaloneFixActive:root.hasAttribute('data-ios-standalone'),
      screen:{width:screen.width,height:screen.height,availWidth:screen.availWidth,availHeight:screen.availHeight,dpr:window.devicePixelRatio},
      window:{width:innerWidth,height:innerHeight,scrollX,scrollY},
      visualViewport:viewport ? Object.fromEntries(['width','height','offsetLeft','offsetTop','scale'].map(key => [key,viewport[key]])) : null,
      viewportMeta:document.querySelector('meta[name="viewport"]')?.content,
      probes,fixedInsets,safeArea,variables,elements,wallpaperLayer:inspect(document.querySelector('.phone'),'::before'),geometryOverrides
    };
  }
  window.IrisLayoutDiagnostics = {collect};
})();
