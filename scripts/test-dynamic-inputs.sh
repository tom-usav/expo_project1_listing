#!/usr/bin/env bash
set -euo pipefail

# Use API_BASE_URL for explicit overrides, or fall back to the Expo env var.
API_BASE_URL="${API_BASE_URL:-${EXPO_PUBLIC_API_BASE_URL:-http://127.0.0.1:3001}}"
updated_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

curl -sS -X POST "${API_BASE_URL}/api/dynamic-inputs" \
  -H 'Content-Type: application/json' \
  -d "{
    \"category\": \"Nhà Cửa\",
    \"latitude\": \"10.762622\",
    \"longitude\": \"106.660172\",
    \"values\": {
      \"propertyType\": \"Can ho\",
      \"location\": \"Quan 1, TP. Ho Chi Minh\",
      \"area\": \"85\",
      \"bedrooms\": \"3\",
      \"budget\": \"2500000000\",
      \"furnishing\": \"Day du\",
      \"needParking\": true,
      \"note\": \"Test save to EC2 MySQL\"
    },
    \"imageUris\": [],
    \"contact\": {
      \"phone\": \"+84901234567\",
      \"email\": \"user@example.com\"
    },
    \"ipAddressLocation\": \"127.0.0.1\",
    \"status\": \"pending\",
    \"updatedAt\": \"${updated_at}\"
  }"

