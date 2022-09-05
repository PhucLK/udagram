echo "$REGISTRY_PASS" | docker login -u "$REGISTRY_USER" --password-stdin
docker image push omarradwan213/udagram-frontend