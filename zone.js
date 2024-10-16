const fs = require('fs'); // Required for writing JSON to file

var proxy = {
  on: { "cloudflare_proxy": "on" },
  off: { "cloudflare_proxy": "off" }
};

// Function to validate filenames according to the given rules
function isValidFilename(filename) {
  var regex = /^[a-z0-9]+(-[a-z0-9]+)*(\.[a-z0-9]+(-[a-z0-9]+)*)*\.json$/;
  return regex.test(filename);
}

// Function to get the domains list from the domains folder
function getDomainsList(filesPath) {
  var result = [];
  var files = glob.apply(null, [filesPath, true, '.json']);

  for (var i = 0; i < files.length; i++) {
    var basename = files[i].split('/').reverse()[0];

    if (!isValidFilename(basename)) {
      console.log(`Skipping invalid file: ${basename}`);
      continue;
    }

    var name = basename.split('.')[0];
    result.push({ name: name, data: require(files[i]) });
  }

  return result;
}

var domains = getDomainsList('./domains');
var zoneFile = {};  // JSON object to hold all the DNS records

for (var idx in domains) {
  var domainData = domains[idx].data;
  var proxyState = proxy.on; // enabled by default

  // Initialize the domain entry in the zone file if not already there
  if (!zoneFile[domainData.record.domain]) {
    zoneFile[domainData.record.domain] = [];
  }

  // Check if proxy should be turned off
  if (domainData.record.proxied === false) {
    proxyState = proxy.off;
  }

  // Handle CNAME record
  if (domainData.record.CNAME) {
    zoneFile[domainData.record.domain].push({
      type: "CNAME",
      subdomain: domainData.subdomain,
      value: domainData.record.CNAME + ".",
      proxy: proxyState
    });
  }

  // Handle A records
  if (domainData.record.A) {
    for (var a in domainData.record.A) {
      zoneFile[domainData.record.domain].push({
        type: "A",
        subdomain: domainData.subdomain,
        value: domainData.record.A[a],
        proxy: proxyState
      });
    }
  }

  // Handle AAAA records
  if (domainData.record.AAAA) {
    for (var aaaa in domainData.record.AAAA) {
      zoneFile[domainData.record.domain].push({
        type: "AAAA",
        subdomain: domainData.subdomain,
        value: domainData.record.AAAA[aaaa],
        proxy: proxyState
      });
    }
  }

  // Handle MX records
  if (domainData.record.MX) {
    for (var mx in domainData.record.MX) {
      zoneFile[domainData.record.domain].push({
        type: "MX",
        subdomain: domainData.subdomain,
        value: domainData.record.MX[mx] + ".",
        priority: 10
      });
    }
  }

  // Handle URL records (redirect)
  if (domainData.record.URL) {
    zoneFile[domainData.record.domain].push({
      type: "URL",
      subdomain: domainData.subdomain,
      value: domainData.record.URL
    });
  }

  // Handle TXT records
  if (domainData.record.TXT) {
    if (Array.isArray(domainData.record.TXT)) {
      for (var txt in domainData.record.TXT) {
        zoneFile[domainData.record.domain].push({
          type: "TXT",
          subdomain: domainData.subdomain,
          value: domainData.record.TXT[txt]
        });
      }
    } else {
      zoneFile[domainData.record.domain].push({
        type: "TXT",
        subdomain: domainData.subdomain,
        value: domainData.record.TXT
      });
    }
  }
}

// Write the JSON zone file to disk
fs.writeFileSync('zoneFile.json', JSON.stringify(zoneFile, null, 2), 'utf-8');

console.log("Zone file has been written to zoneFile.json");
