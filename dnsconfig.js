var regNone = NewRegistrar("none");
var providerPdns = DnsProvider(NewDnsProvider("powerdns"));

function getDomainsList(filesPath) {
    var result = [];
    var files = glob.sync(filesPath); // Use glob.sync for simplicity

    for (var i = 0; i < files.length; i++) {
        try {
            var basename = files[i].split("/").reverse()[0];
            var name = basename.split(".")[0];

            result.push({ name: name, data: require(files[i]) });
        } catch (error) {
            console.log(`Error reading file ${files[i]}: ${error.message}`);
        }
    }

    return result;
}

var domains = getDomainsList("./domains");
var commit = {};

for (var idx in domains) {
    var domainData = domains[idx].data;

    if (!commit[domains[idx].name]) {
        commit[domains[idx].name] = [];
    }

    // Handle A records
    if (domainData.record.A) {
        for (let a of domainData.record.A) {
            commit[domains[idx].name].push(A("", IP(a)));
        }
    }

    // Handle AAAA records
    if (domainData.record.AAAA) {
        for (let aaaa of domainData.record.AAAA) {
            commit[domains[idx].name].push(AAAA("", aaaa));
        }
    }

    // Handle CNAME records
    if (domainData.record.CNAME) {
        commit[domains[idx].name].push(CNAME("", `${domainData.record.CNAME}.`));
    }

    // Handle MX records
    if (domainData.record.MX) {
        for (let mx of domainData.record.MX) {
            commit[domains[idx].name].push(MX("", 10, `${mx}.`)); // Default priority is set to 10
        }
    }

    // Handle NS records
    if (domainData.record.NS) {
        if (Array.isArray(domainData.record.NS)) {
            for (let ns of domainData.record.NS) {
                commit[domains[idx].name].push(NS("", `${ns}.`));
            }
        } else {
            commit[domains[idx].name].push(NS("", `${domainData.record.NS}.`));
        }
    }

    // Handle TXT records
    if (domainData.record.TXT) {
        if (Array.isArray(domainData.record.TXT)) {
            for (let txt of domainData.record.TXT) {
                commit[domains[idx].name].push(TXT("", txt));
            }
        } else {
            commit[domains[idx].name].push(TXT("", domainData.record.TXT));
        }
    }

    // Handle URL records (for redirects)
    if (domainData.record.URL) {
        commit[domains[idx].name].push(
            A("", IP("1.1.1.1")) // URL records are not actual records
        );
    }
}

// Commit all DNS records
for (var domainName in commit) {
    D(domainName, regNone, providerPdns, commit[domainName]);
}
