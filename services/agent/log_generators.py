import random
import time
from string import Template

users = [f"user{i:03d}" for i in range(1, 101)]
admins = random.sample(users, 5)
ttys = [0, 1, 2, 3, 4, 5]
pids = range(1000, 5000)
commands = [
    "ls",
    "cat /etc/passwd",
    "whoami",
    "id",
    "uptime",
    "top",
    "ps aux",
    "nano file.txt",
    "vim notes.txt",
    "python3 script.py",
]
files = [f"/home/{u}/file{j}.txt" for u in users for j in range(1, 3)]
sensitive_files = ["/etc/passwd", "/etc/shadow", "/var/secret/data.db"]
config_files = ["/etc/ssh/sshd_config", "/etc/sudoers"]
templates = {
    "auth": {
        "ssh_login_success": Template(
            "$timestamp $host sshd[$pid]: Accepted password for $user from $src_ip port $src_port ssh2"
        ),
        "ssh_login_failure": Template(
            "$timestamp $host sshd[$pid]: Failed password for $user from $src_ip port $src_port ssh2"
        ),
        "invalid_user": Template(
            "$timestamp $host sshd[$pid]: Invalid user $user from $src_ip port $src_port"
        ),
        "sudo_command": Template(
            "$timestamp $host sudo: $user : TTY=pts/$tty ; PWD=$pwd ; USER=root ; COMMAND=$command"
        ),
        "user_logout": Template(
            "$timestamp $host sshd[$pid]: Disconnected from user $user $src_ip port $src_port"
        ),
    },
    "web": {
        "page_access": Template(
            '$src_ip - $user [$timestamp] "$method $path HTTP/1.1" $status $size'
        ),
        "login_request": Template(
            '$src_ip - $user [$timestamp] "POST /login HTTP/1.1" $status $size'
        ),
        "admin_access_denied": Template(
            '$src_ip - - [$timestamp] "GET /admin HTTP/1.1" 403 $size'
        ),
        "directory_traversal": Template(
            '$src_ip - - [$timestamp] "GET /../../etc/passwd HTTP/1.1" 404 $size'
        ),
        "api_access": Template(
            '$src_ip - $user [$timestamp] "GET /api/$api HTTP/1.1" $status $size'
        ),
    },
    "firewall": {
        "allow_tcp": Template(
            "$timestamp $host kernel: IN=$in_if OUT=$out_if SRC=$src_ip DST=$dst_ip PROTO=TCP SPT=$src_port DPT=$dst_port ACTION=ALLOW"
        ),
        "block_tcp": Template(
            "$timestamp $host kernel: IN=$in_if OUT=$out_if SRC=$src_ip DST=$dst_ip PROTO=TCP SPT=$src_port DPT=$dst_port ACTION=BLOCK"
        ),
        "dns_allow": Template(
            "$timestamp $host kernel: IN=$in_if OUT=$out_if SRC=$src_ip DST=$dst_ip PROTO=UDP SPT=$src_port DPT=53 ACTION=ALLOW"
        ),
        "dns_block": Template(
            "$timestamp $host kernel: IN=$in_if OUT=$out_if SRC=$src_ip DST=$dst_ip PROTO=UDP SPT=$src_port DPT=53 ACTION=BLOCK"
        ),
        "port_scan_block": Template(
            "$timestamp $host kernel: IN=$in_if OUT=$out_if SRC=$src_ip DST=$dst_ip PROTO=TCP SPT=$src_port DPT=$dst_port ACTION=BLOCK"
        ),
        "http_outbound": Template(
            "$timestamp $host kernel: IN=$in_if OUT=$out_if SRC=$src_ip DST=$dst_ip PROTO=TCP SPT=$src_port DPT=80 ACTION=ALLOW"
        ),
        "http_block": Template(
            "$timestamp $host kernel: IN=$in_if OUT=$out_if SRC=$src_ip DST=$dst_ip PROTO=TCP SPT=$src_port DPT=80 ACTION=BLOCK"
        ),
    },
    "dns": {
        "dns_query": Template(
            "$timestamp $host named[$pid]: client $src_ip#$src_port: query: $domain IN A"
        ),
        "internal_lookup": Template(
            "$timestamp $host named[$pid]: client $src_ip#$src_port: query: $domain IN A"
        ),
        "suspicious_domain": Template(
            "$timestamp $host named[$pid]: client $src_ip#$src_port: query: $domain IN A"
        ),
        "cloud_lookup": Template(
            "$timestamp $host named[$pid]: client $src_ip#$src_port: query: $domain IN A"
        ),
        "dns_failure": Template(
            "$timestamp $host named[$pid]: client $src_ip#$src_port: query: $domain IN A NXDOMAIN"
        ),
    },
    "process": {
        "normal_process": Template(
            '$timestamp $host process: user=$user pid=$pid cmd="$command"'
        ),
        "admin_command": Template(
            '$timestamp $host process: user=root pid=$pid cmd="$command"'
        ),
        "network_scan": Template(
            '$timestamp $host process: user=$user pid=$pid cmd="$command"'
        ),
        "reverse_shell": Template(
            '$timestamp $host process: user=$user pid=$pid cmd="$command"'
        ),
        "file_download": Template(
            '$timestamp $host process: user=$user pid=$pid cmd="$command"'
        ),
    },
    "file_access": {
        "file_read": Template(
            "$timestamp $host file_access: user=$user file=$file action=read"
        ),
        "file_write": Template(
            "$timestamp $host file_access: user=$user file=$file action=write"
        ),
        "sensitive_file_read": Template(
            "$timestamp $host file_access: user=$user file=$file action=read"
        ),
        "file_delete": Template(
            "$timestamp $host file_access: user=$user file=$file action=delete"
        ),
        "config_change": Template(
            "$timestamp $host file_access: user=$user file=$file action=write"
        ),
    },
    "vpn": {
        "vpn_connect": Template(
            "$timestamp $host openvpn: user=$user ip=$src_ip connected"
        ),
        "vpn_disconnect": Template(
            "$timestamp $host openvpn: user=$user ip=$src_ip disconnected"
        ),
        "vpn_auth_failure": Template(
            "$timestamp $host openvpn: user=$user ip=$src_ip authentication_failed"
        ),
        "vpn_timeout": Template(
            "$timestamp $host openvpn: user=$user ip=$src_ip session_timeout"
        ),
        "vpn_duplicate": Template(
            "$timestamp $host openvpn: user=$user ip=$src_ip duplicate_session_detected"
        ),
    },
}


def random_ip(agent_type=None):
    # 50% chance to use a public IP for all agent types
    if random.random() < 0.5:
        # Use a real public IP range (e.g., Google DNS, Cloudflare, etc.)
        public_ips = [
            "8.8.8.8", "1.1.1.1", "8.8.4.4", "9.9.9.9", "208.67.222.222", "185.228.168.9",
            "64.233.160.0", "104.16.0.0", "172.217.0.0", "151.101.1.69", "23.216.10.50"
        ]
        return random.choice(public_ips)
    # Otherwise, use the original logic
    if agent_type in ["workstation", "file_server", "vpn", "dns"]:
        return f"10.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(1,254)}"
    elif agent_type == "web_server":
        return f"203.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(1,254)}"
    elif agent_type == "firewall":
        if random.random() < 0.7:
            return f"10.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(1,254)}"
        else:
            return f"203.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(1,254)}"
    else:
        return f"10.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(1,254)}"


def timestamp():
    return time.strftime("%b %d %H:%M:%S", time.localtime(time.time()))


def random_src_port():
    return random.randint(1024, 65535)


def random_dst_port():
    return random.randint(1, 65535)


def gen_auth_log(log_type, agent_type=None, hostname=None):
    template = templates["auth"][log_type]
    user = random.choice(users)
    if log_type == "sudo_command":
        user = random.choice(admins)
    return template.substitute(
        timestamp=timestamp(),
        host=hostname,
        pid=random.choice(pids),
        user=user,
        src_ip=random_ip(agent_type),
        src_port=random_src_port(),
        tty=random.choice(ttys),
        pwd=f"/home/{user}",
        command=random.choice(commands),
    )


def gen_web_access_log(log_type, agent_type=None, hostname=None):
    template = templates["web"][log_type]
    user = random.choice(users)
    return template.substitute(
        timestamp=timestamp(),
        host=hostname,
        src_ip=random_ip(agent_type),
        user=user,
        method=random.choice(["GET", "POST"]),
        path=random.choice(["/index.html", "/dashboard", "/login", "/api/data"]),
        status=random.choice([200, 200, 200, 403, 404, 500]),
        size=random.randint(200, 5000),
        api=random.choice(["users", "courses", "grades", "labs"]),
    )


def gen_firewall_log(log_type, agent_type=None, hostname=None):
    template = templates["firewall"][log_type]
    return template.substitute(
        timestamp=timestamp(),
        host=hostname,
        in_if="eth0",
        out_if="eth1",
        src_ip=random_ip(agent_type),
        dst_ip=random_ip(agent_type),
        src_port=random_src_port(),
        dst_port=random_dst_port(),
    )


def gen_dns_log(log_type, agent_type=None, hostname=None):
    template = templates["dns"][log_type]
    return template.substitute(
        timestamp=timestamp(),
        host=hostname,
        pid=random.choice(pids),
        src_ip=random_ip(agent_type),
        src_port=random_src_port(),
        domain=random.choice(
            [
                "iitb.ac.in",
                "cse.iitb.ac.in",
                "github.com",
                "google.com",
                "malicious.com",
            ]
        ),
    )


def gen_process_execution_log(log_type, agent_type=None, hostname=None):
    template = templates["process"][log_type]
    user = random.choice(users)
    if log_type == "admin_command":
        user = random.choice(admins)
    return template.substitute(
        timestamp=timestamp(),
        host=hostname,
        user=user,
        pid=random.choice(pids),
        command=random.choice(commands),
    )


def gen_file_access_log(log_type, agent_type=None, hostname=None):
    template = templates["file_access"][log_type]
    user = random.choice(users)
    file = random.choice(files)
    if log_type == "sensitive_file_read":
        file = random.choice(sensitive_files)
    if log_type == "config_change":
        file = random.choice(config_files)
    return template.substitute(
        timestamp=timestamp(), host=hostname, user=user, file=file
    )


def gen_vpn_log(log_type, agent_type=None, hostname=None):
    template = templates["vpn"][log_type]
    user = random.choice(users)
    return template.substitute(
        timestamp=timestamp(),
        host=hostname,
        user=user,
        src_ip=random_ip(agent_type),
    )
