# Parse every extracted command (placeholders substituted) with this host's PowerShell parser.
param([string]$File, [string]$Out)
$lines = Get-Content -LiteralPath $File -Encoding UTF8
$res = New-Object System.Collections.Generic.List[string]
$i = 0; $bad = 0; $multi = 0
foreach ($line in $lines) {
  if (-not $line.Trim()) { continue }
  $i++
  $t = $null; $e = $null
  $ast = [System.Management.Automation.Language.Parser]::ParseInput($line, [ref]$t, [ref]$e)
  $stmts = @($ast.EndBlock.Statements)
  $shape = 'n/a'
  if ($stmts.Count -eq 1 -and $stmts[0] -is [System.Management.Automation.Language.PipelineAst] -and @($stmts[0].PipelineElements).Count -eq 1) {
    $c = $stmts[0].PipelineElements[0]
    $redir = @($c.Redirections).Count
    $shape = "single-command elements=$(@($c.CommandElements).Count) redirections=$redir invocation=$($c.InvocationOperator)"
  } else { $multi++; $shape = "NOT a single command (statements=$($stmts.Count))" }
  if ($e.Count) { $bad++; $res.Add(("{0:d3} PARSE-ERROR {1} :: {2}" -f $i, $e[0].Message, $line)) }
  else { $res.Add(("{0:d3} ok {1} :: {2}" -f $i, $shape, $line)) }
}
$res.Add("SUMMARY $($PSVersionTable.PSEdition) $($PSVersionTable.PSVersion): $i commands, $bad parse errors, $multi not single-command")
[System.IO.File]::WriteAllText($Out, (($res -join "`n") + "`n"), (New-Object System.Text.UTF8Encoding($false)))
$res[-1]
