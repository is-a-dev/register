var regNone = NewRegistrar("none");
var providerCf = DnsProvider(NewDnsProvider("cloudflare"));

var proxy = {
    off: { cloudflare_proxy: "off" },
    on: { cloudflare_proxy: "on" }
}

function getDomainsList(filesPath) {
    var result = [];
    var files = glob.apply(null, [filesPath, true, ".json"]);

    for (var i = 0; i < files.length; i++) {
        var name = files[i].split("/").pop().replace(/\.json$/, "");

        result.push({ name: name, data: require(files[i]) });
    }

    return result;
}

var domains = getDomainsList("./domains");
var commit = [];

for (var idx in domains) {
    var subdomainName = domains[idx].name;
    var domainData = domains[idx].data;
    var proxyState = proxy.off; // disabled by default

    if (domainData.proxied) proxyState = proxy.on;

    // Handle A records
    if (domainData.record.A) {
        for (var a in domainData.record.A) {
            commit.push(A(subdomainName, IP(domainData.record.A[a]), proxyState));
        }
    }

    // Handle AAAA records
    if (domainData.record.AAAA) {
        for (var aaaa in domainData.record.AAAA) {
            commit.push(AAAA(subdomainName, domainData.record.AAAA[aaaa], proxyState));
        }
    }

    // Handle CAA records
    if (domainData.record.CAA) {
        for (var caa in domainData.record.CAA) {
            var caaRecord = domainData.record.CAA[caa];
            commit.push(CAA(subdomainName, caaRecord.flags, caaRecord.tag, caaRecord.value));
        }
    }

    // Handle CNAME records
    if (domainData.record.CNAME) {
        commit.push(CNAME(subdomainName, domainData.record.CNAME + ".", proxyState));
    }

    // Handle MX records
    if (domainData.record.MX) {
        for (var mx in domainData.record.MX) {
            commit.push(MX(subdomainName, 10, domainData.record.MX[mx] + "."));
        }
    }

    // Handle NS records
    if (domainData.record.NS) {
        for (var ns in domainData.record.NS) {
            commit.push(NS(subdomainName, domainData.record.NS[ns] + "."));
        }
    }

    // Handle SRV records
    if (domainData.record.SRV) {
        for (var srv in domainData.record.SRV) {
            var srvRecord = domainData.record.SRV[srv];
            commit.push(SRV(subdomainName, srvRecord.priority, srvRecord.weight, srvRecord.port, srvRecord.target + "."));
        }
    }

    // Handle TXT records
    if (domainData.record.TXT) {
        if (Array.isArray(domainData.record.TXT)) {
            for (var txt in domainData.record.TXT) {
                commit.push(TXT(subdomainName, domainData.record.TXT[txt]));
            }
        } else {
            commit.push(TXT(subdomainName, domainData.record.TXT));
        }
    }

    // Handle URL records
    if (domainData.record.URL) {
        commit.push(
            A(subdomainName, "45.85.238.5", proxy.on),
            TXT("_redirect." + subdomainName, "v=txtv0;type=host;to=" + domainData.record.URL)
        );
    }
}

// Commit all DNS records
D("is-a.dev", regNone, providerCf, commit);
