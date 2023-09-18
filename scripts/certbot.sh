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
    --preferred-challenges=dns \
    --manual-auth-hook=./scripts/certbot-auth.sh \
    -m 'phenax5@gmail.com' \
    -d '*.is-a.dev,is-a.dev' \
    --agree-tos \
    $(if_dry_run "--dry-run" "");

  echo "+-----------------------------------------------+";
  echo "|            Certificate output:                |";
  echo "|=            $outdir";
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

reset_acme() {
  sleep 1;
  update_record remove TXT '_acme-challenge' '';
  update_record remove TXT '_acme-challenge' '';
}

get_acme() { dig +noall +answer _acme-challenge.is-a.dev TXT | awk '{print $5}'; }

case "$1" in
  check) echo "TXT record:: $(get_acme)" ;;
  get-acme) get_acme ;;
  cert) generate_certificate ;;
  acme_txt) update_acme_txt_record "$2" ;;
  reset) reset_acme ;;
  *) echo "Invalid command"; exit 1; ;;
esac


### STEPS ###
# Run ./scripts/certbot.sh cert
# Run ./scripts/certbot.sh acme_txt "<key>"
# cp -r /tmp/is-a-dev-whatever /opt/app/code/is-a-dev-cert
# Upload cert.pem and privkey.pem (from config/live/is-a.dev/) contents to SSL > Manage SSL Sites
# Run ./scripts/certbot.sh reset

