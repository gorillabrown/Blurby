declare module "foliate-js/view.js" {
  export class View extends HTMLElement {
    book: any;
    renderer: any;
    lastLocation: any;
    history: any;
    open(file: File | Blob | string): Promise<void>;
    init(opts: { lastLocation?: string | null; showTextStart?: boolean }): Promise<void>;
    close(): void;
    goTo(target: string | number): Promise<any>;
    goToFraction(frac: number): Promise<void>;
    goToTextStart(): Promise<void>;
    getCFI(index: number, range?: Range): string;
    addAnnotation(annotation: any, remove?: boolean): Promise<any>;
    deleteAnnotation(annotation: any): Promise<any>;
    select(target: string): Promise<void>;
    deselect(): void;
  }
  export function makeBook(file: File | Blob | string): Promise<any>;
  export class ResponseError extends Error {}
  export class NotFoundError extends Error {}
  export class UnsupportedTypeError extends Error {}
}

declare module "foliate-js/epub.js" {
  export class EPUB {
    constructor(loader: any);
    init(): Promise<any>;
  }
}

declare module "foliate-js/epubcfi.js" {
  export function parse(cfi: string): any;
  export function fromRange(range: Range): any;
  export function toRange(doc: Document, parts: any): Range;
  export function joinIndir(base: string, relative: any): string;
  export const isCFI: RegExp;
  export const fake: {
    fromIndex(index: number): string;
    toIndex(parts: any): number;
  };
}

declare module "foliate-js/search.js" {
  export function search(book: any, query: string): AsyncGenerator<any>;
}

declare module "foliate-js/overlayer.js" {
  export class Overlayer {
    constructor(doc: Document);
    add(id: string, range: Range, draw: Function, opts?: any): void;
    remove(id: string): void;
    hitTest(event: Event): [string | null, Range | null];
    static highlight: Function;
    static underline: Function;
    static squiggly: Function;
    static outline: Function;
  }
}

declare module "foliate-js/tts.js" {
  export function* speak(doc: Document, range?: Range): Generator<any>;
}
