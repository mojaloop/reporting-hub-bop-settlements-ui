#!/bin/bash
if grep -q "__CENTRAL_SETTLEMENTS_ENDPOINT__" /usr/share/nginx/html/runtime-env.js; then
sed -i 's#__CENTRAL_SETTLEMENTS_ENDPOINT__#'"$CENTRAL_SETTLEMENTS_ENDPOINT"'#g' /usr/share/nginx/html/runtime-env.js
sed -i 's#__CENTRAL_LEDGER_ENDPOINT__#'"$CENTRAL_LEDGER_ENDPOINT"'#g' /usr/share/nginx/html/runtime-env.js
sed -i 's#__REPORTING_TEMPLATE_API_ENDPOINT__#'"$REPORTING_TEMPLATE_API_ENDPOINT"'#g' /usr/share/nginx/html/runtime-env.js
else
  echo "skipping replacement."
fi

exec "$@"
