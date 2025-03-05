declare module "pdf-parse/lib/pdf-parse.js" {
  interface Result {
    text: string;
    info: any;
    metadata: any;
    version: string;
    numpages: number;
  }

  interface Options {
    pagerender?: (pageData: any) => string;
    max?: number;
    version?: string;
  }

  function PDFParse(dataBuffer: Buffer, options?: Options): Promise<Result>;
  export default PDFParse;
}
