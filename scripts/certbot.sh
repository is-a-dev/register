#!/usr/bin/env bash

export ENV=production
DRY_RUN=0
if_dry_run() { [[ $DRY_RUN == 1 ]] && echo "$1" || echo "$2"; }

generate_certificate() {
  outdir=$(mktemp -d /tmp/is-a-dev-certbot.XXXXX);

  certbot \
    --config-dir $outdir/config \
    --work-dir $outdir/work \
    --logs-dir $outdir/logs \
    certonly \
    --manual \
    -m 'phenax5@gmail.com' \
    -d '*.is-a.dev,is-a.dev' \
    $(if_dry_run "--dry-run" "");

  echo "+-----------------------------------------------+";
  echo "|          Certificates output to:              |";
  echo "|          $outdir              |";
  echo "+-----------------------------------------------+";
}

update_record() {
  local method=$([[ "$1" == "add" ]] && echo "addZoneRecord" || echo "removeZoneRecord");
  local type="$2";
  local name="$3";
  local address="$4";
  local ttl=${5:-"1"};
  echo "
    const { domainService } = require('./utils/domain-service');
    const { ENV, DOMAIN_DOMAIN } = require('./utils/constants');
    const method = '$method';
    const name = '$name';
    const type = '$type';

    const record = { name, type, address: '$address', ttl: $ttl };

    async function main() {
      if (method === 'removeZoneRecord') {
        const data = await domainService.get({ customonly: 0, name: '$name.is-a.dev.', type });
        if (data.length > 0) {
          record.id = data[0].line;
        } else {
          throw new Error('Unable to find record');
        }
      }

      console.log('Uploading $name to', DOMAIN_DOMAIN, '(', ENV, ')...');
      const data = await domainService[method](record)();
      console.log(data.cpanelresult ? data.cpanelresult.data : data);
    }

    main().catch(console.error);
  " | node -
}

update_acme_txt_record() {
  update_record add TXT '_acme-challenge' "$1";
}

update_www_record() {
  update_record remove CNAME 'www' "is-a-dev.github.io";
  sleep 1;
  update_record add A 'www' "68.65.123.44";
}

upload_acme_file() {
  local key="$1";
  local value="$2";
  echo "
    const { cpanel } = require('./utils/lib/cpanel');
    const { ENV, DOMAIN_DOMAIN, DOMAIN_USER } = require('./utils/constants');
    
    const file = {
      dir: '/home/' + DOMAIN_USER + '/public_html/.well-known/acme-challenge',
      file: '$key',
      content: '$value',
    };

    console.log('Uploading acme validation file to', DOMAIN_DOMAIN, '(', ENV, ')...');
    cpanel.file.write(file).then(console.log).catch(console.error);
  " | node -;
}

reset_acme() {
  update_record remove A 'www' "68.65.123.44";
  sleep 1;
  update_record add CNAME 'www' "is-a-dev.github.io";
  update_record remove TXT '_acme-challenge' '';
}

case "$1" in
  check)
    echo "TXT record:: $(dig +noall +answer _acme-challenge.is-a.dev TXT | awk '{print $5}')";
  ;;
  config_www) update_www_record ;;
  acme_txt) update_acme_txt_record "$2" ;;
  acme_file) upload_acme_file "$2" "$3" ;;
  cert) generate_certificate ;;
  reset) reset_acme ;;
  *) echo "Invalid command"; exit 1; ;;
esac


### STEPS ###
# Run ./scripts/certbot.sh cert
# Run ./scripts/certbot.sh acme_txt "<key>"
# Run ./scripts/certbot.sh acme_file "<key>" "<value>"
# Run ./scripts/certbot.sh config_www
# cp -r /tmp/is-a-dev-whatever /tmp/is-a-dev-cert (not sure if needed but the directory disappeared once)
# Upload cert.pem and privkey.pem (from config/live/is-a.dev/) contents to SSL > Manage SSL Sites
# Run ./scripts/certbot.sh reset

