#!/bin/bash
sed -i 's#__CENTRAL_SETTLEMENTS_URL__#'"$CENTRAL_SETTLEMENTS_URL"'#g' /usr/share/nginx/html/runtime-env.js
sed -i 's#__CENTRAL_LEDGER_URL__#'"$CENTRAL_LEDGER_URL"'#g' /usr/share/nginx/html/runtime-env.js
sed -i 's#__REACT_APP_MOCK_API__#'"$REACT_APP_MOCK_API"'#g' /usr/share/nginx/html/runtime-env.js

exec "$@"
