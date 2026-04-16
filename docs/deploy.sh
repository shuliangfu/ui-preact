#!/bin/sh
set -e
dweb-cli build
docker compose up -d
