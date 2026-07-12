var domainName = "is-a.dev";
var registrar = NewRegistrar("none");
var dnsProvider = DnsProvider(NewDnsProvider("cloudflare"));

function getDomainsList(filesPath) {
    var result = [];
    var files = glob.apply(null, [filesPath, true, ".json"]);

    for (var i = 0; i < files.length; i++) {
        var name = files[i]
            .split("/")
            .pop()
            .replace(/\.json$/, "");

        result.push({ name: name, data: require(files[i]) });
    }

    return result;
}

var domains = getDomainsList("./domains");
var records = [];

for (var subdomain in domains) {
    var subdomainName = domains[subdomain].name;
    var data = domains[subdomain].data;
    var proxyState = data.proxied ? CF_PROXY_ON : CF_PROXY_OFF;

    // Handle A records
    if (data.records.A) {
        for (var a in data.records.A) {
            records.push(A(subdomainName, IP(data.records.A[a]), proxyState));
        }
    }

    // Handle AAAA records
    if (data.records.AAAA) {
        for (var aaaa in data.records.AAAA) {
            records.push(AAAA(subdomainName, data.records.AAAA[aaaa], proxyState));
        }
    }

    // Handle CAA records
    if (data.records.CAA) {
        for (var caa in data.records.CAA) {
            var caaRecord = data.records.CAA[caa];
            records.push(CAA(subdomainName, caaRecord.tag, caaRecord.value));
        }
    }

    // Handle CNAME records
    if (data.records.CNAME) {
        records.push(ALIAS(subdomainName, data.records.CNAME + ".", proxyState));
    }

    // Handle DS records
    if (data.records.DS) {
        for (var ds in data.records.DS) {
            var dsRecord = data.records.DS[ds];
            records.push(
                DS(subdomainName, dsRecord.key_tag, dsRecord.algorithm, dsRecord.digest_type, dsRecord.digest)
            );
        }
    }

    // Handle MX records
    if (data.records.MX) {
        for (var mx in data.records.MX) {
            var mxRecord = data.records.MX[mx];

            if (typeof mxRecord === "string") {
                records.push(
                    MX(subdomainName, 10 + parseInt(mx), data.records.MX[mx] + ".")
                );
            } else {
                records.push(
                    MX(
                        subdomainName,
                        parseInt(mxRecord.priority),
                        mxRecord.target + "."
                    )
                );
            }
        }
    }

    // Handle NS records
    if (data.records.NS) {
        for (var ns in data.records.NS) {
            records.push(NS(subdomainName, data.records.NS[ns] + "."));
        }
    }

    // Handle SRV records
    if (data.records.SRV) {
        for (var srv in data.records.SRV) {
            var srvRecord = data.records.SRV[srv];
            records.push(
                SRV(subdomainName, srvRecord.priority, srvRecord.weight, srvRecord.port, srvRecord.target + ".")
            );
        }
    }

    // Handle TLSA records
    if (data.records.TLSA) {
        for (var tlsa in data.records.TLSA) {
            var tlsaRecord = data.records.TLSA[tlsa];

            records.push(
                TLSA(
                    subdomainName,
                    tlsaRecord.usage,
                    tlsaRecord.selector,
                    tlsaRecord.matching_type,
                    tlsaRecord.certificate
                )
            );
        }
    }

    // Handle TXT records
    if (data.records.TXT) {
        if (Array.isArray(data.records.TXT)) {
            for (var txt in data.records.TXT) {
                records.push(TXT(subdomainName, data.records.TXT[txt].length <= 255 ? "\"" + data.records.TXT[txt] + "\"" : data.records.TXT[txt]));
            }
        } else {
            records.push(TXT(subdomainName, data.records.TXT.length <= 255 ? "\"" + data.records.TXT + "\"" : data.records.TXT));
        }
    }

    // Handle URL records
    if (data.records.URL) {
        records.push(A(subdomainName, IP("192.0.2.1"), CF_PROXY_ON));
    }
}

var reserved = require("./util/reserved.json");

// Handle reserved domains
for (var i = 0; i < reserved.length; i++) {
    var subdomainName = reserved[i];
    records.push(A(subdomainName, IP("192.0.2.1"), CF_PROXY_ON));
}

// Zone last updated TXT record
records.push(TXT("_zone-updated", "\"" + Date.now().toString() + "\""));

var ignored = [
    IGNORE("\\*", "A"),
    IGNORE("*._domainkey", "TXT"),
    IGNORE("@", "*"),
    IGNORE("_acme-challenge", "TXT"),
    IGNORE("_discord", "TXT"),
    IGNORE("_dmarc", "TXT"),
    IGNORE("_gh-is-a-dev-o", "TXT"),
    IGNORE("_gh-is-a-dev-o.**", "TXT"),
    IGNORE("_github-pages-challenge-is-a-dev", "TXT"),
    IGNORE("_github-pages-challenge-is-a-dev.**", "TXT"),
    IGNORE("_psl", "TXT"),
    IGNORE("ns[1-4]", "A,AAAA")
];

var internal = require("./util/internal.json");

internal.forEach(function(subdomain) {
    ignored.push(IGNORE(subdomain, "*"));
});

D(domainName, registrar, dnsProvider, records, ignored);
