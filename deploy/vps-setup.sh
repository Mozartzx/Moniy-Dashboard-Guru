#!/usr/bin/env bash
# One-time VPS setup for moniy.site. Run as root: bash vps-setup.sh "<deploy public key>"
set -euo pipefail

PUBKEY="$1"

command -v rsync >/dev/null || apt-get install -y rsync

id moniy >/dev/null 2>&1 || useradd -m -s /bin/bash moniy
install -d -o moniy -g moniy /var/www/moniy-dashboard
install -d -m 700 -o moniy -g moniy /home/moniy/.ssh
echo "$PUBKEY" > /home/moniy/.ssh/authorized_keys
chown moniy:moniy /home/moniy/.ssh/authorized_keys
chmod 600 /home/moniy/.ssh/authorized_keys

# CI may restart the app service and nothing else.
echo 'moniy ALL=(root) NOPASSWD: /usr/bin/systemctl restart moniy-dashboard' > /etc/sudoers.d/moniy-deploy
chmod 440 /etc/sudoers.d/moniy-deploy
visudo -cf /etc/sudoers.d/moniy-deploy

# Private Node 22 in /opt, so the host's Node (v20) stays untouched.
if [ ! -x /opt/node22/bin/node ]; then
  f=$(curl -fsSL https://nodejs.org/dist/latest-v22.x/SHASUMS256.txt | grep -o 'node-v22[^ ]*-linux-x64.tar.xz')
  mkdir -p /opt/node22
  curl -fsSL "https://nodejs.org/dist/latest-v22.x/$f" | tar -xJ -C /opt/node22 --strip-components=1
fi

cat > /etc/systemd/system/moniy-dashboard.service <<'EOF'
[Unit]
Description=Moniy teacher dashboard
After=network.target

[Service]
User=moniy
WorkingDirectory=/var/www/moniy-dashboard
Environment=PORT=3100 HOST=127.0.0.1
ExecStart=/opt/node22/bin/node server.js
Restart=always

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
# Enabled but not started: the first CI deploy uploads server.js, then restarts it.
systemctl enable moniy-dashboard

cat > /etc/nginx/sites-available/moniy-dashboard <<'EOF'
server {
    listen 80;
    server_name moniy.site;

    location / {
        proxy_pass http://127.0.0.1:3100;
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
ln -sf /etc/nginx/sites-available/moniy-dashboard /etc/nginx/sites-enabled/moniy-dashboard
nginx -t
systemctl reload nginx

certbot --nginx -d moniy.site --non-interactive --redirect
