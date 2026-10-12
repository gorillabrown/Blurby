# Parse-only: tokenize each command with the PowerShell parser, never execute it.
param([string]$CmdFile)
$i = 0
foreach ($cmd in (Get-Content -LiteralPath $CmdFile)) {
  $i++
  if (-not $cmd.Trim()) { continue }
  $tokens = $null; $errs = $null
  $ast = [System.Management.Automation.Language.Parser]::ParseInput($cmd, [ref]$tokens, [ref]$errs)
  $cmds = $ast.FindAll({ param($n) $n -is [System.Management.Automation.Language.CommandAst] }, $true)
  $parts = foreach ($c in $cmds) { '[' + (($c.CommandElements | ForEach-Object { '<' + $_.Extent.Text + '>' }) -join ' ') + ']' }
  $e = ($errs | ForEach-Object { $_.Message }) -join ' | '
  "#$i ERR={$e} AST=" + ($parts -join ' ; ')
}
