import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

const byId = (id) => document.getElementById(id);
const host = byId("pgf-viewport");
if (host) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#142238");
  const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 1200);
  camera.position.set(0, 26, 43);
  camera.lookAt(0, 0, 0);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
  renderer.shadowMap.enabled = true;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight("#c4ddf3", "#34402e", 1.65));
  const sun = new THREE.DirectionalLight("#fff1d7", 2.15);
  sun.position.set(55, 70, -28);
  sun.castShadow = true;
  scene.add(sun);

  const terrain = new THREE.Mesh(new THREE.PlaneGeometry(96, 96, 96, 96), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, side: THREE.DoubleSide }));
  terrain.rotation.x = -Math.PI / 2;
  terrain.receiveShadow = true;
  scene.add(terrain);
  const water = new THREE.Mesh(new THREE.PlaneGeometry(700, 700), new THREE.MeshPhysicalMaterial({ color: "#316987", roughness: .25, transparent: true, opacity: .7 }));
  water.rotation.x = -Math.PI / 2;
  scene.add(water);
  const grid = new THREE.GridHelper(96, 24, "#8aacca", "#344c68");
  scene.add(grid);

  const orbit = new OrbitControls(camera, renderer.domElement);
  orbit.enableDamping = true;
  orbit.dampingFactor = .075;
  orbit.maxPolarAngle = Math.PI * .48;
  orbit.minDistance = 9;
  orbit.maxDistance = 220;
  orbit.target.set(0, 0, 0);
  const pointer = new PointerLockControls(camera, renderer.domElement);
  const raycaster = new THREE.Raycaster();
  const keys = new Set();
  const state = {
    seed: 784215, width: 96, depth: 96, amplitude: 9, frequency: .055, projectName: "Untitled World",
    waterLevel: -1.5, fog: true, mode: "edit", placing: null, selected: null, objects: [],
    verticalVelocity: 0, lastTime: 0
  };
  const fraction = (value) => value - Math.floor(value);
  const hash = (x, z, seed) => fraction(Math.sin(x * 127.1 + z * 311.7 + seed * .017) * 43758.5453) * 2 - 1;
  const smooth = (value) => value * value * (3 - 2 * value);
  function noise(seed, x, z) {
    const x0 = Math.floor(x), z0 = Math.floor(z), tx = smooth(fraction(x)), tz = smooth(fraction(z));
    const a = hash(x0, z0, seed), b = hash(x0 + 1, z0, seed);
    const c = hash(x0, z0 + 1, seed), d = hash(x0 + 1, z0 + 1, seed);
    const upper = a + (b - a) * tx, lower = c + (d - c) * tx;
    return upper + (lower - upper) * tz;
  }
  function heightAt(x, z) {
    const base = noise(state.seed, x * state.frequency, z * state.frequency) * .72;
    const detail = noise(state.seed + 101, x * state.frequency * 2.1, z * state.frequency * 2.1) * .35;
    const ridge = (1 - Math.abs(noise(state.seed + 211, x * state.frequency * .55, z * state.frequency * .55))) * .18;
    return (base + detail + ridge) * state.amplitude;
  }
  const mat = (color, roughness = .84) => new THREE.MeshStandardMaterial({ color, roughness, metalness: .08 });
  function makeAsset(kind, x, z, id) {
    const group = new THREE.Group();
    group.userData.assetId = id;
    group.position.set(x, heightAt(x, z), z);
    const colorMap = { outpost: "#829ebc", beacon: "#558fa8", tree: "#4c846f", rock: "#8d8b84", crate: "#b18a5f" };
    const base = mat(colorMap[kind] || "#8ba7c7");
    const add = (geometry, material, y, sx = 1, sy = 1, sz = 1) => {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.y = y;
      mesh.scale.set(sx, sy, sz);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData.assetId = id;
      group.add(mesh);
    };
    if (kind === "outpost") {
      add(new THREE.BoxGeometry(8, 4, 8), base, 2);
      add(new THREE.BoxGeometry(8.6, .45, 8.6), mat("#b5c7da", .55), 4.2);
      add(new THREE.BoxGeometry(1.2, 2.3, .18), mat("#263a51"), 1.15);
    } else if (kind === "beacon") {
      add(new THREE.CylinderGeometry(.55, .9, 3.6, 8), base, 1.8);
      add(new THREE.SphereGeometry(.55, 12, 10), new THREE.MeshStandardMaterial({ color: "#6bd9ff", emissive: "#42c8ff", emissiveIntensity: 1.4 }), 3.85);
    } else if (kind === "tree") {
      add(new THREE.CylinderGeometry(.25, .42, 3.2, 7), mat("#71563e"), 1.6);
      add(new THREE.DodecahedronGeometry(1.65, 1), base, 3.55, 1, 1.25, 1);
    } else if (kind === "rock") {
      add(new THREE.DodecahedronGeometry(1.25, 1), base, .85, 1.25, .8, 1.05);
    } else {
      add(new THREE.BoxGeometry(1.8, 1.8, 1.8), base, .9);
      add(new THREE.BoxGeometry(1.92, .12, 1.92), mat("#d3deea", .55), 1.55);
    }
    return group;
  }
  function rebuildTerrain() {
    const geometry = new THREE.PlaneGeometry(state.width, state.depth, 100, 100);
    geometry.rotateX(-Math.PI / 2);
    const positions = geometry.attributes.position;
    const colors = [];
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i), z = positions.getZ(i);
      const elevation = heightAt(x, z);
      positions.setY(i, elevation);
      const wetness = noise(state.seed + 991, x * .12, z * .12);
      const color = elevation < -1.8 ? new THREE.Color("#315e78") :
        elevation > 5.5 ? new THREE.Color("#858c92") :
        wetness < -.25 ? new THREE.Color("#a78a68") :
        wetness > .35 ? new THREE.Color("#477768") : new THREE.Color("#829172");
      colors.push(color.r, color.g, color.b);
    }
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geometry.computeVertexNormals();
    terrain.geometry.dispose();
    terrain.geometry = geometry;
    water.position.y = state.waterLevel;
    const size = Math.max(state.width, state.depth);
    grid.scale.set(size / 96, 1, size / 96);
    grid.position.y = state.waterLevel + .08;
    scene.fog = state.fog ? new THREE.Fog("#172b40", size * .55, size * 2.7) : null;
    const angle = THREE.MathUtils.degToRad(-28);
    sun.position.set(Math.cos(angle) * 75, 70, Math.sin(angle) * 75);
    state.objects.forEach((item) => { scene.remove(item.group); dispose(item.group); });
    state.objects = state.objects.map((item) => ({ ...item, group: makeAsset(item.kind, item.x, item.z, item.id) }));
    state.objects.forEach((item) => scene.add(item.group));
    selectObject(state.selected);
  }
  function dispose(group) {
    group.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        node.geometry.dispose();
        (Array.isArray(node.material) ? node.material : [node.material]).forEach((material) => material.dispose());
      }
    });
  }
  function selectObject(id) {
    state.selected = id;
    const selected = state.objects.find((item) => item.id === id);
    byId("pgf-transform").hidden = !selected;
    if (selected) {
      byId("pgf-x").value = selected.x;
      byId("pgf-z").value = selected.z;
      byId("pgf-scale").value = selected.scale;
      byId("pgf-x-value").textContent = selected.x.toFixed(1);
      byId("pgf-z-value").textContent = selected.z.toFixed(1);
      byId("pgf-scale-value").textContent = selected.scale.toFixed(2) + "×";
    }
    document.querySelectorAll(".pgf-object").forEach((button) => button.classList.toggle("active", button.dataset.id === id));
  }
  function addObject(kind, x, z) {
    const id = "asset-" + Math.random().toString(36).slice(2, 10);
    const label = { outpost: "Outpost", beacon: "Signal beacon", tree: "Alien tree", rock: "Rock formation", crate: "Cargo crate" }[kind];
    const object = { id, kind, name: label + " " + (state.objects.filter((item) => item.kind === kind).length + 1), x, z, y: 0, rotation: 0, scale: 1 };
    object.group = makeAsset(kind, x, z, id);
    state.objects.push(object);
    scene.add(object.group);
    state.placing = null;
    document.querySelectorAll(".pgf-asset").forEach((button) => button.classList.remove("active"));
    selectObject(id);
    renderObjectList();
  }
  function renderObjectList() {
    const list = byId("pgf-object-list");
    list.replaceChildren();
    if (!state.objects.length) {
      const empty = document.createElement("p");
      empty.className = "pgf-note";
      empty.textContent = "No objects placed. Choose an asset, then click the terrain.";
      list.appendChild(empty);
      return;
    }
    state.objects.forEach((item) => {
      const button = document.createElement("button");
      button.className = "pgf-object" + (state.selected === item.id ? " active" : "");
      button.dataset.id = item.id;
      const swatch = document.createElement("i");
      swatch.style.background = ({ outpost: "#829ebc", beacon: "#558fa8", tree: "#4c846f", rock: "#8d8b84", crate: "#b18a5f" })[item.kind];
      const title = document.createElement("span");
      title.textContent = item.name;
      const meta = document.createElement("small");
      meta.textContent = item.kind + " · " + item.x.toFixed(1) + ", " + item.z.toFixed(1);
      title.appendChild(meta);
      button.append(swatch, title);
      button.addEventListener("click", () => selectObject(item.id));
      list.appendChild(button);
    });
  }
  function syncSelected() {
    const item = state.objects.find((entry) => entry.id === state.selected);
    if (!item) return;
    item.group.position.set(item.x, heightAt(item.x, item.z) + item.y, item.z);
    item.group.rotation.y = THREE.MathUtils.degToRad(item.rotation);
    item.group.scale.setScalar(item.scale);
    selectObject(item.id);
    renderObjectList();
  }
  document.querySelectorAll(".pgf-asset").forEach((button) => button.addEventListener("click", () => {
    state.mode = "edit";
    pointer.unlock();
    orbit.enabled = true;
    state.placing = button.dataset.kind;
    document.querySelectorAll(".pgf-asset").forEach((item) => item.classList.toggle("active", item === button));
    byId("pgf-hint").textContent = "CLICK THE TERRAIN TO PLACE " + state.placing.toUpperCase();
  }));
  byId("pgf-seed").addEventListener("change", (event) => { state.seed = Math.max(0, Math.min(4294967295, Number(event.target.value) || 0)); rebuildTerrain(); });
  byId("pgf-elevation").addEventListener("input", (event) => { state.amplitude = Number(event.target.value); byId("pgf-elevation-value").textContent = state.amplitude.toFixed(1); rebuildTerrain(); });
  byId("pgf-roughness").addEventListener("input", (event) => { state.frequency = Number(event.target.value); byId("pgf-roughness-value").textContent = state.frequency.toFixed(3); rebuildTerrain(); });
  byId("pgf-water").addEventListener("input", (event) => { state.waterLevel = Number(event.target.value); byId("pgf-water-value").textContent = state.waterLevel.toFixed(1); water.position.y = state.waterLevel; grid.position.y = state.waterLevel + .08; });
  byId("pgf-width").addEventListener("input", (event) => { state.width = Number(event.target.value); byId("pgf-width-value").textContent = state.width + " m"; rebuildTerrain(); });
  byId("pgf-depth").addEventListener("input", (event) => { state.depth = Number(event.target.value); byId("pgf-depth-value").textContent = state.depth + " m"; rebuildTerrain(); });
  byId("pgf-fog").addEventListener("change", (event) => { state.fog = event.target.checked; rebuildTerrain(); });

  ["x", "z", "scale"].forEach((key) => byId("pgf-" + key).addEventListener("input", (event) => {
    const item = state.objects.find((entry) => entry.id === state.selected);
    if (!item) return;
    item[key] = Number(event.target.value);
    syncSelected();
  }));
  byId("pgf-rotate").addEventListener("click", () => {
    const item = state.objects.find((entry) => entry.id === state.selected);
    if (item) { item.rotation = (item.rotation + 15) % 360; syncSelected(); }
  });
  byId("pgf-duplicate").addEventListener("click", () => {
    const item = state.objects.find((entry) => entry.id === state.selected);
    if (item) addObject(item.kind, item.x + 3, item.z + 3);
  });
  byId("pgf-delete").addEventListener("click", () => {
    const index = state.objects.findIndex((entry) => entry.id === state.selected);
    if (index >= 0) {
      scene.remove(state.objects[index].group);
      dispose(state.objects[index].group);
      state.objects.splice(index, 1);
      selectObject(null);
      renderObjectList();
    }
  });
  renderer.domElement.addEventListener("click", (event) => {
    if (state.mode === "play") {
      if (!pointer.isLocked) pointer.lock();
      return;
    }
    const bounds = renderer.domElement.getBoundingClientRect();
    const coords = new THREE.Vector2(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -((event.clientY - bounds.top) / bounds.height) * 2 + 1);
    raycaster.setFromCamera(coords, camera);
    if (state.placing) {
      const hit = raycaster.intersectObject(terrain, false)[0];
      if (hit) {
        addObject(state.placing, hit.point.x, hit.point.z);
        byId("pgf-hint").textContent = "ASSET PLACED · SELECT OR CHOOSE ANOTHER";
      }
      return;
    }
    const hit = raycaster.intersectObjects(state.objects.map((item) => item.group), true)[0];
    if (hit) {
      let node = hit.object;
      while (node && !node.userData.assetId) node = node.parent;
      selectObject(node?.userData.assetId || null);
    } else selectObject(null);
  });

  byId("pgf-play").addEventListener("click", () => {
    state.mode = state.mode === "play" ? "edit" : "play";
    orbit.enabled = state.mode === "edit";
    pointer.unlock();
    if (state.mode === "play") {
      camera.position.set(0, heightAt(0, 18) + 1.7, 18);
      camera.lookAt(0, heightAt(0, 0), 0);
      byId("pgf-play").textContent = "■ Exit world";
      byId("pgf-mode-label").textContent = "● EXPLORATION MODE";
      byId("pgf-hint").textContent = "CLICK WORLD TO CAPTURE MOUSE · WASD MOVE · SHIFT SPRINT · SPACE JUMP · ESC RELEASE";
    } else {
      camera.position.set(0, 26, 43);
      orbit.target.set(0, 0, 0);
      byId("pgf-play").textContent = "▶ Enter world";
      byId("pgf-mode-label").textContent = "● LIVE WORLD PREVIEW";
      byId("pgf-hint").textContent = "ORBIT: DRAG · ZOOM: SCROLL · SELECT OR PLACE OBJECTS";
    }
  });
  byId("pgf-export").addEventListener("click", () => {
    const documentData = { format: "pgf-preview-scene", version: 1, seed: state.seed, world: { width: state.width, depth: state.depth, amplitude: state.amplitude, frequency: state.frequency, water_level: state.waterLevel, fog: state.fog }, objects: state.objects.map(({ group, ...item }) => item) };
    const url = URL.createObjectURL(new Blob([JSON.stringify(documentData, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "procedural-world-scene.json";
    anchor.click();
    URL.revokeObjectURL(url);
  });
  byId("pgf-reset").addEventListener("click", () => { camera.position.set(0, 26, 43); orbit.target.set(0, 0, 0); orbit.update(); });
  window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    if (["w", "a", "s", "d", " ", "shift"].includes(key)) {
      keys.add(key);
      if (state.mode === "play") event.preventDefault();
    }
  });
  window.addEventListener("keyup", (event) => keys.delete(event.key.toLowerCase()));

  const projectStatus = (message) => { const node = byId("nx-save-state"); if (node) node.textContent = message; };
  const projectData = () => ({
    format: "nexora-foundry-project", schema_version: 1,
    project: { name: (byId("nx-project-name")?.value || "Untitled World").trim().slice(0, 64) || "Untitled World", saved_at: new Date().toISOString() },
    world: { seed: state.seed, width: state.width, depth: state.depth, amplitude: state.amplitude, frequency: state.frequency, water_level: state.waterLevel, fog: state.fog },
    scene: { objects: state.objects.map(({ group, ...item }) => item) },
    pipeline: { authoring: "browser-workspace", native_assembly: "not_run", build_status: "not_built" }
  });
  function applyProject(data) {
    if (!data || data.format !== "nexora-foundry-project" || data.schema_version !== 1 || !data.world || !data.scene || !Array.isArray(data.scene.objects)) throw new Error("Unsupported or malformed Nexora project file.");
    const w = data.world;
    const number = (v, fallback, min, max) => Math.max(min, Math.min(max, Number.isFinite(Number(v)) ? Number(v) : fallback));
    state.seed = number(w.seed, 784215, 0, 4294967295);
    state.width = number(w.width, 96, 48, 192); state.depth = number(w.depth, 96, 48, 192);
    state.amplitude = number(w.amplitude, 9, 0, 24); state.frequency = number(w.frequency, .055, .018, .12);
    state.waterLevel = number(w.water_level, -1.5, -8, 8); state.fog = Boolean(w.fog);
    const name = String(data.project?.name || "Imported World").slice(0,64);
    byId("nx-project-name").value = name; state.projectName = name;
    byId("pgf-seed").value = state.seed; byId("pgf-elevation").value = state.amplitude; byId("pgf-elevation-value").textContent = state.amplitude.toFixed(1);
    byId("pgf-roughness").value = state.frequency; byId("pgf-roughness-value").textContent = state.frequency.toFixed(3);
    byId("pgf-water").value = state.waterLevel; byId("pgf-water-value").textContent = state.waterLevel.toFixed(1);
    byId("pgf-width").value = state.width; byId("pgf-width-value").textContent = state.width + " m";
    byId("pgf-depth").value = state.depth; byId("pgf-depth-value").textContent = state.depth + " m"; byId("pgf-fog").checked = state.fog;
    state.objects.forEach(item => { scene.remove(item.group); dispose(item.group); });
    state.objects = []; state.selected = null;
    rebuildTerrain();
    for (const raw of data.scene.objects) {
      if (!["outpost","beacon","tree","rock","crate"].includes(raw.kind)) continue;
      const x = number(raw.x,0,-state.width/2,state.width/2), z = number(raw.z,0,-state.depth/2,state.depth/2);
      const id = "asset-" + Math.random().toString(36).slice(2,10);
      const item = { id, kind: raw.kind, name: String(raw.name || raw.kind).slice(0,80), x, z, y: number(raw.y,0,-20,50), rotation: number(raw.rotation,0,0,360), scale: number(raw.scale,1,.25,3) };
      item.group = makeAsset(item.kind,item.x,item.z,id); item.group.position.y += item.y; item.group.rotation.y = THREE.MathUtils.degToRad(item.rotation); item.group.scale.setScalar(item.scale);
      state.objects.push(item); scene.add(item.group);
    }
    renderObjectList(); selectObject(null); projectStatus("PROJECT OPENED · UNSAVED CHANGES");
  }
  function validateProject() {
    const data = projectData(), errors = [], warnings = [];
    if (!data.project.name.trim()) errors.push("Project name is required.");
    if (data.scene.objects.length === 0) warnings.push("Scene has no placed assets.");
    if (data.scene.objects.length > 500) errors.push("Scene exceeds the 500-object workspace limit.");
    for (const [i,item] of data.scene.objects.entries()) {
      if (!["outpost","beacon","tree","rock","crate"].includes(item.kind)) errors.push("Object " + (i+1) + " has an unsupported asset type.");
      if (![item.x,item.z,item.scale,item.rotation].every(Number.isFinite)) errors.push("Object " + (i+1) + " has invalid transform data.");
      if (Math.abs(item.x) > state.width/2 || Math.abs(item.z) > state.depth/2) errors.push("Object " + (i+1) + " is outside world bounds.");
    }
    const box = byId("nx-validation");
    if (errors.length) { box.dataset.state="fail"; box.textContent="VALIDATION FAILED · " + errors.join(" "); return false; }
    box.dataset.state="pass"; box.textContent="STRUCTURE VALID · " + data.scene.objects.length + " scene object(s). " + (warnings.length ? "Warnings: " + warnings.join(" ") : "No structural warnings.") + " Native engine build and gameplay tests have not been run.";
    return true;
  }
  function downloadProject() {
    const data = projectData();
    const blob = new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    const url = URL.createObjectURL(blob), a = document.createElement("a");
    a.href=url; a.download=(data.project.name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"") || "nexora-project")+".nexora.json";
    a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  byId("nx-project-name").addEventListener("input", () => { state.projectName=byId("nx-project-name").value; projectStatus("UNSAVED CHANGES"); });
  byId("nx-save").addEventListener("click", () => {
    const data=projectData(); localStorage.setItem("nexora-foundry-project-v1",JSON.stringify(data)); projectStatus("SAVED LOCALLY · "+new Date().toLocaleTimeString());
  });
  byId("nx-load").addEventListener("click", () => byId("nx-file").click());
  byId("nx-file").addEventListener("change", async (event) => {
    const file=event.target.files?.[0]; if(!file) return;
    try { applyProject(JSON.parse(await file.text())); } catch(error) { const box=byId("nx-validation"); box.dataset.state="fail"; box.textContent="OPEN FAILED · "+error.message; }
    event.target.value="";
  });
  byId("nx-export").addEventListener("click", () => { if(validateProject()) downloadProject(); });
  byId("nx-validate").addEventListener("click", validateProject);
  byId("nx-project-name").value=state.projectName;
  try { const saved=localStorage.getItem("nexora-foundry-project-v1"); if(saved) applyProject(JSON.parse(saved)); } catch(error) { projectStatus("LOCAL SAVE UNAVAILABLE"); }

  function resize() {
    const width = Math.max(1, host.clientWidth), height = Math.max(1, host.clientHeight);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }
  window.addEventListener("resize", resize);
  resize();
  rebuildTerrain();
  renderObjectList();
  const frame = (now) => {
    requestAnimationFrame(frame);
    const delta = Math.min(.05, state.lastTime ? (now - state.lastTime) / 1000 : .016);
    state.lastTime = now;
    if (state.mode === "play" && pointer.isLocked) {
      const forward = new THREE.Vector3();
      camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();
      const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).negate().normalize();
      const move = new THREE.Vector3();
      if (keys.has("w")) move.add(forward);
      if (keys.has("s")) move.sub(forward);
      if (keys.has("d")) move.add(right);
      if (keys.has("a")) move.sub(right);
      if (move.lengthSq()) move.normalize();
      camera.position.addScaledVector(move, (keys.has("shift") ? 16 : 8) * delta);
      camera.position.x = THREE.MathUtils.clamp(camera.position.x, -state.width / 2 + 1, state.width / 2 - 1);
      camera.position.z = THREE.MathUtils.clamp(camera.position.z, -state.depth / 2 + 1, state.depth / 2 - 1);
      const floor = heightAt(camera.position.x, camera.position.z) + 1.7;
      if (keys.has(" ") && camera.position.y <= floor + .04) state.verticalVelocity = 6.4;
      state.verticalVelocity -= 18 * delta;
      camera.position.y += state.verticalVelocity * delta;
      if (camera.position.y < floor) { camera.position.y = floor; state.verticalVelocity = 0; }
    } else orbit.update();
    renderer.render(scene, camera);
  };
  requestAnimationFrame(frame);
}
