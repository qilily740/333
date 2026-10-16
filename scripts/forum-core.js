(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.IrisForumCore=api})(typeof globalThis==='object'?globalThis:null,function(){
 const id=(prefix='id')=>`${prefix}-${typeof globalThis.crypto?.randomUUID==='function'?globalThis.crypto.randomUUID():`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`}`;
 const clean=(value,max=500)=>String(value??'').trim().slice(0,max);
 const ensure=(state,characters=[])=>{
  if(!Array.isArray(state.users))state.users=[];
  state.users.forEach(user=>{if(user&&!user.forumPersonaId)user.forumPersonaId=id('persona')});
  characters.forEach(character=>{if(character&&!character.forumCharacterId)character.forumCharacterId=id('character')});
  const data=state.forums&&typeof state.forums==='object'?state.forums:{};
  data.version=1;data.worlds=Array.isArray(data.worlds)?data.worlds:[];for(const world of data.worlds){world.id||=id('world');world.members=Array.isArray(world.members)?world.members:[];world.profiles=world.profiles&&typeof world.profiles==='object'?world.profiles:{};world.npcs=Array.isArray(world.npcs)?world.npcs:[];for(const npc of world.npcs)if(npc?.name==='阿团不加冰'&&npc.bio==='喜欢城市散步和甜饮，习惯分享路边小店，语气轻松，偶尔发一张随手拍。')npc.bio='爱散步和甜饮，常分享街边小店与随手拍。';world.collections=Array.isArray(world.collections)?world.collections:[];world.posts=Array.isArray(world.posts)?world.posts:[];world.comments=Array.isArray(world.comments)?world.comments:[];world.notifications=Array.isArray(world.notifications)?world.notifications:[];world.events=Array.isArray(world.events)?world.events:[];world.follows=world.follows&&typeof world.follows==='object'?world.follows:{};world.bookmarks=world.bookmarks&&typeof world.bookmarks==='object'?world.bookmarks:{}}
  data.activeWorldId=data.worlds.some(world=>world.id===data.activeWorldId)?data.activeWorldId:(data.worlds[0]?.id||'');
  state.forums=data;return data;
 };
 const actorForPersona=persona=>persona?.forumPersonaId?`persona:${persona.forumPersonaId}`:'';
 const actorForCharacter=(character,persona)=>character?.forumCharacterId&&persona?.forumPersonaId?`character:${character.forumCharacterId}:${persona.forumPersonaId}`:'';
 const worldById=(data,idValue)=>data?.worlds?.find(world=>world.id===idValue)||null;
 const activeWorld=data=>worldById(data,data?.activeWorldId);
 const deleteWorld=(data,idValue)=>{const world=worldById(data,idValue);if(!world||world.isDefault)return false;data.worlds=data.worlds.filter(item=>item!==world);if(data.activeWorldId===idValue)data.activeWorldId=data.worlds.find(item=>item.isDefault)?.id||data.worlds[0]?.id||'';return true};
 const defaultNpcs=()=>[
  ['阿团不加冰','爱散步和甜饮，常分享街边小店与随手拍。'],
  ['夜航纸片','爱看书和做摘抄，表达克制，常在深夜讨论电影、音乐与故事。'],
  ['今天也迟到','关注通勤、工作和生活琐事，幽默直接，擅长用一句话吐槽。'],
  ['青柠研究所','热衷料理和生活实验，会认真记录过程，也乐于回复别人的求助。'],
  ['猫在开会','爱猫、爱摄影，讲话慢热温和，偶尔一本正经地讲冷笑话。'],
  ['周末缓冲中','关注展览、散步和城市活动，喜欢邀请网友交流但不会过度热情。']
 ].map(([name,bio])=>({id:id('npc'),forumProfileId:id('profile'),name,nickname:name,avatar:'',bio,personality:bio,interests:bio,language:bio,createdAt:Date.now(),postCount:0,active:true}));
 const createWorld=(data,{name,description='',background='',persona=null}={})=>{
  const title=clean(name,50);if(!title)throw Error('请填写论坛世界名称');
  const world={id:id('world'),name:title,description:clean(description,300),background:clean(background,240),createdAt:Date.now(),updatedAt:Date.now(),members:[],profiles:{},npcs:defaultNpcs(),collections:[],posts:[],comments:[],notifications:[],events:[],follows:{},bookmarks:{},settings:{},lastAiUpdateAt:0};
  data.worlds.push(world);data.activeWorldId=world.id;
  if(persona)addPersona(world,persona);
  return world;
 };
 const ensureDefaultWorld=(data,persona=null)=>{
  let world=data.worlds.find(item=>item.isDefault||item.id==='default-forum');
  let created=false;
  if(!world){world={id:data.worlds.some(item=>item.id==='default-forum')?id('default-forum'):'default-forum',name:'默认论坛',description:'不同面具可以在这里共享公开的帖子与讨论。',background:'',createdAt:Date.now(),updatedAt:Date.now(),isDefault:true,members:[],profiles:{},npcs:defaultNpcs(),collections:[],posts:[],comments:[],notifications:[],events:[],follows:{},bookmarks:{},settings:{},lastAiUpdateAt:0};data.worlds.unshift(world);created=true}
  for(const item of data.worlds)item.isDefault=item===world;
  if(!world.name)world.name='默认论坛';
  let personaAdded=false;
  if(persona&&actorForPersona(persona)&&!world.members.some(item=>item.actorId===actorForPersona(persona))){addPersona(world,persona);personaAdded=true}
  if(!worldById(data,data.activeWorldId))data.activeWorldId=world.id;
  return{world,created,personaAdded};
 };
 const resetWorld=(data,idValue)=>{
  const world=worldById(data,idValue);if(!world||!world.isDefault)return false;
  world.posts=[];world.comments=[];world.notifications=[];world.events=[];world.collections=[];world.follows={};world.bookmarks={};
  for(const npc of world.npcs||[])npc.postCount=0;
  world.lastAiUpdateAt=0;world.lastAiAttemptAt=0;world.updatedAt=Date.now();
  return true;
 };
 const ensureProfile=(world,actorId,source,kind)=>{
  world.profiles||={};let profile=world.profiles[actorId];
  if(!profile){profile={id:id('profile'),actorId,kind,nickname:clean(source.nickname||source.name,60)||'未命名',avatar:String(source.avatar||''),bio:clean(source.forumBio,280),createdAt:Date.now()};world.profiles[actorId]=profile}
  return profile;
 };
 const addPersona=(world,persona)=>{
  const actorId=actorForPersona(persona);if(!actorId)throw Error('用户面具缺少稳定身份 ID');
  if(world.members.some(member=>member.actorId===actorId))return world.members.find(member=>member.actorId===actorId);
  const profile=ensureProfile(world,actorId,persona,'persona'),member={actorId,kind:'persona',sourcePersonaId:persona.forumPersonaId,forumProfileId:profile.id,participationMode:'manual',permissions:{allowStoryContext:false},createdAt:Date.now()};world.members.push(member);return member;
 };
 const addCharacter=(world,character,persona,sourceChatId='')=>{
  const actorId=actorForCharacter(character,persona);if(!actorId)throw Error('角色或来源面具缺少稳定身份 ID');
  if(world.members.some(member=>member.actorId===actorId))return world.members.find(member=>member.actorId===actorId);
  const profile=ensureProfile(world,actorId,character,'character'),member={actorId,kind:'character',characterInstanceId:character.forumCharacterId,sourcePersonaId:persona.forumPersonaId,sourceChatId:clean(sourceChatId,180),forumProfileId:profile.id,participationMode:'manual',permissions:{allowPosts:true,allowComments:true,allowReplyCharacters:true,allowReplyNpcs:true,allowReplyPersonas:true,allowStoryContext:false,allowChatContext:false,frequency:'daily'},authorizedStorySummary:'',createdAt:Date.now(),lastActivityAt:0};world.members.push(member);return member;
 };
 const canRolePost=member=>member?.kind==='character'&&member.participationMode!=='off'&&member.permissions?.allowPosts!==false;
 const canRoleReply=(member,targetActorId)=>{
  if(member?.kind!=='character'||member.participationMode==='off'||member.permissions?.allowComments===false||!targetActorId||member.actorId===targetActorId)return false;
  const setting=targetActorId.startsWith('character:')?'allowReplyCharacters':targetActorId.startsWith('npc:')?'allowReplyNpcs':'allowReplyPersonas';return member.permissions?.[setting]!==false;
 };
 const removeMember=(world,actorId)=>{
  const member=world.members.find(item=>item.actorId===actorId);if(!member)return false;
  world.members=world.members.filter(item=>item!==member);world.follows||={};world.bookmarks||={};delete world.follows[actorId];delete world.bookmarks[actorId];
  return true;
 };
 const actorProfile=(world,actorId)=>world?.profiles?.[actorId]||world?.npcs?.find(npc=>npc.id===actorId.replace(/^npc:/,''))||null;
 const authorView=(world,post)=>post?.anonymous?{actorId:'anonymous',kind:'anonymous',name:'匿名网友',nickname:'匿名网友',avatar:'',bio:''}:(actorProfile(world,post?.authorId)||{actorId:post?.authorId,kind:post?.authorKind||'unknown',name:post?.authorName||'已离开论坛',nickname:post?.authorName||'已离开论坛',avatar:''});
 const collectionById=(world,collectionId)=>world?.collections?.find(item=>item.id===collectionId)||null;
 const collectionsForActor=(world,actorId)=>world?.collections?.filter(item=>item.createdBy===actorId)||[];
 const ownedCollectionById=(world,collectionId,actorId)=>world?.collections?.find(item=>item.id===collectionId&&item.createdBy===actorId)||null;
 const createCollection=(world,{name,description='',actorId=''}={})=>{
  if(!world)throw Error('论坛世界不存在');world.collections=Array.isArray(world.collections)?world.collections:[];const owner=clean(actorId,180);if(!owner)throw Error('合集所属身份无效');const title=clean(name,60);if(!title)throw Error('请填写合集名称');if(world.collections.some(item=>item.createdBy===owner&&String(item.name||'').toLowerCase()===title.toLowerCase()))throw Error('你的合集里已有同名合集');const collection={id:id('collection'),worldId:world.id,name:title,description:clean(description,240),createdBy:owner,createdAt:Date.now()};world.collections.push(collection);world.updatedAt=collection.createdAt;return collection;
 };
 const createPost=(world,{actorId,kind='persona',authorName='',content,type='text',anonymous=false,attachments=[],topics=[],poll=null,collectionId='',marketShare=null}={})=>{
  if(!actorId)throw Error('帖子作者身份无效');const body=clean(content,5000);if(!body&&!attachments.length&&type!=='poll')throw Error('帖子内容不能为空');
  if(!['text','image','poll','update'].includes(type))throw Error('不支持的帖子类型');
  const shared=marketShare&&['product','purchase','gift'].includes(marketShare.kind)&&clean(marketShare.name,100)?{kind:marketShare.kind,productId:clean(marketShare.productId,120),name:clean(marketShare.name,100),category:clean(marketShare.category,40),shopName:clean(marketShare.shopName,60),sender:clean(marketShare.sender,60)}:null;
  const post={id:id('post'),worldId:world.id,authorId:actorId,authorKind:kind,authorName:clean(authorName,60)||'未命名',displayAuthor:anonymous?'匿名网友':clean(authorName,60)||'未命名',anonymous:Boolean(anonymous),createdAt:Date.now(),updatedAt:0,type,content:body,attachments:Array.isArray(attachments)?attachments.slice(0,4):[],topics:Array.isArray(topics)?topics.map(topic=>clean(topic.replace(/^#/,'').replace(/\s+/g,''),30)).filter(Boolean).slice(0,8):[],collectionId:ownedCollectionById(world,collectionId,actorId)?.id||'',marketShare:shared,commentsCount:0,likes:[],views:0,edited:false,deleted:false,poll:poll&&type==='poll'?{options:poll.options.map(text=>clean(text,100)).filter(Boolean).slice(0,6),votes:{},endsAt:Number(poll.endsAt)||0}:null};
  if(type==='poll'&&(!post.poll||post.poll.options.length<2))throw Error('投票至少需要两个选项');
  world.posts.unshift(post);world.updatedAt=post.createdAt;if(kind==='npc'){const npc=world.npcs.find(item=>`npc:${item.id}`===actorId);if(npc)npc.postCount=(npc.postCount||0)+1}
  return post;
 };
 const addComment=(world,{postId,actorId,kind='persona',authorName='',content,parentId='',replyToActorId=''}={})=>{
  const post=world.posts.find(item=>item.id===postId&&!item.deleted);if(!post)throw Error('帖子已不存在');
  if(!actorId)throw Error('评论作者身份无效');const body=clean(content,1600);if(!body)throw Error('评论内容不能为空');
  if(parentId){let parent=world.comments.find(item=>item.id===parentId&&item.postId===postId),depth=0;if(!parent)throw Error('回复对象已不存在');while(parent&&parent.parentId&&depth<=8){depth++;parent=world.comments.find(item=>item.id===parent.parentId&&item.postId===postId)}if(depth>=8)throw Error('回复层级已达到上限')}
  const comment={id:id('comment'),worldId:world.id,postId,actorId,authorKind:kind,authorName:clean(authorName,60)||'未命名',content:body,parentId:clean(parentId,100),replyToActorId:clean(replyToActorId,160),createdAt:Date.now(),likes:[],deleted:false};
  world.comments.push(comment);post.commentsCount=(Number(post.commentsCount)||0)+1;world.updatedAt=comment.createdAt;return comment;
 };
 const toggleId=(list,value)=>{const next=Array.isArray(list)?list.slice():[],index=next.indexOf(value);if(index>=0)next.splice(index,1);else next.push(value);return next};
 const toggleLike=(entity,actorId)=>{entity.likes=toggleId(entity.likes,actorId);return entity.likes.includes(actorId)};
 const toggleFollow=(world,actorId,targetId)=>{world.follows||={};world.follows[actorId]=toggleId(world.follows[actorId],targetId);return world.follows[actorId].includes(targetId)};
 const toggleBookmark=(world,actorId,postId)=>{world.bookmarks||={};world.bookmarks[actorId]=toggleId(world.bookmarks[actorId],postId);return world.bookmarks[actorId].includes(postId)};
 const notify=(world,recipientActorId,event)=>{if(!recipientActorId||recipientActorId===event.actorId)return null;const item={id:id('notice'),worldId:world.id,recipientActorId,actorId:event.actorId||'',kind:clean(event.kind,30),postId:event.postId||'',commentId:event.commentId||'',text:clean(event.text,180),createdAt:Date.now(),readAt:0};world.notifications.unshift(item);if(world.notifications.length>2000)world.notifications.length=2000;return item};
 const markRead=(world,actorId)=>{for(const item of world.notifications||[])if(item.recipientActorId===actorId&&!item.readAt)item.readAt=Date.now()};
 const chatContext=(state,character,persona,limit=6)=>{
  if(!Array.isArray(state?.forums?.worlds)||!state.forums.worlds.length)return'';
  const data=ensure(state,[character]),actorId=actorForCharacter(character,persona);if(!actorId)return'';
  const world=data.worlds.find(item=>item.members.some(member=>member.actorId===actorId&&member.sourcePersonaId===persona.forumPersonaId&&member.permissions?.allowChatContext===true));if(!world)return'';
  const binding=world.members.find(member=>member.actorId===actorId&&member.sourcePersonaId===persona.forumPersonaId&&member.permissions?.allowChatContext===true);if(!binding)return'';
  const items=new Map(),addPost=post=>{if(!post||post.deleted||post.worldId!==world.id)return;const author=authorView(world,post),share=post.marketShare&&['product','purchase','gift'].includes(post.marketShare.kind)?`；公开分享商场内容：${clean(post.marketShare.name,100)}${post.marketShare.kind==='gift'?'（收到礼物）':''}`:'';items.set(`post:${post.id}`,{id:post.id,createdAt:post.createdAt,text:`${author.nickname||author.name} 发帖：${clean(post.content,500)}${share}`})},addComment=comment=>{if(!comment||comment.deleted||comment.worldId!==world.id)return;const post=world.posts.find(item=>item.id===comment.postId&&!item.deleted);if(!post)return;const parent=world.comments.find(item=>item.id===comment.parentId&&!item.deleted),author=actorProfile(world,comment.actorId),target=parent?(actorProfile(world,parent.actorId)?.nickname||parent.authorName):authorView(world,post).nickname;items.set(`comment:${comment.id}`,{id:comment.id,createdAt:comment.createdAt,text:`${author?.nickname||author?.name||comment.authorName} 评论${target?`（回复 ${target}）`:''}：${clean(comment.content,400)}`})};
  for(const post of world.posts)if(post.authorId===actorId)addPost(post);
  for(const comment of world.comments)if(comment.actorId===actorId)addComment(comment);
  for(const notice of world.notifications||[])if(notice.recipientActorId===actorId){if(notice.commentId){const comment=world.comments.find(item=>item.id===notice.commentId);addComment(comment);if(comment)addPost(world.posts.find(post=>post.id===comment.postId))}else if(notice.postId)addPost(world.posts.find(post=>post.id===notice.postId))}
  const lines=[...items.values()].sort((a,b)=>Number(b.createdAt||0)-Number(a.createdAt||0)).slice(0,Math.max(1,Math.min(10,Number(limit)||6))).map(item=>{const time=Number(item.createdAt);return`- ${Number.isFinite(time)&&time>0?new Date(time).toISOString():'时间未记录'} ${item.text}`});
  return lines.length?`【当前论坛世界中该角色自己的公开活动与收到的论坛通知】\n论坛：${world.name}\n${lines.join('\n')}\n这些只是可见的论坛经历，不覆盖私人主线；不要假定角色知道未包含的帖子。`:'';
 };
 const deletePost=(world,postId,actorId)=>{const post=world.posts.find(item=>item.id===postId);if(!post||post.authorId!==actorId)return false;post.deleted=true;post.deletedAt=Date.now();post.content='';post.attachments=[];world.comments=world.comments.filter(comment=>comment.postId!==postId);world.notifications=world.notifications.filter(item=>item.postId!==postId);return true};
 return{ id,clean,ensure,ensureDefaultWorld,resetWorld,actorForPersona,actorForCharacter,worldById,activeWorld,deleteWorld,createWorld,addPersona,addCharacter,canRolePost,canRoleReply,removeMember,actorProfile,authorView,collectionById,collectionsForActor,ownedCollectionById,createCollection,createPost,addComment,toggleLike,toggleFollow,toggleBookmark,notify,markRead,chatContext,deletePost,defaultNpcs };
});
