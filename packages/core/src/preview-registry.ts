import type {
  FilePreviewPlugin,
  FilePreviewResolution,
  FileSource
} from "@file-preview-kit/shared";
import { normalizeFileSource } from "./file-source";

export class FilePreviewRegistry {
  private readonly plugins = new Map<string, FilePreviewPlugin>();

  register(plugin: FilePreviewPlugin): this {
    this.plugins.set(plugin.descriptor.id, plugin);
    return this;
  }

  unregister(id: string): boolean {
    return this.plugins.delete(id);
  }

  list(): FilePreviewPlugin[] {
    return [...this.plugins.values()].sort((left, right) => {
      const leftPriority = left.descriptor.priority ?? 0;
      const rightPriority = right.descriptor.priority ?? 0;
      return rightPriority - leftPriority;
    });
  }

  resolve(source: FileSource): FilePreviewResolution | null {
    const normalizedSource = normalizeFileSource(source);

    for (const plugin of this.list()) {
      if (plugin.canPreview({ source: normalizedSource })) {
        return { plugin, source: normalizedSource };
      }
    }

    return null;
  }
}

