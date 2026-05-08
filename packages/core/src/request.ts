import type {
  FilePreviewFetchContext,
  FilePreviewFetcher,
  FilePreviewRequestConfig
} from "@file-preview-kit/shared";

export function mergeRequestConfigs(
  ...configs: Array<FilePreviewRequestConfig | undefined>
): FilePreviewRequestConfig | undefined {
  const mergedHeaders: Record<string, string> = {};
  let hasHeaders = false;
  let merged: FilePreviewRequestConfig | undefined;
  let mergedOffice: FilePreviewRequestConfig["office"] | undefined;
  let hasOffice = false;

  for (const config of configs) {
    if (!config) {
      continue;
    }

    merged = {
      ...(merged ?? {}),
      ...config
    };

    if (config.headers) {
      hasHeaders = true;
      Object.assign(mergedHeaders, config.headers);
    }

    if (config.office) {
      hasOffice = true;
      mergedOffice = {
        ...(mergedOffice ?? {}),
        ...config.office,
        workbook: {
          ...(mergedOffice?.workbook ?? {}),
          ...(config.office.workbook ?? {})
        }
      };
    }
  }

  if (!merged) {
    return undefined;
  }

  return {
    ...merged,
    ...(hasHeaders ? { headers: mergedHeaders } : {}),
    ...(hasOffice && mergedOffice ? { office: mergedOffice } : {})
  };
}

export function createRequestInit(
  config: FilePreviewRequestConfig | undefined,
  signal: AbortSignal | undefined
): RequestInit | undefined {
  const headers = new Headers(config?.headers);
  if (config?.authToken && !headers.has("Authorization")) {
    const authScheme = config.authScheme ?? "Bearer";
    headers.set("Authorization", `${authScheme} ${config.authToken}`);
  }

  const init: RequestInit = {
    ...(config?.cache ? { cache: config.cache } : {}),
    ...(config?.credentials ? { credentials: config.credentials } : {}),
    ...(config?.integrity ? { integrity: config.integrity } : {}),
    ...(config?.mode ? { mode: config.mode } : {}),
    ...(config?.redirect ? { redirect: config.redirect } : {}),
    ...(config?.referrerPolicy ? { referrerPolicy: config.referrerPolicy } : {}),
    ...(signal ? { signal } : {})
  };

  if ([...headers.keys()].length > 0) {
    init.headers = headers;
  }

  return Object.keys(init).length > 0 ? init : undefined;
}

export const defaultPreviewFetcher: FilePreviewFetcher = async (
  input: string,
  init: RequestInit,
  _context: FilePreviewFetchContext
) => fetch(input, init);
