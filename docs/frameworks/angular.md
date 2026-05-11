# Angular

Use `@ko1265/file-preview-kit-web-components` directly for now. There is no Angular adapter package yet.

## Install

```bash
pnpm add @ko1265/file-preview-kit-web-components @ko1265/file-preview-kit-core
```

`@ko1265/file-preview-kit-core` is only needed if you want to create a custom `FilePreviewService`.

## Browser-only boundary

- `@ko1265/file-preview-kit-web-components` is browser-only.
- In a normal Angular SPA, register the element from client-side code.
- In Angular SSR, keep both `registerFilePreviewElement()` and DOM property/event work behind a browser check.

## CUSTOM_ELEMENTS_SCHEMA

Angular needs `CUSTOM_ELEMENTS_SCHEMA` for the `file-preview` tag.

```ts
import { CUSTOM_ELEMENTS_SCHEMA, Component } from "@angular/core";

@Component({
  selector: "app-preview",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: "./preview.component.html"
})
export class PreviewComponent {}
```

## Browser-only component example

```ts
import {
  AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  OnDestroy,
  ViewChild
} from "@angular/core";
import { FilePreviewService } from "@ko1265/file-preview-kit-core";

interface FilePreviewElement extends HTMLElement {
  requestConfig?: {
    credentials?: RequestCredentials;
    headers?: Record<string, string>;
  };
  previewService?: FilePreviewService;
}

@Component({
  selector: "app-preview",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <file-preview
      #preview
      src="/private/report.pdf"
      file-name="report.pdf"
      mime-type="application/pdf"
    ></file-preview>
  `
})
export class PreviewComponent implements AfterViewInit, OnDestroy {
  @ViewChild("preview", { static: true })
  previewRef!: ElementRef<FilePreviewElement>;

  private readonly previewService = new FilePreviewService({
    defaultRequest: {
      credentials: "include"
    }
  });

  private readonly handleLoad = () => {
    console.log("preview loaded");
  };

  private readonly handleError = (event: Event) => {
    console.error("preview failed", (event as CustomEvent).detail);
  };

  async ngAfterViewInit() {
    const { registerFilePreviewElement } = await import(
      "@ko1265/file-preview-kit-web-components"
    );
    registerFilePreviewElement();

    const preview = this.previewRef.nativeElement;

    preview.requestConfig = {
      credentials: "include",
      headers: {
        "X-Document-Scope": "private"
      }
    };

    preview.previewService = this.previewService;

    preview.addEventListener("file-preview:load", this.handleLoad);
    preview.addEventListener("file-preview:error", this.handleError);
  }

  ngOnDestroy() {
    const preview = this.previewRef?.nativeElement;
    if (!preview) {
      return;
    }

    preview.removeEventListener("file-preview:load", this.handleLoad);
    preview.removeEventListener("file-preview:error", this.handleError);
  }
}
```

## Angular SSR note

If your app uses Angular SSR, avoid importing the Web Component package on a server path. Load it only in the browser:

```ts
import {
  AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  Inject,
  PLATFORM_ID,
  ViewChild
} from "@angular/core";
import { isPlatformBrowser } from "@angular/common";

@Component({
  selector: "app-preview",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<file-preview #preview src="/sample.pdf"></file-preview>`
})
export class PreviewComponent implements AfterViewInit {
  @ViewChild("preview", { static: true })
  previewRef!: ElementRef<HTMLElement>;

  constructor(@Inject(PLATFORM_ID) private readonly platformId: object) {}

  async ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const { registerFilePreviewElement } = await import(
      "@ko1265/file-preview-kit-web-components"
    );

    registerFilePreviewElement();

    this.previewRef.nativeElement.addEventListener("file-preview:load", () => {
      console.log("preview loaded");
    });
  }
}
```

## Notes

- Use DOM properties for `requestConfig` and `previewService`. Do not try to serialize them into template attributes.
- String values such as `src`, `file-name`, and `mime-type` can stay as element attributes.
- Custom events come from the underlying element, so listen to them with `addEventListener` on the native element.
- Remote preview still depends on browser-readable URLs, compatible CORS, and auth that works in the browser.
