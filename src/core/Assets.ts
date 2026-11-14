import { LoadingManager, TextureLoader, type Texture } from 'three';
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js';

export class Assets {
  private readonly manager = new LoadingManager();
  private readonly models = new GLTFLoader(this.manager);
  private readonly textures = new TextureLoader(this.manager);

  constructor(report: (loaded: number, total: number) => void) {
    this.manager.onProgress = (_url, loaded, total) => report(loaded, total);
  }

  async model(url: string): Promise<GLTF> {
    try {
      return await this.models.loadAsync(url);
    } catch (cause) {
      throw new Error(`Não foi possível carregar o modelo: ${url}`, { cause });
    }
  }

  async texture(url: string): Promise<Texture> {
    try {
      return await this.textures.loadAsync(url);
    } catch (cause) {
      throw new Error(`Não foi possível carregar a textura: ${url}`, { cause });
    }
  }
}
