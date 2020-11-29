#!/usr/bin/env sh

sed \
  -e 's/\.json.*$/.is-a.dev/g' \
  -e 's/^\s*domains\///g' \
  -e '/^\s*$/d' \
| while read domain; do
  echo "$domain";
  dig "$domain" +noall +answer && echo "done" || echo "x";
done;

