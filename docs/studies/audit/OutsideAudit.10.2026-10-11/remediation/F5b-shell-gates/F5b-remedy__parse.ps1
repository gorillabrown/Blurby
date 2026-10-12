$lines = Get-Content -Encoding utf8 C:\Projects\Blurby\ROADMAP.md
foreach ($n in 229,261) {
  $m = [regex]::Matches($lines[$n-1], '`(rg [^`]+)`')
  foreach ($x in $m) { $t=$null;$e=$null; $ast=[System.Management.Automation.Language.Parser]::ParseInput($x.Groups[1].Value,[ref]$t,[ref]$e)
    $els = $ast.EndBlock.Statements[0].PipelineElements[0].CommandElements | ForEach-Object { "<" + $_.Extent.Text + ">" }
    "line $n errors=$($e.Count) $(@($e|%{$_.Message}) -join '|') elems=$($els -join ' ')" }
}
"rg resolves: " + [bool](Get-Command rg -ErrorAction SilentlyContinue)
