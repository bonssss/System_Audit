import fs from 'fs/promises';
import path from 'path';

export interface StorageDriver {
  saveFile(key: string, content: Buffer | string): Promise<string>;
  readFile(key: string): Promise<Buffer>;
  deleteFile(key: string): Promise<void>;
}

class LocalStorageDriver implements StorageDriver {
  private baseDir: string;

  constructor() {
    this.baseDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || './uploads');
  }

  private async ensureDir(dirPath: string) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch {
      // already exists
    }
  }

  public async saveFile(key: string, content: Buffer | string): Promise<string> {
    const fullPath = path.join(this.baseDir, key);
    await this.ensureDir(path.dirname(fullPath));
    await fs.writeFile(fullPath, content);
    return fullPath;
  }

  public async readFile(key: string): Promise<Buffer> {
    const fullPath = path.join(this.baseDir, key);
    return await fs.readFile(fullPath);
  }

  public async deleteFile(key: string): Promise<void> {
    const fullPath = path.join(this.baseDir, key);
    try {
      await fs.unlink(fullPath);
    } catch {
      // ignore
    }
  }
}

export const storage: StorageDriver = new LocalStorageDriver();
