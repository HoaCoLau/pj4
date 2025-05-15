#!/bin/sh
set -e

host="$1"
shift
cmd="$@"

until mysql -h "$host" -u root -e "SELECT 1" > /dev/null 2>&1; do
  echo "Waiting for MySQL..."
  sleep 2
done

>&2 echo "MySQL is up - executing command"
exec $cmd