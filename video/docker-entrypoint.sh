#!/bin/sh
set -eu
# Código/áudios derivados ficam no contêiner. Só os resultados saem em /output.
workdir=$(mktemp -d /tmp/slotguard-video.XXXXXX)
cp -R /opt/video/src /opt/video/scripts /opt/video/public "$workdir/"
cp /opt/video/package.json /opt/video/requirements.txt /opt/video/modelos.json \
   /opt/video/roteiros-completos.json "$workdir/"
ln -s /opt/video/node_modules "$workdir/node_modules"
ln -s /opt/venv "$workdir/.venv"
ln -s /opt/models "$workdir/models"
ln -s /output "$workdir/output"
cd "$workdir"
exec node scripts/produzir.mjs "$@"
