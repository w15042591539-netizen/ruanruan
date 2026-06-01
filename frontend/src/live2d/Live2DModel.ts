import { CubismFramework, Option as CubismOption } from "./Framework/src/live2dcubismframework";
import { CubismModelSettingJson } from "./Framework/src/cubismmodelsettingjson";
import { CubismUserModel } from "./Framework/src/model/cubismusermodel";
import { CubismMotion } from "./Framework/src/motion/cubismmotion";
import { CubismMotionManager } from "./Framework/src/motion/cubismmotionmanager";

let frameworkStarted = false;

class Model extends CubismUserModel {
  private _setting: CubismModelSettingJson | null = null;
  private _dir: string = "";
  private _textures: HTMLImageElement[] = [];
  private _motions = new Map<string, CubismMotion[]>();
  private _mgr = new CubismMotionManager();
  private _blinkTime = 0;
  private _idleTimer = 0;
  private _eyeIds: any[] = [];

  async load(jsonPath: string) {
    this._dir = jsonPath.substring(0, jsonPath.lastIndexOf("/") + 1);
    const jsonResp = await fetch(jsonPath);
    const jsonBuf = await jsonResp.arrayBuffer();
    this._setting = new CubismModelSettingJson(jsonBuf, jsonBuf.byteLength);

    const mocResp = await fetch(this._dir + this._setting.getModelFileName());
    this.loadModel(await mocResp.arrayBuffer());

    for (let i = 0; i < this._setting.getTextureCount(); i++) {
      const texPath = this._dir + this._setting.getTextureFileName(i);
      try {
        const img = new Image();
        img.src = texPath;
        await img.decode();
        this._textures.push(img);
      } catch (e) { console.error("[Live2D] texture:", texPath, e); }
    }

    const gc = this._setting.getMotionGroupCount();
    for (let i = 0; i < gc; i++) {
      const group = this._setting.getMotionGroupName(i);
      const mc = this._setting.getMotionCount(group);
      const motions: CubismMotion[] = [];
      for (let j = 0; j < mc; j++) {
        const path = this._dir + this._setting.getMotionFileName(group, j);
        try {
          const resp = await fetch(path);
          const buf = await resp.arrayBuffer();
          const m = this.loadMotion(buf, buf.byteLength, `${group}_${j}`);
          if (m) { (m as any).setEffectIds([], []); motions.push(m); }
        } catch (e) { console.error("[Live2D] motion:", path, e); }
      }
      this._motions.set(group, motions);
    }

    const ec = this._setting.getEyeBlinkParameterCount();
    for (let i = 0; i < ec; i++) this._eyeIds.push(this._setting.getEyeBlinkParameterId(i));

    this.setInitialized(true);
  }

  async setupRenderer(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true })!;
    gl.clearColor(0, 0, 0, 0);
    this.createRenderer(this.getModel()!.getCanvasWidth(), this.getModel()!.getCanvasHeight());
    const r = this.getRenderer();
    r.startUp(gl);
    await (r as any).loadShaders("/src/live2d/Framework/Shaders/WebGL/");
    this.setRenderTargetSize(canvas.width, canvas.height);

    for (let i = 0; i < this._textures.length; i++) {
      const tex = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this._textures[i]);
      gl.generateMipmap(gl.TEXTURE_2D);
      (r as any).bindTexture(i, tex);
    }
  }

  frame() {
    const model = this.getModel();
    if (!model) return;
    const dt = 1 / 60;

    model.loadParameters();

    // 眨眼
    this._blinkTime += dt;
    const phase = this._blinkTime % 4;
    let eye = 1.0;
    if (phase < 0.1) eye = phase / 0.1;
    else if (phase < 0.15) eye = 0.0;
    else if (phase < 0.25) eye = (phase - 0.15) / 0.1;
    if (this._mgr.isFinished()) {
      for (const id of this._eyeIds) model.setParameterValueById(id, eye);
    }

    // 动作更新
    this._mgr.updateMotion(model, dt);
    model.saveParameters();

    // 关键：将参数应用到顶点
    model.update();

    // 空闲动画
    this._idleTimer -= dt;
    if (this._idleTimer <= 0) {
      this._idleTimer = 5 + Math.random() * 5;
      this.playRandomIdle();
    }

    // 渲染
    const r = this.getRenderer();
    if (r) {
      try { (r as any).gl?.clear((r as any).gl?.COLOR_BUFFER_BIT); } catch { /* skip */ }
      r.drawModel();
    }
  }

  playMotion(group: string, index = -1) {
    const motions = this._motions.get(group);
    if (!motions?.length) return;
    const idx = index < 0 ? Math.floor(Math.random() * motions.length) : index;
    const m = motions[idx];
    if (m) this._mgr.startMotionPriority(m, false, 2);
  }

  playRandomIdle() { this.playMotion("Idle"); }
  playTap() { this.playMotion("Tap"); }

  canvasWidth(): number { return this.getModel()?.getCanvasWidth() ?? 1; }
  canvasHeight(): number { return this.getModel()?.getCanvasHeight() ?? 1; }
}

export function startFramework() {
  if (frameworkStarted) return;
  frameworkStarted = true;
  CubismFramework.startUp({ logFunction: () => {}, loggingLevel: 0 } as CubismOption);
  CubismFramework.initialize();
}

export function createModel() { return new Model(); }
