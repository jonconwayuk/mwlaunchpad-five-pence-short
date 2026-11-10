# usage: s.sh person as -> compact engine summary
curl -s "http://localhost:3071/api/state?personId=$1&as=$2" | jq -c '.data.engineState // .data | {today, items:[.items[]?|{id:.itemId,s:.status,ca:.currentAction.id}], tasks:[.tasks[]?|{owner,label}], notes:[.notifications[]?|{to,message}], nd:[.needsDecisions[]?|.hardStopId]}'
