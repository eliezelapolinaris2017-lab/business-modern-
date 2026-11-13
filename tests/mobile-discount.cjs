const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const src=fs.readFileSync('mobile.js','utf8');
const ctx={invoiceLines:[],taxRate:()=>0.115};vm.createContext(ctx);
vm.runInContext(src.slice(src.indexOf('function newLine('),src.indexOf('function cleanPayload(')),ctx);
ctx.invoiceLines=[ctx.newLine('Servicio',1,100,0,true),ctx.newLine('Descuento',1,0,25,false)];
let c=ctx.invoiceCalc();assert.equal(c.subtotal,100);assert.equal(c.discount,25);assert.equal(c.ivu,11.5);assert.equal(c.total,86.5);assert.equal(ctx.lineNet(ctx.invoiceLines[1]),-25);
const saved=JSON.parse(JSON.stringify(ctx.invoiceLines));ctx.invoiceLines=saved.map(l=>ctx.newLine(l.description,l.qty,l.price,l.discount,l.taxable));assert.equal(ctx.invoiceCalc().total,86.5);assert.equal(ctx.isDiscountLine(ctx.invoiceLines[1]),true);
ctx.invoiceLines=[ctx.newLine('Servicio',2,50,10,true)];assert.equal(ctx.lineNet(ctx.invoiceLines[0]),90);assert.equal(ctx.invoiceCalc().discount,10);
console.log('PASS standalone discount: subtract once, preserve service tax, negative document line, save/reopen, existing service discounts');
