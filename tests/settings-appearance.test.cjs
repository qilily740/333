const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(require.resolve('../scripts/app.js'),'utf8');
function fixture(appearance,mode=false){
 const classes=new Set(),attributes={},button={dataset:{settingsAppearance:'classic'},setAttribute(name,value){attributes[name]=value}},screen={hidden:true,classList:{toggle(name,on){on?classes.add(name):classes.delete(name)}}};
 let saves=0;
 const state={settings:{settingsAppearance:appearance,functionButtonLayout:'horizontal',functionButtonLanguage:'en'}};
 const context=vm.createContext({state,modeSettings:mode,$:()=>screen,document:{querySelectorAll:()=>[button]},save(){saves++},refreshSettings(){throw Error('Hidden settings should not be rendered')}});
 vm.runInContext(source.slice(source.indexOf('function applySettingsAppearance(){'),source.indexOf('function applyFunctionButtonLayout(){')),context);
 return{context,state,classes,attributes,button,saves:()=>saves};
}
test('appearance toggle persists independently of menu language and layout, and switches back to classic',()=>{
 const f=fixture();f.context.applySettingsAppearance();assert.equal(f.attributes['aria-pressed'],'true');
 f.context.setSettingsAppearance('apple');assert.equal(f.state.settings.settingsAppearance,'apple');assert.ok(f.classes.has('apple-settings'));assert.equal(f.attributes['aria-pressed'],'false');
 assert.equal(f.state.settings.functionButtonLayout,'horizontal');assert.equal(f.state.settings.functionButtonLanguage,'en');assert.equal(f.saves(),1);
 f.context.setSettingsAppearance('classic');assert.equal(f.state.settings.settingsAppearance,'classic');assert.equal(f.classes.has('apple-settings'),false);assert.equal(f.saves(),2);
});
test('saved Ningguang style follows global and role settings; unknown preferences fall back to classic',()=>{
 const role=fixture('apple',true);role.context.applySettingsAppearance();assert.equal(role.classes.has('apple-settings'),true);assert.equal(role.classes.has('apple-role-settings'),true);assert.equal(role.attributes['aria-pressed'],'false');
 const reopened=fixture('apple');reopened.context.applySettingsAppearance();assert.ok(reopened.classes.has('apple-settings'));
 const invalid=fixture('unknown');invalid.context.applySettingsAppearance();assert.equal(invalid.attributes['aria-pressed'],'true');assert.equal(invalid.classes.has('apple-settings'),false);
});
