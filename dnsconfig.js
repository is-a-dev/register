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
var records = [];

for (var subdomain in domains) {
    var subdomainName = domains[subdomain].name;
    var domainData = domains[subdomain].data;
    var proxyState = domainData.proxied ? CF_PROXY_ON : CF_PROXY_OFF;

    // Handle A records
    if (domainData.records.A) {
        for (var a in domainData.records.A) {
            records.push(A(subdomainName, IP(domainData.records.A[a]), proxyState));
        }
    }

    // Handle AAAA records
    if (domainData.records.AAAA) {
        for (var aaaa in domainData.records.AAAA) {
            records.push(AAAA(subdomainName, domainData.records.AAAA[aaaa], proxyState));
        }
    }

    // Handle CAA records
    if (domainData.records.CAA) {
        for (var caa in domainData.records.CAA) {
            var caaRecord = domainData.records.CAA[caa];
            records.push(CAA(subdomainName, caaRecord.tag, caaRecord.value));
        }
    }

    // Handle CNAME records
    if (domainData.records.CNAME) {
        // Use ALIAS instead of CNAME to support CNAME flattening on the root domain
        records.push(ALIAS(subdomainName, domainData.records.CNAME + ".", proxyState));
    }

    // Handle DS records
    if (domainData.records.DS) {
        for (var ds in domainData.records.DS) {
            var dsRecord = domainData.records.DS[ds];
            records.push(
                DS(subdomainName, dsRecord.key_tag, dsRecord.algorithm, dsRecord.digest_type, dsRecord.digest)
            );
        }
    }

    // Handle MX records
    if (domainData.records.MX) {
        for (var mx in domainData.records.MX) {
            var mxRecord = domainData.records.MX[mx];

            if (typeof mxRecord === "string") {
                records.push(
                    MX(subdomainName, 10 + parseInt(mx), domainData.records.MX[mx] + ".")
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
    if (domainData.records.NS) {
        for (var ns in domainData.records.NS) {
            records.push(NS(subdomainName, domainData.records.NS[ns] + "."));
        }
    }

    // Handle SRV records
    if (domainData.records.SRV) {
        for (var srv in domainData.records.SRV) {
            var srvRecord = domainData.records.SRV[srv];
            records.push(
                SRV(subdomainName, srvRecord.priority, srvRecord.weight, srvRecord.port, srvRecord.target + ".")
            );
        }
    }

    // Handle TLSA records
    if (domainData.records.TLSA) {
        for (var tlsa in domainData.records.TLSA) {
            var tlsaRecord = domainData.records.TLSA[tlsa];

            records.push(
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
    if (domainData.records.TXT) {
        if (Array.isArray(domainData.records.TXT)) {
            for (var txt in domainData.records.TXT) {
                records.push(TXT(subdomainName, domainData.records.TXT[txt].length <= 255 ? "\"" + domainData.records.TXT[txt] + "\"" : domainData.records.TXT[txt]));
            }
        } else {
            records.push(TXT(subdomainName, domainData.records.TXT.length <= 255 ? "\"" + domainData.records.TXT + "\"" : domainData.records.TXT));
        }
    }

    // Handle URL records
    if (domainData.records.URL) {
        records.push(A(subdomainName, IP("192.0.2.1"), CF_PROXY_ON));
    }
}

var reserved = require("./util/reserved.json");

// Handle reserved domains
for (var i = 0; i < reserved.length; i++) {
    var subdomainName = reserved[i];
    if (
        subdomainName !== "ns1" &&
        subdomainName !== "ns2" &&
        subdomainName !== "ns3" &&
        subdomainName !== "ns4"
    ) {
        records.push(A(subdomainName, IP("192.0.2.1"), CF_PROXY_ON));
    }
}

var options = {
    no_ns: "true"
};

var ignored = [
    IGNORE("@", "MX,TXT"),
    IGNORE("_acme-challenge", "TXT"),
    IGNORE("_autodiscover._tcp", "SRV"),
    IGNORE("_dmarc", "TXT"),
    IGNORE("autoconfig", "CNAME"),
    IGNORE("autodiscover", "CNAME"),
    IGNORE("dkim._domainkey", "TXT"),
    IGNORE("ns[1-4]", "A,AAAA"),
];

// Push TXT record of when the zone was last updated
records.push(TXT("_zone-updated", "\"" + Date.now().toString() + "\""));

D(domainName, registrar, dnsProvider, options, ignored, records);
