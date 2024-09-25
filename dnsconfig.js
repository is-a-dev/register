var regNone = NewRegistrar("none");
var providerPdns = DnsProvider(NewDnsProvider("powerdns"));

function getDomainsList(filesPath) {
  var result = [];
  var files = glob.apply(null, [filesPath, true, '.json']);

  for (var i = 0; i < files.length; i++) {
    try {
      var basename = files[i].split('/').reverse()[0];
      var name = basename.split('.')[0];
      
      result.push({ name: name, data: require(files[i]) });
    } catch (error) {
      console.error(`Error reading file ${files[i]}: ${error.message}`);
    }
  }

  return result;
}

var domains = getDomainsList('./domains');
var commit = {};

for (var idx in domains) {
  var domainData = domains[idx].data;

  if (!commit[domains[idx].name]) {
    commit[domains[idx].name] = [];
  }

  // Handle A records
  if (domainData.record.A) {
    for (var a in domainData.record.A) {
      commit[domains[idx].name].push(
        A('', IP(domainData.record.A[a])) // Assuming root domain for 'subdomain'
      );
    }
  }

  // Handle AAAA records
  if (domainData.record.AAAA) {
    for (var aaaa in domainData.record.AAAA) {
      commit[domains[idx].name].push(
        AAAA('', domainData.record.AAAA[aaaa])
      );
    }
  }

  // Handle CNAME records
  if (domainData.record.CNAME) {
    commit[domains[idx].name].push(
      CNAME('', `${domainData.record.CNAME}.`)
    );
  }

  // Handle URL records (for redirects)
  if (domainData.record.URL) {
    commit[domains[idx].name].push(
      URL('', domainData.record.URL)
    );
  }

  // Handle MX records
  if (domainData.record.MX) {
    for (var mx in domainData.record.MX) {
      commit[domains[idx].name].push(
        MX('', 10, `${domainData.record.MX[mx]}.`) // Default priority is set to 10
      );
    }
  }

  // Handle TXT records
  if (domainData.record.TXT) {
    if (Array.isArray(domainData.record.TXT)) {
      for (var txt in domainData.record.TXT) {
        commit[domains[idx].name].push(
          TXT('', domainData.record.TXT[txt])
        );
      }
    } else {
      commit[domains[idx].name].push(
        TXT('', domainData.record.TXT)
      );
    }
  }

  // Handle NS records
  if (domainData.record.NS) {
    if (Array.isArray(domainData.record.NS)) {
      for (var ns in domainData.record.NS) {
        commit[domains[idx].name].push(
          NS('', `${domainData.record.NS}.`)
        );
      }
    } else {
      commit[domains[idx].name].push(
        NS('', `${domainData.record.NS}.`)
      );
    }
  }
}

// Commit all DNS records
for (var domainName in commit) {
  D(domainName, regNone, providerPdns, commit[domainName]);
}
