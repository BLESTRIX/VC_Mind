import { sha256 } from '../../lib/hashing.js';
import { AppError } from '../../lib/errors.js';
export type ExtractedDocument={documentId:string;pages:Array<{pageNumber:number;text:string;textHash:string}>;pageCount:number;characterCount:number;warnings:string[]};
const normalize=(text:string)=>text.replace(/\0/g,'').replace(/[ \t]+/g,' ').replace(/\n{3,}/g,'\n\n').trim();
export async function extractPdf(documentId:string,buffer:Uint8Array,maxPages:number):Promise<ExtractedDocument>{
 const pdfjs=await import('pdfjs-dist/legacy/build/pdf.mjs');let document;
 try{document=await pdfjs.getDocument({data:buffer,useSystemFonts:true}).promise;}catch{throw new AppError('DOCUMENT_PROCESSING_FAILED','PDF is corrupt or encrypted and could not be read',422);}
 if(document.numPages>maxPages)throw new AppError('DOCUMENT_PROCESSING_FAILED',`PDF exceeds the ${maxPages}-page limit`,422);
 const pages=[];const warnings:string[]=[];let characterCount=0;
 for(let pageNumber=1;pageNumber<=document.numPages;pageNumber++){const page=await document.getPage(pageNumber);const content=await page.getTextContent();const text=normalize(content.items.map((item)=>('str' in item?item.str:'')).join(' '));if(text.length<30)warnings.push(`Page ${pageNumber} is empty or likely image-only.`);characterCount+=text.length;pages.push({pageNumber,text,textHash:sha256(text)});}
 if(characterCount<100)warnings.push('Document appears image-only or has insufficient extractable text.');return{documentId,pages,pageCount:document.numPages,characterCount,warnings};
}
