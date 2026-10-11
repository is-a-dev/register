# Polls 7soumyajitghosh.is-a.dev until it resolves to Vercel (216.198.79.1)
# Run: powershell -File scripts/poll-subdomain.ps1
$domain = "7soumyajitghosh.is-a.dev"
$expected = "216.198.79.1"
$intervalSec = 120
$maxAttempts = 2160  # 120s * 2160 = 72h
$log = "scripts/poll-subdomain.log"
New-Item -ItemType Directory -Force -Path "scripts" | Out-Null
"Poll started $(Get-Date -Format o) for $domain expecting $expected" | Tee-Object -FilePath $log

for ($i = 1; $i -le $maxAttempts; $i++) {
  $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  try {
    $ans = Resolve-DnsName -Name $domain -Type A -ErrorAction Stop | Where-Object { $_.Section -eq "Answer" } | Select-Object -ExpandProperty IPAddress
    $ips = @($ans) -join ","
    "$ts attempt $i : A=[$ips]" | Tee-Object -FilePath $log -Append
    if ($ans -contains $expected) {
      "$ts SUCCESS: $domain resolves to $expected after $i attempts" | Tee-Object -FilePath $log -Append
      exit 0
    }
  } catch {
    "$ts attempt $i : DNS query failed: $($_.Exception.Message)" | Tee-Object -FilePath $log -Append
  }
  # Also check Cloudflare DoH as second opinion
  try {
    $doh = Invoke-RestMethod -Uri "https://cloudflare-dns.com/dns-query?name=$domain&type=A" -Headers @{ Accept = "application/dns-json" } -TimeoutSec 15
    $dohIps = ($doh.Answer | Where-Object { $_.type -eq 1 } | Select-Object -ExpandProperty data) -join ","
    "$ts attempt $i : DoH A=[$dohIps]" | Tee-Object -FilePath $log -Append
    if ($dohIps -match [regex]::Escape($expected)) {
      "$ts SUCCESS via DoH after $i attempts" | Tee-Object -FilePath $log -Append
      exit 0
    }
  } catch {
    "$ts attempt $i : DoH failed: $($_.Exception.Message)" | Tee-Object -FilePath $log -Append
  }
  Start-Sleep -Seconds $intervalSec
}
"Poll timed out after $maxAttempts attempts" | Tee-Object -FilePath $log -Append
exit 1
