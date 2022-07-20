import{BufferAttribute,ClampToEdgeWrapping,DoubleSide,InterpolateDiscrete,InterpolateLinear,LinearFilter,LinearMipmapLinearFilter,LinearMipmapNearestFilter,MathUtils,Matrix4,MirroredRepeatWrapping,NearestFilter,NearestMipmapLinearFilter,NearestMipmapNearestFilter,PropertyBinding,RGBAFormat,RepeatWrapping,Scene,Source,Vector3}from"./three.js";class GLTFExporter{constructor(){this.pluginCallbacks=[],this.register((function(e){return new GLTFLightExtension(e)})),this.register((function(e){return new GLTFMaterialsUnlitExtension(e)})),this.register((function(e){return new GLTFMaterialsPBRSpecularGlossiness(e)})),this.register((function(e){return new GLTFMaterialsTransmissionExtension(e)})),this.register((function(e){return new GLTFMaterialsVolumeExtension(e)})),this.register((function(e){return new GLTFMaterialsClearcoatExtension(e)}))}register(e){return-1===this.pluginCallbacks.indexOf(e)&&this.pluginCallbacks.push(e),this}unregister(e){return-1!==this.pluginCallbacks.indexOf(e)&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,s,r){"object"==typeof s&&(console.warn("THREE.GLTFExporter: parse() expects options as the fourth argument now."),r=s);const n=new GLTFWriter,i=[];for(let e=0,t=this.pluginCallbacks.length;e<t;e++)i.push(this.pluginCallbacks[e](n));n.setPlugins(i),n.write(e,t,r).catch(s)}parseAsync(e,t){const s=this;return new Promise((function(r,n){s.parse(e,r,n,t)}))}}const WEBGL_CONSTANTS={POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6,UNSIGNED_BYTE:5121,UNSIGNED_SHORT:5123,FLOAT:5126,UNSIGNED_INT:5125,ARRAY_BUFFER:34962,ELEMENT_ARRAY_BUFFER:34963,NEAREST:9728,LINEAR:9729,NEAREST_MIPMAP_NEAREST:9984,LINEAR_MIPMAP_NEAREST:9985,NEAREST_MIPMAP_LINEAR:9986,LINEAR_MIPMAP_LINEAR:9987,CLAMP_TO_EDGE:33071,MIRRORED_REPEAT:33648,REPEAT:10497},THREE_TO_WEBGL={};THREE_TO_WEBGL[NearestFilter]=WEBGL_CONSTANTS.NEAREST,THREE_TO_WEBGL[NearestMipmapNearestFilter]=WEBGL_CONSTANTS.NEAREST_MIPMAP_NEAREST,THREE_TO_WEBGL[NearestMipmapLinearFilter]=WEBGL_CONSTANTS.NEAREST_MIPMAP_LINEAR,THREE_TO_WEBGL[LinearFilter]=WEBGL_CONSTANTS.LINEAR,THREE_TO_WEBGL[LinearMipmapNearestFilter]=WEBGL_CONSTANTS.LINEAR_MIPMAP_NEAREST,THREE_TO_WEBGL[LinearMipmapLinearFilter]=WEBGL_CONSTANTS.LINEAR_MIPMAP_LINEAR,THREE_TO_WEBGL[ClampToEdgeWrapping]=WEBGL_CONSTANTS.CLAMP_TO_EDGE,THREE_TO_WEBGL[RepeatWrapping]=WEBGL_CONSTANTS.REPEAT,THREE_TO_WEBGL[MirroredRepeatWrapping]=WEBGL_CONSTANTS.MIRRORED_REPEAT;const PATH_PROPERTIES={scale:"scale",position:"translation",quaternion:"rotation",morphTargetInfluences:"weights"},GLB_HEADER_BYTES=12,GLB_HEADER_MAGIC=1179937895,GLB_VERSION=2,GLB_CHUNK_PREFIX_BYTES=8,GLB_CHUNK_TYPE_JSON=1313821514,GLB_CHUNK_TYPE_BIN=5130562;function equalArray(e,t){return e.length===t.length&&e.every((function(e,s){return e===t[s]}))}function stringToArrayBuffer(e){return(new TextEncoder).encode(e).buffer}function isIdentityMatrix(e){return equalArray(e.elements,[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1])}function getMinMax(e,t,s){const r={min:new Array(e.itemSize).fill(Number.POSITIVE_INFINITY),max:new Array(e.itemSize).fill(Number.NEGATIVE_INFINITY)};for(let n=t;n<t+s;n++)for(let t=0;t<e.itemSize;t++){let s;e.itemSize>4?s=e.array[n*e.itemSize+t]:0===t?s=e.getX(n):1===t?s=e.getY(n):2===t?s=e.getZ(n):3===t&&(s=e.getW(n)),r.min[t]=Math.min(r.min[t],s),r.max[t]=Math.max(r.max[t],s)}return r}function getPaddedBufferSize(e){return 4*Math.ceil(e/4)}function getPaddedArrayBuffer(e,t=0){const s=getPaddedBufferSize(e.byteLength);if(s!==e.byteLength){const r=new Uint8Array(s);if(r.set(new Uint8Array(e)),0!==t)for(let n=e.byteLength;n<s;n++)r[n]=t;return r.buffer}return e}let cachedCanvas=null;function getCanvas(){return cachedCanvas||(cachedCanvas="undefined"==typeof document&&"undefined"!=typeof OffscreenCanvas?new OffscreenCanvas(1,1):document.createElement("canvas"),cachedCanvas)}class GLTFWriter{constructor(){this.plugins=[],this.options={},this.pending=[],this.buffers=[],this.byteOffset=0,this.buffers=[],this.nodeMap=new Map,this.skins=[],this.extensionsUsed={},this.uids=new Map,this.uid=0,this.json={asset:{version:"2.0",generator:"THREE.GLTFExporter"}},this.cache={meshes:new Map,attributes:new Map,attributesNormalized:new Map,materials:new Map,textures:new Map,images:new Map}}setPlugins(e){this.plugins=e}async write(e,t,s){this.options=Object.assign({},{binary:!1,trs:!1,onlyVisible:!0,truncateDrawRange:!0,embedImages:!0,maxTextureSize:1/0,animations:[],includeCustomExtensions:!1},s),this.options.animations.length>0&&(this.options.trs=!0),this.processInput(e),await Promise.all(this.pending);const r=this,n=r.buffers,i=r.json;s=r.options;const a=r.extensionsUsed,o=new Blob(n,{type:"application/octet-stream"}),l=Object.keys(a);if(l.length>0&&(i.extensionsUsed=l),i.buffers&&i.buffers.length>0&&(i.buffers[0].byteLength=o.size),!0===s.binary){const e=new FileReader;e.readAsArrayBuffer(o),e.onloadend=function(){const s=getPaddedArrayBuffer(e.result),r=new DataView(new ArrayBuffer(8));r.setUint32(0,s.byteLength,!0),r.setUint32(4,5130562,!0);const n=getPaddedArrayBuffer(stringToArrayBuffer(JSON.stringify(i)),32),a=new DataView(new ArrayBuffer(8));a.setUint32(0,n.byteLength,!0),a.setUint32(4,1313821514,!0);const o=new ArrayBuffer(12),l=new DataView(o);l.setUint32(0,1179937895,!0),l.setUint32(4,2,!0);const c=12+a.byteLength+n.byteLength+r.byteLength+s.byteLength;l.setUint32(8,c,!0);const u=new Blob([o,a,n,r,s],{type:"application/octet-stream"}),h=new FileReader;h.readAsArrayBuffer(u),h.onloadend=function(){t(h.result)}}}else if(i.buffers&&i.buffers.length>0){const e=new FileReader;e.readAsDataURL(o),e.onloadend=function(){const s=e.result;i.buffers[0].uri=s,t(i)}}else t(i)}serializeUserData(e,t){if(0===Object.keys(e.userData).length)return;const s=this.options,r=this.extensionsUsed;try{const n=JSON.parse(JSON.stringify(e.userData));if(s.includeCustomExtensions&&n.gltfExtensions){void 0===t.extensions&&(t.extensions={});for(const e in n.gltfExtensions)t.extensions[e]=n.gltfExtensions[e],r[e]=!0;delete n.gltfExtensions}Object.keys(n).length>0&&(t.extras=n)}catch(t){console.warn("THREE.GLTFExporter: userData of '"+e.name+"' won't be serialized because of JSON.stringify error - "+t.message)}}getUID(e){return this.uids.has(e)||this.uids.set(e,this.uid++),this.uids.get(e)}isNormalizedNormalAttribute(e){if(this.cache.attributesNormalized.has(e))return!1;const t=new Vector3;for(let s=0,r=e.count;s<r;s++)if(Math.abs(t.fromBufferAttribute(e,s).length()-1)>5e-4)return!1;return!0}createNormalizedNormalAttribute(e){const t=this.cache;if(t.attributesNormalized.has(e))return t.attributesNormalized.get(e);const s=e.clone(),r=new Vector3;for(let e=0,t=s.count;e<t;e++)r.fromBufferAttribute(s,e),0===r.x&&0===r.y&&0===r.z?r.setX(1):r.normalize(),s.setXYZ(e,r.x,r.y,r.z);return t.attributesNormalized.set(e,s),s}applyTextureTransform(e,t){let s=!1;const r={};0===t.offset.x&&0===t.offset.y||(r.offset=t.offset.toArray(),s=!0),0!==t.rotation&&(r.rotation=t.rotation,s=!0),1===t.repeat.x&&1===t.repeat.y||(r.scale=t.repeat.toArray(),s=!0),s&&(e.extensions=e.extensions||{},e.extensions.KHR_texture_transform=r,this.extensionsUsed.KHR_texture_transform=!0)}buildMetalRoughTexture(e,t){if(e===t)return e;console.warn("THREE.GLTFExporter: Merged metalnessMap and roughnessMap textures.");const s=e?.image,r=t?.image,n=Math.max(s?.width||0,r?.width||0),i=Math.max(s?.height||0,r?.height||0),a=getCanvas();a.width=n,a.height=i;const o=a.getContext("2d");o.fillStyle="#00ffff",o.fillRect(0,0,n,i);const l=o.getImageData(0,0,n,i);if(s){o.drawImage(s,0,0,n,i);const e=o.getImageData(0,0,n,i).data;for(let t=2;t<e.length;t+=4)l.data[t]=e[t]}if(r){o.drawImage(r,0,0,n,i);const e=o.getImageData(0,0,n,i).data;for(let t=1;t<e.length;t+=4)l.data[t]=e[t]}o.putImageData(l,0,0);const c=(e||t).clone();return c.source=new Source(a),c}processBuffer(e){const t=this.json,s=this.buffers;return t.buffers||(t.buffers=[{byteLength:0}]),s.push(e),0}processBufferView(e,t,s,r,n){const i=this.json;let a;i.bufferViews||(i.bufferViews=[]),a=t===WEBGL_CONSTANTS.UNSIGNED_BYTE?1:t===WEBGL_CONSTANTS.UNSIGNED_SHORT?2:4;const o=getPaddedBufferSize(r*e.itemSize*a),l=new DataView(new ArrayBuffer(o));let c=0;for(let n=s;n<s+r;n++)for(let s=0;s<e.itemSize;s++){let r;e.itemSize>4?r=e.array[n*e.itemSize+s]:0===s?r=e.getX(n):1===s?r=e.getY(n):2===s?r=e.getZ(n):3===s&&(r=e.getW(n)),t===WEBGL_CONSTANTS.FLOAT?l.setFloat32(c,r,!0):t===WEBGL_CONSTANTS.UNSIGNED_INT?l.setUint32(c,r,!0):t===WEBGL_CONSTANTS.UNSIGNED_SHORT?l.setUint16(c,r,!0):t===WEBGL_CONSTANTS.UNSIGNED_BYTE&&l.setUint8(c,r),c+=a}const u={buffer:this.processBuffer(l.buffer),byteOffset:this.byteOffset,byteLength:o};return void 0!==n&&(u.target=n),n===WEBGL_CONSTANTS.ARRAY_BUFFER&&(u.byteStride=e.itemSize*a),this.byteOffset+=o,i.bufferViews.push(u),{id:i.bufferViews.length-1,byteLength:0}}processBufferViewImage(e){const t=this,s=t.json;return s.bufferViews||(s.bufferViews=[]),new Promise((function(r){const n=new FileReader;n.readAsArrayBuffer(e),n.onloadend=function(){const e=getPaddedArrayBuffer(n.result),i={buffer:t.processBuffer(e),byteOffset:t.byteOffset,byteLength:e.byteLength};t.byteOffset+=e.byteLength,r(s.bufferViews.push(i)-1)}}))}processAccessor(e,t,s,r){const n=this.options,i=this.json;let a;if(e.array.constructor===Float32Array)a=WEBGL_CONSTANTS.FLOAT;else if(e.array.constructor===Uint32Array)a=WEBGL_CONSTANTS.UNSIGNED_INT;else if(e.array.constructor===Uint16Array)a=WEBGL_CONSTANTS.UNSIGNED_SHORT;else{if(e.array.constructor!==Uint8Array)throw new Error("THREE.GLTFExporter: Unsupported bufferAttribute component type.");a=WEBGL_CONSTANTS.UNSIGNED_BYTE}if(void 0===s&&(s=0),void 0===r&&(r=e.count),n.truncateDrawRange&&void 0!==t&&null===t.index){const n=s+r,i=t.drawRange.count===1/0?e.count:t.drawRange.start+t.drawRange.count;s=Math.max(s,t.drawRange.start),(r=Math.min(n,i)-s)<0&&(r=0)}if(0===r)return null;const o=getMinMax(e,s,r);let l;void 0!==t&&(l=e===t.index?WEBGL_CONSTANTS.ELEMENT_ARRAY_BUFFER:WEBGL_CONSTANTS.ARRAY_BUFFER);const c=this.processBufferView(e,a,s,r,l),u={bufferView:c.id,byteOffset:c.byteOffset,componentType:a,count:r,max:o.max,min:o.min,type:{1:"SCALAR",2:"VEC2",3:"VEC3",4:"VEC4",16:"MAT4"}[e.itemSize]};return!0===e.normalized&&(u.normalized=!0),i.accessors||(i.accessors=[]),i.accessors.push(u)-1}processImage(e,t,s,r="image/png"){const n=this,i=n.cache,a=n.json,o=n.options,l=n.pending;i.images.has(e)||i.images.set(e,{});const c=i.images.get(e),u=r+":flipY/"+s.toString();if(void 0!==c[u])return c[u];a.images||(a.images=[]);const h={mimeType:r};if(o.embedImages){const i=getCanvas();i.width=Math.min(e.width,o.maxTextureSize),i.height=Math.min(e.height,o.maxTextureSize);const a=i.getContext("2d");if(!0===s&&(a.translate(0,i.height),a.scale(1,-1)),void 0!==e.data){t!==RGBAFormat&&console.error("GLTFExporter: Only RGBAFormat is supported."),(e.width>o.maxTextureSize||e.height>o.maxTextureSize)&&console.warn("GLTFExporter: Image size is bigger than maxTextureSize",e);const s=new Uint8ClampedArray(e.height*e.width*4);for(let t=0;t<s.length;t+=4)s[t+0]=e.data[t+0],s[t+1]=e.data[t+1],s[t+2]=e.data[t+2],s[t+3]=e.data[t+3];a.putImageData(new ImageData(s,e.width,e.height),0,0)}else a.drawImage(e,0,0,i.width,i.height);if(!0===o.binary){let e;if(void 0!==i.toBlob)e=new Promise((e=>i.toBlob(e,r)));else{let t;"image/jpeg"===r?t=.92:"image/webp"===r&&(t=.8),e=i.convertToBlob({type:r,quality:t})}l.push(e.then((e=>n.processBufferViewImage(e).then((e=>{h.bufferView=e})))))}else h.uri=i.toDataURL(r)}else h.uri=e.src;const p=a.images.push(h)-1;return c[u]=p,p}processSampler(e){const t=this.json;t.samplers||(t.samplers=[]);const s={magFilter:THREE_TO_WEBGL[e.magFilter],minFilter:THREE_TO_WEBGL[e.minFilter],wrapS:THREE_TO_WEBGL[e.wrapS],wrapT:THREE_TO_WEBGL[e.wrapT]};return t.samplers.push(s)-1}processTexture(e){const t=this.cache,s=this.json;if(t.textures.has(e))return t.textures.get(e);s.textures||(s.textures=[]);let r=e.userData.mimeType;"image/webp"===r&&(r="image/png");const n={sampler:this.processSampler(e),source:this.processImage(e.image,e.format,e.flipY,r)};e.name&&(n.name=e.name),this._invokeAll((function(t){t.writeTexture&&t.writeTexture(e,n)}));const i=s.textures.push(n)-1;return t.textures.set(e,i),i}processMaterial(e){const t=this.cache,s=this.json;if(t.materials.has(e))return t.materials.get(e);if(e.isShaderMaterial)return console.warn("GLTFExporter: THREE.ShaderMaterial not supported."),null;s.materials||(s.materials=[]);const r={pbrMetallicRoughness:{}};!0!==e.isMeshStandardMaterial&&!0!==e.isMeshBasicMaterial&&console.warn("GLTFExporter: Use MeshStandardMaterial or MeshBasicMaterial for best results.");const n=e.color.toArray().concat([e.opacity]);if(equalArray(n,[1,1,1,1])||(r.pbrMetallicRoughness.baseColorFactor=n),e.isMeshStandardMaterial?(r.pbrMetallicRoughness.metallicFactor=e.metalness,r.pbrMetallicRoughness.roughnessFactor=e.roughness):(r.pbrMetallicRoughness.metallicFactor=.5,r.pbrMetallicRoughness.roughnessFactor=.5),e.metalnessMap||e.roughnessMap){const t=this.buildMetalRoughTexture(e.metalnessMap,e.roughnessMap),s={index:this.processTexture(t)};this.applyTextureTransform(s,t),r.pbrMetallicRoughness.metallicRoughnessTexture=s}if(e.map){const t={index:this.processTexture(e.map)};this.applyTextureTransform(t,e.map),r.pbrMetallicRoughness.baseColorTexture=t}if(e.emissive){const t=e.emissive.clone().multiplyScalar(e.emissiveIntensity),s=Math.max(t.r,t.g,t.b);if(s>1&&(t.multiplyScalar(1/s),console.warn("THREE.GLTFExporter: Some emissive components exceed 1; emissive has been limited")),s>0&&(r.emissiveFactor=t.toArray()),e.emissiveMap){const t={index:this.processTexture(e.emissiveMap)};this.applyTextureTransform(t,e.emissiveMap),r.emissiveTexture=t}}if(e.normalMap){const t={index:this.processTexture(e.normalMap)};e.normalScale&&1!==e.normalScale.x&&(t.scale=e.normalScale.x),this.applyTextureTransform(t,e.normalMap),r.normalTexture=t}if(e.aoMap){const t={index:this.processTexture(e.aoMap),texCoord:1};1!==e.aoMapIntensity&&(t.strength=e.aoMapIntensity),this.applyTextureTransform(t,e.aoMap),r.occlusionTexture=t}e.transparent?r.alphaMode="BLEND":e.alphaTest>0&&(r.alphaMode="MASK",r.alphaCutoff=e.alphaTest),e.side===DoubleSide&&(r.doubleSided=!0),""!==e.name&&(r.name=e.name),this.serializeUserData(e,r),this._invokeAll((function(t){t.writeMaterial&&t.writeMaterial(e,r)}));const i=s.materials.push(r)-1;return t.materials.set(e,i),i}processMesh(e){const t=this.cache,s=this.json,r=[e.geometry.uuid];if(Array.isArray(e.material))for(let t=0,s=e.material.length;t<s;t++)r.push(e.material[t].uuid);else r.push(e.material.uuid);const n=r.join(":");if(t.meshes.has(n))return t.meshes.get(n);const i=e.geometry;let a;if(a=e.isLineSegments?WEBGL_CONSTANTS.LINES:e.isLineLoop?WEBGL_CONSTANTS.LINE_LOOP:e.isLine?WEBGL_CONSTANTS.LINE_STRIP:e.isPoints?WEBGL_CONSTANTS.POINTS:e.material.wireframe?WEBGL_CONSTANTS.LINES:WEBGL_CONSTANTS.TRIANGLES,!0!==i.isBufferGeometry)throw new Error("THREE.GLTFExporter: Geometry is not of type THREE.BufferGeometry.");const o={},l={},c=[],u=[],h={uv:"TEXCOORD_0",uv2:"TEXCOORD_1",color:"COLOR_0",skinWeight:"WEIGHTS_0",skinIndex:"JOINTS_0"},p=i.getAttribute("normal");void 0===p||this.isNormalizedNormalAttribute(p)||(console.warn("THREE.GLTFExporter: Creating normalized normal attribute from the non-normalized one."),i.setAttribute("normal",this.createNormalizedNormalAttribute(p)));let m=null;for(let e in i.attributes){if("morph"===e.slice(0,5))continue;const s=i.attributes[e];if(e=h[e]||e.toUpperCase(),/^(POSITION|NORMAL|TANGENT|TEXCOORD_\d+|COLOR_\d+|JOINTS_\d+|WEIGHTS_\d+)$/.test(e)||(e="_"+e),t.attributes.has(this.getUID(s))){l[e]=t.attributes.get(this.getUID(s));continue}m=null;const r=s.array;"JOINTS_0"!==e||r instanceof Uint16Array||r instanceof Uint8Array||(console.warn('GLTFExporter: Attribute "skinIndex" converted to type UNSIGNED_SHORT.'),m=new BufferAttribute(new Uint16Array(r),s.itemSize,s.normalized));const n=this.processAccessor(m||s,i);null!==n&&(l[e]=n,t.attributes.set(this.getUID(s),n))}if(void 0!==p&&i.setAttribute("normal",p),0===Object.keys(l).length)return null;if(void 0!==e.morphTargetInfluences&&e.morphTargetInfluences.length>0){const s=[],r=[],n={};if(void 0!==e.morphTargetDictionary)for(const t in e.morphTargetDictionary)n[e.morphTargetDictionary[t]]=t;for(let a=0;a<e.morphTargetInfluences.length;++a){const o={};let l=!1;for(const e in i.morphAttributes){if("position"!==e&&"normal"!==e){l||(console.warn("GLTFExporter: Only POSITION and NORMAL morph are supported."),l=!0);continue}const s=i.morphAttributes[e][a],r=e.toUpperCase(),n=i.attributes[e];if(t.attributes.has(this.getUID(s))){o[r]=t.attributes.get(this.getUID(s));continue}const c=s.clone();if(!i.morphTargetsRelative)for(let e=0,t=s.count;e<t;e++)c.setXYZ(e,s.getX(e)-n.getX(e),s.getY(e)-n.getY(e),s.getZ(e)-n.getZ(e));o[r]=this.processAccessor(c,i),t.attributes.set(this.getUID(n),o[r])}u.push(o),s.push(e.morphTargetInfluences[a]),void 0!==e.morphTargetDictionary&&r.push(n[a])}o.weights=s,r.length>0&&(o.extras={},o.extras.targetNames=r)}const f=Array.isArray(e.material);if(f&&0===i.groups.length)return null;const g=f?e.material:[e.material],T=f?i.groups:[{materialIndex:0,start:void 0,count:void 0}];for(let e=0,s=T.length;e<s;e++){const s={mode:a,attributes:l};if(this.serializeUserData(i,s),u.length>0&&(s.targets=u),null!==i.index){let r=this.getUID(i.index);void 0===T[e].start&&void 0===T[e].count||(r+=":"+T[e].start+":"+T[e].count),t.attributes.has(r)?s.indices=t.attributes.get(r):(s.indices=this.processAccessor(i.index,i,T[e].start,T[e].count),t.attributes.set(r,s.indices)),null===s.indices&&delete s.indices}const r=this.processMaterial(g[T[e].materialIndex]);null!==r&&(s.material=r),c.push(s)}o.primitives=c,s.meshes||(s.meshes=[]),this._invokeAll((function(t){t.writeMesh&&t.writeMesh(e,o)}));const d=s.meshes.push(o)-1;return t.meshes.set(n,d),d}processCamera(e){const t=this.json;t.cameras||(t.cameras=[]);const s=e.isOrthographicCamera,r={type:s?"orthographic":"perspective"};return s?r.orthographic={xmag:2*e.right,ymag:2*e.top,zfar:e.far<=0?.001:e.far,znear:e.near<0?0:e.near}:r.perspective={aspectRatio:e.aspect,yfov:MathUtils.degToRad(e.fov),zfar:e.far<=0?.001:e.far,znear:e.near<0?0:e.near},""!==e.name&&(r.name=e.type),t.cameras.push(r)-1}processAnimation(e,t){const s=this.json,r=this.nodeMap;s.animations||(s.animations=[]);const n=(e=GLTFExporter.Utils.mergeMorphTargetTracks(e.clone(),t)).tracks,i=[],a=[];for(let e=0;e<n.length;++e){const s=n[e],o=PropertyBinding.parseTrackName(s.name);let l=PropertyBinding.findNode(t,o.nodeName);const c=PATH_PROPERTIES[o.propertyName];if("bones"===o.objectName&&(l=!0===l.isSkinnedMesh?l.skeleton.getBoneByName(o.objectIndex):void 0),!l||!c)return console.warn('THREE.GLTFExporter: Could not export animation track "%s".',s.name),null;const u=1;let h,p=s.values.length/s.times.length;c===PATH_PROPERTIES.morphTargetInfluences&&(p/=l.morphTargetInfluences.length),!0===s.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline?(h="CUBICSPLINE",p/=3):h=s.getInterpolation()===InterpolateDiscrete?"STEP":"LINEAR",a.push({input:this.processAccessor(new BufferAttribute(s.times,u)),output:this.processAccessor(new BufferAttribute(s.values,p)),interpolation:h}),i.push({sampler:a.length-1,target:{node:r.get(l),path:c}})}return s.animations.push({name:e.name||"clip_"+s.animations.length,samplers:a,channels:i}),s.animations.length-1}processSkin(e){const t=this.json,s=this.nodeMap,r=t.nodes[s.get(e)],n=e.skeleton;if(void 0===n)return null;const i=e.skeleton.bones[0];if(void 0===i)return null;const a=[],o=new Float32Array(16*n.bones.length),l=new Matrix4;for(let t=0;t<n.bones.length;++t)a.push(s.get(n.bones[t])),l.copy(n.boneInverses[t]),l.multiply(e.bindMatrix).toArray(o,16*t);return void 0===t.skins&&(t.skins=[]),t.skins.push({inverseBindMatrices:this.processAccessor(new BufferAttribute(o,16)),joints:a,skeleton:s.get(i)}),r.skin=t.skins.length-1}processNode(e){const t=this.json,s=this.options,r=this.nodeMap;t.nodes||(t.nodes=[]);const n={};if(s.trs){const t=e.quaternion.toArray(),s=e.position.toArray(),r=e.scale.toArray();equalArray(t,[0,0,0,1])||(n.rotation=t),equalArray(s,[0,0,0])||(n.translation=s),equalArray(r,[1,1,1])||(n.scale=r)}else e.matrixAutoUpdate&&e.updateMatrix(),!1===isIdentityMatrix(e.matrix)&&(n.matrix=e.matrix.elements);if(""!==e.name&&(n.name=String(e.name)),this.serializeUserData(e,n),e.isMesh||e.isLine||e.isPoints){const t=this.processMesh(e);null!==t&&(n.mesh=t)}else e.isCamera&&(n.camera=this.processCamera(e));if(e.isSkinnedMesh&&this.skins.push(e),e.children.length>0){const t=[];for(let r=0,n=e.children.length;r<n;r++){const n=e.children[r];if(n.visible||!1===s.onlyVisible){const e=this.processNode(n);null!==e&&t.push(e)}}t.length>0&&(n.children=t)}this._invokeAll((function(t){t.writeNode&&t.writeNode(e,n)}));const i=t.nodes.push(n)-1;return r.set(e,i),i}processScene(e){const t=this.json,s=this.options;t.scenes||(t.scenes=[],t.scene=0);const r={};""!==e.name&&(r.name=e.name),t.scenes.push(r);const n=[];for(let t=0,r=e.children.length;t<r;t++){const r=e.children[t];if(r.visible||!1===s.onlyVisible){const e=this.processNode(r);null!==e&&n.push(e)}}n.length>0&&(r.nodes=n),this.serializeUserData(e,r)}processObjects(e){const t=new Scene;t.name="AuxScene";for(let s=0;s<e.length;s++)t.children.push(e[s]);this.processScene(t)}processInput(e){const t=this.options;e=e instanceof Array?e:[e],this._invokeAll((function(t){t.beforeParse&&t.beforeParse(e)}));const s=[];for(let t=0;t<e.length;t++)e[t]instanceof Scene?this.processScene(e[t]):s.push(e[t]);s.length>0&&this.processObjects(s);for(let e=0;e<this.skins.length;++e)this.processSkin(this.skins[e]);for(let s=0;s<t.animations.length;++s)this.processAnimation(t.animations[s],e[0]);this._invokeAll((function(t){t.afterParse&&t.afterParse(e)}))}_invokeAll(e){for(let t=0,s=this.plugins.length;t<s;t++)e(this.plugins[t])}}class GLTFLightExtension{constructor(e){this.writer=e,this.name="KHR_lights_punctual"}writeNode(e,t){if(!e.isLight)return;if(!e.isDirectionalLight&&!e.isPointLight&&!e.isSpotLight)return void console.warn("THREE.GLTFExporter: Only directional, point, and spot lights are supported.",e);const s=this.writer,r=s.json,n=s.extensionsUsed,i={};e.name&&(i.name=e.name),i.color=e.color.toArray(),i.intensity=e.intensity,e.isDirectionalLight?i.type="directional":e.isPointLight?(i.type="point",e.distance>0&&(i.range=e.distance)):e.isSpotLight&&(i.type="spot",e.distance>0&&(i.range=e.distance),i.spot={},i.spot.innerConeAngle=(e.penumbra-1)*e.angle*-1,i.spot.outerConeAngle=e.angle),void 0!==e.decay&&2!==e.decay&&console.warn("THREE.GLTFExporter: Light decay may be lost. glTF is physically-based, and expects light.decay=2."),!e.target||e.target.parent===e&&0===e.target.position.x&&0===e.target.position.y&&-1===e.target.position.z||console.warn("THREE.GLTFExporter: Light direction may be lost. For best results, make light.target a child of the light with position 0,0,-1."),n[this.name]||(r.extensions=r.extensions||{},r.extensions[this.name]={lights:[]},n[this.name]=!0);const a=r.extensions[this.name].lights;a.push(i),t.extensions=t.extensions||{},t.extensions[this.name]={light:a.length-1}}}class GLTFMaterialsUnlitExtension{constructor(e){this.writer=e,this.name="KHR_materials_unlit"}writeMaterial(e,t){if(!e.isMeshBasicMaterial)return;const s=this.writer.extensionsUsed;t.extensions=t.extensions||{},t.extensions[this.name]={},s[this.name]=!0,t.pbrMetallicRoughness.metallicFactor=0,t.pbrMetallicRoughness.roughnessFactor=.9}}class GLTFMaterialsPBRSpecularGlossiness{constructor(e){this.writer=e,this.name="KHR_materials_pbrSpecularGlossiness"}writeMaterial(e,t){if(!e.isGLTFSpecularGlossinessMaterial)return;const s=this.writer,r=s.extensionsUsed,n={};t.pbrMetallicRoughness.baseColorFactor&&(n.diffuseFactor=t.pbrMetallicRoughness.baseColorFactor);const i=[1,1,1];if(e.specular.toArray(i,0),n.specularFactor=i,n.glossinessFactor=e.glossiness,t.pbrMetallicRoughness.baseColorTexture&&(n.diffuseTexture=t.pbrMetallicRoughness.baseColorTexture),e.specularMap){const t={index:s.processTexture(e.specularMap)};s.applyTextureTransform(t,e.specularMap),n.specularGlossinessTexture=t}t.extensions=t.extensions||{},t.extensions[this.name]=n,r[this.name]=!0}}class GLTFMaterialsClearcoatExtension{constructor(e){this.writer=e,this.name="KHR_materials_clearcoat"}writeMaterial(e,t){if(!e.isMeshPhysicalMaterial)return;const s=this.writer,r=s.extensionsUsed,n={};if(n.clearcoatFactor=e.clearcoat,e.clearcoatMap){const t={index:s.processTexture(e.clearcoatMap)};s.applyTextureTransform(t,e.clearcoatMap),n.clearcoatTexture=t}if(n.clearcoatRoughnessFactor=e.clearcoatRoughness,e.clearcoatRoughnessMap){const t={index:s.processTexture(e.clearcoatRoughnessMap)};s.applyTextureTransform(t,e.clearcoatRoughnessMap),n.clearcoatRoughnessTexture=t}if(e.clearcoatNormalMap){const t={index:s.processTexture(e.clearcoatNormalMap)};s.applyTextureTransform(t,e.clearcoatNormalMap),n.clearcoatNormalTexture=t}t.extensions=t.extensions||{},t.extensions[this.name]=n,r[this.name]=!0}}class GLTFMaterialsTransmissionExtension{constructor(e){this.writer=e,this.name="KHR_materials_transmission"}writeMaterial(e,t){if(!e.isMeshPhysicalMaterial||0===e.transmission)return;const s=this.writer,r=s.extensionsUsed,n={};if(n.transmissionFactor=e.transmission,e.transmissionMap){const t={index:s.processTexture(e.transmissionMap)};s.applyTextureTransform(t,e.transmissionMap),n.transmissionTexture=t}t.extensions=t.extensions||{},t.extensions[this.name]=n,r[this.name]=!0}}class GLTFMaterialsVolumeExtension{constructor(e){this.writer=e,this.name="KHR_materials_volume"}writeMaterial(e,t){if(!e.isMeshPhysicalMaterial||0===e.transmission)return;const s=this.writer,r=s.extensionsUsed,n={};if(n.thicknessFactor=e.thickness,e.thicknessMap){const t={index:s.processTexture(e.thicknessMap)};s.applyTextureTransform(t,e.thicknessMap),n.thicknessTexture=t}n.attenuationDistance=e.attenuationDistance,n.attenuationColor=e.attenuationColor.toArray(),t.extensions=t.extensions||{},t.extensions[this.name]=n,r[this.name]=!0}}GLTFExporter.Utils={insertKeyframe:function(e,t){const s=.001,r=e.getValueSize(),n=new e.TimeBufferType(e.times.length+1),i=new e.ValueBufferType(e.values.length+r),a=e.createInterpolant(new e.ValueBufferType(r));let o;if(0===e.times.length){n[0]=t;for(let e=0;e<r;e++)i[e]=0;o=0}else if(t<e.times[0]){if(Math.abs(e.times[0]-t)<s)return 0;n[0]=t,n.set(e.times,1),i.set(a.evaluate(t),0),i.set(e.values,r),o=0}else if(t>e.times[e.times.length-1]){if(Math.abs(e.times[e.times.length-1]-t)<s)return e.times.length-1;n[n.length-1]=t,n.set(e.times,0),i.set(e.values,0),i.set(a.evaluate(t),e.values.length),o=n.length-1}else for(let l=0;l<e.times.length;l++){if(Math.abs(e.times[l]-t)<s)return l;if(e.times[l]<t&&e.times[l+1]>t){n.set(e.times.slice(0,l+1),0),n[l+1]=t,n.set(e.times.slice(l+1),l+2),i.set(e.values.slice(0,(l+1)*r),0),i.set(a.evaluate(t),(l+1)*r),i.set(e.values.slice((l+1)*r),(l+2)*r),o=l+1;break}}return e.times=n,e.values=i,o},mergeMorphTargetTracks:function(e,t){const s=[],r={},n=e.tracks;for(let e=0;e<n.length;++e){let i=n[e];const a=PropertyBinding.parseTrackName(i.name),o=PropertyBinding.findNode(t,a.nodeName);if("morphTargetInfluences"!==a.propertyName||void 0===a.propertyIndex){s.push(i);continue}if(i.createInterpolant!==i.InterpolantFactoryMethodDiscrete&&i.createInterpolant!==i.InterpolantFactoryMethodLinear){if(i.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline)throw new Error("THREE.GLTFExporter: Cannot merge tracks with glTF CUBICSPLINE interpolation.");console.warn("THREE.GLTFExporter: Morph target interpolation mode not yet supported. Using LINEAR instead."),i=i.clone(),i.setInterpolation(InterpolateLinear)}const l=o.morphTargetInfluences.length,c=o.morphTargetDictionary[a.propertyIndex];if(void 0===c)throw new Error("THREE.GLTFExporter: Morph target name not found: "+a.propertyIndex);let u;if(void 0===r[o.uuid]){u=i.clone();const e=new u.ValueBufferType(l*u.times.length);for(let t=0;t<u.times.length;t++)e[t*l+c]=u.values[t];u.name=(a.nodeName||"")+".morphTargetInfluences",u.values=e,r[o.uuid]=u,s.push(u);continue}const h=i.createInterpolant(new i.ValueBufferType(1));u=r[o.uuid];for(let e=0;e<u.times.length;e++)u.values[e*l+c]=h.evaluate(u.times[e]);for(let e=0;e<i.times.length;e++){const t=this.insertKeyframe(u,i.times[e]);u.values[t*l+c]=i.values[e]}}return e.tracks=s,e}};export{GLTFExporter};