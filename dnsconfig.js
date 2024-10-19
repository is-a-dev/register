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

for (var subdomain in domains) {
    var subdomainName = domains[subdomain].name;
    var fullSubdomain = subdomainName + ".is-a.dev";
    var domainData = domains[subdomain].data;
    var proxyState = domainData.proxied ? { cloudflare_proxy: "on" } : { cloudflare_proxy: "off" };

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
        // Allow CNAME record on root
        if (subdomainName === "@") {
            commit.push(ALIAS(subdomainName, domainData.record.CNAME + ".", proxyState));
        } else {
            commit.push(CNAME(subdomainName, domainData.record.CNAME + ".", proxyState));
        }
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
            A(subdomainName, "192.0.2.1", { cloudflare_proxy: "on" })
            // CF_SINGLE_REDIRECT(fullSubdomain, 302, 'http.host eq "' + fullSubdomain + '"', 'concat("' + domainData.record.URL + '", "")')
        )
    }
}

// Exceptions
// *
commit.push(IGNORE("*", "DS", "*"));
// is-a.dev
commit.push(IGNORE("@", "MX"));
commit.push(IGNORE("@", "TXT"));
// *.is-a.dev
commit.push(IGNORE("\\*"));
// *._domainkey.is-a.dev
commit.push(IGNORE("*._domainkey", "TXT"));
// _acme-challenge.is-a.dev
commit.push(IGNORE("_acme-challenge", "TXT"));
// _autodiscover._tcp.is-a.dev
commit.push(IGNORE("_autodiscover._tcp", "SRV"));
// _dmarc.is-a.dev
commit.push(IGNORE("_dmarc", "TXT"));
// _psl.is-a.dev
commit.push(IGNORE("_psl", "TXT"));
// autoconfig.is-a.dev
commit.push(IGNORE("autoconfig", "CNAME"));
// autodiscover.is-a.dev
commit.push(IGNORE("autodiscover", "CNAME"));
// ns1.is-a.dev
commit.push(IGNORE("ns1", "A"));
commit.push(IGNORE("ns1", "AAAA"));
// ns2.is-a.dev
commit.push(IGNORE("ns2", "A"));
commit.push(IGNORE("ns2", "AAAA"));
// ns3.is-a.dev
commit.push(IGNORE("ns3", "A"));
commit.push(IGNORE("ns3", "AAAA"));
// ns4.is-a.dev
commit.push(IGNORE("ns4", "A"));
commit.push(IGNORE("ns4", "AAAA"));
// test.is-a.dev
commit.push(IGNORE("test"));
commit.push(IGNORE("**.test"));

// Commit all DNS records
D("is-a.dev", NewRegistrar("none"), DnsProvider(NewDnsProvider("cloudflare", { "manage_single_redirects": true })), commit);
