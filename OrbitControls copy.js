import{EventDispatcher,MOUSE,Quaternion,Spherical,TOUCH,Vector2,Vector3}from"three";const _changeEvent={type:"change"},_startEvent={type:"start"},_endEvent={type:"end"};class OrbitControls extends EventDispatcher{constructor(e,t){super(),void 0===t&&console.warn('THREE.OrbitControls: The second parameter "domElement" is now mandatory.'),t===document&&console.error('THREE.OrbitControls: "document" should not be used as the target "domElement". Please use "renderer.domElement" instead.'),this.object=e,this.domElement=t,this.domElement.style.touchAction="none",this.enabled=!0,this.target=new Vector3,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:MOUSE.ROTATE,MIDDLE:MOUSE.DOLLY,RIGHT:MOUSE.PAN},this.touches={ONE:TOUCH.ROTATE,TWO:TOUCH.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._domElementKeyEvents=null,this.getPolarAngle=function(){return r.phi},this.getAzimuthalAngle=function(){return r.theta},this.getDistance=function(){return this.object.position.distanceTo(this.target)},this.listenToKeyEvents=function(e){e.addEventListener("keydown",F),this._domElementKeyEvents=e},this.saveState=function(){n.target0.copy(n.target),n.position0.copy(n.object.position),n.zoom0=n.object.zoom},this.reset=function(){n.target.copy(n.target0),n.object.position.copy(n.position0),n.object.zoom=n.zoom0,n.object.updateProjectionMatrix(),n.dispatchEvent(_changeEvent),n.update(),a=o.NONE},this.update=function(){const t=new Vector3,p=(new Quaternion).setFromUnitVectors(e.up,new Vector3(0,1,0)),u=p.clone().invert(),h=new Vector3,d=new Quaternion,b=2*Math.PI;return function(){const e=n.object.position;t.copy(e).sub(n.target),t.applyQuaternion(p),r.setFromVector3(t),n.autoRotate&&a===o.NONE&&P(2*Math.PI/60/60*n.autoRotateSpeed),n.enableDamping?(r.theta+=c.theta*n.dampingFactor,r.phi+=c.phi*n.dampingFactor):(r.theta+=c.theta,r.phi+=c.phi);let E=n.minAzimuthAngle,O=n.maxAzimuthAngle;return isFinite(E)&&isFinite(O)&&(E<-Math.PI?E+=b:E>Math.PI&&(E-=b),O<-Math.PI?O+=b:O>Math.PI&&(O-=b),r.theta=E<=O?Math.max(E,Math.min(O,r.theta)):r.theta>(E+O)/2?Math.max(E,r.theta):Math.min(O,r.theta)),r.phi=Math.max(n.minPolarAngle,Math.min(n.maxPolarAngle,r.phi)),r.makeSafe(),r.radius*=s,r.radius=Math.max(n.minDistance,Math.min(n.maxDistance,r.radius)),!0===n.enableDamping?n.target.addScaledVector(l,n.dampingFactor):n.target.add(l),t.setFromSpherical(r),t.applyQuaternion(u),e.copy(n.target).add(t),n.object.lookAt(n.target),!0===n.enableDamping?(c.theta*=1-n.dampingFactor,c.phi*=1-n.dampingFactor,l.multiplyScalar(1-n.dampingFactor)):(c.set(0,0,0),l.set(0,0,0)),s=1,!!(m||h.distanceToSquared(n.object.position)>i||8*(1-d.dot(n.object.quaternion))>i)&&(n.dispatchEvent(_changeEvent),h.copy(n.object.position),d.copy(n.object.quaternion),m=!1,!0)}}(),this.dispose=function(){n.domElement.removeEventListener("contextmenu",X),n.domElement.removeEventListener("pointerdown",D),n.domElement.removeEventListener("pointercancel",V),n.domElement.removeEventListener("wheel",z),n.domElement.removeEventListener("pointermove",U),n.domElement.removeEventListener("pointerup",I),null!==n._domElementKeyEvents&&n._domElementKeyEvents.removeEventListener("keydown",F)};const n=this,o={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6};let a=o.NONE;const i=1e-6,r=new Spherical,c=new Spherical;let s=1;const l=new Vector3;let m=!1;const p=new Vector2,u=new Vector2,h=new Vector2,d=new Vector2,b=new Vector2,E=new Vector2,O=new Vector2,g=new Vector2,f=new Vector2,T=[],y={};function v(){return Math.pow(.95,n.zoomSpeed)}function P(e){c.theta-=e}function A(e){c.phi-=e}const L=function(){const e=new Vector3;return function(t,n){e.setFromMatrixColumn(n,0),e.multiplyScalar(-t),l.add(e)}}(),N=function(){const e=new Vector3;return function(t,o){!0===n.screenSpacePanning?e.setFromMatrixColumn(o,1):(e.setFromMatrixColumn(o,0),e.crossVectors(n.object.up,e)),e.multiplyScalar(t),l.add(e)}}(),w=function(){const e=new Vector3;return function(t,o){const a=n.domElement;if(n.object.isPerspectiveCamera){const i=n.object.position;e.copy(i).sub(n.target);let r=e.length();r*=Math.tan(n.object.fov/2*Math.PI/180),L(2*t*r/a.clientHeight,n.object.matrix),N(2*o*r/a.clientHeight,n.object.matrix)}else n.object.isOrthographicCamera?(L(t*(n.object.right-n.object.left)/n.object.zoom/a.clientWidth,n.object.matrix),N(o*(n.object.top-n.object.bottom)/n.object.zoom/a.clientHeight,n.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),n.enablePan=!1)}}();function M(e){n.object.isPerspectiveCamera?s/=e:n.object.isOrthographicCamera?(n.object.zoom=Math.max(n.minZoom,Math.min(n.maxZoom,n.object.zoom*e)),n.object.updateProjectionMatrix(),m=!0):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),n.enableZoom=!1)}function j(e){n.object.isPerspectiveCamera?s*=e:n.object.isOrthographicCamera?(n.object.zoom=Math.max(n.minZoom,Math.min(n.maxZoom,n.object.zoom/e)),n.object.updateProjectionMatrix(),m=!0):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),n.enableZoom=!1)}function S(e){p.set(e.clientX,e.clientY)}function C(e){d.set(e.clientX,e.clientY)}function R(){if(1===T.length)p.set(T[0].pageX,T[0].pageY);else{const e=.5*(T[0].pageX+T[1].pageX),t=.5*(T[0].pageY+T[1].pageY);p.set(e,t)}}function k(){if(1===T.length)d.set(T[0].pageX,T[0].pageY);else{const e=.5*(T[0].pageX+T[1].pageX),t=.5*(T[0].pageY+T[1].pageY);d.set(e,t)}}function x(){const e=T[0].pageX-T[1].pageX,t=T[0].pageY-T[1].pageY,n=Math.sqrt(e*e+t*t);O.set(0,n)}function Y(e){if(1==T.length)u.set(e.pageX,e.pageY);else{const t=B(e),n=.5*(e.pageX+t.x),o=.5*(e.pageY+t.y);u.set(n,o)}h.subVectors(u,p).multiplyScalar(n.rotateSpeed);const t=n.domElement;P(2*Math.PI*h.x/t.clientHeight),A(2*Math.PI*h.y/t.clientHeight),p.copy(u)}function _(e){if(1===T.length)b.set(e.pageX,e.pageY);else{const t=B(e),n=.5*(e.pageX+t.x),o=.5*(e.pageY+t.y);b.set(n,o)}E.subVectors(b,d).multiplyScalar(n.panSpeed),w(E.x,E.y),d.copy(b)}function H(e){const t=B(e),o=e.pageX-t.x,a=e.pageY-t.y,i=Math.sqrt(o*o+a*a);g.set(0,i),f.set(0,Math.pow(g.y/O.y,n.zoomSpeed)),M(f.y),O.copy(g)}function D(e){!1!==n.enabled&&(0===T.length&&(n.domElement.setPointerCapture(e.pointerId),n.domElement.addEventListener("pointermove",U),n.domElement.addEventListener("pointerup",I)),function(e){T.push(e)}(e),"touch"===e.pointerType?function(e){switch(K(e),T.length){case 1:switch(n.touches.ONE){case TOUCH.ROTATE:if(!1===n.enableRotate)return;R(),a=o.TOUCH_ROTATE;break;case TOUCH.PAN:if(!1===n.enablePan)return;k(),a=o.TOUCH_PAN;break;default:a=o.NONE}break;case 2:switch(n.touches.TWO){case TOUCH.DOLLY_PAN:if(!1===n.enableZoom&&!1===n.enablePan)return;n.enableZoom&&x(),n.enablePan&&k(),a=o.TOUCH_DOLLY_PAN;break;case TOUCH.DOLLY_ROTATE:if(!1===n.enableZoom&&!1===n.enableRotate)return;n.enableZoom&&x(),n.enableRotate&&R(),a=o.TOUCH_DOLLY_ROTATE;break;default:a=o.NONE}break;default:a=o.NONE}a!==o.NONE&&n.dispatchEvent(_startEvent)}(e):function(e){let t;switch(e.button){case 0:t=n.mouseButtons.LEFT;break;case 1:t=n.mouseButtons.MIDDLE;break;case 2:t=n.mouseButtons.RIGHT;break;default:t=-1}switch(t){case MOUSE.DOLLY:if(!1===n.enableZoom)return;!function(e){O.set(e.clientX,e.clientY)}(e),a=o.DOLLY;break;case MOUSE.ROTATE:if(e.ctrlKey||e.metaKey||e.shiftKey){if(!1===n.enablePan)return;C(e),a=o.PAN}else{if(!1===n.enableRotate)return;S(e),a=o.ROTATE}break;case MOUSE.PAN:if(e.ctrlKey||e.metaKey||e.shiftKey){if(!1===n.enableRotate)return;S(e),a=o.ROTATE}else{if(!1===n.enablePan)return;C(e),a=o.PAN}break;default:a=o.NONE}a!==o.NONE&&n.dispatchEvent(_startEvent)}(e))}function U(e){!1!==n.enabled&&("touch"===e.pointerType?function(e){switch(K(e),a){case o.TOUCH_ROTATE:if(!1===n.enableRotate)return;Y(e),n.update();break;case o.TOUCH_PAN:if(!1===n.enablePan)return;_(e),n.update();break;case o.TOUCH_DOLLY_PAN:if(!1===n.enableZoom&&!1===n.enablePan)return;!function(e){n.enableZoom&&H(e),n.enablePan&&_(e)}(e),n.update();break;case o.TOUCH_DOLLY_ROTATE:if(!1===n.enableZoom&&!1===n.enableRotate)return;!function(e){n.enableZoom&&H(e),n.enableRotate&&Y(e)}(e),n.update();break;default:a=o.NONE}}(e):function(e){if(!1!==n.enabled)switch(a){case o.ROTATE:if(!1===n.enableRotate)return;!function(e){u.set(e.clientX,e.clientY),h.subVectors(u,p).multiplyScalar(n.rotateSpeed);const t=n.domElement;P(2*Math.PI*h.x/t.clientHeight),A(2*Math.PI*h.y/t.clientHeight),p.copy(u),n.update()}(e);break;case o.DOLLY:if(!1===n.enableZoom)return;!function(e){g.set(e.clientX,e.clientY),f.subVectors(g,O),f.y>0?M(v()):f.y<0&&j(v()),O.copy(g),n.update()}(e);break;case o.PAN:if(!1===n.enablePan)return;!function(e){b.set(e.clientX,e.clientY),E.subVectors(b,d).multiplyScalar(n.panSpeed),w(E.x,E.y),d.copy(b),n.update()}(e)}}(e))}function I(e){Z(e),0===T.length&&(n.domElement.releasePointerCapture(e.pointerId),n.domElement.removeEventListener("pointermove",U),n.domElement.removeEventListener("pointerup",I)),n.dispatchEvent(_endEvent),a=o.NONE}function V(e){Z(e)}function z(e){!1!==n.enabled&&!1!==n.enableZoom&&a===o.NONE&&(e.preventDefault(),n.dispatchEvent(_startEvent),function(e){e.deltaY<0?j(v()):e.deltaY>0&&M(v()),n.update()}(e),n.dispatchEvent(_endEvent))}function F(e){!1!==n.enabled&&!1!==n.enablePan&&function(e){let t=!1;switch(e.code){case n.keys.UP:w(0,n.keyPanSpeed),t=!0;break;case n.keys.BOTTOM:w(0,-n.keyPanSpeed),t=!0;break;case n.keys.LEFT:w(n.keyPanSpeed,0),t=!0;break;case n.keys.RIGHT:w(-n.keyPanSpeed,0),t=!0}t&&(e.preventDefault(),n.update())}(e)}function X(e){!1!==n.enabled&&e.preventDefault()}function Z(e){delete y[e.pointerId];for(let t=0;t<T.length;t++)if(T[t].pointerId==e.pointerId)return void T.splice(t,1)}function K(e){let t=y[e.pointerId];void 0===t&&(t=new Vector2,y[e.pointerId]=t),t.set(e.pageX,e.pageY)}function B(e){const t=e.pointerId===T[0].pointerId?T[1]:T[0];return y[t.pointerId]}n.domElement.addEventListener("contextmenu",X),n.domElement.addEventListener("pointerdown",D),n.domElement.addEventListener("pointercancel",V),n.domElement.addEventListener("wheel",z,{passive:!1}),this.update()}}class MapControls extends OrbitControls{constructor(e,t){super(e,t),this.screenSpacePanning=!1,this.mouseButtons.LEFT=MOUSE.PAN,this.mouseButtons.RIGHT=MOUSE.ROTATE,this.touches.ONE=TOUCH.PAN,this.touches.TWO=TOUCH.DOLLY_ROTATE}}export{OrbitControls,MapControls};