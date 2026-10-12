// Read one gate result directory: decode UTF-8 or UTF-16LE (Windows PowerShell 5.1 redirection), return {exit, out[], err}.
const fs = require("fs");
const dec = (p) => { if (!fs.existsSync(p)) return null; const b = fs.readFileSync(p);
  if (b[0] === 0xff && b[1] === 0xfe) return b.slice(2).toString("utf16le");
  if (b[0] === 0xef && b[1] === 0xbb && b[2] === 0xbf) return b.slice(3).toString("utf8");
  return b.toString("utf8"); };
module.exports = (dir, id) => {
  const out = (dec(`${dir}/${id}.out`) ?? "").replace(/\r\n/g, "\n");
  const err = (dec(`${dir}/${id}.err`) ?? "").trim();
  const exit = Number((dec(`${dir}/${id}.exit`) ?? "NaN").trim());
  return { exit, out: out === "" ? [] : out.replace(/\n$/, "").split("\n"), err };
};
