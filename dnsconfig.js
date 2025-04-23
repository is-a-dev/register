var domainName = "is-a.dev";
var registrar = NewRegistrar("none");
var dnsProvider = DnsProvider(NewDnsProvider("cloudflare"), 0);

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
var zone = [];

for (var subdomain in domains) {
    var subdomainName = domains[subdomain].name;
    var data = domains[subdomain].data;
    var records = data.records;
    var proxyState = data.proxied ? CF_PROXY_ON : CF_PROXY_OFF;

    // Handle A records
    if (records.A) {
        for (var a in records.A) {
            zone.push(A(subdomainName, IP(records.A[a]), proxyState));
        }
    }

    // Handle AAAA records
    if (records.AAAA) {
        for (var aaaa in records.AAAA) {
            zone.push(AAAA(subdomainName, records.AAAA[aaaa], proxyState));
        }
    }

    // Handle CAA records
    if (records.CAA) {
        for (var caa in records.CAA) {
            var caaRecord = records.CAA[caa];
            zone.push(CAA(subdomainName, caaRecord.tag, caaRecord.value));
        }
    }

    // Handle CNAME records
    if (records.CNAME) {
        zone.push(ALIAS(subdomainName, records.CNAME + ".", proxyState));
    }

    // Handle DS records
    if (records.DS) {
        for (var ds in records.DS) {
            var dsRecord = records.DS[ds];
            zone.push(
                DS(subdomainName, dsRecord.key_tag, dsRecord.algorithm, dsRecord.digest_type, dsRecord.digest)
            );
        }
    }

    // Handle MX records
    if (records.MX) {
        for (var mx in records.MX) {
            var mxRecord = records.MX[mx];

            if (typeof mxRecord === "string") {
                zone.push(
                    MX(subdomainName, 10 + parseInt(mx), records.MX[mx] + ".")
                );
            } else {
                zone.push(
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
    if (records.NS) {
        for (var ns in records.NS) {
            zone.push(NS(subdomainName, records.NS[ns] + "."));
        }
    }

    // Handle SRV records
    if (records.SRV) {
        for (var srv in records.SRV) {
            var srvRecord = records.SRV[srv];
            zone.push(
                SRV(subdomainName, srvRecord.priority, srvRecord.weight, srvRecord.port, srvRecord.target + ".")
            );
        }
    }

    // Handle TLSA records
    if (records.TLSA) {
        for (var tlsa in records.TLSA) {
            var tlsaRecord = records.TLSA[tlsa];

            zone.push(
                TLSA(
                    subdomainName,
                    tlsaRecord.usage,
                    tlsaRecord.selector,
                    tlsaRecord.matchingType,
                    tlsaRecord.certificate
                )
            );
        }
    }

    // Handle TXT records
    if (records.TXT) {
        if (Array.isArray(records.TXT)) {
            for (var txt in records.TXT) {
                zone.push(TXT(subdomainName, records.TXT[txt].length <= 255 ? "\"" + records.TXT[txt] + "\"" : records.TXT[txt]));
            }
        } else {
            zone.push(TXT(subdomainName, records.TXT.length <= 255 ? "\"" + records.TXT + "\"" : records.TXT));
        }
    }

    // Handle URL records
    if (records.URL) {
        zone.push(A(subdomainName, IP("192.0.2.1"), CF_PROXY_ON));
    }
}

var reserved = require("./util/reserved.json");

// Handle reserved domains
for (var i = 0; i < reserved.length; i++) {
    var subdomainName = reserved[i];
    if (
        subdomainName !== "autoconfig" &&
        subdomainName !== "autodiscover" &&
        subdomainName !== "ns1" &&
        subdomainName !== "ns2" &&
        subdomainName !== "ns3" &&
        subdomainName !== "ns4" &&
        subdomainName !== "www"
    ) {
        zone.push(A(subdomainName, IP("192.0.2.1"), CF_PROXY_ON));
    }
}

var options = {
    no_ns: "true"
};

var ignored = [
    IGNORE("*._domainkey", "TXT"),
    IGNORE("@", "*"),
    IGNORE("_acme-challenge", "TXT"),
    IGNORE("_autodiscover._tcp", "SRV"),
    IGNORE("_discord", "TXT"),
    IGNORE("_dmarc", "TXT"),
    IGNORE("_gh-is-a-dev-o", "TXT"),
    IGNORE("_gh-is-a-dev-o.**", "TXT"),
    IGNORE("_github-pages-challenge-is-a-dev", "TXT"),
    IGNORE("_github-pages-challenge-is-a-dev.**", "TXT"),
    IGNORE("_psl", "TXT"),
    IGNORE("autoconfig", "CNAME"),
    IGNORE("autodiscover", "CNAME"),
    IGNORE("ns[1-4]", "A,AAAA"),
    IGNORE("www", "*")
];

// Push TXT record of when the zone was last updated
zone.push(TXT("_zone-updated", "\"" + Date.now().toString() + "\""));

D(domainName, registrar, dnsProvider, options, ignored, records);
