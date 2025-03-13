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
    if (domainData.record.A) {
        for (var a in domainData.record.A) {
            records.push(A(subdomainName, IP(domainData.record.A[a]), proxyState));
        }
    }

    // Handle AAAA records
    if (domainData.record.AAAA) {
        for (var aaaa in domainData.record.AAAA) {
            records.push(AAAA(subdomainName, domainData.record.AAAA[aaaa], proxyState));
        }
    }

    // Handle CAA records
    if (domainData.record.CAA) {
        for (var caa in domainData.record.CAA) {
            var caaRecord = domainData.record.CAA[caa];
            records.push(CAA(subdomainName, caaRecord.tag, caaRecord.value));
        }
    }

    // Handle CNAME records
    if (domainData.record.CNAME) {
        // Use ALIAS instead of CNAME to support CNAME flattening on the root domain
        records.push(ALIAS(subdomainName, domainData.record.CNAME + ".", proxyState));
    }

    // Handle DS records
    if (domainData.record.DS) {
        for (var ds in domainData.record.DS) {
            var dsRecord = domainData.record.DS[ds];
            records.push(
                DS(subdomainName, dsRecord.key_tag, dsRecord.algorithm, dsRecord.digest_type, dsRecord.digest)
            );
        }
    }

    // Handle MX records
    if (domainData.record.MX) {
        for (var mx in domainData.record.MX) {
            var mxRecord = domainData.record.MX[mx];

            if (typeof mxRecord === "string") {
                records.push(
                    MX(subdomainName, 10 + parseInt(mx), domainData.record.MX[mx] + ".")
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
    if (domainData.record.NS) {
        for (var ns in domainData.record.NS) {
            records.push(NS(subdomainName, domainData.record.NS[ns] + "."));
        }
    }

    // Handle SRV records
    if (domainData.record.SRV) {
        for (var srv in domainData.record.SRV) {
            var srvRecord = domainData.record.SRV[srv];
            records.push(
                SRV(subdomainName, srvRecord.priority, srvRecord.weight, srvRecord.port, srvRecord.target + ".")
            );
        }
    }

    // Handle TLSA records
    if (domainData.record.TLSA) {
		for (var tlsa in domainData.record.TLSA) {
			var tlsaRecord = domainData.record.TLSA[tlsa];

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
    if (domainData.record.TXT) {
        if (Array.isArray(domainData.record.TXT)) {
            for (var txt in domainData.record.TXT) {
                records.push(TXT(subdomainName, domainData.record.TXT[txt].length <= 255 ? "\"" + domainData.record.TXT[txt] + "\"" : domainData.record.TXT[txt]));
            }
        } else {
            records.push(TXT(subdomainName, domainData.record.TXT.length <= 255 ? "\"" + domainData.record.TXT + "\"" : domainData.record.TXT));
        }
    }

    // Handle URL records
    if (domainData.record.URL) {
        records.push(A(subdomainName, IP("192.0.2.1"), CF_PROXY_ON));
	    records.push(TXT("_redirect." + subdomainName, domainData.record.URL));
    }
}

var reserved = require("./util/reserved.json");

// Handle reserved domains
for (var i = 0; i < reserved.length; i++) {
    var subdomain = reserved[i];
    records.push(CNAME(subdomain, "reserved.is-a.dev.", CF_PROXY_ON));
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
