var regNone = NewRegistrar("none");
var providerCf = DnsProvider(NewDnsProvider("cloudflare"));

var proxy = {
    on: { "cloudflare_proxy": "on" },
    off: { "cloudflare_proxy": "off" }
}

function getDomainsList(filesPath) {
    var result = [];
    var files = glob.apply(null, [filesPath, true, '.json']);

    for (var i = 0; i < files.length; i++) {
        var name = files[i].split('/').pop().replace(/\.json$/, '');

        result.push({ name: name, data: require(files[i]) });
    }

    return result;
}

var domains = getDomainsList('./domains');
var commit = {};

for (var idx in domains) {
    var domainName = "is-a.dev";
    var subdomainName = domains[idx].name;
    var domainData = domains[idx].data;
    var proxyState = proxy.on; // enabled by default

    if (!commit[domainName]) commit[domainName] = [];
    if (!domainData.proxied) proxyState = proxy.off;

    // Handle A records
    if (domainData.record.A) {
        for (var a in domainData.record.A) {
            commit[domainName].push(
                A(subdomainName, IP(domainData.record.A[a]), proxyState)
            );
        }
    }

    // Handle AAAA records
    if (domainData.record.AAAA) {
        for (var aaaa in domainData.record.AAAA) {
            commit[domainName].push(
                AAAA(subdomainName, domainData.record.AAAA[aaaa], proxyState)
            );
        }
    }

    // Handle CAA records
    if (domainData.record.CAA) {
        for (var caa in domainData.record.CAA) {
            var caaRecord = domainData.record.CAA[caa];
            commit[domainName].push(
                CAA(subdomainName, caaRecord.flags, caaRecord.tag, caaRecord.value)
            );
        }
    }

    // Handle CNAME records
    if (domainData.record.CNAME) {
        commit[domainName].push(
            CNAME(subdomainName, domainData.record.CNAME + ".", proxyState)
        );
    }

    // Handle MX records
    if (domainData.record.MX) {
        for (var mx in domainData.record.MX) {
            commit[domainName].push(
                MX(subdomainName, 10, domainData.record.MX[mx] + ".")
            );
        }
    }

    // Handle NS records
    if (domainData.record.NS) {
        for (var ns in domainData.record.NS) {
            commit[domainName].push(
                NS(subdomainName, domainData.record.NS[ns] + ".")
            );
        }
    }

    // Handle SRV records
    if (domainData.record.SRV) {
        for (var srv in domainData.record.SRV) {
            var srvRecord = domainData.record.SRV[srv];
            commit[domainName].push(
                SRV(subdomainName, srvRecord.priority, srvRecord.weight, srvRecord.port, srvRecord.target + ".")
            );
        }
    }

    // Handle TXT records
    if (domainData.record.TXT) {
        if (Array.isArray(domainData.record.TXT)) {
            for (var txt in domainData.record.TXT) {
                commit[domainName].push(
                    TXT(subdomainName, domainData.record.TXT[txt])
                );
            }
        } else {
            commit[domainName].push(
                TXT(subdomainName, domainData.record.TXT)
            );
        }
    }

    // Handle URL records
    // Note: URL records are not actual DNS records, we have a server configured to support them instead.
    if (domainData.record.URL) {
        commit[domainName].push(
            A(subdomainName, "45.85.238.5", proxy.on),
            TXT("_redirect." + subdomainName, "v=txtv0;type=host;to=" + domainData.record.URL)
        );
    }
}

// Commit all DNS records
for (var domainName in commit) {
    D(domainName, regNone, providerCf, commit[domainName]);
}
