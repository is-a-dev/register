var regNone = NewRegistrar("none");
var providerCf = DnsProvider(NewDnsProvider("cloudflare"));

var proxy = {
  on: { "cloudflare_proxy": "on" },
  off: { "cloudflare_proxy": "off" }
};

// Function to validate filenames according to the given rules
function isValidFilename(filename) {
  var regex = /\.json$/;
  return regex.test(filename);
}

function getDomainsList(filesPath) {
  var result = [];
  var files = glob.apply(null, [filesPath, true, '.json']);

  for (var i = 0; i < files.length; i++) {
    var basename = files[i].split('/').reverse()[0];

    if (!isValidFilename(basename)) {
      console.log("Skipping invalid file:" + basename);
      continue;
    }

    var name = basename.split('.')[0];
    result.push({ name: name, data: require(files[i]) });
  }

  return result;
}

var domains = getDomainsList('./domains');
var commit = {};

for (var idx in domains) {
  var domainData = domains[idx].data;
  var proxyState = proxy.off; // disabled by default

  if (!commit[domainData.record.domain]) {
    commit[domainData.record.domain] = [];
  }

  if (domainData.record.proxied === false) {
    proxyState = proxy.off;
  }

  // Handle A records
  if (domainData.record.A) {
    for (var a in domainData.record.A) {
      commit[domainData.record.domain].push(
        A(domainData.subdomain, IP(domainData.record.A[a]), proxyState)
      );
    }
  }

  // Handle AAAA records
  if (domainData.record.AAAA) {
    for (var aaaa in domainData.record.AAAA) {
      commit[domainData.record.domain].push(
        AAAA(domainData.subdomain, domainData.record.AAAA[aaaa], proxyState)
      );
    }
  }

  // Handle CNAME record
  if (domainData.record.CNAME) {
    commit[domainData.domain].push(
      CNAME(domainData.subdomain, domainData.record.CNAME + ".", proxyState)
    );
  }

  // Handle MX records
  if (domainData.record.MX) {
    for (var mx in domainData.record.MX) {
      commit[domainData.record.domain].push(
        MX(domainData.subdomain, 10, domainData.record.MX[mx] + ".")
      );
    }
  }

  // Handle NS records
  if (domainData.record.NS) {
    for (var ns in domainData.record.NS) {
      commit[domainData.domain].push(
        NS(domainData.subdomain, domainData.record.NS[ns] + ".")
      );
    }
  }

  // Handle SRV records
  if (domainData.record.SRV) {
    for (var srv in domainData.record.SRV) {
      var srvRecord = domainData.record.SRV[srv];
      commit[domainData.domain].push(
        SRV(domainData.subdomain, srvRecord.priority, srvRecord.weight, srvRecord.port, srvRecord.target + ".")
      );
    }
  }

  // Handle TXT records
  if (domainData.record.TXT) {
    if (Array.isArray(domainData.record.TXT)) {
      for (var txt in domainData.record.TXT) {
        commit[domainData.record.domain].push(
          TXT(domainData.subdomain, domainData.record.TXT[txt])
        );
      }
    } else {
      commit[domainData.record.domain].push(
        TXT(domainData.subdomain, domainData.record.TXT)
      );
    }
  }

  // Handle URL records (redirect)
  if (domainData.record.URL) {
    commit[domainData.record.domain].push(
      CNAME(domainData.subdomain, "redirect.is-a.dev.", proxy.on)
    );
  }
}

// Commit all DNS records
for (var domainName in commit) {
  D(domainName, regNone, providerCf, commit[domainName]);
}
