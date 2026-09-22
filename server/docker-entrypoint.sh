#!/bin/sh
set -e

i=0
until npx prisma migrate deploy; do
  i=$((i + 1))
  if [ "$i" -ge 40 ]; then
    echo "Prisma migrate failed after waiting for MySQL"
    exit 1
  fi
  echo "Waiting for MySQL... ($i)"
  sleep 3
done

npx prisma db seed || echo "Seed skipped or already applied"
npx prisma db execute --schema prisma/schema.prisma --file prisma/ensure-users.sql || echo "ensure users skipped"
npx prisma db execute --schema prisma/schema.prisma --file prisma/ensure-orders.sql || echo "ensure orders skipped"
npx prisma db execute --schema prisma/schema.prisma --file prisma/seed-orders.sql || echo "seed orders skipped"
npx prisma db execute --schema prisma/schema.prisma --file prisma/ensure-reviews.sql || echo "ensure reviews skipped"
npx prisma db execute --schema prisma/schema.prisma --file prisma/seed-reviews.sql || echo "seed reviews skipped"
npx prisma db execute --schema prisma/schema.prisma --file prisma/ensure-travelers.sql || echo "ensure travelers skipped"
npx prisma db execute --schema prisma/schema.prisma --file prisma/seed-travelers.sql || echo "seed travelers skipped"
npx prisma db execute --schema prisma/schema.prisma --file prisma/ensure-explore.sql || echo "ensure explore skipped"
npx prisma db execute --schema prisma/schema.prisma --file prisma/seed-explore.sql || echo "seed explore skipped"
npx prisma db execute --schema prisma/schema.prisma --file prisma/ensure-feedback.sql || echo "ensure feedback skipped"

exec node dist/src/main.js
