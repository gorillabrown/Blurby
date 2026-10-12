// Compare regex vi.mock hits (v2) with syntax-tree vi.mock calls (v3) over the repo's scanned files.
const fs=require("fs"),path=require("path");const root=process.cwd();
const ts=require(path.join(root,"node_modules","typescript"));
const walk=(d,o=[])=>{if(!fs.existsSync(d))return o;for(const e of fs.readdirSync(d,{withFileTypes:true})){if(e.name==="node_modules"||e.name.startsWith("."))continue;const p=path.join(d,e.name);e.isDirectory()?walk(p,o):o.push(p);}return o;};
const files=[...["src","tests","main","scripts"].flatMap(d=>walk(path.join(root,d))),"main.js","preload.js","vite.config.js"].map(f=>path.resolve(root,f)).filter(f=>fs.existsSync(f)&&/\.(m?[jt]sx?|cjs)$/.test(f));
let a=[],b=[];
for(const f of files){const t=fs.readFileSync(f,"utf8");for(const m of t.matchAll(/\bvi\.mock\(\s*['"]([^'"]+)['"]/g))a.push(path.relative(root,f)+" "+m[1]);
const out=[];const v=n=>{if(ts.isCallExpression(n)&&n.expression.getText()==="vi.mock"&&n.arguments[0]&&ts.isStringLiteralLike(n.arguments[0]))out.push(n.arguments[0].text);ts.forEachChild(n,v);};v(ts.createSourceFile(f,t,ts.ScriptTarget.Latest,true));out.forEach(s=>b.push(path.relative(root,f)+" "+s));}
const sa=new Set(a),sb=new Set(b);
console.log("files",files.length,"regex",a.length,"ast",b.length,"onlyRegex",[...sa].filter(x=>!sb.has(x)),"onlyAst",[...sb].filter(x=>!sa.has(x)));
