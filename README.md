# Reika-OS

> BIOS-style web panel for Keenetic routers.

**Author:** [lunarshe11](https://github.com/lunarshe11) · [mewsh](https://github.com/mewsh)
**Router:** Keenetic Hopper (KN-3811) · KeeneticOS 4.3.9

---

## About

Reika-OS is an alternative web panel for Keenetic routers, built on top of **Entware** + **lighttpd**. It speaks to the router through the native **RCI** API and shows live system state in the aesthetic of an Award BIOS from the 90s.

The project is named after **Reika (雷華)** — a fictional character: a quiet 16-year-old girl with long blue hair and blue eyes, who wears a school uniform and a clown mask in public. Behind the mask she codes, listens to breakcore, and writes scripts just to keep her GitHub squares green. At home, after Logoff, the blue cube vanishes and the mask falls off.

Reika-OS is what she sees when the cube is near — a quick flash of `init → kub → link → sync → scan → load → verify → online`, then **R.A.I.K.A O.S** in the dark.

*The cube doesn't speak. But the bootlog does.*

---

## Features

| Tab | What it does |
|---|---|
| **Main** | Model, firmware, uptime, CPU, RAM, connections — from the live router |
| **Advanced** | Detailed memory metrics, swap, connection table |
| **Security** | HTTP/HTTPS ports, TELNET status, lockout policy |
| **Boot** | Active + backup firmware slot, dual image, Save / Reboot / Shutdown |
| **Tools** | RCI console — `show version`, `show interface`, `show ip hotspot host`, etc. |

### Highlights

- **BIOS boot screen** — bootlog → blue screen → heart → `R.A.I.K.A O.S`
- **Power actions** — Logoff / Reboot / Shutdown with glitch sequence, Japanese noise and `wake up ×3`
- **Glitch engine** — screen inverts, RGB shifts, artifacts grow
- **PWA** — installable on phone home screen

---

## Requirements

- Keenetic router with USB port
- Entware installed on USB
- KeeneticOS 4.x / 5.x
- Packages: `lighttpd`, `lighttpd-mod-cgi`, `lighttpd-mod-auth`, `lighttpd-mod-authn_file`, `curl`, `python3`

---

## Install

```bash
# 1. Packages
opkg update
opkg install lighttpd lighttpd-mod-cgi lighttpd-mod-auth lighttpd-mod-authn_file curl python3

# 2. Directories
mkdir -p /opt/var/www/{logo,cgi-bin}
mkdir -p /opt/etc/lighttpd /opt/var/log/lighttpd

# 3. Clone
mkdir -p /opt/share/ai/github/repos
cd /opt/share/ai/github/repos
git clone https://github.com/mewsh/raika-os.git

# 4. Copy files
cd raika-os
cp files/www/index.html  /opt/var/www/
cp files/www/style.css   /opt/var/www/
cp files/www/script.js   /opt/var/www/
cp files/www/logo/*.jpg  /opt/var/www/logo/
cp files/www/cgi-bin/api /opt/var/www/cgi-bin/api
chmod +x /opt/var/www/cgi-bin/api
cp files/lighttpd/lighttpd.conf /opt/etc/lighttpd/lighttpd.conf
cp files/init.d/S80lighttpd /opt/etc/init.d/
chmod +x /opt/etc/init.d/S80lighttpd

# 5. Credentials
printf 'reika:os\n' > /opt/etc/lighttpd/lighttpd.user
chmod 600 /opt/etc/lighttpd/lighttpd.user

# 6. Move original admin to :8080
ndmc -c "ip http port 8080"
ndmc -c "system configuration save"

# 7. Start
/opt/etc/init.d/S80lighttpd start
```

Open http://192.168.1.1/ → login reika / password os.

---

Repo structure

```
raika-os/
├── files/
│   ├── init.d/S80lighttpd        # autostart
│   ├── lighttpd/lighttpd.conf    # web server config
│   └── www/
│       ├── cgi-bin/api           # CGI → RCI bridge
│       ├── logo/                 # icons
│       ├── index.html
│       ├── script.js
│       └── style.css
├── docs/
│   ├── api.md
│   └── install.md
├── about.md
├── README.md
└── CHANGELOG.md
```

---

Warning

Don't click on the heart.

---

License

MIT
