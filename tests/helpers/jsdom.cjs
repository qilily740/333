const jsdom=require('jsdom');
const {TextEncoder,TextDecoder}=require('node:util');

// jsdom omits these browser APIs, which the app's importers use at startup.
class JSDOM extends jsdom.JSDOM{
 constructor(html,options={}){
  const beforeParse=options.beforeParse;
  super(html,{...options,beforeParse(window){
   window.TextEncoder??=TextEncoder;
   window.TextDecoder??=TextDecoder;
   beforeParse?.(window);
  }});
 }
}
module.exports={...jsdom,JSDOM};
